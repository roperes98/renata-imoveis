/**
 * Cliente HTTP para a API do Registro de Imóveis do Brasil
 */

import type {
  AuthRequest,
  AuthResponse,
  ApiError,
} from "./types";

export class RegistroImoveisClient {
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private clientId: string;
  private clientSecret: string;
  private grantType: "client_credentials" | "password";
  private username?: string;
  private password?: string;

  constructor(config: {
    baseUrl?: string;
    clientId: string;
    clientSecret: string;
    grantType?: "client_credentials" | "password";
    username?: string;
    password?: string;
  }) {
    // Usa URL de produção por padrão, mas permite override
    this.baseUrl = config.baseUrl || "https://api.registrodeimoveis.org.br";
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.grantType = config.grantType || "client_credentials";
    this.username = config.username;
    this.password = config.password;
  }

  /**
   * Autentica e obtém token JWT
   */
  async authenticate(): Promise<string> {
    // Verifica se já tem um token válido
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    const authRequest: AuthRequest = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: this.grantType,
    };

    if (this.grantType === "password") {
      if (!this.username || !this.password) {
        throw new Error("username e password são obrigatórios quando grant_type é 'password'");
      }
      authRequest.username = this.username;
      authRequest.password = this.password;
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authRequest),
      });

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          codigo: "AUTH_ERROR",
          descricao: `Erro na autenticação: ${response.status} ${response.statusText}`,
        }));
        throw new Error(error.descricao || "Erro na autenticação");
      }

      const data: AuthResponse = await response.json();
      this.token = data.access_token;
      // Define expiração com margem de segurança (5 minutos antes)
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

      return this.token;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro desconhecido na autenticação");
    }
  }

  /**
   * Valida o token atual
   */
  async validateToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/auth/validacao`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Faz uma requisição autenticada
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Garante que está autenticado
    await this.authenticate();

    if (!this.token) {
      throw new Error("Token de autenticação não disponível");
    }

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Se receber 401, tenta reautenticar uma vez
      if (response.status === 401) {
        this.token = null;
        this.tokenExpiry = null;
        await this.authenticate();

        if (!this.token) {
          throw new Error("Falha na reautenticação");
        }

        // Tenta novamente com novo token
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (!retryResponse.ok) {
          const error: ApiError = await retryResponse.json().catch(() => ({
            codigo: "REQUEST_ERROR",
            descricao: `Erro na requisição: ${retryResponse.status} ${retryResponse.statusText}`,
          }));
          throw new Error(error.descricao || "Erro na requisição");
        }

        return retryResponse.json();
      }

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          codigo: "REQUEST_ERROR",
          descricao: `Erro na requisição: ${response.status} ${response.statusText}`,
        }));
        throw new Error(error.descricao || "Erro na requisição");
      }

      // Para respostas vazias (204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro desconhecido na requisição");
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

/**
 * Cria uma instância do cliente usando variáveis de ambiente
 */
export function createClient(): RegistroImoveisClient {
  const clientId = process.env.REGISTRO_IMOVEIS_CLIENT_ID;
  const clientSecret = process.env.REGISTRO_IMOVEIS_CLIENT_SECRET;
  const baseUrl = process.env.REGISTRO_IMOVEIS_BASE_URL;
  const grantType = (process.env.REGISTRO_IMOVEIS_GRANT_TYPE ||
    "client_credentials") as "client_credentials" | "password";
  const username = process.env.REGISTRO_IMOVEIS_USERNAME;
  const password = process.env.REGISTRO_IMOVEIS_PASSWORD;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Variáveis de ambiente REGISTRO_IMOVEIS_CLIENT_ID e REGISTRO_IMOVEIS_CLIENT_SECRET são obrigatórias"
    );
  }

  return new RegistroImoveisClient({
    baseUrl,
    clientId,
    clientSecret,
    grantType,
    username,
    password,
  });
}










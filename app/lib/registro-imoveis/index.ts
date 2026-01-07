/**
 * Exportações principais do módulo de integração com o Registro de Imóveis do Brasil
 */

export { RegistroImoveisClient, createClient } from "./client";
export { AcompanhamentoRegistralService } from "./services/acompanhamento-registral";
export { CobrancaService } from "./services/cobranca";
export * from "./types";

/**
 * Classe principal que agrupa todos os serviços
 */
import { RegistroImoveisClient, createClient } from "./client";
import { AcompanhamentoRegistralService } from "./services/acompanhamento-registral";
import { CobrancaService } from "./services/cobranca";

export class RegistroImoveisAPI {
  public readonly acompanhamento: AcompanhamentoRegistralService;
  public readonly cobranca: CobrancaService;
  private client: RegistroImoveisClient;

  constructor(config?: {
    baseUrl?: string;
    clientId: string;
    clientSecret: string;
    grantType?: "client_credentials" | "password";
    username?: string;
    password?: string;
  }) {
    if (config) {
      this.client = new RegistroImoveisClient(config);
    } else {
      this.client = createClient();
    }
    this.acompanhamento = new AcompanhamentoRegistralService(this.client);
    this.cobranca = new CobrancaService(this.client);
  }
}

/**
 * Cria uma instância da API usando variáveis de ambiente
 */
export function createRegistroImoveisAPI(): RegistroImoveisAPI {
  return new RegistroImoveisAPI();
}


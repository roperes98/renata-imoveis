/**
 * Serviços para Cobrança
 */

import { RegistroImoveisClient } from "../client";
import type {
  GerarCobrancaRequest,
  CobrancaResponse,
  ListagemCobrancasResponse,
  TipoPagamento,
  ListagemTiposPagamentoResponse,
  DevolucaoPixRequest,
  DevolucaoPixResponse,
} from "../types";

export class CobrancaService {
  constructor(private client: RegistroImoveisClient) {}

  /**
   * [RFC-01] - Geração de cobrança
   */
  async gerarCobranca(
    data: GerarCobrancaRequest
  ): Promise<CobrancaResponse> {
    return this.client.post<CobrancaResponse>("/v1/cobranca", data);
  }

  /**
   * [RFC-02] - Listagem das cobranças
   */
  async listarCobrancas(params?: {
    pagina?: number;
    tamanhoPagina?: number;
    status?: number;
    hashProtocolo?: string;
  }): Promise<ListagemCobrancasResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.pagina) {
      queryParams.append("pagina", params.pagina.toString());
    }
    if (params?.tamanhoPagina) {
      queryParams.append("tamanhoPagina", params.tamanhoPagina.toString());
    }
    if (params?.status !== undefined) {
      queryParams.append("status", params.status.toString());
    }
    if (params?.hashProtocolo) {
      queryParams.append("hashProtocolo", params.hashProtocolo);
    }

    const queryString = queryParams.toString();
    const endpoint = `/v1/cobranca${queryString ? `?${queryString}` : ""}`;

    return this.client.get<ListagemCobrancasResponse>(endpoint);
  }

  /**
   * [RFC-03] - Detalhes da cobrança
   */
  async detalharCobranca(hashCobranca: string): Promise<CobrancaResponse> {
    return this.client.get<CobrancaResponse>(`/v1/cobranca/${hashCobranca}`);
  }

  /**
   * [RFC-04] - Cancelamento da cobrança
   */
  async cancelarCobranca(hashCobranca: string): Promise<void> {
    return this.client.patch<void>(`/v1/cobranca/${hashCobranca}`);
  }

  /**
   * [RFC-05] - Listagem dos tipos de pagamentos
   */
  async listarTiposPagamento(params?: {
    pagina?: number;
    tamanhoPagina?: number;
    status?: number;
  }): Promise<ListagemTiposPagamentoResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.pagina) {
      queryParams.append("pagina", params.pagina.toString());
    }
    if (params?.tamanhoPagina) {
      queryParams.append("tamanhoPagina", params.tamanhoPagina.toString());
    }
    if (params?.status !== undefined) {
      queryParams.append("status", params.status.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/v1/cobranca/tipo-pagamento${queryString ? `?${queryString}` : ""}`;

    return this.client.get<ListagemTiposPagamentoResponse>(endpoint);
  }

  /**
   * [RFC-06] - Devolução de valores pagos no PIX
   */
  async devolverPix(
    hashCobranca: string,
    data: DevolucaoPixRequest
  ): Promise<DevolucaoPixResponse> {
    return this.client.put<DevolucaoPixResponse>(
      `/v1/cobranca/${hashCobranca}/pix/devolucao`,
      data
    );
  }
}










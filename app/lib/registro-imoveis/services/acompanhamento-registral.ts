/**
 * Serviços para Acompanhamento Registral
 */

import { RegistroImoveisClient } from "../client";
import type {
  ProtocoloOnlineRequest,
  ProtocoloLoteRequest,
  ProtocoloResponse,
  ListagemProtocolosResponse,
  DetalhamentoProtocoloResponse,
  GerarCobrancaRequest,
  GerarCobrancaResponse,
} from "../types";

export class AcompanhamentoRegistralService {
  constructor(private client: RegistroImoveisClient) {}

  /**
   * [RFP-01] - Envio do protocolo online
   */
  async enviarProtocoloOnline(
    data: ProtocoloOnlineRequest
  ): Promise<ProtocoloResponse> {
    return this.client.post<ProtocoloResponse>(
      "/v1/protocolo",
      data
    );
  }

  /**
   * [RFP-02] - Envio de protocolo em lote
   */
  async enviarProtocoloLote(
    data: ProtocoloLoteRequest
  ): Promise<ProtocoloResponse[]> {
    return this.client.post<ProtocoloResponse[]>(
      "/v1/protocolo/lote",
      data
    );
  }

  /**
   * [RFP-03] - Geração de cobrança automatizada no protocolo
   */
  async gerarCobrancaAutomatizada(
    hashProtocolo: string,
    data: GerarCobrancaRequest
  ): Promise<GerarCobrancaResponse> {
    return this.client.post<GerarCobrancaResponse>(
      `/v1/protocolo/${hashProtocolo}/cobranca`,
      data
    );
  }

  /**
   * [RFP-04] - Exclusão de protocolo
   */
  async excluirProtocolo(hashProtocolo: string): Promise<void> {
    return this.client.delete<void>(`/v1/protocolo/${hashProtocolo}`);
  }

  /**
   * [RFP-05] - Listagem dos protocolos integrados
   */
  async listarProtocolos(params?: {
    pagina?: number;
    tamanhoPagina?: number;
    numeroProtocolo?: string;
    tipoSolicitacao?: number;
    situacao?: number;
  }): Promise<ListagemProtocolosResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.pagina) {
      queryParams.append("pagina", params.pagina.toString());
    }
    if (params?.tamanhoPagina) {
      queryParams.append("tamanhoPagina", params.tamanhoPagina.toString());
    }
    if (params?.numeroProtocolo) {
      queryParams.append("numeroProtocolo", params.numeroProtocolo);
    }
    if (params?.tipoSolicitacao) {
      queryParams.append("tipoSolicitacao", params.tipoSolicitacao.toString());
    }
    if (params?.situacao !== undefined) {
      queryParams.append("situacao", params.situacao.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/v1/protocolo${queryString ? `?${queryString}` : ""}`;

    return this.client.get<ListagemProtocolosResponse>(endpoint);
  }

  /**
   * [RFP-06] - Detalhamento do protocolo
   */
  async detalharProtocolo(
    hashProtocolo: string
  ): Promise<DetalhamentoProtocoloResponse> {
    return this.client.get<DetalhamentoProtocoloResponse>(
      `/v1/protocolo/${hashProtocolo}`
    );
  }
}










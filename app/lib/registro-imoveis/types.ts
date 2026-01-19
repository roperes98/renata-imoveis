/**
 * Tipos TypeScript para a API do Registro de Imóveis do Brasil
 * Baseado na documentação v1.4 de 29/01/2025
 */

// ==================== AUTENTICAÇÃO ====================

export interface AuthRequest {
  client_id: string;
  client_secret: string;
  grant_type: "client_credentials" | "password";
  username?: string;
  password?: string;
}

export interface AuthResponse {
  access_token: string;
  expires_in: number;
  token_type: "Bearer";
}

// ==================== TABELAS DE DOMÍNIO ====================

export enum StatusCobranca {
  AGUARDANDO_PAGAMENTO = 0,
  PAGAMENTO_CONFIRMADO = 1,
  PAGAMENTO_CANCELADO = 2,
}

export enum ACTipoSolicitacao {
  REGISTRO = 1,
  EXAME_E_CALCULO = 2,
}

export enum ACCodigoStatus {
  TITULO_COM_REINGRESSO = 1,
  CANCELADO = 2,
  TITULO_PRONTO_PARA_RETIRADA = 3,
  TITULO_PRENOTADO = 4,
  EXAME_E_CALCULO_CONCLUIDO = 5,
  TITULO_REGISTRADO_NAO_DISPONIVEL = 6,
  NOTA_DE_EXIGENCIA = 7,
  TITULO_ENTREGUE = 8,
  SUSCITACAO_DE_DUVIDA = 9,
  DUVIDA_JUGADA_PROCEDENTE = 10,
  DUVIDA_JUGADA_IMPROCEDENTE = 11,
  EXAME_E_CALCULO_PROTOCOLADO = 12,
  EXAME_E_CALCULO_PRONTO_PARA_RETIRADA = 13,
  BLOQUEIO_DE_MATRICULAS = 14,
  PRORROGADO_PRAZO_PRENOTACAO = 15,
  PRORROGADO_PRAZO_ENTREGA_OU_DEVOLUCAO = 16,
  PRORROGADO_PRAZO_PENHORA_ONLINE = 17,
  NOTIFICACAO = 18,
  PRORROGADO_PRAZO_NOTIFICACAO = 19,
  PROCESSAMENTO = 20,
}

export enum ACFilaSituacao {
  PENDENTE = 0,
  EM_PROCESSAMENTO = 1,
  PROCESSADO_COM_SUCESSO = 2,
  PROCESSADO_COM_ALERTAS = 3,
  PROCESSADO_COM_ERROS = 4,
}

export enum StatusTipoPagamento {
  INATIVO = 0,
  ATIVO = 1,
}

// ==================== ACOMPANHAMENTO REGISTRAL ====================

export interface ProtocoloOnlineRequest {
  numeroProtocolo: string;
  tipoSolicitacao: ACTipoSolicitacao;
  matricula?: string;
  cpfCnpj?: string;
  nome?: string;
  observacoes?: string;
}

export interface ProtocoloLoteItem {
  numeroProtocolo: string;
  tipoSolicitacao: ACTipoSolicitacao;
  matricula?: string;
  cpfCnpj?: string;
  nome?: string;
  observacoes?: string;
}

export interface ProtocoloLoteRequest {
  protocolos: ProtocoloLoteItem[];
}

export interface ProtocoloResponse {
  hash: string;
  numeroProtocolo: string;
  tipoSolicitacao: ACTipoSolicitacao;
  matricula?: string;
  cpfCnpj?: string;
  nome?: string;
  observacoes?: string;
  dataCadastro: string;
  situacao: ACFilaSituacao;
  codigoStatus?: ACCodigoStatus;
  descricaoStatus?: string;
  dataStatus?: string;
}

export interface ListagemProtocolosResponse {
  totalRegistros: number;
  totalPaginas: number;
  paginaAtual: number;
  dados: ProtocoloResponse[];
}

export interface DetalhamentoProtocoloResponse extends ProtocoloResponse {
  historico?: Array<{
    codigoStatus: ACCodigoStatus;
    descricaoStatus: string;
    dataStatus: string;
  }>;
}

export interface GerarCobrancaRequest {
  valor: number; // Valor em centavos (ex: R$100,00 = 10000)
  tipoPagamento: number; // ID do tipo de pagamento
  vencimento?: string; // Data de vencimento (formato: YYYY-MM-DD)
  descricao?: string;
}

export interface GerarCobrancaResponse {
  hash: string;
  valor: number;
  tipoPagamento: number;
  vencimento?: string;
  descricao?: string;
  dataCadastro: string;
}

// ==================== COBRANÇA ====================

export interface CobrancaResponse {
  hash: string;
  status: StatusCobranca;
  dataStatus: string;
  valorTotal: number; // Valor em centavos
  valorTotalPago?: number; // Valor em centavos
  valorTotalDevolvido?: number; // Valor em centavos
  tipoPagamento?: number;
  descricao?: string;
  vencimento?: string;
  dataCadastro: string;
  pagamentoVinculado?: {
    hash: string;
    valor: number;
    dataPagamento: string;
  };
}

export interface ListagemCobrancasResponse {
  totalRegistros: number;
  totalPaginas: number;
  paginaAtual: number;
  dados: CobrancaResponse[];
}

export interface TipoPagamento {
  id: number;
  descricao: string;
  dataCadastro: string;
  dataAtualizacao?: string;
  status: StatusTipoPagamento;
}

export interface ListagemTiposPagamentoResponse {
  totalRegistros: number;
  totalPaginas: number;
  paginaAtual: number;
  dados: TipoPagamento[];
}

export interface DevolucaoPixRequest {
  valor: number; // Valor em centavos
}

export interface DevolucaoPixResponse {
  hash: string;
  status: StatusCobranca;
  dataStatus: string;
  valorTotal: number;
  valorTotalDevolvido: number;
}

// ==================== ERROS ====================

export interface ApiError {
  codigo: string;
  descricao: string;
  campos?: Record<string, string>;
}














import { Offer, RealEstate, Client, Agent } from "./database";

export type SaleStepStatus = "pending" | "in_progress" | "completed" | "blocked" | "skipped";
export type ActionType = "upload" | "review" | "external" | "manual";

export interface SaleStepChecklistItem {
  id: string;
  label: string;
  required: boolean;
  status: "pending" | "uploaded" | "approved" | "rejected";
  fileUrl?: string | null;
  actionType?: ActionType;
  expiresAt?: string | null; // ISO date - data de expiração da certidão
  uploadedAt?: string | null; // ISO date - data de upload
  needsCare?: boolean; // Indica se precisa de cuidado/renovação (como certidões fermentadas)
  validityDays?: number; // Dias de validade da certidão (padrão: 30 para certidões que expiram)
}

export type RGIPair = {
  status: "pending" | "current" | "completed";
  label: string;
  date?: string;
};

export interface RGIData {
  protocol: string;
  protocolDate: string; // ISO Date
  currentStage: "protocol" | "analysis" | "requirements" | "registered";
  history: RGIPair[];
}

export interface SaleStep {
  id: string;
  name: string;
  description: string;
  status: SaleStepStatus;
  actionType: ActionType | "rgi_tracker";
  updated_at: string; // ISO date
  optional?: boolean;
  notes?: string;
  documents?: string[];
  checklist?: SaleStepChecklistItem[];
  rgiData?: RGIData; // New field
}

export interface SaleProcess {
  id: string; // Could be same as offer_id or unique if we had a table
  offer_id: string;
  offer?: Offer;
  property?: RealEstate;
  buyer?: Client;
  seller?: Client; // Complex relations usually, but simplified here

  status: "active" | "completed" | "cancelled";
  current_step_index: number;
  steps: SaleStep[];

  created_at: string;
  updated_at: string;
}

// Template for Rio de Janeiro real estate process
export const SALES_STEPS_TEMPLATE: Omit<SaleStep, "updated_at">[] = [
  {
    id: "proposal_accepted",
    name: "Aceite da Proposta",
    description: "Confirmação do aceite e recebimento/comprovação do sinal (Arras).",
    status: "completed",
    actionType: "upload",
    checklist: [
      { id: "signal_receipt", label: "Comprovante de pagamento do Sinal", required: true, status: "pending" },
      { id: "proposal_signed", label: "Proposta assinada pelas partes", required: true, status: "pending" }
    ]
  },
  {
    id: "documentation",
    name: "Documentação (Due Diligence)",
    description: "Coleta e análise de certidões (Vendedores e Imóvel) e documentos dos compradores.",
    status: "pending",
    actionType: "upload",
    checklist: [
      { id: "cert_rgi", label: "Certidão de Ônus Reais (RGI)", required: true, status: "pending" },
      { id: "cert_iptu", label: "Certidão de Situação Fiscal e Enfitêutica (IPTU)", required: true, status: "pending" },
      { id: "cert_condo", label: "Declaração de Quitação Condominial", required: true, status: "pending" },
      { id: "cert_funesbom", label: "Certidão de Taxa de Incêndio (FUNESBOM)", required: true, status: "pending" },
      { id: "cert_fiscal_imovel", label: "Certidão Fiscal e Fazendária (Imóvel)", required: true, status: "pending" },
      { id: "cert_fiscal_vendedores", label: "Certidão Fiscal e Fazendária (Vendedores)", required: true, status: "pending" },

      { id: "cert_interdicao_1", label: "1º Certidão de Interdição e Tutela", required: true, status: "pending" },
      { id: "cert_interdicao_2", label: "2º Certidão de Interdição e Tutela", required: true, status: "pending" },
      { id: "cert_distribuidor_civil", label: "2º Distribuidor Civil", required: true, status: "pending" },
      { id: "cert_trabalhista", label: "Certidão Negativa de Débitos Trabalhistas (CNDT)", required: true, status: "pending" },
      { id: "cert_receita", label: "Certidão Negativa da Receita Federal", required: true, status: "pending" },
      { id: "cert_justica", label: "Certidão Negativa da Justiça Federal", required: true, status: "pending" },
      { id: "cert_fiscal_fazendaria", label: "Certidão Fiscal e Fazendária", required: true, status: "pending" },
      { id: "docs_buyer", label: "Documentos Pessoais (Compradores)", required: true, status: "pending" },
      { id: "docs_seller", label: "Documentos Pessoais (Vendedores)", required: true, status: "pending" },
    ]
  },
  {
    id: "contract",
    name: "Contrato (CCV)",
    description: "Minuta, aprovação e assinatura do Compromisso de Compra e Venda.",
    status: "pending",
    actionType: "upload",
    checklist: [
      { id: "ccv_draft", label: "Minuta do Contrato (Draft)", required: true, status: "pending" },
      { id: "ccv_signed", label: "Contrato Assinado (CCV)", required: true, status: "pending" }
    ]
  },
  {
    id: "financing",
    name: "Financiamento",
    description: "Coleta de documentos, aprovação bancária, avaliação de engenharia e emissão do contrato bancário.",
    status: "pending",
    actionType: "upload",
    optional: true,
    checklist: [
      // Documents for Financing
      { id: "id_doc", label: "Identidade ou CNH", required: true, status: "pending" },
      { id: "civil_status", label: "Certidão de Estado Civil (Casamento ou Nascimento)", required: true, status: "pending" },
      { id: "proof_residence", label: "Comprovante de Residência Atualizado", required: true, status: "pending" },
      { id: "paystubs", label: "3 Últimos Contra-cheques", required: true, status: "pending" },

      // Documents for FGTS
      { id: "irpf", label: "Imposto de Renda Completo com Recibo (uso FGTS)", required: false, status: "pending" },
      { id: "pis", label: "PIS (uso FGTS)", required: false, status: "pending" },
      { id: "fgts_statement", label: "Extrato do FGTS (uso FGTS)", required: false, status: "pending" },

      // Process Outputs
      { id: "finance_approval", label: "Carta de Aprovação de Crédito", required: true, status: "pending" },
      { id: "engineering_eval", label: "Laudo de Engenharia", required: true, status: "pending" },
      { id: "bank_contract", label: "Contrato de Financiamento Emitido", required: true, status: "pending" }
    ]
  },
  {
    id: "itbi",
    name: "Guias: ITBI e Funesbom",
    description: "Emissão e pagamento das guias de transmissão.",
    status: "pending",
    actionType: "upload",
    checklist: [
      { id: "itbi_paid", label: "Guia de ITBI Paga", required: true, status: "pending" },
      { id: "laudemio_paid", label: "Laudêmio Pago (se aplicável)", required: false, status: "pending" }
    ]
  },
  {
    id: "deed",
    name: "Escritura Pública",
    description: "Lavratura da Escritura Pública de Compra e Venda em Cartório de Notas.",
    status: "pending",
    actionType: "external",
    checklist: [
      { id: "deed_draft", label: "Minuta da Escritura", required: true, status: "pending" },
      { id: "deed_signed", label: "Traslado da Escritura Assinada", required: true, status: "pending" }
    ]
  },
  {
    id: "registry",
    name: "Registro (RGI)",
    description: "Acompanhamento do processo de registro no Cartório de Imóveis.",
    status: "pending",
    actionType: "rgi_tracker",
    checklist: []
  },
  {
    id: "handover",
    name: "Entrega de Chaves",
    description: "Vistoria final do imóvel, quitação de saldo e entrega das chaves.",
    status: "pending",
    actionType: "manual",
    checklist: [
      { id: "final_inspection", label: "Vistoria Final Realizada", required: true, status: "pending" },
      { id: "utility_transfer", label: "Transferência de Contas (Luz/Gás)", required: false, status: "pending" },
      { id: "keys_receipt", label: "Termo de Entrega de Chaves", required: true, status: "pending" }
    ]
  },
];

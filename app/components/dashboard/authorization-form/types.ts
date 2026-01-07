export interface OwnerData {
  name: string;
  email: string;
  phone: string;
  cellphone: string;
  rg: string;
  rg_issued_at: string;
  cpf: string;
  nationality: string;
  profession: string;
  marital_status: string;
  cpfError?: string;
}

export const MARITAL_STATUS_OPTIONS = [
  { value: "solteiro", label: "Solteiro(a)" },
  { value: "casado", label: "Casado(a)" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "viuvo", label: "Viúvo(a)" },
  { value: "uniao_estavel", label: "União Estável" },
];

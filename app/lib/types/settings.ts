export interface SocialNetworks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  whatsapp?: string;
  youtube?: string;
  website?: string;
  email?: string;
}

export interface CommissionSettings {
  agencyPercentage: number;
  capturerPercentage: number;
  sellerPercentage: number;
}

export interface BankRate {
  id: string;
  bankName: string;
  rate: number; // e.g., 9.5 for 9.5%

  // Simulation constraints
  minAge?: number;
  maxAge?: number;
  amortizationSystem?: "SAC" | "PRICE" | "SAC_PRICE";
  minTerm?: number; // Months
  maxTerm?: number; // Months
  minDownPayment?: number; // Percentage
  maxIncomeCommitment?: number; // Percentage (usually 30%)
  monthlyAdminFee?: number; // BRL (e.g., 25.00)

  conditions?: string;
}

export interface BusinessHour {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  label: string; // "Segunda-feira", etc.
  openTime: string; // "09:00"
  closeTime: string; // "18:00"
  isOpen: boolean;
}

export interface CompanyAddress {
  id: string;
  label: string; // "Sede", "Filial Centro", etc.
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  isMain: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  agency: string;
  accountNumber: string;
  accountType: "Checking" | "Savings" | "Business"; // "Corrente", "Poupança", "PJ"
  pixKey?: string;
  pixKeyType?: "CPF" | "CNPJ" | "Email" | "Phone" | "Random";
  holderName: string;
  holderDocument: string; // CPF or CNPJ
}

// Permissions based on dashboard and features
export type Permission =
  // Dashboard & Analytics
  | "dashboard.view"

  // Properties
  | "properties.view"
  | "properties.create"
  | "properties.edit"
  | "properties.delete"

  // Clients / Vendas
  | "crm.view"
  | "crm.edit"

  // Finance
  | "finance.view"
  | "finance.manage_commissions" // Commission settings

  // Settings & Team
  | "team.manage"      // Manage roles
  | "settings.view"    // View company settings
  | "settings.edit"    // Edit company info, hours, etc.

  // Site
  | "site.customize";  // Customize landing page/site

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem?: boolean;
}

export interface CompanySettings {
  id: string;
  creci: string;
  primaryColor?: string;
  socials: SocialNetworks;
  commissions?: CommissionSettings;
  bankRates: BankRate[];
  businessHours: BusinessHour[];
  addresses: CompanyAddress[];
  bankAccounts: BankAccount[];
  roles: Role[];
}

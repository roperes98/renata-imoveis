// TypeScript types based on the Supabase schema

export interface IbgeUF {
  id: number;
  sigla: string;
  nome: string;
}

export interface IbgeCity {
  nome: string;
  codigo_ibge: string;
}

export type SellingStatus = "for_sale" | "sold" | "pending" | "off_market";
export type PropertyType =
  | "apartment"
  | "village_house"
  | "penthouse"
  | "farm"
  | "flat"
  | "kitnet"
  | "loft"
  | "allotment_land"
  | "building"
  | "studio"
  | "house"
  | "gated_community_house";

export type AgentRole = "owner" | "broker" | "captor" | "dev" | "admin";
export type VisitStatus = "scheduled" | "completed" | "canceled" | "no_show";
export type PropertyItemType = "furniture" | "appliance" | "decoration" | "built_in";
export type PropertyItemCondition = "new" | "good" | "fair" | "worn";
export type PropertyItemStayOption = "stays" | "removed" | "negotiable";
export type OfferPaymentType = "cash" | "financing" | "mixed" | "rent_to_own" | "other";
export type OfferStatus = "submitted" | "under_review" | "accepted" | "rejected" | "withdrawn" | "expired" | "counter_offer";
export type PropertyTaxPeriodType = "yearly" | "monthly";
export type AuthorizationStatusEnum = "written_exclusive" | "written_non_exclusive" | "verbal" | "pending" | "expired" | "none";
export type ConstructionStageEnum = "planning" | "foundation" | "structure" | "masonry" | "finishing" | "ready";

export interface RealEstate {
  id: string;
  sale_price: number | null;
  type: PropertyType;
  code: string;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  features: string[] | null;
  created_at: string;
  updated_at: string;
  address_street: string;
  address_number: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_complement: string;
  address_reference?: string | null;
  address_lat?: number | null;
  address_lng?: number | null;
  status: SellingStatus;
  youtube_url: string | null;
  virtual_tour_url: string | null;
  description: string | null;
  transaction_type: string;
  condominium_fee: number | null;
  is_condo_fee_exempt: boolean;
  property_tax: number | null;
  is_property_tax_exempt: boolean;
  property_tax_period: PropertyTaxPeriodType | null;
  floor_number: number;
  usable_area: number;
  total_area: number;
  suites: number;
  rent_price: number | null;
  condominium_id: string | null;
  condominium_address_id: string | null;
  images?: { url: string; tag: string }[] | null;
  zone?: string | null;
  construction_year: number | null;
  iptu_number: string | null;

  // Joined relations
  real_estate_owners?: { client: Client }[];
  real_estate_agents?: { agent: Agent; agent_role: string }[];
  property_legal_details?: PropertyLegalDetails;
  property_keys?: PropertyKeys;
  condominiums?: Condominium;
}

export interface PropertyLegalDetails {
  property_id: string;
  has_deed: boolean | null;
  is_registered: boolean | null;
  accepts_financing: boolean | null;
  has_exclusivity: boolean | null;
  authorization_status: AuthorizationStatusEnum | null;
  matricula: string | null;
  incorporation_registry: string | null;
  acquisition_origin?: string | null;
  created_at: string;
}

export interface PropertyKeys {
  property_id: string;
  key_location: string | null;
  access_instructions: string | null;
  key_code: string | null;
  created_at: string;
}

export interface PropertyItem {
  id: number;
  property_id: string;
  item_type: PropertyItemType;
  condition: PropertyItemCondition;
  stay_option: PropertyItemStayOption;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Condominium {
  id: string;
  name: string;
  description: string | null;
  building_type: string | null;
  total_units: number | null;
  total_floors: number | null;
  tower_count: number | null;
  construction_year: number | null;
  amenities: string[] | null;
  images?: { url: string; tag: string }[] | null;
  created_at: string;
}

export interface CondominiumAddress {
  id: string;
  condominium_id: string;
  label: string | null;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  zone?: string | null;
  complement: string | null;
  created_at: string;
}

export interface ConstructionInfo {
  id: string;
  condominium_id: string | null;
  real_estate_id: string | null;
  incorporation_registry: string | null;
  developer_name: string | null;
  construction_company: string | null;
  stage: ConstructionStageEnum;
  progress_percentage: number;
  delivery_forecast: string | null;
  started_at: string | null;
  updated_at: string;
}

export interface Agent {
  id: string;
  user_id: string;
  name: string; // Joined from User usually, but schema table doesn't have name. It has user_id. Wait, `select *, users(full_name)`
  // Schema for agents table: phone, roles, show_in_ad, gender, user_id.
  // For display we often join user.
  phone: string | null;
  roles: string[] | null;
  show_in_ad: boolean;
  created_at: string;
  // Augmented fields from join
  full_name?: string;
  email?: string;
  // Extended for contracts
  creci?: string;
  cnpj?: string;
  company_name?: string;
  address_full?: string;
  is_company?: boolean;
}

export interface Client {
  id: string;
  user_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  notes: string | null;
  instagram: string | null;
  contact_email?: string | null;
  // Extended fields for contracts
  nationality?: string | null;
  profession?: string | null;
  marital_status?: string | null;
  union_stable?: boolean;
  rg?: string | null;
  rg_issuer?: string | null;
  rg_issue_date?: string | null;
  cpf?: string | null;
  father_name?: string | null;
  mother_name?: string | null;

  address_street?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_neighborhood?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip?: string | null;

  spouse_name?: string | null;
  spouse_nationality?: string | null;
  spouse_profession?: string | null;
  spouse_rg?: string | null;
  spouse_rg_issuer?: string | null;
  spouse_cpf?: string | null;
  spouse_email?: string | null;
  spouse_father_name?: string | null;
  spouse_mother_name?: string | null;

  bank_accounts?: BankAccount[] | null;

  created_at: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string | null;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}

// Helper for display
export interface PropertyDisplay extends RealEstate {
  condominium?: Condominium | null;
  condominium_address?: CondominiumAddress | null;
}

export interface Visit {
  id: string;
  client_id: string;
  agent_id: string;
  real_estate_id?: string; // Should exist, marking optional to be safe with schema mismatch
  scheduled_at: string | null;
  visited_at: string | null;
  visit_status: VisitStatus;
  notes: string | null;
  client_feedback: string | null;
  agent_feedback: string | null;
  created_at: string;
  // Joins
  client?: Client;
  agent?: Agent;
}

export interface Offer {
  id: string;
  property_id: string;
  client_id: string;
  agent_id: string | null;
  offer_amount: number;
  payment_type: OfferPaymentType;
  status: OfferStatus;
  down_payment?: number;
  financing_amount?: number;
  created_at: string;
  // Joins
  client?: Client;
  agent?: Agent;
}





export interface BankAccount {
  bank_name: string;
  agency: string;
  account_number: string;
  account_type?: string;
  holder_name?: string;
  pix_key?: string;
  pix_key_type?: string;
}

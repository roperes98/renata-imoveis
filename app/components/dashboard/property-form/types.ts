
import { PropertyType, SellingStatus, Condominium, Client, Agent, PropertyDisplay, CondominiumAddress, IbgeUF, IbgeCity } from "@/app/lib/types/database";

export interface PropertyFormData {
  code: string;
  type: PropertyType;
  status: SellingStatus;
  sale_price: string;
  rent_price: string;
  condominium_fee: string;
  property_tax: string;
  iptu_number: string;
  property_tax_period: "yearly" | "monthly";
  description: string;
  address_street: string;
  address_number: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_complement: string;
  address_reference: string;
  zone: string;
  condominium_address_id: string;
  bedrooms: string;
  bathrooms: string;
  parking_spaces: string;
  usable_area: string;
  total_area: string;
  suites: string;
  salas: string;
  floor_number: string;
  construction_year: string;
  orientation: string;
  youtube_url: string;
  virtual_tour_url: string;
  condominium_id: string;
  is_condo_fee_exempt: boolean;
  is_property_tax_exempt: boolean;
  usage_type: "RESIDENTIAL" | "COMMERCIAL";
  features: string[];
  watermark_source: string;
  watermark_position: string;
  watermark_opacity: string;
  construction_data?: ConstructionData;
}

export interface ConstructionData {
  developer_name: string;
  construction_company: string;
  stage: "planning" | "foundation" | "structure" | "masonry" | "finishing" | "ready";
  progress_percentage: string;
  delivery_forecast: string; // ISO date string or YYYY-MM
  started_at: string; // ISO date string
}

export interface MediaItem {
  id: string;
  url: string;
  file?: File;
  isNew: boolean;
  label: string;
}

export interface LegalData {
  has_deed: boolean;
  is_registered: boolean;
  accepts_financing: boolean;
  has_exclusivity: boolean;
  authorization_status: string;
  matricula: string;
  incorporation_registry: string;
}

export interface KeysData {
  key_location: string;
  key_code: string;
  access_instructions: string;
}

export interface BaseStepProps {
  formData: PropertyFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
}

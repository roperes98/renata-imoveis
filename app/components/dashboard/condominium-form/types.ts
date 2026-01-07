import { Condominium, CondominiumAddress, IbgeUF, IbgeCity } from "@/app/lib/types/database";

export interface CondominiumAddressFormData {
  id?: string; // Para endereços existentes
  label: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  complement: string;
  zone: string;
}

export interface CondominiumFormData {
  name: string;
  description: string;
  building_type: string;
  total_units: string;
  total_floors: string;
  tower_count: string;
  construction_year: string;
  amenities: string[];
  // Address fields - mantido para compatibilidade com código existente
  address_street: string;
  address_number: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_complement: string;
  zone: string;
  // Multiple addresses
  addresses: CondominiumAddressFormData[];
  // Media
  youtube_url: string;
  virtual_tour_url: string;
  watermark_source: string;
  watermark_position: string;
  watermark_opacity: string;
}

export interface MediaItem {
  id: string;
  url: string;
  file?: File;
  isNew: boolean;
  label: string;
}

export interface BaseStepProps {
  formData: CondominiumFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<CondominiumFormData>>;
}


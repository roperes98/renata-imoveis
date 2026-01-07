import { createServerClient } from "./server";
import type { PropertyDisplay, SellingStatus, PropertyType, Condominium, CondominiumAddress, ConstructionInfo } from "../types/database";

// Helper to safely cast string to PropertyType
function toPropertyType(type: string): PropertyType | undefined {
  const validTypes: PropertyType[] = [
    "apartment",
    "village_house",
    "penthouse",
    "farm",
    "flat",
    "kitnet",
    "loft",
    "allotment_land",
    "building",
    "studio",
    "house",
    "gated_community_house",
  ];
  return validTypes.includes(type as PropertyType) ? (type as PropertyType) : undefined;
}

export async function getProperties(filters?: {
  status?: SellingStatus;
  type?: PropertyType;
  neighborhood?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  limit?: number;
  search?: string;
  includeAllStatuses?: boolean;
}): Promise<PropertyDisplay[]> {
  const supabase = createServerClient();

  let query = supabase
    .from("real_estate")
    .select(`
      *,
      condominiums (name),
      condominium_addresses (*),
      real_estate_owners (
        client:clients (name)
      )
    `);

  // Apply filters
  if (filters?.status) {
    query = query.eq("status", filters.status);
  } else if (!filters?.includeAllStatuses) {
    // Default to only showing properties for sale if not specified otherwise
    query = query.eq("status", "for_sale");
  }

  if (filters?.type) {
    const validType = toPropertyType(filters.type);
    if (validType) {
      query = query.eq("type", validType);
    }
  }

  if (filters?.neighborhood) {
    query = query.eq("address_neighborhood", filters.neighborhood);
  }

  if (filters?.city) {
    query = query.eq("address_city", filters.city);
  }

  if (filters?.minPrice) {
    query = query.gte("sale_price", filters.minPrice);
  }

  if (filters?.maxPrice) {
    query = query.lte("sale_price", filters.maxPrice);
  }

  if (filters?.minBedrooms) {
    query = query.gte("bedrooms", filters.minBedrooms);
  }

  if (filters?.minBathrooms) {
    query = query.gte("bathrooms", filters.minBathrooms);
  }

  if (filters?.search) {
    const searchTerm = filters.search;
    // Search in code, street, neighborhood
    query = query.or(`code.ilike.%${searchTerm}%,address_street.ilike.%${searchTerm}%,address_neighborhood.ilike.%${searchTerm}%`);
  }

  // Order by created_at descending
  query = query.order("created_at", { ascending: false });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }

  return (data || []) as PropertyDisplay[];
}

export async function getPropertyById(id: string): Promise<PropertyDisplay | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("real_estate")
    .select(`
      *,
      condominiums (*),
      condominium_addresses (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching property:", error);
    return null;
  }

  return data as PropertyDisplay;
}

export async function getPropertyByCode(code: string): Promise<PropertyDisplay | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("real_estate")
    .select(`
      *,
      condominiums (*),
      condominium_addresses (*)
    `)
    .eq("code", code)
    .single();

  if (error) {
    console.error("Error fetching property by code:", error);
    return null;
  }

  return data as PropertyDisplay;
}

export async function getNeighborhoods(): Promise<string[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("real_estate")
    .select("address_neighborhood")
    .eq("status", "for_sale")
    .order("address_neighborhood");

  if (error) {
    console.error("Error fetching neighborhoods:", error);
    return [];
  }

  // Get unique neighborhoods
  const neighborhoods = Array.from(
    new Set(data?.map((item) => item.address_neighborhood) || [])
  ).filter(Boolean) as string[];

  return neighborhoods.sort();
}

export async function getPropertyTypes(): Promise<string[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("real_estate")
    .select("type")
    .eq("status", "for_sale");

  if (error) {
    console.error("Error fetching property types:", error);
    return [];
  }

  // Get unique types
  const types = Array.from(
    new Set(data?.map((item) => item.type) || [])
  ).filter(Boolean) as string[];

  return types.sort();
}

// Helper type for condominium display
export interface CondominiumDisplay extends Condominium {
  condominium_addresses?: CondominiumAddress[];
  construction_infos?: ConstructionInfo[];
}

export async function getCondominiums(limit?: number): Promise<CondominiumDisplay[]> {
  const supabase = createServerClient();

  let query = supabase
    .from("condominiums")
    .select(`
      *,
      condominium_addresses (*),
      construction_infos (*)
    `)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching condominiums:", error);
    throw error;
  }

  return (data || []) as CondominiumDisplay[];
}

export async function getCondominiumById(id: string): Promise<CondominiumDisplay | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("condominiums")
    .select(`
      *,
      condominium_addresses (*),
      construction_infos (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching condominium:", error);
    return null;
  }

  return data as CondominiumDisplay;
}

export async function getPropertiesByCondominiumId(condominiumId: string): Promise<PropertyDisplay[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("real_estate")
    .select(`
      *,
      condominiums (*),
      condominium_addresses (*)
    `)
    .eq("condominium_id", condominiumId)
    .eq("status", "for_sale")
    .order("sale_price", { ascending: true });

  if (error) {
    console.error("Error fetching properties for condominium:", error);
    return [];
  }

  return (data || []) as PropertyDisplay[];
}


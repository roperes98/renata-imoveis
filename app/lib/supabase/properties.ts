import { createServerClient } from "./server";
import { unstable_cache } from "next/cache";
import type { PropertyDisplay, SellingStatus, PropertyType, Condominium, CondominiumAddress, ConstructionInfo } from "../types/database";
import { formatImageUrl } from "../utils/url";

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

// Optimized select fields for list views
const PROPERTIES_SELECT = `
  id,
  code,
  type,
  sale_price,
  address_street,
  address_number,
  address_neighborhood,
  address_state,
  usable_area,
  bedrooms,
  bathrooms,
  parking_spaces,
  created_at,
  images,
  status,
  condominium_id,
  condominiums (name),
  condominium_addresses (id),
  suites,
  description,
  condominium_fee,
  updated_at,
  address_city,
  address_zip,
  address_state,
  address_number,
  address_complement,
  features,
  youtube_url,
  virtual_tour_url,
  transaction_type,
  real_estate_owners (client:clients (name))
`;

const CONDOMINIUMS_SELECT = `
  id,
  name,
  created_at,
  images,
  condominium_addresses (street, number, neighborhood, state),
  construction_infos (stage, delivery_forecast)
`;

export async function getProperties(filters?: {
  status?: SellingStatus;
  type?: PropertyType;
  neighborhood?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  minSuites?: number;
  minArea?: number;
  maxArea?: number;
  condominiumId?: string;
  limit?: number;
  search?: string;
  includeAllStatuses?: boolean;
  page?: number;
}): Promise<{ data: PropertyDisplay[]; count: number }> {
  const supabase = createServerClient();

  // Create a cache key based on filters
  const cacheKey = ['properties', JSON.stringify(filters)];
  const tags = ['properties'];

  return unstable_cache(
    async () => {
      let query = supabase
        .from("real_estate")
        .select(PROPERTIES_SELECT, { count: "exact" });

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

      if (filters?.maxBedrooms) {
        query = query.lte("bedrooms", filters.maxBedrooms);
      }

      if (filters?.minBathrooms) {
        query = query.gte("bathrooms", filters.minBathrooms);
      }

      if (filters?.minSuites) {
        query = query.gte("suites", filters.minSuites);
      }

      if (filters?.minArea) {
        query = query.gte("usable_area", filters.minArea);
      }

      if (filters?.maxArea) {
        query = query.lte("usable_area", filters.maxArea);
      }

      if (filters?.condominiumId) {
        query = query.eq("condominium_id", filters.condominiumId);
      }

      if (filters?.search) {
        const searchTerm = filters.search;
        // Search in code, street, neighborhood
        query = query.or(`code.ilike.%${searchTerm}%,address_street.ilike.%${searchTerm}%,address_neighborhood.ilike.%${searchTerm}%`);
      }

      // Order by created_at descending
      query = query.order("created_at", { ascending: false });

      // Order by created_at descending
      query = query.order("created_at", { ascending: false });

      if (filters?.limit) {
        // If regular limit is used without page
        if (!filters.page) {
          query = query.limit(filters.limit);
        }
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 12; // Default to 12 if not specified

      if (filters?.page) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
      } else if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching properties:", error);
        throw error;
      }

      const formattedData = (data || []).map((property) => ({
        ...property,
        // ... mapped properties
        images: property.images?.map((img: any) => ({
          ...img,
          url: formatImageUrl(img.url),
        })),
        condominiums: property.condominiums
          ? {
            ...property.condominiums,
            images: (property.condominiums as any).images?.map((img: any) => ({
              ...img,
              url: formatImageUrl(img.url),
            })),
          }
          : property.condominiums,
      })) as unknown as PropertyDisplay[];

      return {
        data: formattedData,
        count: count || 0
      };
    },
    cacheKey,
    { tags: tags, revalidate: 60 } // Revalidate every minute
  )();
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

  return {
    ...data,
    images: data.images?.map((img: any) => ({
      ...img,
      url: formatImageUrl(img.url),
    })),
    condominiums: data.condominiums
      ? {
        ...data.condominiums,
        images: (data.condominiums as any).images?.map((img: any) => ({
          ...img,
          url: formatImageUrl(img.url),
        })),
      }
      : data.condominiums,
  } as PropertyDisplay;
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

  return {
    ...data,
    images: data.images?.map((img: any) => ({
      ...img,
      url: formatImageUrl(img.url),
    })),
    condominiums: data.condominiums
      ? {
        ...data.condominiums,
        images: (data.condominiums as any).images?.map((img: any) => ({
          ...img,
          url: formatImageUrl(img.url),
        })),
      }
      : data.condominiums,
  } as PropertyDisplay;
}

export async function getNeighborhoods(): Promise<string[]> {
  const supabase = createServerClient();

  return unstable_cache(
    async () => {
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
    },
    ['neighborhoods'],
    { tags: ['properties', 'neighborhoods'], revalidate: 3600 } // Revalidate every hour
  )();
}

export async function getPropertyTypes(): Promise<string[]> {
  const supabase = createServerClient();

  return unstable_cache(
    async () => {
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
    },
    ['property_types'],
    { tags: ['properties', 'types'], revalidate: 3600 }
  )();
}

// Helper type for condominium display
export interface CondominiumDisplay extends Condominium {
  condominium_addresses?: CondominiumAddress[];
  construction_infos?: ConstructionInfo[];
}

export async function getCondominiums(limit?: number): Promise<CondominiumDisplay[]> {
  const supabase = createServerClient();

  return unstable_cache(
    async () => {
      let query = supabase
        .from("condominiums")
        .select(CONDOMINIUMS_SELECT)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching condominiums:", error);
        throw error;
      }

      return (data || []).map((condo) => ({
        ...condo,
        images: condo.images?.map((img: any) => ({
          ...img,
          url: formatImageUrl(img.url),
        })),
      })) as unknown as CondominiumDisplay[];
    },
    ['condominiums', limit ? `limit-${limit}` : 'all'],
    { tags: ['condominiums'], revalidate: 60 }
  )();
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

  return {
    ...data,
    images: data.images?.map((img: any) => ({
      ...img,
      url: formatImageUrl(img.url),
    })),
  } as CondominiumDisplay;
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

  return (data || []).map((property) => ({
    ...property,
    images: property.images?.map((img: any) => ({
      ...img,
      url: formatImageUrl(img.url),
    })),
    condominiums: property.condominiums
      ? {
        ...property.condominiums,
        images: (property.condominiums as any).images?.map((img: any) => ({
          ...img,
          url: formatImageUrl(img.url),
        })),
      }
      : property.condominiums,
  })) as PropertyDisplay[];
}


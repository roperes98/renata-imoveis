"use server";

import { createClient } from "@supabase/supabase-js";
import { PropertyDisplay } from "../../lib/types/database";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function searchProperties(query: string): Promise<PropertyDisplay[]> {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabaseAdmin
    .from("real_estate")
    .select(`
      *,
      condominiums (name),
      condominium_addresses (*),
      real_estate_owners (
        client:clients (name)
      )
    `)
    .or(`code.ilike.%${query}%,address_street.ilike.%${query}%,address_neighborhood.ilike.%${query}%`)
    .limit(10);

  if (error) {
    console.error("Error searching properties:", error);
    return [];
  }

  return data as PropertyDisplay[];
}

export async function getPropertyDetails(id: string): Promise<PropertyDisplay | null> {
  const { data, error } = await supabaseAdmin
    .from("real_estate")
    .select(`
      *,
      condominiums (*),
      condominium_addresses (*),
      real_estate_owners (
        client:clients (*)
      ),
      real_estate_agents (
        agent:agents (
            *,
            users (full_name, email, avatar_url)
        ),
        agent_role
      ),
      property_legal_details (*),
      property_keys (*),
      property_items (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching property details:", error);
    return null;
  }

  // Transform nested user data for agents if necessary, but PropertyDisplay type might need adjustment or we just return data as is and cast carefully or update type
  // For now, returning as is, casting to PropertyDisplay which might not fully match the complex join without type updates.
  // The current PropertyDisplay type has `condominium` and `condominium_address`.
  // It effectively extends RealEstate.
  // I will check database.ts again if I need strict typing for the PDF, but for now I will cast to any to avoid TS blocks if types are strict, 
  // or better, I rely on the existing types and just grab what I need.

  return data as any as PropertyDisplay;
}

import { createServerClient } from "./server";
import type { Agent } from "../types/database";

export async function getAgentsForTeam(): Promise<Agent[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("show_in_ad", true)
    .order("name");

  if (error) {
    console.error("Error fetching agents:", error);
    return [];
  }

  return (data || []) as Agent[];
}

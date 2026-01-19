import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import PropertyForm from "@/app/components/dashboard/PropertyForm";
import { PropertyDisplay, Condominium, Client } from "@/app/lib/types/database";

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getData(id: string) {
  console.log(`[EditPage] Fetching data for property ID: ${id}`);

  try {
    const [condosRes, clientsRes, agentsRes, propertyRes] = await Promise.all([
      supabaseAdmin.from("condominiums").select("*").order("name"),
      supabaseAdmin.from("clients").select("*").order("name"),
      supabaseAdmin.from("agents").select("*, users(full_name)").order("created_at"),
      supabaseAdmin.from("real_estate")
        .select(`
          *,
          condominiums (name),
          condominium_addresses (*),
          real_estate_owners (
            client:clients (id, name)
          ),
          real_estate_agents (
             agent:agents (id),
             agent_role
          ),
          property_legal_details (*),
          property_keys (*)
        `)
        .eq("id", id)
        .single()
    ]);

    if (propertyRes.error) {
      console.error("[EditPage] Supabase Error fetching property:", propertyRes.error);
      console.error("[EditPage] Query ID was:", id);
      return null;
    }

    if (!propertyRes.data) {
      console.error("[EditPage] No data returned for property:", id);
      return null;
    }

    return {
      condominiums: (condosRes.data || []) as Condominium[],
      clients: (clientsRes.data || []) as Client[],
      agents: (agentsRes.data || []) as any[],
      property: propertyRes.data as PropertyDisplay
    };
  } catch (err) {
    console.error("[EditPage] Unexpected error:", err);
    return null;
  }
}

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

import HistoryLogger from "./HistoryLogger";

export default async function EditPropertyPage(props: EditPropertyPageProps) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await getData(params.id);

  if (!data) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Erro</h1>
        <p>Imóvel não encontrado.</p>
      </div>
    );
  }

  const { condominiums, clients, agents, property } = data;

  const normalizedAgents = agents.map((a: any) => ({
    ...a,
    name: a.users?.full_name || "Sem Nome"
  }));

  // Prepare simple property object for history logging
  const simplifiedProperty = {
    id: property.id,
    code: property.code,
    sale_price: property.sale_price ?? 0,
    type: property.type,
    image: property.images && property.images.length > 0 ? property.images[0].url : null
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <HistoryLogger property={simplifiedProperty} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <PropertyForm
          condominiums={condominiums}
          clients={clients}
          agents={normalizedAgents}
          initialData={property}
        />
      </main>
    </div>
  );
}

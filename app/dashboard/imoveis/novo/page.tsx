import PropertyForm from "@/app/components/dashboard/PropertyForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Condominium, Client, Agent } from "@/app/lib/types/database";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getData() {
  const [condosRes, clientsRes, agentsRes] = await Promise.all([
    supabaseAdmin.from("condominiums").select("*").order("name"),
    supabaseAdmin.from("clients").select("*").order("name"),
    supabaseAdmin.from("agents").select("*, users(full_name)").order("created_at") // Joining user to get name
  ]);

  return {
    condominiums: (condosRes.data || []) as Condominium[],
    clients: (clientsRes.data || []) as Client[],
    agents: (agentsRes.data || []) as any[] // Agent with user join
  };
}

export default async function AddPropertyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { condominiums, clients, agents } = await getData();

  // Normalize Agents
  const normalizedAgents = agents.map(a => ({
    ...a,
    name: a.users?.full_name || "Unknown Agent"
  })) as Agent[];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4. sm:px-0">
          <PropertyForm
            condominiums={condominiums}
            clients={clients}
            agents={normalizedAgents}
          />
        </div>
      </main>
    </div>
  );
}

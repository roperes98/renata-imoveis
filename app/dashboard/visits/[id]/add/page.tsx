import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import VisitForm from "./VisitForm";
import { Client, Agent } from "@/app/lib/types/database";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getData() {
  const [clientsRes, agentsRes] = await Promise.all([
    supabaseAdmin.from("clients").select("*").order("name"),
    supabaseAdmin.from("agents").select("*, users(full_name, email)")
  ]);

  const clients = (clientsRes.data || []) as Client[];

  // Transform agents to include user name for display
  const agents = (agentsRes.data || []).map((a: any) => ({
    ...a,
    full_name: a.users?.full_name || a.users?.email || "Sem Nome",
    email: a.users?.email
  })) as Agent[];

  return { clients, agents };
}

export default async function AddVisitPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { clients, agents } = await getData();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href={`/dashboard/visits/${params.id}`} className="flex items-center text-gray-500 hover:text-[#960000] mb-6">
          <FaArrowLeft className="mr-2" /> Voltar para Visitas
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Agendar Nova Visita</h1>

        <VisitForm propertyId={params.id} clients={clients} agents={agents} />
      </div>
    </div>
  );
}

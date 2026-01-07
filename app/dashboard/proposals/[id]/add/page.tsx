import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import ProposalForm from "./ProposalForm";
import { Client } from "@/app/lib/types/database";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getClients() {
  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
  return data as Client[];
}

export default async function AddProposalPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const clients = await getClients();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href={`/dashboard/proposals/${params.id}`} className="flex items-center text-gray-500 hover:text-[#960000] mb-6">
          <FaArrowLeft className="mr-2" /> Voltar para Propostas
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Registrar Nova Proposta</h1>

        <ProposalForm propertyId={params.id} clients={clients} />
      </div>
    </div>
  );
}

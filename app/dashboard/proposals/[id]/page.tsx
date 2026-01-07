import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { Offer } from "@/app/lib/types/database";
import { formatPrice } from "@/app/lib/utils/format";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function ProposalsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { data: offers, error } = await supabaseAdmin
    .from("real_estate_offers")
    .select(`
      *,
      client:clients (name, email, phone:whatsapp),
      agent:agents (
        users (full_name)
      )
    `)
    .eq("property_id", params.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching offers:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-[#960000] mb-6">
          <FaArrowLeft className="mr-2" /> Voltar ao Dashboard
        </Link>


        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Propostas Recebidas</h1>
          <Link
            href={`/dashboard/proposals/${params.id}/add`}
            className="bg-[#960000] text-white px-4 py-2 rounded shadow hover:bg-[#7a0000]"
          >
            Nova Proposta
          </Link>
        </div>

        <div className="space-y-4">
          {!offers || offers.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
              Nenhuma proposta recebida para este imóvel.
            </div>
          ) : (
            offers.map((offer: any) => (
              <div key={offer.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-[#960000]">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{formatPrice(offer.offer_amount)}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      De: <span className="font-medium">{offer.client?.name}</span> ({offer.client?.phone || offer.client?.email})
                    </p>
                    <p className="text-sm text-gray-500">
                      Pagamento: {offer.payment_type}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded uppercase
                    ${offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      offer.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {offer.status}
                  </span>
                </div>
                {offer.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
                    "{offer.notes}"
                  </div>
                )}
                <div className="mt-4 text-xs text-gray-400">
                  Recebida em: {new Date(offer.created_at).toLocaleString('pt-BR')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import CondominiumForm from "@/app/components/dashboard/CondominiumForm";
import { Condominium, CondominiumAddress } from "@/app/lib/types/database";

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getCondominiumData(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("condominiums")
      .select(`
        *,
        condominium_addresses (*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching condominium:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Transform the data to match the expected format
    const condominium = data as Condominium & {
      condominium_addresses?: CondominiumAddress[];
    };

    // Get images if they exist (you may need to add an images field or table)
    // For now, we'll leave images empty
    const initialData = {
      ...condominium,
      images: [] as string[], // Add images field if you have a way to store them
      addresses: condominium.condominium_addresses || [],
    };

    return initialData;
  } catch (err) {
    console.error("Unexpected error:", err);
    return null;
  }
}

interface EditCondominiumPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCondominiumPage(props: EditCondominiumPageProps) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const initialData = await getCondominiumData(params.id);

  if (!initialData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p>Condomínio não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <CondominiumForm initialData={initialData} />
      </main>
    </div>
  );
}


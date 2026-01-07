import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ClientsTable from "./ClientsTable";
import { FaSignOutAlt, FaChevronLeft, FaChevronRight, FaArrowLeft, FaSearch } from "react-icons/fa";
import Link from "next/link";
import { Client } from "../../lib/types/database";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ITEMS_PER_PAGE = 10;

async function getClientsData(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = Number(searchParams.page) || 1;
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  const search = searchParams.search as string;

  let query = supabaseAdmin
    .from("clients")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching clients:", error);
    return { clients: [], count: 0 };
  }
  return { clients: data as Client[], count: count || 0 };
}

interface DashboardClientsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardClientsPage({ searchParams }: DashboardClientsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const resolvedSearchParams = await searchParams;
  const { clients, count } = await getClientsData(resolvedSearchParams);
  const page = Number(resolvedSearchParams.page) || 1;
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
            <p className="mt-1 text-sm text-gray-500">
              Total de {count} clientes encontrados.
            </p>
          </div>
        </div>

        <div className="px-4 sm:px-0 space-y-6">
          <form className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                name="search"
                type="text"
                placeholder="Buscar por nome ou email..."
                defaultValue={resolvedSearchParams.search as string || ""}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-[#960000] focus:border-[#960000]"
              />
            </div>
            <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700">Buscar</button>
          </form>

          <ClientsTable clients={clients} />

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Link
                href={{ query: { ...resolvedSearchParams, page: page > 1 ? page - 1 : 1 } }}
                className={`p-2 rounded border ${page <= 1 ? "text-gray-300 pointer-events-none" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <FaChevronLeft />
              </Link>
              <span className="text-sm font-medium text-gray-700">
                Página {page} de {totalPages}
              </span>
              <Link
                href={{ query: { ...resolvedSearchParams, page: page < totalPages ? page + 1 : totalPages } }}
                className={`p-2 rounded border ${page >= totalPages ? "text-gray-300 pointer-events-none" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <FaChevronRight />
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import TeamTable from "./TeamTable";
import { FaSearch, FaPlus } from "react-icons/fa";
import Link from "next/link";
import { Agent } from "@/app/lib/types/database";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ITEMS_PER_PAGE = 10;

async function getTeamData(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = Number(searchParams.page) || 1;
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  const search = searchParams.search as string;

  let query = supabaseAdmin
    .from("agents")
    .select(`
      *,
      users (
        full_name,
        email,
        avatar_url
      )
    `, { count: "exact" })
    .order("created_at", { ascending: false });

  // Note: Supabase doesn't support filtering on joined table columns directly in the query
  // We'll filter after fetching if search is provided
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching team members:", error);
    return { agents: [], count: 0 };
  }

  // Transform the data to match Agent interface with joined user data
  let agents = (data || []).map((agent: any) => ({
    ...agent,
    full_name: agent.users?.full_name || null,
    email: agent.users?.email || null,
    avatar_url: agent.users?.avatar_url || null,
  })) as (Agent & { full_name?: string; email?: string; avatar_url?: string })[];

  // Filter by search term if provided (client-side filtering for joined data)
  if (search) {
    const searchLower = search.toLowerCase();
    agents = agents.filter((agent) => {
      const fullName = agent.full_name?.toLowerCase() || "";
      const email = agent.email?.toLowerCase() || "";
      const phone = agent.phone?.toLowerCase() || "";
      return fullName.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower);
    });
  }

  // For accurate count with search, we'd need to fetch all and count, or do a separate count query
  // For now, we'll use the filtered length if search is active
  const finalCount = search ? agents.length : (count || 0);

  return { agents, count: finalCount };
}

interface DashboardTeamPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardTeamPage({ searchParams }: DashboardTeamPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const resolvedSearchParams = await searchParams;
  const { agents, count } = await getTeamData(resolvedSearchParams);
  const page = Number(resolvedSearchParams.page) || 1;
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Time</h2>
            <p className="mt-1 text-sm text-gray-500">
              Total de {count} membros do time encontrados.
            </p>
          </div>
          <Link
            href="/dashboard/time/novo"
            className="flex items-center gap-2 bg-[#960000] text-white px-4 py-2 rounded-md hover:bg-[#7a0000] transition-colors"
          >
            <FaPlus />
            <span>Adicionar Membro</span>
          </Link>
        </div>

        <div className="px-4 sm:px-0 space-y-6">
          <form className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                name="search"
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                defaultValue={resolvedSearchParams.search as string || ""}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-[#960000] focus:border-[#960000]"
              />
            </div>
            <button type="submit" className="bg-[#960000] text-white px-4 py-2 rounded-md hover:bg-[#7a0000] transition-colors">
              Buscar
            </button>
          </form>

          <TeamTable agents={agents} />

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Link
                href={{ query: { ...resolvedSearchParams, page: page > 1 ? page - 1 : 1 } }}
                className={`p-2 rounded border ${page <= 1 ? "text-gray-300 pointer-events-none" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <span className="text-sm font-medium text-gray-700">
                Página {page} de {totalPages}
              </span>
              <Link
                href={{ query: { ...resolvedSearchParams, page: page < totalPages ? page + 1 : totalPages } }}
                className={`p-2 rounded border ${page >= totalPages ? "text-gray-300 pointer-events-none" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


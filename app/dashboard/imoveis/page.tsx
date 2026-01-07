import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import PropertiesTable from "./PropertiesTable";
import PropertiesFilters from "./PropertiesFilters";
import { FaSignOutAlt, FaChevronLeft, FaChevronRight, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import type { RealEstate, PropertyDisplay, SellingStatus, PropertyType, Condominium } from "../../lib/types/database";

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ITEMS_PER_PAGE = 10;

async function getDashboardData(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = Number(searchParams.page) || 1;
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let query = supabaseAdmin
    .from("real_estate")
    .select(`
      *,
      condominiums (name),
      condominium_addresses (*),
      real_estate_owners (
        client:clients (name)
      )
    `, { count: "exact" });

  // 1. Text Search
  const search = searchParams.search as string;
  if (search) {
    query = query.or(`code.ilike.%${search}%,address_street.ilike.%${search}%,address_neighborhood.ilike.%${search}%`);
  }

  // 2. Status & Type
  if (searchParams.status) query = query.eq("status", searchParams.status);
  if (searchParams.type) query = query.eq("type", searchParams.type);
  if (searchParams.neighborhood) query = query.eq("address_neighborhood", searchParams.neighborhood);
  if (searchParams.condominium_id) query = query.eq("condominium_id", searchParams.condominium_id);

  // 3. Range Filters
  if (searchParams.minPrice) query = query.gte("sale_price", Number(searchParams.minPrice));
  if (searchParams.maxPrice) query = query.lte("sale_price", Number(searchParams.maxPrice));
  if (searchParams.minArea) query = query.gte("usable_area", Number(searchParams.minArea));
  if (searchParams.maxArea) query = query.lte("usable_area", Number(searchParams.maxArea));
  if (searchParams.bedrooms) query = query.gte("bedrooms", Number(searchParams.bedrooms));
  if (searchParams.bathrooms) query = query.gte("bathrooms", Number(searchParams.bathrooms));
  if (searchParams.suites) query = query.gte("suites", Number(searchParams.suites));
  if (searchParams.parking) query = query.gte("parking_spaces", Number(searchParams.parking));

  // 4. Sorting
  const sort = searchParams.sort as string;
  switch (sort) {
    case "price_asc":
      query = query.order("sale_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("sale_price", { ascending: false });
      break;
    case "area_asc":
      query = query.order("usable_area", { ascending: true });
      break;
    case "area_desc":
      query = query.order("usable_area", { ascending: false });
      break;
    case "created_asc":
      query = query.order("created_at", { ascending: true });
      break;
    default: // created_desc
      query = query.order("created_at", { ascending: false });
  }

  // 5. Pagination
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching properties:", error);
    return { properties: [], count: 0 };
  }
  return { properties: data as PropertyDisplay[], count: count || 0 };
}

async function getOptions() {
  const [condos, neighborhoods] = await Promise.all([
    supabaseAdmin.from("condominiums").select("id, name").order("name"),
    supabaseAdmin.from("real_estate").select("address_neighborhood").not("address_neighborhood", "is", null)
  ]);

  const uniqueNeighborhoods = Array.from(new Set(neighborhoods.data?.map(n => n.address_neighborhood) || [])).sort();

  return {
    condominiums: (condos.data || []) as Condominium[],
    neighborhoods: uniqueNeighborhoods as string[]
  };
}

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

import RecentlyViewed from "./RecentlyViewed";

export default async function DashboardImoveisPage({ searchParams }: DashboardPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const resolvedSearchParams = await searchParams;

  const { properties, count } = await getDashboardData(resolvedSearchParams);
  const { condominiums, neighborhoods } = await getOptions();

  const page = Number(resolvedSearchParams.page) || 1;
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 space-y-6">
          <PropertiesFilters
            neighborhoods={neighborhoods}
            condominiums={condominiums}
          />

          <RecentlyViewed />

          <PropertiesTable properties={properties} />

          <div className="flex justify-between items-center">
            <p className="mt-1 text-sm text-gray-500">
              Total de {count} imóveis encontrados.
            </p>

            {/* Pagination Controls */}
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
        </div>
      </main>
    </div>
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AuthorizationForm from "./AuthorizationForm";
import { formatArea, getPropertyTypeLabel } from "@/app/lib/utils/format";
import { formatPrice } from "@/app/lib/utils/format";
import Image from "next/image";
import { TfiRulerAlt2 } from "react-icons/tfi";
import { IoBedOutline, IoCarSportOutline } from "react-icons/io5";
import { PiBathtub } from "react-icons/pi";
import { auth } from "@/auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AuthorizationPageProps {
  params: Promise<{ token: string }>;
}

async function getPropertyByToken(token: string) {
  // Por enquanto, vamos assumir que o token pode ser um ID do imóvel ou código
  // Você pode ajustar essa lógica para buscar por um token específico de autorização
  // quando implementar a tabela de tokens de autorização

  // Tentar buscar por ID primeiro
  const { data: property, error } = await supabaseAdmin
    .from("real_estate")
    .select(`
      *,
      condominiums (*),
      real_estate_owners (
        client:clients (*)
      )
    `)
    .eq("id", token)
    .single();

  // Se não encontrar por ID, tentar por código
  if (error || !property) {
    const { data: propertyByCode, error: codeError } = await supabaseAdmin
      .from("real_estate")
      .select(`
        *,
        condominiums (*),
        real_estate_owners (
          client:clients (*)
        )
      `)
      .eq("code", token)
      .single();

    if (codeError || !propertyByCode) {
      return null;
    }

    return propertyByCode;
  }

  return property;
}

export default async function AuthorizationPage({ params }: AuthorizationPageProps) {
  const { token } = await params;
  const property = await getPropertyByToken(token);
  const session = await auth();

  if (!property) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Property Info Card */}
        <div className="flex gap-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <Image
            src="https://investoracres.com/admin/img/blog/blog3_22Jan25_114319.jpg"
            alt={property.code} width={100} height={100} content="cover"
            className="w-60 h-34 object-cover rounded-lg"
          />
          <div className="flex flex-col flex-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-900">
                  {getPropertyTypeLabel(property.type)} {property.code}
                </p>
              </div>

              <p className="text-md text-gray-900">
                {formatPrice(property.sale_price)}
              </p>
            </div>

            <p className="text-gray-900 my-auto text-md">
              {property.address_street} {property.address_number} ({property.address_complement}), {property.address_neighborhood}<br />
              {property.address_city} / {property.address_state} - CEP.: {property.address_zip}
            </p>

            <div className="flex text-sm text-[#000000] gap-3 mt-auto">
              <div className="flex items-center gap-2">
                <TfiRulerAlt2 size={16} className="text-[#B22A22]" />
                <span className="text-xs font-medium text-center">{formatArea(property.usable_area)}</span>
              </div>
              <div className="h-5 w-px bg-[#B22A22]/50" />
              <div className="flex items-center gap-2">
                <IoBedOutline size={20} className="text-[#B22A22]" />
                <span className="text-xs font-medium text-center">
                  {property.bedrooms}
                </span>
              </div>
              <div className="h-5 w-px bg-[#B22A22]/50" />
              <div className="flex items-center gap-2">
                <PiBathtub size={20} className="text-[#B22A22]" />
                <span className="text-xs font-medium text-center">
                  {property.bathrooms}
                </span>
              </div>
              <div className="h-5 w-px bg-[#B22A22]/50" />
              <div className="flex items-center gap-2">
                <IoCarSportOutline size={20} className="text-[#B22A22]" />
                <span className="text-xs font-medium text-center">
                  {property.parking_spaces}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Authorization Form */}
        <AuthorizationForm
          propertyId={property.id}
          token={token}
          userEmail={session?.user?.email || undefined}
        />
      </div>
    </div>
  );
}

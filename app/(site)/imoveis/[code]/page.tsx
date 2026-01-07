import { notFound } from "next/navigation";
import Link from "next/link";

import { getPropertyByCode, getProperties } from "@/app/lib/supabase/properties";
import { formatPrice, formatArea, getPropertyTypeLabel, getDaysSinceCreated, getDaysSinceUpdated } from "@/app/lib/utils/format";
import type { Metadata } from "next";
import Map from "@/app/components/Map";
import Carousel from "@/app/components/Carousel";
import PropertyCard from "@/app/components/PropertyCard";
import {
  FiHeart,
  FiEye,
  FiCalendar,
  FiCheckCircle,
  FiShare2,
  FiInfo
} from "react-icons/fi";
import { MdOutlinePets, MdOutlineWbSunny, MdOutlineLocalFireDepartment, MdOutlineContentCopy } from "react-icons/md";
import PropertyIdCopy from "@/app/components/PropertyIdCopy";
import { LuCopy } from "react-icons/lu";
import { BiWalk } from "react-icons/bi";
import { IoBedOutline, IoCarSportOutline } from "react-icons/io5";
import { PiBathtub } from "react-icons/pi";
import { TfiRulerAlt2 } from "react-icons/tfi";
import ImageGallery from "./ImageGallery";
import ShareButton from "@/app/components/ShareButton";

interface PropertyDetailPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({
  params,
}: PropertyDetailPageProps): Promise<Metadata> {
  const { code } = await params;
  const property = await getPropertyByCode(code);

  if (!property) {
    return {
      title: "Imóvel não encontrado - Renata Imóveis",
    };
  }

  return {
    title: `${property.code} - ${getPropertyTypeLabel(property.type)} - Renata Imóveis`,
    description: property.description || `Imóvel ${property.code} em ${property.address_neighborhood}, ${property.address_city}`,
  };
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { code } = await params;
  const property = await getPropertyByCode(code);

  if (!property) {
    notFound();
  }

  // Placeholder images for the gallery until backend supports multiple images
  const images = [
    "https://www.quintoandar.com.br/guias/wp-content/uploads/2023/06/casa-de-luxo-7-1.jpg", // Main
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=800&auto=format&fit=crop"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Gallery Section */}
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#960000]">Início</Link>
          <span>›</span>
          <Link href="/imoveis" className="hover:text-[#960000]">{property.address_city}</Link>
          <span>›</span>
          <Link href={`/imoveis?neighborhood=${property.address_neighborhood}`} className="hover:text-[#960000]">{property.address_neighborhood}</Link>
          <span>›</span>
          <span className="text-gray-900 line-clamp-1">{property.address_street}</span>
          <PropertyIdCopy code={property.code} />
        </div>

        {/* Gallery Grid */}
        {/* Gallery Grid */}
        <ImageGallery images={images} />
      </div>

      {/* Main Content & Sidebar */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">

          {/* Left Column - Content */}
          <div className="lg:col-span-2">

            {/* Header Info */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#1e1e1e] mb-2">
                  {getPropertyTypeLabel(property.type)} {property.status === 'for_sale' ? 'à venda' : 'para alugar'} com {property.bedrooms} quartos, {formatArea(property.usable_area)}
                </h1>
                <div className="text-gray-600 font-medium flex items-center gap-1.5 text-lg">
                  {property.address_street}, {property.address_number} - {property.address_neighborhood}, {property.address_city}/{property.address_state}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button className="p-3 rounded-full border border-gray-200 text-gray-400 hover:text-[#960000] hover:border-[#960000] hover:cursor-pointer transition-all self-end md:self-start">
                  <FiHeart size={20} />
                </button>

                <ShareButton
                  title={property.code}
                  text={`Confira este imóvel: ${property.code}`}
                />
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              <div className="border border-gray-100 rounded-xl p-4 flex flex-col items-start hover:shadow-sm transition-shadow">
                <TfiRulerAlt2 className="text-3xl text-[#960000] mb-2" />
                <span className="text-lg font-bold text-[#1e1e1e]">{formatArea(property.usable_area)}</span>
                <span className="text-xs text-gray-500">Útil</span>
              </div>
              <div className="border border-gray-100 rounded-xl p-4 flex flex-col items-start hover:shadow-sm transition-shadow">
                <IoBedOutline className="text-3xl text-[#960000] mb-2" />
                <span className="text-lg font-bold text-[#1e1e1e]">{property.bedrooms} Quartos</span>
                <span className="text-xs text-gray-500">{property.suites} suítes</span>
              </div>
              <div className="border border-gray-100 rounded-xl p-4 flex flex-col items-start hover:shadow-sm transition-shadow">
                <IoCarSportOutline className="text-3xl text-[#960000] mb-2" />
                <span className="text-lg font-bold text-[#1e1e1e]">{property.parking_spaces}</span>
                <span className="text-xs text-gray-500">Vagas</span>
              </div>
              <div className="border border-gray-100 rounded-xl p-4 flex flex-col items-start hover:shadow-sm transition-shadow">
                <PiBathtub className="text-3xl text-[#960000] mb-2" />
                <span className="text-lg font-bold text-[#1e1e1e]">{property.bathrooms}</span>
                <span className="text-xs text-gray-500">Banheiros</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-10">
              <div className="flex items-center gap-2">
                <FiCalendar /> {getDaysSinceCreated(property.created_at)}
              </div>

              <div className="flex items-center gap-2">
                <FiCalendar /> {getDaysSinceUpdated(property.updated_at)}
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full mb-10" />

            {/* Description */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-[#1e1e1e] mb-4">Descrição do imóvel</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                {property.description}
              </p>
            </div>

            <div className="h-px bg-gray-100 w-full mb-10" />

            {/* Features / Destaques */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-[#1e1e1e] mb-6">Destaques</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-4">
                {/* Dynamically mapped features */}
                {property.features?.map((feature, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#fbf3f3] flex items-center justify-center shrink-0 text-[#960000]">
                      <FiCheckCircle size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1e1e1e] text-sm mb-0.5">{feature}</h4>
                      <p className="text-xs text-gray-500">Característica do imóvel</p>
                    </div>
                  </div>
                ))}

                {/* Static Hardcoded Examples to match design aesthetic if features are empty or to fill space */}
                {(!property.features || property.features.length === 0) && (
                  <>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#fbf3f3] flex items-center justify-center shrink-0 text-[#960000]">
                        <MdOutlinePets size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1e1e1e] text-sm mb-0.5">Aceita Pet</h4>
                        <p className="text-xs text-gray-500">Permite animais de estimação no condomínio.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#fbf3f3] flex items-center justify-center shrink-0 text-[#960000]">
                        <MdOutlineWbSunny size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1e1e1e] text-sm mb-0.5">Sol da Manhã</h4>
                        <p className="text-xs text-gray-500">Posicionado com frente leste/norte.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#fbf3f3] flex items-center justify-center shrink-0 text-[#960000]">
                        <BiWalk size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1e1e1e] text-sm mb-0.5">Localização Privilegiada</h4>
                        <p className="text-xs text-gray-500">Próximo a tudo o que você precisa.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#fbf3f3] flex items-center justify-center shrink-0 text-[#960000]">
                        <MdOutlineLocalFireDepartment size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1e1e1e] text-sm mb-0.5">Churrasqueira</h4>
                        <p className="text-xs text-gray-500">O imóvel tem uma churrasqueira.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#fbf3f3] flex items-center justify-center shrink-0 text-[#960000]">
                        <MdOutlinePets size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1e1e1e] text-sm mb-0.5">Aceita Pet</h4>
                        <p className="text-xs text-gray-500">Permite animais de estimação no condomínio.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#fbf3f3] flex items-center justify-center shrink-0 text-[#960000]">
                        <MdOutlineWbSunny size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1e1e1e] text-sm mb-0.5">Sol da Manhã</h4>
                        <p className="text-xs text-gray-500">Posicionado com frente leste/norte.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#fbf3f3] flex items-center justify-center shrink-0 text-[#960000]">
                        <BiWalk size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1e1e1e] text-sm mb-0.5">Localização Privilegiada</h4>
                        <p className="text-xs text-gray-500">Próximo a tudo o que você precisa.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#fbf3f3] flex items-center justify-center shrink-0 text-[#960000]">
                        <MdOutlineLocalFireDepartment size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1e1e1e] text-sm mb-0.5">Churrasqueira</h4>
                        <p className="text-xs text-gray-500">O imóvel tem uma churrasqueira.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-25 space-y-4">

              {/* Main Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl shadow-gray-100/50">
                <div className="flex justify-between items-center mb-6">
                  <span className="bg-[var(--primary-light)] text-[var(--primary-hover)] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary-hover)]" />
                    Imóvel exclusivo
                  </span>
                  <span className="text-xs text-gray-400 cursor-pointer hover:underline">Entenda</span>
                </div>

                {/* Popularity Badge */}
                {/* Price */}
                <div className="mb-6">
                  <p className="text-xs text-gray-500 mb-1">
                    {property.status === 'for_sale' ? 'Valor de venda' : 'Somente aluguel:'}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#1e1e1e] tracking-tight">{formatPrice(property.sale_price)}</span>
                  </div>
                </div>

                {/* Fees */}
                <div className="space-y-3 mb-7 pb-7 border-b border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Condomínio</span>
                    <span className="font-medium text-gray-700">
                      {property.condominium_fee ? formatPrice(property.condominium_fee) : 'R$ 0,00'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">IPTU Anual</span>
                    <span className="font-medium text-gray-700">
                      {property.property_tax ? formatPrice(property.property_tax) : 'R$ 0,00'}
                    </span>
                  </div>

                  <div className="mt-4 bg-gray-50 rounded-lg p-3 flex items-start gap-3">
                    <FiInfo className="text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Os valores e a disponibilidade das unidades podem sofrer alterações sem aviso prévio. Consulte nossos corretores.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between mb-8 border border-gray-100">
                  <div className="text-xs text-gray-600">
                    <span className="font-bold block text-gray-900 text-sm">Alta procura</span>
                    1522 pessoas viram este imóvel recentemente
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#f2cccc] flex items-center justify-center text-[#960000]">
                    <FiEye />
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <button className="w-full bg-[#960000] hover:bg-[#b30000] hover:cursor-pointer text-white font-bold py-3.5 rounded-lg transition-colors shadow-sm text-sm">
                    Agendar visita
                  </button>
                  <p className="text-[10px] text-center text-gray-400 flex items-center justify-center gap-1">
                    <FiCheckCircle size={10} className="text-green-500" /> Sua visita é gratuita e livre de compromissos
                  </p>
                  <button className="w-full bg-white border border-[#960000] text-[#960000] hover:bg-gray-50 hover:cursor-pointer font-bold py-3.5 rounded-lg transition-colors text-sm">
                    Quero fazer uma proposta
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-[#1e1e1e] mb-6">Localização</h2>
          <Map address={`${property.address_street}, ${property.address_number} - ${property.address_neighborhood}, ${property.address_city}`} />
        </div>

        {/* Similar Properties Carousel */}
        <div>
          <h2 className="text-xl font-bold text-[#1e1e1e] mb-6">Imóveis semelhantes</h2>
          <SimilarProperties propertyType={property.type} currentPropertyId={property.id} />
        </div>
      </div>
    </div>
  );
}

// Separate component for async data fetching of similar properties
async function SimilarProperties({ propertyType, currentPropertyId }: { propertyType: any, currentPropertyId: string }) {
  const allSimilar = await getProperties({ type: propertyType, limit: 10 });
  const similarProperties = allSimilar.filter(p => p.id !== currentPropertyId);

  if (similarProperties.length === 0) {
    return <p className="text-gray-500">Nenhum imóvel semelhante encontrado.</p>;
  }

  return (
    <Carousel>
      {similarProperties.map((prop, index) => (
        <PropertyCard
          className="w-[276px]"
          property={prop}
          index={index}
          imageUrl={prop.images?.[0] || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop"} // Fallback image if needed, though card handles it usually
        />
      ))}
    </Carousel>
  );
}

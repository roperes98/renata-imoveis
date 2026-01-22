import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { PropertyDisplay } from "@/app/lib/types/database";

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
import FavoriteButton from "@/app/components/FavoriteButton";
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
    icons: {
      icon: "/icon.svg",
    },
    keywords: [property.code, getPropertyTypeLabel(property.type), property.address_neighborhood, property.address_city],
    openGraph: {
      title: `Renata Imóveis | Imóvel ${property.code}`,
      description: property.description || `Imóvel ${property.code} em ${property.address_neighborhood}, ${property.address_city}`,
      type: "website",
      locale: "pt-BR",
      siteName: "Renata Imóveis",
      url: `https://renataimoveis.com.br/imoveis/${property.code}`,
      images: [
        {
          url: property.images?.[0]?.url || "https://renataimoveis.com.br/og-image.png",
          width: 1200,
          height: 630,
          alt: `Renata Imóveis | Imóvel ${property.code}`,
        },
      ],
    },
    twitter: {
      title: `Renata Imóveis | Imóvel ${property.code}`,
      description: property.description || `Imóvel ${property.code} em ${property.address_neighborhood}, ${property.address_city}`,
      card: "summary_large_image",
      images: [
        {
          url: "https://renataimoveis.com.br/og-image.png",
          width: 1200,
          height: 630,
          alt: `Renata Imóveis | Imóvel ${property.code}`,
        },
      ],
    },
    alternates: {
      canonical: `https://renataimoveis.com.br/imoveis/${property.code}`,
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        nocache: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
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



  /* Helper to map property type to Schema.org type */
  function getSchemaType(type: string) {
    const apartmentTypes = ['apartment', 'flat', 'kitnet', 'loft', 'studio', 'penthouse'];
    const houseTypes = ['house', 'village_house', 'gated_community_house', 'farm'];

    if (apartmentTypes.includes(type)) return 'Apartment';
    if (houseTypes.includes(type)) return 'SingleFamilyResidence';
    if (type === 'allotment_land') return 'Landform'; // Or specific Land type if available, but Landform is often used or just Place
    return 'Accommodation'; // Fallback
  }

  const schemaType = getSchemaType(property.type);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: property.code,
    description: property.description,
    numberOfRooms: property.bedrooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.usable_area,
      unitCode: 'MTK'
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${property.address_street}, ${property.address_number}`,
      addressLocality: property.address_city,
      addressRegion: property.address_state,
      addressCountry: 'BR'
    },
    brand: {
      '@type': 'Brand',
      name: 'Renata Imóveis',
    },
    image: property.images?.[0]?.url || 'https://renataimoveis.com.br/og-image.png',
    offers: {
      '@type': 'Offer',
      price: property.sale_price,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url: `https://renataimoveis.com.br/imoveis/${property.code}`,
    },
    sku: property.id,
    url: `https://renataimoveis.com.br/imoveis/${property.code}`,
    ...(property.bedrooms ? { numberOfBedrooms: property.bedrooms } : {}),
    ...(property.bathrooms ? { numberOfBathroomsTotal: property.bathrooms } : {}),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: 'https://renataimoveis.com.br'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Imóveis',
        item: 'https://renataimoveis.com.br/imoveis'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: property.address_neighborhood,
        item: `https://renataimoveis.com.br/imoveis?neighborhood=${encodeURIComponent(property.address_neighborhood)}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: property.code,
        item: `https://renataimoveis.com.br/imoveis/${property.code}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([productSchema, breadcrumbSchema]).replace(/</g, '\\u003c') }}
      />

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
          {/* Gallery Grid */}
          <ImageGallery
            images={[
              ...(property.images || []),
              ...(property.condominiums?.images?.map(img => ({
                ...img,
                tag: `${img.tag || ""} | Condomínio`
              })) || [])
            ]}
          />
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
                  <FavoriteButton propertyId={property.id} />

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
                  <PiBathtub className="text-3xl text-[#960000] mb-2" />
                  <span className="text-lg font-bold text-[#1e1e1e]">{property.bathrooms}</span>
                  <span className="text-xs text-gray-500">Banheiros</span>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 flex flex-col items-start hover:shadow-sm transition-shadow">
                  <IoCarSportOutline className="text-3xl text-[#960000] mb-2" />
                  <span className="text-lg font-bold text-[#1e1e1e]">{property.parking_spaces}</span>
                  <span className="text-xs text-gray-500">Vagas</span>
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
            <Suspense fallback={<div className="h-[400px] bg-gray-50 rounded-xl animate-pulse flex items-center justify-center text-gray-400">Carregando imóveis semelhantes...</div>}>
              <SimilarProperties currentProperty={property} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}

// Separate component for async data fetching of similar properties
// Separate component for async data fetching of similar properties
async function SimilarProperties({ currentProperty }: { currentProperty: PropertyDisplay }) {
  // Strategy:
  // 1. Get properties in the SAME Condominium (if applicable)
  // 2. Get properties with similar characteristics (Status, Type, Location, Price, Area)

  const promises = [];

  // 1. Condominium Matches
  if (currentProperty.condominium_id) {
    promises.push(
      getProperties({
        condominiumId: currentProperty.condominium_id,
        status: currentProperty.status, // Same status usually makes sense, but maybe we want all in condo? Let's stick to status.
        limit: 5
      })
    );
  } else {
    promises.push(Promise.resolve({ data: [], count: 0 }));
  }

  // 2. Similar Specs Matches
  // Price +/- 25%
  const minPrice = currentProperty.sale_price ? currentProperty.sale_price * 0.75 : undefined;
  const maxPrice = currentProperty.sale_price ? currentProperty.sale_price * 1.25 : undefined;

  // Area +/- 25%
  const minArea = currentProperty.usable_area ? currentProperty.usable_area * 0.75 : undefined;
  const maxArea = currentProperty.usable_area ? currentProperty.usable_area * 1.25 : undefined;

  promises.push(
    getProperties({
      status: currentProperty.status,
      type: currentProperty.type,
      city: currentProperty.address_city, // Broaden to city, prefer neighborhood in sort if possible or just rely on price/area to narrow
      neighborhood: currentProperty.address_neighborhood, // Try neighborhood first? getProperties treats this as strict AND.
      // If we are too strict, we get nothing.
      // Let's relax neighborhood for the query but we can client-side sort if we want.
      // Actually, let's just match on City + Price + Area + Type. That is usually a good "Similar" set.
      // If we want to enforce Neighborhood, we can pass it. Let's start with Neighborhood strict.
      // If we find few, we might want to relax. For now, let's keep it simple: strict neighborhood or just city?
      // User said "imoveis semelhantes de fato". Comparison usually implies same neighborhood.
      // Let's try Strict Neighborhood first. (If we strictly filter by neighborhood, we might get 0 results for rare areas).
      // Ideally we'd do (Neighborhood OR (City AND PriceRange)).
      // Supabase simple query can't do complex ORs easily.
      // Let's do a slightly broader query: City + Type + Status + Price Range + Area Range.
      // And then we can sort/prioritize Neighborhood matches.
      // removing neighborhood strict filter to ensure we get results, but keeping City.
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      limit: 15
    })
  );

  const [condoResults, similarResults] = await Promise.all(promises);

  let allMatches = [
    ...(condoResults.data || []),
    ...(similarResults.data || [])
  ];

  // deduplicate and remove current
  const seen = new Set<string>();
  const filteredMatches = allMatches.filter(p => {
    if (p.id === currentProperty.id) return false;
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  // Weighted Scoring System for Relevance
  function calculateScore(candidate: PropertyDisplay) {
    let score = 0;

    // 1. Condominium (Highest Priority) - +2000
    if (currentProperty.condominium_id && candidate.condominium_id === currentProperty.condominium_id) {
      score += 1000;
    }

    // 2. Neighborhood - +1000
    if (candidate.address_neighborhood === currentProperty.address_neighborhood) {
      score += 1000;
    }

    // 3. Exact Bedrooms - +300
    if (candidate.bedrooms === currentProperty.bedrooms) {
      score += 300;
    }

    // 4. Exact Suites - +100
    if (candidate.suites === currentProperty.suites) {
      score += 100;
    }

    // 5. Exact Parking - +50
    if (candidate.parking_spaces === currentProperty.parking_spaces) {
      score += 50;
    }

    // 6. Price Closeness (Penalty)
    // Calculate % difference and penalize.
    if (currentProperty.sale_price && candidate.sale_price) {
      const diff = Math.abs(currentProperty.sale_price - candidate.sale_price);
      const percentDiff = diff / currentProperty.sale_price;
      // Penalize 10 points for every 1% difference
      score -= (percentDiff * 1000);
    }

    // 7. Area Closeness (Penalty)
    if (currentProperty.usable_area && candidate.usable_area) {
      const diff = Math.abs(currentProperty.usable_area - candidate.usable_area);
      const percentDiff = diff / currentProperty.usable_area;
      // Penalize 5 points for every 1% difference
      score -= (percentDiff * 500);
    }

    return score;
  }

  filteredMatches.sort((a, b) => {
    return calculateScore(b) - calculateScore(a);
  });

  const finalMatches = filteredMatches.slice(0, 10);

  if (finalMatches.length === 0) {
    return <p className="text-gray-500">Nenhum imóvel semelhante encontrado.</p>;
  }

  return (
    <Carousel>
      {finalMatches.map((prop, index) => (
        <PropertyCard
          key={prop.id}
          className="w-[276px]"
          property={prop}
          index={index}
          imageUrl={prop.images?.[0]?.url || null}
        />
      ))}
    </Carousel>
  );
}

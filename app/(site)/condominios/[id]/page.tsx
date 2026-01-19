import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCondominiumById, getPropertiesByCondominiumId } from "@/app/lib/supabase/properties";
import { formatPrice, formatArea } from "@/app/lib/utils/format";
import Map from "@/app/components/Map";
import PropertyCard from "@/app/components/PropertyCard";
import ImageGallery from "../../imoveis/[code]/ImageGallery";
import {
  FiCheckCircle,
  FiMapPin,
  FiCalendar,
  FiInfo,
  FiHeart,
  FiShare2
} from "react-icons/fi";

import { IoBedOutline, IoCarSportOutline } from "react-icons/io5";
import { TfiRulerAlt2 } from "react-icons/tfi";
import Carousel from "@/app/components/Carousel";
import PropertyIdCopy from "@/app/components/PropertyIdCopy";
import ShareButton from "@/app/components/ShareButton";

interface CondominiumDetailPageProps {
  params: Promise<{ id: string }>;
}

// Helper to format ranges
function formatRange(min: number | null, max: number | null, formatter: (val: number) => string) {
  if (min === null && max === null) return null;
  if (min !== null && (max === null || min === max)) return formatter(min);
  if (min === null && max !== null) return formatter(max);
  return `${formatter(min!)} a ${formatter(max!)}`;
}

// Helper function to get stage label
function getStageLabel(stage: string | null | undefined): string {
  const stageLabels: Record<string, string> = {
    planning: "Planejamento",
    foundation: "Fundação",
    structure: "Estrutura",
    masonry: "Alvenaria",
    finishing: "Acabamento",
    ready: "Pronto",
  };
  return stageLabels[stage || ""] || stage || "Não informado";
}

export async function generateMetadata({
  params,
}: CondominiumDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const condominium = await getCondominiumById(id);

  if (!condominium) {
    return {
      title: "Condomínio não encontrado - Renata Imóveis",
    };
  }

  const title = `${condominium.name} - Renata Imóveis`;
  const description = condominium.description || `Condomínio ${condominium.name}`;

  return {
    title,
    description,
    icons: {
      icon: "/icon.svg",
    },
    keywords: [condominium.name, "condomínio", "Rio de Janeiro", "Renata Imóveis"],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "pt-BR",
      siteName: "Renata Imóveis",
      url: `https://renataimoveis.com.br/condominios/${condominium.id}`,
      images: [
        {
          url: "https://renataimoveis.com.br/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
      images: [
        {
          url: "https://renataimoveis.com.br/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    alternates: {
      canonical: `https://renataimoveis.com.br/condominios/${condominium.id}`,
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

export default async function CondominiumDetailPage({
  params,
}: CondominiumDetailPageProps) {
  const { id } = await params;
  const condominium = await getCondominiumById(id);
  const properties = await getPropertiesByCondominiumId(id);

  if (!condominium) {
    notFound();
  }

  const address = condominium.condominium_addresses?.[0];
  const constructionInfo = condominium.construction_infos?.[0];

  // Calculate ranges based on AVAILABLE properties
  const prices = properties.map(p => p.sale_price).filter((p): p is number => p !== null);
  const areas = properties.map(p => p.usable_area).filter((p): p is number => p !== null);
  const bedrooms = properties.map(p => p.bedrooms).filter((p): p is number => p !== null);
  const parking = properties.map(p => p.parking_spaces).filter((p): p is number => p !== null);

  const ranges = {
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    minArea: areas.length ? Math.min(...areas) : null,
    maxArea: areas.length ? Math.max(...areas) : null,
    minBeds: bedrooms.length ? Math.min(...bedrooms) : null,
    maxBeds: bedrooms.length ? Math.max(...bedrooms) : null,
    minParking: parking.length ? Math.min(...parking) : null,
    maxParking: parking.length ? Math.max(...parking) : null,
  };

  // Generate REF code
  const idHash = condominium.id.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  const refCode = String(idHash % 1000).padStart(3, '0');

  // Real images from database
  const images = condominium.images || [];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HousingComplex',
    name: condominium.name,
    description: condominium.description,
    url: `https://renataimoveis.com.br/condominios/${condominium.id}`,
    image: 'https://renataimoveis.com.br/og-image.png',
    inLanguage: 'pt-BR',
    author: {
      '@type': 'Organization',
      name: 'Renata Imóveis',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Renata Imóveis',
      logo: {
        '@type': 'ImageObject',
        url: 'https://renataimoveis.com.br/logo.png',
      },
    },
    address: address ? {
      '@type': 'PostalAddress',
      streetAddress: `${address.street}, ${address.number}`,
      addressLocality: address.city,
      addressRegion: address.state,
      addressCountry: 'BR'
    } : undefined,
    datePublished: new Date(),
    dateModified: new Date(),
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
        name: 'Condomínios',
        item: 'https://renataimoveis.com.br/condominios'
      },
      ...(address ? [
        {
          '@type': 'ListItem',
          position: 3,
          name: address.city,
          item: `https://renataimoveis.com.br/condominios?city=${encodeURIComponent(address.city)}`
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: address.neighborhood,
          item: `https://renataimoveis.com.br/condominios?neighborhood=${encodeURIComponent(address.neighborhood)}`
        },
        {
          '@type': 'ListItem',
          position: 5,
          name: condominium.name,
          item: `https://renataimoveis.com.br/condominios/${condominium.id}`
        }
      ] : [
        {
          '@type': 'ListItem',
          position: 3,
          name: condominium.name,
          item: `https://renataimoveis.com.br/condominios/${condominium.id}`
        }
      ])
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([structuredData, breadcrumbSchema]).replace(/</g, '\\u003c') }}
      />

      <div className="min-h-screen bg-white">
        {/* Gallery Section */}
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumbs */}
          <div className="text-sm text-gray-500 mb-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-[#960000]">Início</Link>
            <span>›</span>
            <Link href="/condominios" className="hover:text-[#960000]">Condomínios</Link>
            {address && (
              <>
                <span>›</span>
                <span className="hover:text-[#960000]">{address.city}</span>
                <span>›</span>
                <span className="hover:text-[#960000]">{address.neighborhood}</span>
              </>
            )}
            <span>›</span>
            <span className="text-gray-900 line-clamp-1">{condominium.name}</span>
            <PropertyIdCopy code={`REF: ${refCode}`} />
          </div>

          {/* Gallery Grid */}
          <ImageGallery images={images} />
        </div>

        {/* Main Content & Sidebar */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">

            {/* Left Column - Content */}
            <div className="lg:col-span-2">

              {/* Header Info */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  {constructionInfo?.stage && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${constructionInfo.stage === 'ready'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                      }`}>
                      {getStageLabel(constructionInfo.stage)}
                    </span>
                  )}
                  {condominium.building_type && (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                      {condominium.building_type}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl md:text-4xl font-bold text-[#1e1e1e] mb-2">
                      {condominium.name}
                    </h1>
                    {address && (
                      <div className="text-gray-600 font-medium flex items-center gap-1.5 text-lg">
                        <FiMapPin className="shrink-0" />
                        {address.street}, {address.number} - {address.neighborhood}, {address.city}/{address.state}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button className="p-3 rounded-full border border-gray-200 text-gray-400 hover:text-[#960000] hover:border-[#960000] hover:cursor-pointer transition-all self-end md:self-start">
                      <FiHeart size={20} />
                    </button>



                    <ShareButton
                      title={condominium.name}
                      text={`Confira este condomínio: ${condominium.name}`}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Stats Banner (Ranges) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                <div className="border border-gray-100 rounded-xl p-4 flex flex-col items-start hover:shadow-sm transition-shadow">
                  <TfiRulerAlt2 className="text-3xl text-[#960000] mb-2" />
                  <span className="text-lg font-bold text-[#1e1e1e]">
                    {ranges.minArea ? formatRange(ranges.minArea, ranges.maxArea, formatArea) : '-- m²'}
                  </span>
                  <span className="text-xs text-gray-500">Área Útil</span>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 flex flex-col items-start hover:shadow-sm transition-shadow">
                  <IoBedOutline className="text-3xl text-[#960000] mb-2" />
                  <span className="text-lg font-bold text-[#1e1e1e]">
                    {ranges.minBeds ? formatRange(ranges.minBeds, ranges.maxBeds, (n) => n.toString()) : '--'}
                  </span>
                  <span className="text-xs text-gray-500">Quartos</span>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 flex flex-col items-start hover:shadow-sm transition-shadow">
                  <IoCarSportOutline className="text-3xl text-[#960000] mb-2" />
                  <span className="text-lg font-bold text-[#1e1e1e]">
                    {ranges.minParking ? formatRange(ranges.minParking, ranges.maxParking, (n) => n.toString()) : '--'}
                  </span>
                  <span className="text-xs text-gray-500">Vagas</span>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 flex flex-col items-start hover:shadow-sm transition-shadow">
                  <FiCalendar className="text-3xl text-[#960000] mb-2" />
                  <span className="text-lg font-bold text-[#1e1e1e]">
                    {condominium.construction_year || '--'}
                  </span>
                  <span className="text-xs text-gray-500">Ano construção</span>
                </div>
              </div>

              <div className="h-px bg-gray-100 w-full mb-10" />

              {/* Description */}
              <div className="mb-10">
                <h2 className="text-xl font-bold text-[#1e1e1e] mb-4">Sobre o empreendimento</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                  {condominium.description || "Descrição não disponível."}
                </p>
              </div>

              <div className="h-px bg-gray-100 w-full mb-10" />

              {/* Amenities / Destaques */}
              {condominium.amenities && condominium.amenities.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-[#1e1e1e] mb-6">Comodidades e Lazer</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-4">
                    {condominium.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-[#fbf3f3] flex items-center justify-center shrink-0 text-[#960000]">
                          <FiCheckCircle size={16} />
                        </div>
                        <span className="font-medium text-[#1e1e1e]">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-25 space-y-4">

                {/* Main Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl shadow-gray-100/50">
                  <p className="text-xs text-gray-500 mb-1">
                    Valores a partir de
                  </p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-extrabold text-[#1e1e1e] tracking-tight">
                      {ranges.minPrice ? formatPrice(ranges.minPrice) : 'Sob Consulta'}
                    </span>
                  </div>

                  {/* Developer Info */}
                  {(constructionInfo?.developer_name || constructionInfo?.construction_company) && (
                    <div className="space-y-3 mb-8 pb-8 border-b border-gray-100">
                      {constructionInfo.developer_name && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Incorporadora</span>
                          <span className="font-medium text-gray-700">{constructionInfo.developer_name}</span>
                        </div>
                      )}
                      {constructionInfo.construction_company && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Construtora</span>
                          <span className="font-medium text-gray-700">{constructionInfo.construction_company}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-3 flex items-start gap-3 mb-6">
                    <FiInfo className="text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Os valores e a disponibilidade das unidades podem sofrer alterações sem aviso prévio. Consulte nossos corretores.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    <button className="w-full bg-[#960000] hover:bg-[#b30000] hover:cursor-pointer text-white font-bold py-3.5 rounded-lg transition-colors shadow-sm text-sm">
                      Agendar visita ao decorado
                    </button>
                    <button className="w-full bg-white border border-[#960000] text-[#960000] hover:bg-gray-50 hover:cursor-pointer font-bold py-3.5 rounded-lg transition-colors text-sm">
                      Solicitar tabela de vendas
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Available Units Section */}
          <div className="mb-16">
            <h2 className="text-xl font-bold text-[#1e1e1e] mb-6">Unidades Disponíveis ({properties.length})</h2>
            {properties.length > 0 ? (
              <Carousel>
                {properties.map((prop, index) => (
                  <PropertyCard
                    className="w-[276px]"
                    key={prop.id}
                    property={prop}
                    index={index}
                    imageUrl={prop.images?.[0]?.url || null}
                  />
                ))}
              </Carousel>
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No momento não há unidades cadastradas online para este empreendimento.</p>
                <button className="text-[#960000] font-bold hover:underline">
                  Entre em contato para verificar disponibilidade off-market
                </button>
              </div>
            )}
          </div>

          {/* Owner CTA */}
          <div className="bg-white rounded-2xl p-8 mb-16 border border-gray-outline">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left Column */}
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold text-[#b30000] tracking-wider">
                  Venha para Renata Imóveis
                </span>
                <h3 className="mt-3 text-2xl md:text-3xl font-bold text-[#1e1e1e]">
                  Você possui imóvel no<br /> condomínio {condominium.name}?
                </h3>
                <Link
                  href="/anunciar"
                  className="bg-[#960000] hover:bg-[#b30000] text-white font-bold mt-10 py-3.5 px-8 rounded-4xl transition-colors shadow-sm hover:shadow-md"
                >
                  Anunciar meu imóvel
                </Link>
              </div>

              {/* Right Column - Advantages */}
              <div className="space-y-6 md:pl-8">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-[#960000] shadow-sm">
                    <FiCheckCircle size={20} />
                  </div>
                  <span className="text-lg font-bold text-[#1e1e1e]">
                    Precificação assertiva focada na realidade do seu condomínio.
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-[#960000] shadow-sm">
                    <FiCheckCircle size={20} />
                  </div>
                  <span className="text-lg font-bold text-[#1e1e1e]">
                    Nossa plataforma recebe milhares de acessos de compradores qualificados.
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-[#960000] shadow-sm">
                    <FiCheckCircle size={20} />
                  </div>
                  <span className="text-lg font-bold text-[#1e1e1e]">
                    Estratégias de marketing personalizadas para vender seu imóvel mais rápido.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          {address && (
            <div className="mb-16">
              <h2 className="text-xl font-bold text-[#1e1e1e] mb-6">Localização</h2>
              <Map address={`${address.street}, ${address.number} - ${address.neighborhood}, ${address.city}`} />
            </div>
          )}

        </div>
      </div>
    </>
  );
}

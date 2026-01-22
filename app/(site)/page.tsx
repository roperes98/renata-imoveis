import Link from "next/link";
import type { Metadata } from "next";
import { getProperties, getCondominiums } from "@/app/lib/supabase/properties";
import { getBusinessReviews } from "@/app/lib/googleBusinessProfile";
import type { RealEstate } from "@/app/lib/types/database";
import type { CondominiumDisplay } from "@/app/lib/supabase/properties";
import CondominiumCard from "@/app/components/CondominiumCard";
import PropertyCard from "@/app/components/PropertyCard";
import ReviewCard from "@/app/components/ReviewCard";
import CategoriesCard from "@/app/components/CategoriesCard";
import NeighborhoodsCard from "@/app/components/NeighborhoodsCard";

import Carousel from "@/app/components/Carousel";

import { FiMapPin, FiPhone, FiMail } from "react-icons/fi"

export const metadata: Metadata = {
  title: "Renata Imóveis - Sua imobiliária de confiança",
  description: "Encontre o imóvel dos seus sonhos com a Renata Imóveis. Apartamentos, casas e terrenos nos melhores bairros do Rio de Janeiro.",
  icons: {
    icon: "/icon.svg",
  },
  keywords: ["imóveis", "apartamentos", "casas", "terrenos", "imobiliária", "Rio de Janeiro", "Renata Imóveis"],
  openGraph: {
    title: "Renata Imóveis - Sua imobiliária de confiança",
    description: "Encontre o imóvel dos seus sonhos com a Renata Imóveis. Apartamentos, casas e terrenos nos melhores bairros do Rio de Janeiro.",
    type: "website",
    locale: "pt-BR",
    siteName: "Renata Imóveis",
    url: "https://renataimoveis.com.br",
    images: [
      {
        url: "https://renataimoveis.com.br/og-image.png",
        width: 1200,
        height: 630,
        alt: "Renata Imóveis - Sua imobiliária de confiança",
      },
    ],
  },
  twitter: {
    title: "Renata Imóveis - Sua imobiliária de confiança",
    description: "Encontre o imóvel dos seus sonhos com a Renata Imóveis. Apartamentos, casas e terrenos nos melhores bairros do Rio de Janeiro.",
    card: "summary_large_image",
    images: [
      {
        url: "https://renataimoveis.com.br/og-image.png",
        width: 1200,
        height: 630,
        alt: "Renata Imóveis - Sua imobiliária de confiança",
      },
    ],
  },
  alternates: {
    canonical: "https://renataimoveis.com.br",
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

export default async function Home() {
  // Fetch featured properties, condominiums and latest Google reviews
  const [featuredPropertiesResponse, featuredCondominiums, googleReviews] =
    await Promise.all([
      getProperties({ limit: 10 }),
      getCondominiums(10),
      getBusinessReviews(),
    ]);

  const featuredProperties = featuredPropertiesResponse.data;

  // Categories (counts can be fetched dynamically if needed)
  const categories = [
    { name: "Apartamentos", count: 0, icon: "🏢" },
    { name: "Casas", count: 0, icon: "🏠" },
    { name: "Terrenos", count: 0, icon: "📐" },
    { name: "Comerciais", count: 0, icon: "🏪" },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Renata Imóveis',
    image: 'https://renataimoveis.com.br/og-image.png',
    '@id': 'https://renataimoveis.com.br',
    url: 'https://renataimoveis.com.br',
    telephone: '+5521998158080',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Avenida das Américas, 7899 / bl. 2 - loja 101',
      addressLocality: 'Barra da Tijuca',
      addressRegion: 'RJ',
      postalCode: '22793-081',
      addressCountry: 'BR'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -23.000574,
      longitude: -43.398684
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday'
        ],
        opens: '09:00',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '13:00'
      }
    ],
    sameAs: [
      'https://www.instagram.com/_renataimoveis',
      'https://www.facebook.com/renataimoveis'
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-[#0f1216] to-[#1e1e1e] text-white py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Encontre o Imóvel dos Seus Sonhos
              </h1>
              <p className="text-xl md:text-2xl text-[#e6e6e6] mb-8">
                A Renata Imóveis oferece os melhores imóveis com qualidade,
                transparência e confiança.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/imoveis"
                  className="bg-[#960000] text-white px-8 py-4 rounded-lg hover:bg-[#b30000] transition-colors font-semibold text-center"
                >
                  Ver Imóveis
                </Link>
                <Link
                  href="/contato"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-[#0f1216] transition-colors font-semibold text-center"
                >
                  Fale Conosco
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* Categories Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold text-[#1e1e1e]">
                Explore por bairros
              </h2>
              <Link
                href="/condominios"
                className="group relative text-sm text-gray-outline font-semibold border border-gray-outline px-[22px] py-[10px] rounded-lg flex items-center gap-2 overflow-hidden transition-all duration-300 hover:border-[#960000]"
              >
                <span className="relative z-10 flex items-center gap-2 group-hover:text-[#fafafa] transition-colors duration-300">
                  Ver todos
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 10 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M5.5 12L10.5 8L5.5 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="absolute inset-0 bg-[#960000] transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
              </Link>
            </div>
            <Carousel>
              <NeighborhoodsCard
                imageUrl="/barra.jpg"
                name="Barra da Tijuca"
              />
              <NeighborhoodsCard
                imageUrl="/recreio.png"
                name="Recreio dos Bandeirantes"
              />
              <NeighborhoodsCard
                imageUrl="/copacabana.jpg"
                name="Copacabana"
              />
              <NeighborhoodsCard
                imageUrl="/copacabana.jpg"
                name="Ipanema"
              />
              <NeighborhoodsCard
                imageUrl="/copacabana.jpg"
                name="Leblon"
              />
              <NeighborhoodsCard
                imageUrl="/maracana.jpg"
                name="Maracanã"
              />
              <NeighborhoodsCard
                imageUrl="/maracana.jpg"
                name="Grajaú"
              />
            </Carousel>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold text-[#1e1e1e]">
                Explore por categoria
              </h2>
              <Link
                href="/condominios"
                className="group relative text-sm text-gray-outline font-semibold border border-gray-outline px-[22px] py-[10px] rounded-lg flex items-center gap-2 overflow-hidden transition-all duration-300 hover:border-[#960000]"
              >
                <span className="relative z-10 flex items-center gap-2 group-hover:text-[#fafafa] transition-colors duration-300">
                  Ver todos
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 10 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M5.5 12L10.5 8L5.5 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="absolute inset-0 bg-[#960000] transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
              </Link>
            </div>
            <Carousel>
              <CategoriesCard
                imageUrl="https://fotos.sobressai.com.br/fotos/1235/1235/2641466/37028567/MM_15.jpg?v=4"
                title="Alto padrão"
                description="Imóveis de luxo com acabamento diferenciado."
              />
              <CategoriesCard
                imageUrl="https://fotos.sobressai.com.br/fotos/1235/1235/2641466/37028567/MM_15.jpg?v=4"
                title="Com mobília"
                description="Conforto e praticidade para você morar tranquilo."
              />
              <CategoriesCard
                imageUrl="https://fotos.sobressai.com.br/fotos/1235/1235/2641466/37028567/MM_15.jpg?v=4"
                title="Bairro seguro"
                description="Segurança para você viver tranquilo e relaxado."
              />
              <CategoriesCard
                imageUrl="https://fotos.sobressai.com.br/fotos/1235/1235/2641466/37028567/MM_15.jpg?v=4"
                title="Próximo à praia"
                description="Localização privilegiada próxima às melhores praias do Rio."
              />
              <CategoriesCard
                imageUrl="https://fotos.sobressai.com.br/fotos/1235/1235/2641466/37028567/MM_15.jpg?v=4"
                title="Próximo ao metrô"
                description="Facilidade de transporte e mobilidade urbana."
              />
            </Carousel>
          </div>
        </section>

        {/* Featured Condominiums */}
        <section className="py-16 bg-[#fafafa]">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold text-[#1e1e1e]">
                Condomínios em Destaque
              </h2>
              <Link
                href="/condominios"
                className="group relative text-sm text-gray-outline font-semibold border border-gray-outline px-[22px] py-[10px] rounded-lg flex items-center gap-2 overflow-hidden transition-all duration-300 hover:border-[#960000]"
              >
                <span className="relative z-10 flex items-center gap-2 group-hover:text-[#fafafa] transition-colors duration-300">
                  Ver todos
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 10 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M5.5 12L10.5 8L5.5 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="absolute inset-0 bg-[#960000] transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
              </Link>
            </div>
            <Carousel>
              {featuredCondominiums.map((condominium: CondominiumDisplay, index: number) => {
                const imageUrl = condominium.images?.[0]?.url || null;

                return (
                  <CondominiumCard
                    key={condominium.id}
                    condominium={condominium}
                    imageUrl={imageUrl}
                    index={index}
                  />
                );
              })}
            </Carousel>
          </div>
        </section>

        <section className="py-16 bg-[#fafafa]">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold text-[#1e1e1e]">
                Imóveis em Destaque
              </h2>
              <Link
                href="/imoveis"
                className="group relative text-sm text-gray-outline font-semibold border border-gray-outline px-[22px] py-[10px] rounded-lg flex items-center gap-2 overflow-hidden transition-all duration-300 hover:border-[#960000]"
              >
                <span className="relative z-10 flex items-center gap-2 group-hover:text-[#fafafa] transition-colors duration-300">
                  Ver todos
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 10 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M5.5 12L10.5 8L5.5 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="absolute inset-0 bg-[#960000] transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
              </Link>
            </div>
            <Carousel>
              {featuredProperties.map((property: RealEstate, index: number) => {
                const imageUrl = property.images?.[0]?.url || null;

                return (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    imageUrl={imageUrl}
                    index={index}
                    className="w-[276px]"
                  />
                );
              })}
            </Carousel>
          </div>
        </section>

        <section className="py-16 bg-[#fafafa]">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold text-[#1e1e1e]">
                Imóveis Exclusivos
              </h2>
              <Link
                href="/imoveis"
                className="group relative text-sm text-gray-outline font-semibold border border-gray-outline px-[22px] py-[10px] rounded-lg flex items-center gap-2 overflow-hidden transition-all duration-300 hover:border-[#960000]"
              >
                <span className="relative z-10 flex items-center gap-2 group-hover:text-[#fafafa] transition-colors duration-300">
                  Ver todos
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 10 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M5.5 12L10.5 8L5.5 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="absolute inset-0 bg-[#960000] transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
              </Link>
            </div>
            <Carousel>
              {featuredProperties.map((property: RealEstate, index: number) => {
                const imageUrl = property.images?.[0]?.url || null;

                return (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    imageUrl={imageUrl}
                    index={index}
                    className="w-[276px]"
                  />
                );
              })}
            </Carousel>
          </div>
        </section>

        <section className="py-16 bg-[#fafafa]">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold text-[#1e1e1e]">
                Salas em Destaque
              </h2>
              <Link
                href="/imoveis"
                className="group relative text-sm text-gray-outline font-semibold border border-gray-outline px-[22px] py-[10px] rounded-lg flex items-center gap-2 overflow-hidden transition-all duration-300 hover:border-[#960000]"
              >
                <span className="relative z-10 flex items-center gap-2 group-hover:text-[#fafafa] transition-colors duration-300">
                  Ver todos
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 10 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M5.5 12L10.5 8L5.5 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="absolute inset-0 bg-[#960000] transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
              </Link>
            </div>
            <Carousel>
              {featuredProperties.map((property: RealEstate, index: number) => {
                const imageUrl = property.images?.[0]?.url || null;

                return (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    imageUrl={imageUrl}
                    index={index}
                    className="w-[276px]"
                  />
                );
              })}
            </Carousel>
          </div>
        </section>

        {/* Google Reviews */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-sm uppercase tracking-[0.2em] text-[#960000] font-semibold">
                Google Maps
              </p>
              <h2 className="text-3xl font-bold text-[#1e1e1e] mt-2">
                O que dizem nossos clientes
              </h2>
              <p className="text-[#4f4f4f] mt-3">
                Avaliações reais de quem comprou ou alugou com a Renata Imóveis.
              </p>
            </div>

            {googleReviews.length === 0 ? (
              <div className="text-center text-[#4f4f4f]">
                <p>
                  Não foi possível carregar as avaliações agora. Tente novamente
                  mais tarde.
                </p>
              </div>
            ) : (
              <Carousel>
                {googleReviews.map((review, index) => (
                  <div key={index} className="w-[350px] md:w-[400px] h-full">
                    <ReviewCard
                      authorName={review.authorName}
                      rating={review.rating}
                      text={review.text}
                      relativeTime={review.relativeTime}
                      profilePhotoUrl={review.profilePhotoUrl}
                      reviewUrl={review.reviewUrl}
                    />
                  </div>
                ))}
              </Carousel>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-white">
          <div className="bg-white py-12 pl-11 pr-12 rounded-2xl shadow-md border border-gray-200 container mx-auto flex items-center justify-between">
            {/* Left Column - Contact CTA */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-[#1e1e1e] mb-4">
                Entre em contato <br />com a gente!
              </h2>
              <p className="text-[#4f4f4f] mb-8 text-lg">
                Entre em contato com a Renata Imóveis, <br />queremos tirar suas dúvidas, ouvir suas <br />críticas e sugestões.
              </p>
              <div className="flex justify-center md:justify-start">
                <a
                  href="https://wa.me/5521998158080"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#960000] text-white px-8 py-4 rounded-lg hover:bg-[var(--primary-hover)] transition-colors font-semibold"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Entrar em contato
                </a>
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div className="space-y-6 text-center md:text-left">
              <Link
                href="tel:+5521987654321"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 justify-center md:justify-start transition-colors"
                aria-label="WhatsApp"
              >
                <FiPhone size={28} className="text-[#B22A22]" />
                <p className="text-[#4f4f4f] group-hover:text-[#b30000] transition-colors text-lg">
                  (21) 99815-8080
                </p>
              </Link>
              <Link
                href="https://maps.app.goo.gl/5H4yxPTFTUeRq1KR9"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 justify-center md:justify-start transition-colors"
                aria-label="WhatsApp"
              >
                <FiMapPin size={28} className="text-[#B22A22]" />
                <p className="text-[#4f4f4f] group-hover:text-[#b30000] transition-colors text-lg">
                  Avenida das Américas, 7899 / bl. 2 - loja 101
                  <br />
                  Barra da Tijuca, RJ - 22793-081
                </p>
              </Link>
              <Link
                href="mailto:contato@renataimoveis.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 justify-center md:justify-start transition-colors"
                aria-label="WhatsApp"
              >
                <FiMail size={28} className="text-[#B22A22]" />
                <p className="text-[#4f4f4f] group-hover:text-[#b30000] transition-colors text-lg">
                  contato@renataimoveis.com.br
                </p>
              </Link>
            </div>
          </div>
        </section >
      </div >
    </>
  );
}

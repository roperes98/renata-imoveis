import Link from "next/link";
import type { Metadata } from "next";
import { getCondominiums } from "@/app/lib/supabase/properties";
import CondominiumCard from "@/app/components/CondominiumCard";
import type { CondominiumDisplay } from "@/app/lib/supabase/properties";

export const metadata: Metadata = {
  title: "Condomínios",
  description: "Explore nossos condomínios em destaque. Encontre o condomínio perfeito para você.",
  icons: {
    icon: "/icon.svg",
  },
  keywords: ["condomínios", "apartamentos", "casas", "imóveis", "Rio de Janeiro", "Renata Imóveis"],
  openGraph: {
    title: "Renata Imóveis | Condomínios",
    description: "Explore nossos condomínios em destaque. Encontre o condomínio perfeito para você.",
    type: "website",
    locale: "pt-BR",
    siteName: "Renata Imóveis",
    url: "https://renataimoveis.com.br/condominios",
    images: [
      {
        url: "https://renataimoveis.com.br/og-image.png",
        width: 1200,
        height: 630,
        alt: "Renata Imóveis | Condomínios",
      },
    ],
  },
  twitter: {
    title: "Renata Imóveis | Condomínios",
    description: "Explore nossos condomínios em destaque. Encontre o condomínio perfeito para você.",
    card: "summary_large_image",
    images: [
      {
        url: "https://renataimoveis.com.br/og-image.png",
        width: 1200,
        height: 630,
        alt: "Renata Imóveis | Condomínios",
      },
    ],
  },
  alternates: {
    canonical: "https://renataimoveis.com.br/condominios",
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

export default async function CondominiosPage() {
  const condominiums = await getCondominiums();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Renata Imóveis | Condomínios',
    description: 'Explore nossos condomínios em destaque. Encontre o condomínio perfeito para você.',
    numberOfItems: condominiums.length,
    itemListElement: condominiums.map((condominium, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'HousingComplex',
        name: condominium.name,
        description: condominium.description,
        url: `https://renataimoveis.com.br/condominios/${condominium.id}`,
      },
    })),
    url: 'https://renataimoveis.com.br/condominios',
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
    datePublished: new Date(),
    dateModified: new Date(),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />

      <div className="min-h-screen bg-[#fafafa] py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-[#960000] hover:text-[#b30000] mb-6 font-semibold"
            >
              ← Voltar para início
            </Link>
            <h1 className="text-4xl font-bold text-[#1e1e1e] mb-4">
              Nossos Condomínios
            </h1>
            <p className="text-lg text-[#4f4f4f]">
              Explore nossa seleção de condomínios em destaque
            </p>
          </div>

          {condominiums.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-xl text-[#4f4f4f]">
                Nenhum condomínio encontrado no momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {condominiums.map((condominium: CondominiumDisplay, index: number) => {
                // Mock image URL - only from second condominium onwards (index > 0) for debugging
                // First condominium (index 0) will show fallback
                const imageUrl = index > 0
                  ? "https://lopesrio.com.br/wp-content/uploads/2025/03/3-FACHADA-EPIC-1.000-1.jpg"
                  : null;

                return (
                  <CondominiumCard
                    key={condominium.id}
                    condominium={condominium}
                    imageUrl={imageUrl}
                    index={index}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}


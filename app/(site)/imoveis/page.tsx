import PropertiesList from "@/app/components/PropertiesList";
import { getProperties, getNeighborhoods, getPropertyTypes, getCondominiums } from "@/app/lib/supabase/properties";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Imóveis",
  description: "Encontre o imóvel dos seus sonhos com a Renata Imóveis. Apartamentos, casas e terrenos nos melhores bairros do Rio de Janeiro.",
  icons: {
    icon: "/icon.svg",
  },
  keywords: ["imóveis", "apartamentos", "casas", "terrenos", "imobiliária", "Rio de Janeiro", "Renata Imóveis"],
  openGraph: {
    title: "Renata Imóveis | Imóveis",
    description: "Encontre o imóvel dos seus sonhos com a Renata Imóveis. Apartamentos, casas e terrenos nos melhores bairros do Rio de Janeiro.",
    type: "website",
    locale: "pt-BR",
    siteName: "Renata Imóveis",
    url: "https://renataimoveis.com.br/imoveis",
    images: [
      {
        url: "https://renataimoveis.com.br/og-image.png",
        width: 1200,
        height: 630,
        alt: "Renata Imóveis | Imóveis",
      },
    ],
  },
  twitter: {
    title: "Renata Imóveis | Imóveis",
    description: "Encontre o imóvel dos seus sonhos com a Renata Imóveis. Apartamentos, casas e terrenos nos melhores bairros do Rio de Janeiro.",
    card: "summary_large_image",
    images: [
      {
        url: "https://renataimoveis.com.br/og-image.png",
        width: 1200,
        height: 630,
        alt: "Renata Imóveis | Imóveis",
      },
    ],
  },
  alternates: {
    canonical: "https://renataimoveis.com.br/imoveis",
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

export default async function Imoveis() {
  // Fetch initial data on the server
  const [properties, neighborhoods, propertyTypes, condominiums] = await Promise.all([
    getProperties({ limit: 50 }),
    getNeighborhoods(),
    getPropertyTypes(),
    getCondominiums(),
  ]);

  /* Helper to map property type to Schema.org type */
  function getSchemaType(type: string) {
    const apartmentTypes = ['apartment', 'flat', 'kitnet', 'loft', 'studio', 'penthouse'];
    const houseTypes = ['house', 'village_house', 'gated_community_house', 'farm'];

    if (apartmentTypes.includes(type)) return 'Apartment';
    if (houseTypes.includes(type)) return 'SingleFamilyResidence';
    if (type === 'allotment_land') return 'Landform';
    return 'Accommodation';
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Renata Imóveis | Imóveis',
    description: 'Encontre o imóvel dos seus sonhos com a Renata Imóveis. Apartamentos, casas e terrenos nos melhores bairros do Rio de Janeiro.',
    numberOfItems: properties.length,
    itemListElement: properties.map((property, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': getSchemaType(property.type),
        name: property.code,
        description: property.description,
        // image: property.image,
        offers: {
          '@type': 'Offer',
          price: property.sale_price,
          priceCurrency: 'BRL',
          availability: 'https://schema.org/InStock',
        },
        sku: property.id,
        url: `https://renataimoveis.com.br/imoveis/${property.code}`,
      },
    })),
    url: 'https://renataimoveis.com.br/imoveis',
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
          <h1 className="text-4xl font-bold mb-8 text-[#1e1e1e]">
            Nossos Imóveis
          </h1>
          <PropertiesList
            initialProperties={properties}
            neighborhoods={neighborhoods}
            propertyTypes={propertyTypes}
            condominiums={condominiums}
          />
        </div>
      </div>
    </>
  );
}


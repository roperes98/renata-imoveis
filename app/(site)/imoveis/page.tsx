import PropertiesList from "@/app/components/PropertiesList";
import { getProperties, getNeighborhoods, getPropertyTypes, getCondominiums, getPropertiesForMap } from "@/app/lib/supabase/properties";
import { Metadata } from "next";

// ... metadata

export default async function Imoveis() {
  // Fetch initial data on the server
  const [propertiesResult, neighborhoods, propertyTypes, condominiums, mapProperties] = await Promise.all([
    getProperties({ limit: 12, page: 1 }),
    getNeighborhoods(),
    getPropertyTypes(),
    getCondominiums(),
    getPropertiesForMap()
  ]);

  const properties = propertiesResult.data;
  const totalCount = propertiesResult.count;

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

      <div className="bg-[#fafafa]">
        {/* Removed container and py-12 to allow full width map */}
        <PropertiesList
          initialProperties={properties}
          totalCount={totalCount}
          neighborhoods={neighborhoods}
          propertyTypes={propertyTypes}
          condominiums={condominiums}
          mapProperties={mapProperties}
        />
      </div>
    </>
  );
}

// // garden
// [{ "tag": "coelho ambiente", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/366/HSF.RT.002-25.jpg" }, { "tag": "coelho estimação", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/366/HSF.RT.002-20.jpg" }, { "tag": "coelho 3", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/366/HSF.RT.002-14.jpg" }, { "tag": "coelho 4", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/366/HSF.RT.002-08.jpg" }, { "tag": "coelho 5", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/366/22HSF.RT.002-22.jpg" }, { "tag": "coelho 6", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/366/1HSF.RT.002-01.jpg" }, { "tag": "coelho 7", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/366/19HSF.RT.002-19.jpg" }, { "tag": "coelho 8", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/366/16HSF.RT.002-16.jpg" }, { "tag": "coelho 9", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/366/13HSF.RT.002-13.jpg" }, { "tag": "coelho 10", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/366/11HSF.RT.002-11.jpg" }]


// mundo novo
// [{ "tag": "Sauna", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Sauna.png" }, { "tag": "Sauna Dolce Vitta", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Sauna%20Dolce%20Vitta.png" }, { "tag": "Sala Jovem Dolce Vitta", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Sala%20Jovem%20Dolce%20Vitta.png" }, { "tag": "Sala de Spini", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Sala%20de%20Spini.png" }, { "tag": "Sala de Pilates", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Sala%20de%20Pilates.png" }, { "tag": "Sala de Ginastica", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Sala%20de%20Ginastica.png" }, { "tag": "Sala Adulto Dolce Vitta", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Sala%20Adulto%20Dolce%20Vitta.png" }, { "tag": "Restaurante Dolce Vitta", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Restaurante%20Dolce%20Vitta.png" }, { "tag": "Restaurante Dolce Vitta 2", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Restaurante%20Dolce%20Vitta-2.png" }, { "tag": "Quadra Volei Areia", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Quadra%20volei%20areia_.png" }, { "tag": "Quadra Tennis", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Quadra%20de%20Tennis.png" }, { "tag": "Quadra Grama", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Quadra%20de%20grama.png" }, { "tag": "Piscina Dolce Vitta", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Piscina%20Dolce%20Vitta.png" }, { "tag": "Piscina Clube", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Piscina%20Clube.png" }, { "tag": "Piscina Clube 2", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Piscina%20Clube-2.png" }, { "tag": "Piscina Aquecida", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Piscina%20aquecida.png" }, { "tag": "Parquinho", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Parquinho.png" }, { "tag": "Churrasqueira Dolce Vitta", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Churrasqueira%20Dolce%20Vitta.png" }, { "tag": "Brinquedoteca Dolce Vitta", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Brinquedoteca%20Dolce%20Vitta.png" }, { "tag": "Academia", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Academia.png" }, { "tag": "Academia Dolce Vitta", "url": "https://supabase.360renataimoveis.com/storage/v1/object/public/condominiums-images/701/Academia%20Dolce%20Vitta.png" }]
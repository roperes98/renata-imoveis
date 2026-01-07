import PropertiesList from "@/app/components/PropertiesList";
import { getProperties, getNeighborhoods, getPropertyTypes, getCondominiums } from "@/app/lib/supabase/properties";

export default async function Imoveis() {
  // Fetch initial data on the server
  const [properties, neighborhoods, propertyTypes, condominiums] = await Promise.all([
    getProperties({ limit: 50 }),
    getNeighborhoods(),
    getPropertyTypes(),
    getCondominiums(),
  ]);

  return (
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
  );
}


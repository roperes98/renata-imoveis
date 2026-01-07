import Link from "next/link";
import type { Metadata } from "next";
import { getCondominiums } from "@/app/lib/supabase/properties";
import CondominiumCard from "@/app/components/CondominiumCard";
import type { CondominiumDisplay } from "@/app/lib/supabase/properties";

export const metadata: Metadata = {
  title: "Condomínios - Renata Imóveis",
  description: "Explore nossos condomínios em destaque. Encontre o condomínio perfeito para você.",
};

export default async function CondominiosPage() {
  const condominiums = await getCondominiums();

  return (
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
  );
}


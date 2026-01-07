import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Imóveis - Renata Imóveis",
  description: "Explore nossa seleção de imóveis. Filtre por bairro ou categoria e encontre o imóvel perfeito para você.",
};

export default function ImoveisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


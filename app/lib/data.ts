// Server-side data - Next.js 16 Server Components
export interface Property {
  id: number;
  title: string;
  location: string;
  bairro: string;
  categoria: string;
  price: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  ref: string;
}

export const properties: Property[] = [
  {
    id: 1,
    title: "Apartamento Moderno",
    location: "Barra da Tijuca, RJ",
    bairro: "Barra da Tijuca",
    categoria: "Apartamentos",
    price: "R$ 2.500.000",
    area: "120m²",
    bedrooms: 3,
    bathrooms: 2,
    ref: "REF: 187",
  },
  {
    id: 2,
    title: "Casa com Piscina",
    location: "Recreio dos Bandeirantes, RJ",
    bairro: "Recreio dos Bandeirantes",
    categoria: "Casas",
    price: "R$ 3.800.000",
    area: "250m²",
    bedrooms: 4,
    bathrooms: 3,
    ref: "REF: 201",
  },
  {
    id: 3,
    title: "Apartamento Alto Padrão",
    location: "Leblon, RJ",
    bairro: "Leblon",
    categoria: "Apartamentos",
    price: "R$ 4.200.000",
    area: "150m²",
    bedrooms: 3,
    bathrooms: 3,
    ref: "REF: 189",
  },
  {
    id: 4,
    title: "Cobertura com Vista para o Mar",
    location: "Ipanema, RJ",
    bairro: "Ipanema",
    categoria: "Apartamentos",
    price: "R$ 5.500.000",
    area: "200m²",
    bedrooms: 4,
    bathrooms: 4,
    ref: "REF: 205",
  },
  {
    id: 5,
    title: "Casa em Condomínio Fechado",
    location: "Jardim Botânico, RJ",
    bairro: "Jardim Botânico",
    categoria: "Casas",
    price: "R$ 6.200.000",
    area: "350m²",
    bedrooms: 5,
    bathrooms: 4,
    ref: "REF: 210",
  },
  {
    id: 6,
    title: "Terreno para Construção",
    location: "Barra da Tijuca, RJ",
    bairro: "Barra da Tijuca",
    categoria: "Terrenos",
    price: "R$ 1.800.000",
    area: "500m²",
    bedrooms: 0,
    bathrooms: 0,
    ref: "REF: 215",
  },
];

export const bairros = [
  "Barra da Tijuca",
  "Leblon",
  "Ipanema",
  "Copacabana",
  "Recreio dos Bandeirantes",
  "Jardim Botânico",
];

export const categorias = ["Apartamentos", "Casas", "Terrenos", "Comerciais"];


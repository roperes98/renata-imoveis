import { MetadataRoute } from "next";
import { getProperties, getCondominiums } from "@/app/lib/supabase/properties";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://renataimoveis.com.br";

  // Fetch dynamic data
  // We fetch a larger limit to ensure we get most relevant properties for the sitemap
  // In a real large-scale app we might need pagination or separate sitemaps
  const [properties, condominiums] = await Promise.all([
    getProperties({ limit: 1000, includeAllStatuses: false }), // Only active properties
    getCondominiums(1000),
  ]);

  const propertyEntries: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${baseUrl}/imoveis/${property.code}`,
    lastModified: new Date(property.updated_at || property.created_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const condominiumEntries: MetadataRoute.Sitemap = condominiums.map((condo) => ({
    url: `${baseUrl}/condominios/${condo.id}`, // Assuming route structure, verify if it is /condominios/[id]
    lastModified: new Date(condo.created_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/imoveis`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/condominios`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contato`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.7,
    },
  ];

  return [...staticEntries, ...propertyEntries, ...condominiumEntries];
}
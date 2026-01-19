/**
 * Formats a Supabase storage URL to use the local /images proxy.
 * Replaces the full Supabase URL with /images/ to leverage Next.js rewrites.
 * 
 * @param url The full URL or path string
 * @returns The formatted URL starting with /images/, or null/original if invalid
 */
export function formatImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Define the prefix to remove
  // Based on next.config.ts: https://supabase.360renataimoveis.com/storage/v1/object/public/real-estate-images/
  const supabasePrefix = "https://supabase.360renataimoveis.com/storage/v1/object/public/real-estate-images/";

  if (url.startsWith(supabasePrefix)) {
    return url.replace(supabasePrefix, "/images/");
  }

  // If we already have the simplified path (e.g. from a previous save), ensure it starts with /images/
  // However, the task is specifically to CUT the prefix from the DB data if present.

  return url;
}

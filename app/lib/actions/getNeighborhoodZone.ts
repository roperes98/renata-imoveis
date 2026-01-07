"use server";

import { RIO_ZONES_FALLBACK } from "@/app/lib/constants/rio_zones_fallback";

/**
 * Returns the Zone (e.g., "Zona Sul", "Zona Norte") for a given neighborhood.
 * Uses a local constant mapping to ensure speed and reliability.
 */
export async function getNeighborhoodZone(neighborhood: string): Promise<string | null> {
  if (!neighborhood) return null;

  // 1. Direct lookup
  if (neighborhood in RIO_ZONES_FALLBACK) {
    return RIO_ZONES_FALLBACK[neighborhood];
  }

  // 2. Normalize input for better matching
  // Remove accents and lowercase: "São Conrado" -> "sao conrado"
  const normalizedInput = neighborhood.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const foundKey = Object.keys(RIO_ZONES_FALLBACK).find(key =>
    key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalizedInput
  );

  if (foundKey) {
    return RIO_ZONES_FALLBACK[foundKey];
  }

  return null;
}

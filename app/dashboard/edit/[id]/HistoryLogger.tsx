"use client";

import { useEffect } from "react";

interface HistoryLoggerProps {
  property: {
    id: string;
    code: string;
    sale_price: number;
    type: string;
    image: string | null;
  };
}

export default function HistoryLogger({ property }: HistoryLoggerProps) {
  useEffect(() => {
    try {
      const saved = localStorage.getItem("recent_properties");
      let recent = saved ? JSON.parse(saved) : [];

      // Remove existing entry for this property to avoid duplicates (and move to top)
      recent = recent.filter((p: any) => p.id !== property.id);

      // Add new property to top
      recent.unshift(property);

      // Limit to 5 items
      if (recent.length > 5) {
        recent = recent.slice(0, 5);
      }

      localStorage.setItem("recent_properties", JSON.stringify(recent));
    } catch (e) {
      console.error("Failed to save to recent_properties", e);
    }
  }, [property]);

  return null;
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, getPropertyTypeLabel } from "../../lib/utils/format";
import { FaClock, FaBuilding } from "react-icons/fa";

interface RecentProperty {
  id: string;
  code: string;
  sale_price: number;
  type: string;
  image: string | null;
}

export default function RecentlyViewed() {
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("recent_properties");
    if (saved) {
      try {
        setRecentProperties(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent_properties", e);
      }
    }
  }, []);

  if (!mounted) return null;

  if (recentProperties.length === 0) {
    return (
      <div className="mb-8 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
        <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
          <FaClock className="text-2xl mb-2" />
          <h3 className="text-lg font-medium text-gray-600">Histórico Vazio</h3>
          <p className="text-sm">Os imóveis que você visitar aparecerão aqui.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-[#8B735B] mb-2">
        <FaClock className="text-xs" />
        <span className="text-xs font-bold tracking-wider uppercase">HISTÓRICO</span>
      </div>
      <h3 className="text-xl font-medium text-gray-800 mb-4">Vistos Recentemente</h3>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {recentProperties.map((property) => (
          <Link
            key={property.id}
            href={`/dashboard/edit/${property.id}`}
            className="shrink-0 w-64 bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {property.image ? (
                  <Image
                    src={property.image}
                    alt={property.code}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <FaBuilding size={20} />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-sm font-bold text-gray-900 mb-1">{property.code}</span>
                <span className="inline-block mb-1 px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 font-medium self-start">
                  {getPropertyTypeLabel(property.type)}
                </span>
                <span className="text-xs text-gray-500 font-medium">{formatPrice(property.sale_price)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

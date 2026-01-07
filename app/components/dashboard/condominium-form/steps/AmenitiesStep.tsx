import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { CondominiumFormData } from "../types";
import { cn } from "@/lib/utils";
import {
  COMMON_AREAS_LEISURE,
  COMMON_AREAS_SECURITY,
  COMMON_AREAS_INFRASTRUCTURE,
  COMMON_AREAS_CONVENIENCE,
} from "@/app/lib/constants/property-features";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Search } from "lucide-react";

interface AmenitiesStepProps {
  formData: CondominiumFormData;
  setFormData: React.Dispatch<React.SetStateAction<CondominiumFormData>>;
}

export function AmenitiesStep({ formData, setFormData }: AmenitiesStepProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleAmenityToggle = (value: string) => {
    setFormData((prev) => {
      const amenities = prev.amenities.includes(value)
        ? prev.amenities.filter((a) => a !== value)
        : [...prev.amenities, value];
      return { ...prev, amenities };
    });
  };

  // Função para filtrar amenidades baseado no termo de busca
  const filterAmenities = (items: { value: string; label: string }[]) => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase().trim();
    return items.filter((item) =>
      item.label.toLowerCase().includes(term)
    );
  };

  // Calcula o total de resultados filtrados
  const totalResults = useMemo(() => {
    const allAmenities = [
      ...COMMON_AREAS_LEISURE,
      ...COMMON_AREAS_SECURITY,
      ...COMMON_AREAS_INFRASTRUCTURE,
      ...COMMON_AREAS_CONVENIENCE,
    ];
    if (!searchTerm.trim()) return allAmenities.length;
    const term = searchTerm.toLowerCase().trim();
    return allAmenities.filter((item) =>
      item.label.toLowerCase().includes(term)
    ).length;
  }, [searchTerm]);

  const renderAmenitySection = (
    title: string,
    items: { value: string; label: string }[],
    prefix: string
  ) => {
    const filteredItems = filterAmenities(items);
    if (filteredItems.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">{title}</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredItems.map((item) => {
            const isActive = formData.amenities.includes(item.value);
            return (
              <Card
                key={item.value}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md border-2 gap-0 p-0",
                  isActive
                    ? "bg-[#fbf3f3] border-[#960000] shadow-sm"
                    : "bg-white border-gray-200 hover:border-gray-300"
                )}
                onClick={() => handleAmenityToggle(item.value)}
              >
                <div className="flex items-center gap-2 py-3 px-4 w-full">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                      isActive
                        ? "bg-[#960000] border-[#960000]"
                        : "bg-white border-gray-300"
                    )}
                  >
                    {isActive && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium select-none flex-1",
                      isActive ? "text-[#960000]" : "text-gray-700"
                    )}
                  >
                    {item.label}
                  </span>
                  <input
                    id={`${prefix}-${item.value}`}
                    name={`${prefix}-${item.value}`}
                    type="checkbox"
                    checked={isActive}
                    onChange={() => { }}
                    className="sr-only"
                    tabIndex={-1}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 mt-[-24px]">
      {/* Barra de pesquisa */}
      <InputGroup>
        <InputGroupInput
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <InputGroupAddon>
          <Search className="h-4 w-4" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          {totalResults} {totalResults === 1 ? "resultado" : "resultados"}
        </InputGroupAddon>
      </InputGroup>

      <div className="border-t border-gray-200 pt-6">
        {renderAmenitySection("Lazer", COMMON_AREAS_LEISURE, "amenity")}
        {renderAmenitySection("Segurança", COMMON_AREAS_SECURITY, "amenity")}
        {renderAmenitySection("Infraestrutura", COMMON_AREAS_INFRASTRUCTURE, "amenity")}
        {renderAmenitySection("Comodidades", COMMON_AREAS_CONVENIENCE, "amenity")}
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase/client";
import type { RealEstate, Condominium } from "../lib/types/database";
import { getPropertyTypeLabel } from "../lib/utils/format";
import PropertyCard from "./PropertyCard";
import { FiSearch, FiFilter } from "react-icons/fi";

interface PropertiesListProps {
  initialProperties: RealEstate[];
  neighborhoods: string[];
  propertyTypes: string[];
  condominiums: Condominium[];
}

export default function PropertiesList({
  initialProperties,
  neighborhoods,
  propertyTypes,
  condominiums,
}: PropertiesListProps) {
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCondo, setSelectedCondo] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [parkingSpaces, setParkingSpaces] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  const [properties, setProperties] = useState<RealEstate[]>(initialProperties);
  const [loading, setLoading] = useState(false);

  // Debounce search query to avoid too many requests
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function filterProperties() {
      setLoading(true);
      try {
        let query = supabase
          .from("real_estate")
          .select("*")
          .eq("status", "for_sale");

        // Search Query (Code, Neighborhood, Street, City)
        if (debouncedSearch) {
          const searchFilter = `code.ilike.%${debouncedSearch}%,address_neighborhood.ilike.%${debouncedSearch}%,address_street.ilike.%${debouncedSearch}%,address_city.ilike.%${debouncedSearch}%`;
          query = query.or(searchFilter);
        }

        // Dropdown Filters
        if (selectedNeighborhood) {
          query = query.eq("address_neighborhood", selectedNeighborhood);
        }
        if (selectedType) {
          query = query.eq("type", selectedType);
        }
        if (selectedCondo) {
          query = query.eq("condominium_id", selectedCondo);
        }

        // Numeric Filters
        if (minPrice) query = query.gte("sale_price", Number(minPrice));
        if (maxPrice) query = query.lte("sale_price", Number(maxPrice));
        if (minArea) query = query.gte("usable_area", Number(minArea));
        if (maxArea) query = query.lte("usable_area", Number(maxArea));
        if (bedrooms) query = query.gte("bedrooms", Number(bedrooms));
        if (bathrooms) query = query.gte("bathrooms", Number(bathrooms));
        if (parkingSpaces) query = query.gte("parking_spaces", Number(parkingSpaces));

        // Sorting
        switch (sortOption) {
          case "price_asc":
            query = query.order("sale_price", { ascending: true });
            break;
          case "price_desc":
            query = query.order("sale_price", { ascending: false });
            break;
          case "area_asc":
            query = query.order("usable_area", { ascending: true });
            break;
          case "area_desc":
            query = query.order("usable_area", { ascending: false });
            break;
          case "newest":
          default:
            query = query.order("created_at", { ascending: false });
            break;
        }

        const { data, error } = await query;

        if (error) throw error;
        setProperties((data as RealEstate[]) || []);
      } catch (error) {
        console.error("Error filtering properties:", error);
      } finally {
        setLoading(false);
      }
    }

    filterProperties();
  }, [
    debouncedSearch,
    selectedNeighborhood,
    selectedType,
    selectedCondo,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedrooms,
    bathrooms,
    parkingSpaces,
    sortOption,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedNeighborhood("");
    setSelectedType("");
    setSelectedCondo("");
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setMaxArea("");
    setBedrooms("");
    setBathrooms("");
    setParkingSpaces("");
    setSortOption("newest");
  };

  return (
    <>
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* Search Bar */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
          <input
            type="text"
            placeholder="Buscar por código, bairro, rua ou cidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-[#e6e6e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960000] text-lg"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Main Selects */}
          <select
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
            className="px-4 py-2 border border-[#e6e6e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960000]"
          >
            <option value="">Todos os bairros</option>
            {neighborhoods.map((neighborhood) => (
              <option key={neighborhood} value={neighborhood}>
                {neighborhood}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-[#e6e6e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960000]"
          >
            <option value="">Todos os tipos</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {getPropertyTypeLabel(type)}
              </option>
            ))}
          </select>

          <select
            value={selectedCondo}
            onChange={(e) => setSelectedCondo(e.target.value)}
            className="px-4 py-2 border border-[#e6e6e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960000]"
          >
            <option value="">Todos os condomínios</option>
            {condominiums && condominiums.map((condo) => (
              <option key={condo.id} value={condo.id}>
                {condo.name}
              </option>
            ))}
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 border border-[#e6e6e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960000]"
          >
            <option value="newest">Mais recentes</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
            <option value="area_asc">Menor área</option>
            <option value="area_desc">Maior área</option>
          </select>

          {/* Price Range */}
          <input
            type="number"
            placeholder="Preço Mínimo"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="px-4 py-2 border border-[#e6e6e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960000]"
          />
          <input
            type="number"
            placeholder="Preço Máximo"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="px-4 py-2 border border-[#e6e6e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960000]"
          />

          {/* Area Range */}
          <input
            type="number"
            placeholder="Área Mínima (m²)"
            value={minArea}
            onChange={(e) => setMinArea(e.target.value)}
            className="px-4 py-2 border border-[#e6e6e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960000]"
          />
          <input
            type="number"
            placeholder="Área Máxima (m²)"
            value={maxArea}
            onChange={(e) => setMaxArea(e.target.value)}
            className="px-4 py-2 border border-[#e6e6e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960000]"
          />

          {/* Rooms */}
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="px-4 py-2 border border-[#e6e6e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960000]"
          >
            <option value="">Quartos</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>

          <select
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            className="px-4 py-2 border border-[#e6e6e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960000]"
          >
            <option value="">Banheiros</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>

          <select
            value={parkingSpaces}
            onChange={(e) => setParkingSpaces(e.target.value)}
            className="px-4 py-2 border border-[#e6e6e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960000]"
          >
            <option value="">Vagas</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>

          {/* Clear Button */}
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 px-6 py-2 text-[#960000] border border-[#960000] rounded-lg hover:bg-[#960000] hover:text-white transition-colors"
          >
            <FiFilter />
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-[#4f4f4f] mb-6">
        {loading ? "Carregando..." : `${properties.length} ${properties.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}`}
      </p>

      {/* Properties Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-[#4f4f4f]">Carregando imóveis...</p>
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
          {properties.map((property, index) => {
            // Mock image URL to match homepage logic
            const imageUrl = index > 0
              ? "https://hansenimoveis.com/wp-content/uploads/2021/10/Nova-casa-de-luxo-para-aluguel-na-Praia-do-Forte-13.jpg"
              : null;

            return (
              <PropertyCard
                key={property.id}
                property={property}
                imageUrl={imageUrl}
                index={index}
              />
            );
          })}
        </div>
      )}

      {!loading && properties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-[#4f4f4f] mb-4">
            Nenhum imóvel encontrado com os filtros selecionados.
          </p>
          <button
            onClick={clearFilters}
            className="bg-[#960000] text-white px-6 py-3 rounded-lg hover:bg-[#b30000] transition-colors font-semibold"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </>
  );
}


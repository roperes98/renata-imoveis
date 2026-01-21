"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase/client";
import type { RealEstate, Condominium } from "../lib/types/database";
import { getPropertyTypeLabel } from "../lib/utils/format";
import PropertyCard from "./PropertyCard";
import { FiSearch, FiFilter } from "react-icons/fi";
import {
  COMMON_AREAS_LEISURE,
  COMMON_AREAS_SECURITY,
  COMMON_AREAS_INFRASTRUCTURE,
  COMMON_AREAS_CONVENIENCE,
} from "@/app/lib/constants/property-features";

interface PropertiesListProps {
  initialProperties: RealEstate[];
  totalCount: number;
  neighborhoods: string[];
  propertyTypes: string[];
  condominiums: Condominium[];
  mapProperties: RealEstate[];
}

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import PropertyCardSkeleton from "./PropertyCardSkeleton";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, MapIcon, ListIcon, SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { MultiCombobox } from "@/components/ui/multi-combobox";

const PropertiesMap = dynamic(() => import("./PropertiesMap"), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center">Carregando mapa...</div>
});

export default function PropertiesList({
  initialProperties,
  totalCount = 0,
  neighborhoods,
  propertyTypes,
  condominiums,
  mapProperties,
}: PropertiesListProps) {
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCondos, setSelectedCondos] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [parkingSpaces, setParkingSpaces] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  const allAmenities = [
    ...COMMON_AREAS_LEISURE,
    ...COMMON_AREAS_SECURITY,
    ...COMMON_AREAS_INFRASTRUCTURE,
    ...COMMON_AREAS_CONVENIENCE,
  ];

  // View Mode State
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [totalItems, setTotalItems] = useState(totalCount);

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

  // Reset to page 1 when filters change (but not when just page changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    selectedNeighborhoods,
    selectedTypes,
    selectedCondos,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedrooms,
    bathrooms,
    parkingSpaces,
    sortOption,
  ]);

  useEffect(() => {
    async function filterProperties() {
      setLoading(true);
      try {
        let query = supabase
          .from("real_estate")
          .select(`
            id,
            code,
            type,
            sale_price,
            address_street,
            address_number,
            address_neighborhood,
            address_state,
            usable_area,
            bedrooms,
            bathrooms,
            parking_spaces,
            created_at,
            images,
            status,
            condominium_id,
            condominiums (name),
            condominium_addresses (id),
            suites,
            description,
            condominium_fee,
            updated_at,
            address_city,
            address_zip,
            address_state,
            address_number,
            address_complement,
            features,
            youtube_url,
            virtual_tour_url,
            transaction_type,
            address_lat,
            address_lng,
            real_estate_owners (client:clients (name))
          `,
            { count: 'exact' })
          .eq("status", "for_sale");

        // Search Query (Code, Neighborhood, Street, City)
        if (debouncedSearch) {
          const searchFilter = `code.ilike.%${debouncedSearch}%,address_neighborhood.ilike.%${debouncedSearch}%,address_street.ilike.%${debouncedSearch}%,address_city.ilike.%${debouncedSearch}%`;
          query = query.or(searchFilter);
        }

        // Dropdown Filters
        if (selectedNeighborhoods.length > 0) {
          query = query.in("address_neighborhood", selectedNeighborhoods);
        }
        if (selectedTypes.length > 0) {
          query = query.in("type", selectedTypes);
        }
        if (selectedCondos.length > 0) {
          query = query.in("condominium_id", selectedCondos);
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

        // Pagination
        if (viewMode !== "map") {
          const from = (currentPage - 1) * itemsPerPage;
          const to = from + itemsPerPage - 1;
          query = query.range(from, to);
        }

        const { data, error, count } = await query;

        if (error) throw error;
        setProperties((data as unknown as RealEstate[]) || []);
        if (count !== null) setTotalItems(count);
      } catch (error) {
        console.error("Error filtering properties:", error);
      } finally {
        setLoading(false);
      }
    }

    // Only fetch if filters are changing from initial state or page changed
    // We can assume initialProperties matches "newest" sorting and no filters and page 1
    const isInitialState =
      !debouncedSearch &&
      selectedNeighborhoods.length === 0 &&
      selectedTypes.length === 0 &&
      selectedCondos.length === 0 &&
      !minPrice &&
      !maxPrice &&
      !minArea &&
      !maxArea &&
      !bedrooms &&
      !bathrooms &&
      !parkingSpaces &&
      currentPage === 1 &&
      sortOption === "newest" &&
      viewMode === "list"; // Also consider viewMode

    if (!isInitialState) {
      filterProperties();
    } else {
      // Reset to initial properties if filters are cleared
      setProperties(initialProperties);
      setTotalItems(totalCount);
    }
  }, [
    debouncedSearch,
    debouncedSearch,
    selectedNeighborhoods,
    selectedTypes,
    selectedCondos,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedrooms,
    bathrooms,
    parkingSpaces,
    sortOption,
    currentPage,
    viewMode
  ]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedNeighborhoods([]);
    setSelectedTypes([]);
    setSelectedCondos([]);
    setMinPrice("");
    setMaxPrice("");
    setMaxArea("");
    setMinArea("");
    setBedrooms("");
    setBathrooms("");
    setParkingSpaces("");
    setSortOption("newest");
  };

  const clearAdvancedFilters = () => {
    setSelectedNeighborhoods([]);
    setSelectedTypes([]);
    setSelectedCondos([]);
    setMinPrice("");
    setMaxPrice("");
    setMaxArea("");
    setMinArea("");
    setBedrooms("");
    setBathrooms("");
    setParkingSpaces("");
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "list" ? "map" : "list"));
  };

  const activeAdvancedFilters = !!(
    selectedNeighborhoods.length > 0 ||
    selectedTypes.length > 0 ||
    selectedCondos.length > 0 ||
    minPrice ||
    maxPrice ||
    minArea ||
    maxArea ||
    bedrooms ||
    bathrooms ||
    parkingSpaces
  );

  const hasActiveFilters = !!(debouncedSearch || activeAdvancedFilters);

  const isSortActive = sortOption !== "newest";

  return (
    <>
      {viewMode === "map" && (
        <style>{`
          footer { display: none !important; }
        `}</style>
      )}
      {/* 
        Layout Wrapper: 
        If list mode: container standard layout.
        If map mode: full-screen layout.
      */}
      <div className={viewMode === "list" ? "container mx-auto px-4 py-12 min-h-[calc(100vh-80px)]" : "w-full h-[calc(100vh-80px)] relative overflow-hidden"}>

        {/* Page Title - Only visible in List Mode */}
        {viewMode === "list" && (
          <h1 className="text-4xl font-bold mb-8 text-[#1e1e1e]">
            Nossos Imóveis
          </h1>
        )}

        {/* Search & Filters Header */}
        <div className={`
          flex flex-col gap-2 
          ${viewMode === "list" ? "mb-8 relative" : "absolute top-4 left-1/2 -translate-x-1/2 z-1000 w-[90%] max-w-4xl bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg"}
        `}>
          <div className="flex gap-4 items-center">
            <InputGroup className="py-6 rounded-lg flex-1 bg-white">
              <InputGroupInput
                id="inline-start-input"
                placeholder="Buscar por código, bairro, rua ou cidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-lg"
              />
              <InputGroupAddon align="inline-start">
                <SearchIcon className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>

            <Button
              onClick={toggleViewMode}
              className="h-[48px] text-md gap-2.5 w-[120px]"
              variant="default"
            >
              {viewMode === "list" ? (
                <>
                  <MapIcon className="size-5" />
                  Mapa
                </>
              ) : (
                <>
                  <ListIcon className="size-5" />
                  Lista
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mask-linear-fade">
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 whitespace-nowrap">Mobiliados</Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 whitespace-nowrap">Novos</Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 whitespace-nowrap">Com garagem</Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 whitespace-nowrap">Com piscina</Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 whitespace-nowrap">Com varanda</Badge>
            </div>

            <div className="flex gap-2 shrink-0 ml-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={isSortActive ? "border-[#960000] text-[#960000] hover:text-[#960000] hover:bg-red-50 pr-2" : ""}
                  >
                    <ArrowUpDown className="mr-2 size-4" />
                    Ordem
                    {isSortActive && (
                      <div
                        role="button"
                        className="ml-1 p-0.5 hover:bg-red-100 rounded-full cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSortOption("newest");
                        }}
                      >
                        <X className="size-3" />
                      </div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0 z-[1100]" align="end">
                  <div className="flex flex-col p-2 gap-1">
                    {[
                      { label: "Mais recentes", value: "newest" },
                      { label: "Preço: Menor > Maior", value: "price_asc" },
                      { label: "Preço: Maior > Menor", value: "price_desc" },
                      { label: "Área: Menor > Maior", value: "area_asc" },
                      { label: "Área: Maior > Menor", value: "area_desc" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortOption(option.value)}
                        className={`text-left px-3 py-2 text-sm rounded-md transition-colors ${sortOption === option.value
                          ? "bg-[#960000] text-white font-medium"
                          : "hover:bg-gray-100 text-gray-700"
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={activeAdvancedFilters ? "border-[#960000] text-[#960000] hover:text-[#960000] hover:bg-red-50 pr-2" : ""}
                  >
                    <SlidersHorizontal className="mr-2 size-4" />
                    Filtros
                    {activeAdvancedFilters && (
                      <div
                        role="button"
                        className="ml-1 p-0.5 hover:bg-red-100 rounded-full cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAdvancedFilters();
                        }}
                      >
                        <X className="size-3" />
                      </div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] sm:w-[500px] p-4 z-[1100]" align="end">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Filtros Avançados</h4>
                      <p className="text-sm text-muted-foreground">
                        Refine sua busca por imóveis.
                      </p>
                    </div>
                    <div className="grid gap-4">
                      {/* Neighborhood & Type */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="neighborhood">Bairros</Label>
                          <MultiCombobox
                            options={neighborhoods.map(n => ({ value: n, label: n }))}
                            value={selectedNeighborhoods}
                            onChange={setSelectedNeighborhoods}
                            placeholder="Selecione bairros"
                            searchPlaceholder="Buscar bairro..."
                            emptyText="Nenhum bairro encontrado."
                            className="w-full"
                            popoverClassName="z-[1200]"
                          />
                        </div>
                        {/* Condo */}
                        <div className="space-y-1">
                          <Label htmlFor="condo">Condomínios</Label>
                          <MultiCombobox
                            options={condominiums.map(c => ({ value: c.id, label: c.name }))}
                            value={selectedCondos}
                            onChange={setSelectedCondos}
                            placeholder="Selecione condomínios"
                            searchPlaceholder="Buscar condomínio..."
                            emptyText="Nenhum condomínio encontrado."
                            className="w-full"
                            popoverClassName="z-[1200]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="type">Tipos</Label>
                          <MultiCombobox
                            options={propertyTypes.map(t => ({ value: t, label: getPropertyTypeLabel(t) }))}
                            value={selectedTypes}
                            onChange={setSelectedTypes}
                            placeholder="Selecione tipos"
                            searchPlaceholder="Buscar tipo..."
                            emptyText="Nenhum tipo encontrado."
                            className="w-full"
                            popoverClassName="z-[1200]"
                          />
                        </div>

                        {/* Condo */}
                        <div className="space-y-1">
                          <Label htmlFor="condo">Características</Label>
                          <MultiCombobox
                            options={allAmenities.map(c => ({ value: c.value, label: c.label }))}
                            value={selectedFeatures}
                            onChange={setSelectedFeatures}
                            placeholder="Selecione características"
                            searchPlaceholder="Buscar características..."
                            emptyText="Nenhuma característica encontrada."
                            className="w-full"
                            popoverClassName="z-[1200]"
                          />
                        </div>
                      </div>

                      {/* Price Range */}
                      <div className="grid gap-2">
                        <Label>Faixa de Preço (R$)</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="Mínimo"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            type="number"
                            className="h-9"
                          />
                          <span className="text-muted-foreground">-</span>
                          <Input
                            placeholder="Máximo"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            type="number"
                            className="h-9"
                          />
                        </div>
                      </div>

                      {/* Area Range */}
                      <div className="grid gap-2">
                        <Label>Área Útil (m²)</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="Mínimo"
                            value={minArea}
                            onChange={(e) => setMinArea(e.target.value)}
                            type="number"
                            className="h-9"
                          />
                          <span className="text-muted-foreground">-</span>
                          <Input
                            placeholder="Máximo"
                            value={maxArea}
                            onChange={(e) => setMaxArea(e.target.value)}
                            type="number"
                            className="h-9"
                          />
                        </div>
                      </div>

                      {/* Rooms */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="bedrooms" className="text-xs">Quartos (min)</Label>
                          <Input
                            id="bedrooms"
                            type="number"
                            min={0}
                            value={bedrooms}
                            onChange={(e) => setBedrooms(e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="bathrooms" className="text-xs">Banheiros (min)</Label>
                          <Input
                            id="bathrooms"
                            type="number"
                            min={0}
                            value={bathrooms}
                            onChange={(e) => setBathrooms(e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="parking" className="text-xs">Vagas (min)</Label>
                          <Input
                            id="parking"
                            type="number"
                            min={0}
                            value={parkingSpaces}
                            onChange={(e) => setParkingSpaces(e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                    <Button onClick={clearFilters} variant="secondary" size="sm" className="w-full">
                      Limpar Filtros
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === "map" ? (
          <div className="w-full h-full"> {/* Expanded height to fill viewport below header */}
            <PropertiesMap
              properties={properties}
              allProperties={mapProperties}
              autoFocus={hasActiveFilters}
              isFiltering={hasActiveFilters}
            />
          </div>
        ) : (
          <>
            {/* Results Count */}
            <p className="text-[#4f4f4f] mb-6">
              {loading ? "Carregando..." : `${properties.length} ${properties.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}`}
            </p>

            {/* Properties Grid */}
            {loading ? (
              <div className="grid gap-8 grid-cols-[repeat(auto-fit,minmax(276px,1fr))]">
                {Array.from({ length: 12 }).map((_, index) => (
                  <PropertyCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="grid gap-8 grid-cols-[repeat(auto-fit,minmax(276px,1fr))]">
                {properties.map((property, index) => {
                  const imageUrl = property.images?.[0]?.url || null;
                  return (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      imageUrl={imageUrl}
                      index={index}
                      className="w-[276px]"
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
            {/* Pagination */}
            {!loading && totalItems > itemsPerPage && (
              <div className="mt-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        if (page === 1 || page === totalPages) return true;
                        if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                        return false;
                      })
                      .map((page, index, array) => {
                        const isGap = index > 0 && page - array[index - 1] > 1;
                        return (
                          <div key={page} className="flex items-center">
                            {isGap && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                isActive={page === currentPage}
                                onClick={() => handlePageChange(page)}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </div>
                        );
                      })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

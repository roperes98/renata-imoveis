"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase/client";
import { getFavoritesIdsAction } from "../lib/actions";
import type { RealEstate, Condominium } from "../lib/types/database";
import type { CondominiumDisplay } from "../lib/supabase/properties"; // Import the correct type
import { getPropertyTypeLabel } from "../lib/utils/format";
import PropertyCard from "./PropertyCard";
import { FiSearch, FiFilter } from "react-icons/fi";
import {
  COMMON_AREAS_LEISURE,
  COMMON_AREAS_SECURITY,
  COMMON_AREAS_INFRASTRUCTURE,
  COMMON_AREAS_CONVENIENCE,
} from "@/app/lib/constants/property-features";
import { isPointInPolygon, getDistanceFromPolygon } from "../lib/utils/geo";

interface PropertiesListProps {
  initialProperties: RealEstate[];
  totalCount: number;
  neighborhoods: string[];
  propertyTypes: string[];
  condominiums: CondominiumDisplay[];
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
import { LuLasso } from "react-icons/lu";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { PiSiren } from "react-icons/pi";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>([]);
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

  const QUICK_FILTERS = [
    { label: "Mobiliados", value: "custom_furniture" },
    { label: "Na Planta", value: "ground_floor" },
    { label: "Próximo ao Metrô", value: "near_subway" },
    { label: "Vista Mar", value: "ocean_view" },
    { label: "Alto Padrão", value: "high_standard_finishing" },
  ];

  const handleQuickFilterToggle = (value: string) => {
    setSelectedQuickFilters(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  // View Mode State
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [isDrawing, setIsDrawing] = useState(false);
  const [filterPolygon, setFilterPolygon] = useState<{ lat: number; lng: number }[] | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Initialize favorites from localStorage
  // Initialize favorites from server
  useEffect(() => {
    async function fetchFavorites() {
      try {
        const ids = await getFavoritesIdsAction();
        if (ids && Array.isArray(ids)) {
          setFavorites(ids);
          localStorage.setItem("renata-favorites-v2", JSON.stringify(ids));
        }
      } catch (error) {
        console.error("Failed to fetch favorites", error);
        // Fallback to local storage
        const stored = localStorage.getItem("renata-favorites-v2");
        if (stored) {
          try {
            setFavorites(JSON.parse(stored));
          } catch (e) {
            // ignore
          }
        }
      }
    }
    fetchFavorites();
  }, []);

  // Update localStorage when favorites change
  useEffect(() => {
    localStorage.setItem("renata-favorites-v2", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

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
    selectedFeatures,
    selectedQuickFilters,
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

        // Feature Filters (Combined QuickFilters + Advanced Features)
        const allSelectedFeatures = [...selectedFeatures, ...selectedQuickFilters];
        if (allSelectedFeatures.length > 0) {
          query = query.contains("features", allSelectedFeatures);
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

        let fetchedProperties = (data as unknown as RealEstate[]) || [];

        // Apply Polygon Filter Client-Side (Inside OR <= 2km)
        if (filterPolygon && filterPolygon.length >= 3) {
          fetchedProperties = fetchedProperties.filter((p) => {
            if (!p.address_lat || !p.address_lng) return false;
            const point = { lat: p.address_lat, lng: p.address_lng };

            if (isPointInPolygon(point, filterPolygon)) return true;

            // If not inside, check distance (max 2km = 2000m)
            const distance = getDistanceFromPolygon(point, filterPolygon);
            return distance <= 2000;
          });
        }

        setProperties(fetchedProperties);
        // data count might be wrong if we filter client side, but since we are filtering the RESULTS of the query, 
        // and pagination is handled by the query... wait.
        // If we filter client side, pagination from server will be weird.
        // However, for map view usually we want ALL properties. 
        // But here loop is taking pages.

        // If map view, usually we load ALL properties for the map pins (mapProperties), 
        // but 'properties' state is used for the list/cards.

        // If the user draws a lasso, we probably want to filter the visual results.
        // If we are in map mode, we see all pins.
        // If we filter, we want to see only pins inside.

        // The `properties` state is what drives the list AND the map pins (via PropertiesMap props).

        if (count !== null) setTotalItems(count); // This count is total from DB query, not after polygon. 
        // Ideally update totalItems if polygon is active, but pagination makes this tricky.
        // For now, let's assume if polygon is active we might ignore server pagination or just filter what we have.
        // ACTUALLY, usually map search implies spatial search on DB or loading all.
        // Given current architecture loads `mapProperties` (all) for the map component?
        // Let's check props.
        // `mapProperties` is passed to PropertiesList.

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
      selectedFeatures.length === 0 &&
      selectedQuickFilters.length === 0 &&
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
    selectedFeatures,
    selectedQuickFilters,
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
    setSelectedFeatures([]);
    setSelectedQuickFilters([]);
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
    setSelectedFeatures([]);
    setMinPrice("");
    setMaxPrice("");
    setMaxArea("");
    setMinArea("");
    setBedrooms("");
    setBathrooms("");
    setParkingSpaces("");
    setFilterPolygon(null); // Clear polygon too
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "list" ? "map" : "list"));
  };

  const activeAdvancedFilters = !!(
    selectedNeighborhoods.length > 0 ||
    selectedTypes.length > 0 ||
    selectedCondos.length > 0 ||
    selectedFeatures.length > 0 ||
    minPrice ||
    maxPrice ||
    minArea ||
    maxArea ||
    bedrooms ||
    bathrooms ||
    parkingSpaces
  );

  const hasActiveFilters = !!(debouncedSearch || activeAdvancedFilters || selectedQuickFilters.length > 0);

  const isSortActive = sortOption !== "newest";

  return (
    <>
      {viewMode === "map" && (
        <style>{`
          footer { display: none !important; }
        `}</style>
      )}
      {isDrawing && (
        <style>{`
          body, .leaflet-container, .leaflet-grab, .leaflet-interactive { 
            cursor: crosshair !important; 
            user-select: none; 
            -webkit-user-select: none; 
          }
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
        <div className="flex gap-2 relative z-50 pointer-events-none">
          {/* Map Controls - Left Side */}
          {/* Map Controls - Left Side (Moved to Main Container) */}

          <div className={`
          flex flex-col gap-2 pointer-events-auto
          ${viewMode === "list" ? "w-full mb-8 relative" : "absolute top-4 left-1/2 -translate-x-1/2 z-1000 w-[90%] max-w-4xl bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg"}
        `}>
            {/* Map Controls - Absolute to the left of this container */}
            {viewMode === "map" && (
              <div className="absolute top-5 -left-16 flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    if (filterPolygon) {
                      setFilterPolygon(null);
                      setIsDrawing(false);
                    } else {
                      setIsDrawing(!isDrawing);
                    }
                  }}
                  variant={isDrawing ? "destructive" : (filterPolygon ? "secondary" : "default")}
                  className={`p-3 h-auto w-auto shadow-lg transition-all ${isDrawing ? 'bg-[#960000] hover:bg-red-700' : 'bg-white hover:bg-gray-100 text-gray-800'}`}
                  title={filterPolygon ? "Limpar área desenhada" : (isDrawing ? "Cancelar desenho" : "Desenhar área no mapa")}
                >
                  {filterPolygon ? <X className="size-5" /> : <LuLasso className="size-5" />}
                </Button>
                {/* Favorites Toggle Button */}
                <Button
                  type="button"
                  onClick={() => {
                    setShowFavorites(!showFavorites);
                    // Disable drawing if enabling favorites to avoid confusion, or keep independent?
                    // Let's keep independent but maybe turn off drawing if it was active?
                    if (isDrawing) setIsDrawing(false);
                  }}
                  variant="default"
                  className={`p-3 h-auto w-auto shadow-lg transition-all ${showFavorites ? 'bg-[#960000] hover:bg-red-700' : 'bg-white hover:bg-gray-100 text-gray-800'}`}
                  title={showFavorites ? "Mostrar todos" : "Mostrar apenas favoritos"}
                >
                  {showFavorites ? <FaHeart className="size-5 text-white" /> : <FaRegHeart className="size-5 text-gray-600" />}
                </Button>
              </div>
            )}
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
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mask-linear-fade py-2">
                {QUICK_FILTERS.map((filter) => {
                  const isActive = selectedQuickFilters.includes(filter.value);
                  return (
                    <Badge
                      key={filter.value}
                      variant={isActive ? "default" : "secondary"}
                      className={`
                      cursor-pointer whitespace-nowrap text-xs px-3 py-1 transition-all
                      ${isActive
                          ? 'bg-[#960000] hover:bg-[#b30000] text-white border-transparent'
                          : 'hover:bg-secondary/80 border-transparent'
                        }
                    `}
                      onClick={() => handleQuickFilterToggle(filter.value)}
                    >
                      {filter.label}
                    </Badge>
                  );
                })}
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
                  <PopoverContent className="w-[200px] p-0 z-1100" align="end">
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
                  <PopoverContent className="w-[320px] sm:w-[500px] p-4 z-1100" align="end">
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
                              popoverClassName="z-1200"
                            />
                          </div>
                          {/* Condo */}
                          <div className="space-y-1">
                            <Label htmlFor="condo">Condomínios</Label>
                            <MultiCombobox
                              options={useMemo(() => {
                                if (selectedNeighborhoods.length === 0) {
                                  return condominiums.map(c => ({ value: c.id, label: c.name }));
                                }
                                return condominiums
                                  .filter(c => {
                                    // Check if any of the condo's addresses/neighborhoods match the selected neighborhoods
                                    // Handle array or single object if the type is tricky, but CondominiumDisplay defines it as array
                                    const addresses = Array.isArray(c.condominium_addresses)
                                      ? c.condominium_addresses
                                      : (c.condominium_addresses ? [c.condominium_addresses] : []);

                                    return addresses.some((addr: any) =>
                                      selectedNeighborhoods.includes(addr.neighborhood)
                                    );
                                  })
                                  .map(c => ({ value: c.id, label: c.name }));
                              }, [condominiums, selectedNeighborhoods])}
                              value={selectedCondos}
                              onChange={setSelectedCondos}
                              placeholder="Selecione condomínios"
                              searchPlaceholder="Buscar condomínio..."
                              emptyText="Nenhum condomínio encontrado."
                              className="w-full"
                              popoverClassName="z-1200"
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
                              popoverClassName="z-1200"
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
                              popoverClassName="z-1200"
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

                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={activeAdvancedFilters ? "border-[#960000] text-[#960000] hover:text-[#960000] hover:bg-red-50 pr-2" : ""}
                    >
                      <PiSiren className="mr-2 size-4" />
                      Alertas
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="min-w-[500px]">
                    <SheetHeader>
                      <SheetTitle>Alertas</SheetTitle>
                      <SheetDescription>
                        Configure alertas para a sua busca para que você receba notificações quando imóveis que atendam aos seus critérios estiverem disponíveis.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="grid flex-1 auto-rows-min gap-4 px-4">
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
                            popoverClassName="z-1200"
                          />
                        </div>
                        {/* Condo */}
                        <div className="space-y-1">
                          <Label htmlFor="condo">Condomínios</Label>
                          <MultiCombobox
                            options={useMemo(() => {
                              if (selectedNeighborhoods.length === 0) {
                                return condominiums.map(c => ({ value: c.id, label: c.name }));
                              }
                              return condominiums
                                .filter(c => {
                                  // Check if any of the condo's addresses/neighborhoods match the selected neighborhoods
                                  // Handle array or single object if the type is tricky, but CondominiumDisplay defines it as array
                                  const addresses = Array.isArray(c.condominium_addresses)
                                    ? c.condominium_addresses
                                    : (c.condominium_addresses ? [c.condominium_addresses] : []);

                                  return addresses.some((addr: any) =>
                                    selectedNeighborhoods.includes(addr.neighborhood)
                                  );
                                })
                                .map(c => ({ value: c.id, label: c.name }));
                            }, [condominiums, selectedNeighborhoods])}
                            value={selectedCondos}
                            onChange={setSelectedCondos}
                            placeholder="Selecione condomínios"
                            searchPlaceholder="Buscar condomínio..."
                            emptyText="Nenhum condomínio encontrado."
                            className="w-full"
                            popoverClassName="z-1200"
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
                            popoverClassName="z-1200"
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
                            popoverClassName="z-1200"
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
                    <SheetFooter>
                      <Button type="submit">Save changes</Button>
                      <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>

        {/* Map Controls - Absolute Positioned in Main Container */}


        {/* Content Area */}
        {viewMode === "map" ? (
          <div className="w-full h-full"> {/* Expanded height to fill viewport below header */}
            <PropertiesMap
              properties={properties}
              allProperties={mapProperties}
              autoFocus={hasActiveFilters}
              isFiltering={hasActiveFilters}
              isDrawing={isDrawing}
              filterPolygon={filterPolygon}
              onPolygonComplete={(poly) => {
                setFilterPolygon(poly);
                setIsDrawing(false);
              }}
              favorites={favorites}
              showFavorites={showFavorites}
            />
          </div>
        ) : (
          <>
            {/* Results Count */}
            <p className="text-[#4f4f4f] mb-6">
              {loading ? "Carregando..." : `${totalItems} ${totalItems === 1 ? "imóvel encontrado" : "imóveis encontrados"}`}
            </p>

            {/* Properties Grid */}
            {loading ? (
              <div className="grid gap-x-7 gap-y-8 grid-cols-[repeat(auto-fit,minmax(276px,1fr))] justify-items-center">
                {Array.from({ length: 12 }).map((_, index) => (
                  <PropertyCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="grid gap-x-7 gap-y-8 grid-cols-[repeat(auto-fit,minmax(276px,1fr))] justify-items-center">
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

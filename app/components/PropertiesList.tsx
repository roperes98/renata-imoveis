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

  /* --- Neighborhood Hierarchy Configuration --- */
  // Define Parent -> Children relationship
  // Parent MUST be in the GeoJSON to provide a polygon for children
  const NEIGHBORHOOD_HIERARCHY: Record<string, string[]> = {
    "Tijuca": ["Usina", "Muda", "Andaraí", "Maracanã", "Vila Isabel"],
    "Barra da Tijuca": ["Jardim Oceânico", "Barrinha", "Ilha da Gigóia", "Joá"],
    "Recreio dos Bandeirantes": ["Pontal", "Terreirão"],
    "Copacabana": ["Leme"],
    "Botafogo": ["Urca", "Humaitá"],
    "Leblon": ["Jardim de Alah"],
    "Ipanema": ["Arpoador"],
    // Add more as needed based on commonly accepted regions
  };

  // Compute children to parent map for reverse lookup
  const CHILD_TO_PARENT: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(NEIGHBORHOOD_HIERARCHY).forEach(([parent, children]) => {
      children.forEach(child => {
        map[child] = parent;
      });
    });
    return map;
  }, []);

  // Format neighborhoods into a flat list with depth for MultiCombobox
  const neighborhoodOptions = useMemo(() => {
    const flatOptions: { value: string; label: string; depth: number }[] = [];
    const usedNeighborhoods = new Set<string>();

    // 1. Process defined hierarchy
    Object.entries(NEIGHBORHOOD_HIERARCHY).forEach(([parent, children]) => {
      const parentExists = neighborhoods.includes(parent);
      const activeChildren = children.filter(child => neighborhoods.includes(child));

      // Only proceed if parent or children exist in the data
      if (parentExists || activeChildren.length > 0) {
        // Add Parent
        if (parentExists) {
          flatOptions.push({ value: parent, label: parent, depth: 0 });
          usedNeighborhoods.add(parent);
        }

        // Add Children (indented if parent exists)
        // If parent doesn't exist but children do, we list them at depth 0
        const childDepth = parentExists ? 1 : 0;
        activeChildren.forEach(child => {
          flatOptions.push({ value: child, label: child, depth: childDepth });
          usedNeighborhoods.add(child);
        });
      }
    });

    // 2. Add remaining neighborhoods
    const remaining = neighborhoods
      .filter(n => !usedNeighborhoods.has(n))
      .sort((a, b) => a.localeCompare(b));

    remaining.forEach(n => {
      flatOptions.push({ value: n, label: n, depth: 0 });
    });

    return flatOptions;
  }, [neighborhoods]);

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

  // ... (rest of useEffects) ...

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
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [isMobile, setIsMobile] = useState(false);
  const [totalItems, setTotalItems] = useState(totalCount);

  // Determine items per page and isMobile based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);

      // 5 columns * 3 rows = 15 items (approx width > 1400px tailored for minmax(276px, 1fr))
      // You can adjust the threshold 1400 based on actual grid behavior in CSS.
      if (width >= 1450) {
        setItemsPerPage(15);
      } else {
        setItemsPerPage(12);
      }
    };

    // Initial check
    handleResize();

    const debouncedResize = debounce(handleResize, 200);
    window.addEventListener("resize", debouncedResize);
    return () => window.removeEventListener("resize", debouncedResize);
  }, []);

  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  const [properties, setProperties] = useState<RealEstate[]>(initialProperties);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // For infinite scroll appending

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
      // Determine if we are appending (mobile & page > 1) or replacing
      const isAppending = isMobile && currentPage > 1;

      if (isAppending) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

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

        if (isAppending) {
          setProperties(prev => {
            const newIds = new Set(fetchedProperties.map(p => p.id));
            // Filter out any fetched properties that supposedly might already exist (though unlikely with proper pagination, safety first)
            // Actually, better to filter the *incoming* to ensure we don't add what we already have.
            // Or better: Create a Map of existing + new to ensure uniqueness by ID.
            const combined = [...prev, ...fetchedProperties];
            const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
            return unique;
          });
        } else {
          setProperties(fetchedProperties);
        }

        if (count !== null) setTotalItems(count);

      } catch (error) {
        console.error("Error filtering properties:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }

    // Only fetch if filters are changing from initial state or page changed
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
      viewMode === "list";

    // If we need more items than initially loaded (e.g. 15 vs 12) and there are more items available,
    // we must fetch, even if it looks like the "initial state".
    const needsMoreItems = itemsPerPage > initialProperties.length && totalCount > initialProperties.length;

    if (!isInitialState || needsMoreItems) {
      filterProperties();
    } else {
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
    viewMode,
    itemsPerPage, // Added dependency
    isMobile // Added dependency to know if behavior should change
  ]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (!isMobile) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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

  // --- Neighborhood Highlighting Logic ---
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [neighborhoodPolygons, setNeighborhoodPolygons] = useState<any[]>([]);

  // Fetch GeoJSON on mount
  useEffect(() => {
    async function loadGeoJson() {
      try {
        const response = await fetch("/data/bairros_rio_de_janeiro.geojson");
        if (!response.ok) throw new Error("Failed to load GeoJSON");
        const data = await response.json();
        setGeoJsonData(data);
      } catch (error) {
        console.error("Error loading neighborhood data:", error);
      }
    }
    loadGeoJson();
  }, []);

  // Update polygons when selection changes
  useEffect(() => {
    if (!geoJsonData || selectedNeighborhoods.length === 0) {
      setNeighborhoodPolygons([]);
      return;
    }

    const polygons: any[] = [];
    const processedNeighborhoods = new Set<string>();

    selectedNeighborhoods.forEach(neighborhood => {
      // Logic:
      // 1. Try to find direct match in GeoJSON.
      // 2. If no direct match, look up parent.
      // 3. If parent found, use parent's polygon (if not already added).

      let targetNeighborhood = neighborhood;
      let feature = geoJsonData.features.find(
        (f: any) => f.properties.nome.toLowerCase() === neighborhood.toLowerCase()
      );

      if (!feature) {
        // Not found, check hierarchy
        const parent = CHILD_TO_PARENT[neighborhood];
        if (parent) {
          // It's a child, try to find parent feature
          const parentFeature = geoJsonData.features.find(
            (f: any) => f.properties.nome.toLowerCase() === parent.toLowerCase()
          );
          if (parentFeature) {
            feature = parentFeature;
            targetNeighborhood = parent;
          }
        }
      }

      // If we found a feature (either direct or parent) and haven't processed it yet
      if (feature && feature.geometry && !processedNeighborhoods.has(targetNeighborhood)) {
        processedNeighborhoods.add(targetNeighborhood);

        const flipCoords = (coords: any[]): any => {
          if (typeof coords[0] === 'number') {
            return [coords[1], coords[0]]; // Flip [lng, lat] to [lat, lng]
          }
          return coords.map(flipCoords);
        };

        if (feature.geometry.type === 'Polygon') {
          polygons.push(flipCoords(feature.geometry.coordinates));
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach((polyCoords: any) => {
            polygons.push(flipCoords(polyCoords));
          });
        }
      }
    });

    setNeighborhoodPolygons(polygons);
  }, [geoJsonData, selectedNeighborhoods, CHILD_TO_PARENT]);

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
                              options={neighborhoodOptions}
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
              highlightPolygons={neighborhoodPolygons}
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
            {/* Infinite Scroll Sentinel for Mobile */}
            {isMobile && !loading && properties.length < totalItems && (
              <div
                className="w-full py-8 flex justify-center"
                ref={(node) => {
                  if (!node || loadingMore) return;
                  const observer = new IntersectionObserver(
                    (entries) => {
                      if (entries[0].isIntersecting) {
                        handlePageChange(currentPage + 1);
                      }
                    },
                    { threshold: 0.1, rootMargin: '928px' }
                  );
                  observer.observe(node);
                  return () => observer.disconnect();
                }}
              >
                {loadingMore ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#960000] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-500">Carregando mais imóveis...</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Role para ver mais</span>
                )}
              </div>
            )}

            {/* Pagination (Desktop Only) */}
            {!isMobile && !loading && totalItems > itemsPerPage && (
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

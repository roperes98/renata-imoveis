"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useTransition } from "react";
import { FiSearch, FiFilter, FiX, FiList, FiArrowLeft, FiChevronDown, FiCheck, FiMapPin, FiHome } from "react-icons/fi";
import { PropertyType, SellingStatus, Condominium, PropertyDisplay } from "../../lib/types/database";
import { searchProperties } from "./actions";
import Link from "next/link";
import { formatPrice } from "../../lib/utils/format";

// Click outside hook
function useOnClickOutside(ref: any, handler: any) {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

interface PropertiesFiltersProps {
  neighborhoods: string[];
  condominiums: Condominium[];
}

export default function PropertiesFilters({ neighborhoods, condominiums }: PropertiesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper to get param
  const getParam = (key: string) => searchParams.get(key) || "";

  // State
  const [search, setSearch] = useState(getParam("search"));

  // Search Overlay State
  const [searchResults, setSearchResults] = useState<PropertyDisplay[]>([]);
  const [isSearching, startTransition] = useTransition();
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filter States
  const [status, setStatus] = useState(getParam("status"));
  const [type, setType] = useState(getParam("type"));
  const [neighborhood, setNeighborhood] = useState(getParam("neighborhood"));
  const [condominiumId, setCondominiumId] = useState(getParam("condominium_id"));
  const [sort, setSort] = useState(getParam("sort") || "created_desc");

  // Numeric Ranges
  const [minPrice, setMinPrice] = useState(getParam("minPrice"));
  const [maxPrice, setMaxPrice] = useState(getParam("maxPrice"));
  const [minArea, setMinArea] = useState(getParam("minArea"));
  const [maxArea, setMaxArea] = useState(getParam("maxArea"));

  // Counts
  const [bedrooms, setBedrooms] = useState(getParam("bedrooms"));
  const [bathrooms, setBathrooms] = useState(getParam("bathrooms"));
  const [suites, setSuites] = useState(getParam("suites"));
  const [parking, setParking] = useState(getParam("parking"));

  // UI States
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(filterRef, () => setIsFiltersOpen(false));
  useOnClickOutside(sortRef, () => setIsSortOpen(false));
  useOnClickOutside(searchContainerRef, () => setShowResults(false));

  // Handle Search Input Change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (value.length >= 2) {
      setShowResults(true);
      startTransition(async () => {
        const results = await searchProperties(value);
        setSearchResults(results);
      });
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Updates
    const setOrDelete = (key: string, val: string) => {
      if (val) params.set(key, val);
      else params.delete(key);
    };

    // Note: 'search' param is purposely NOT set on every keystroke anymore
    // It is only set if user hits enter or explicitly wants to filter table by search term
    setOrDelete("search", search);
    setOrDelete("status", status);
    setOrDelete("type", type);
    setOrDelete("neighborhood", neighborhood);
    setOrDelete("condominium_id", condominiumId);
    setOrDelete("sort", sort);

    setOrDelete("minPrice", minPrice);
    setOrDelete("maxPrice", maxPrice);
    setOrDelete("minArea", minArea);
    setOrDelete("maxArea", maxArea);

    setOrDelete("bedrooms", bedrooms);
    setOrDelete("bathrooms", bathrooms);
    setOrDelete("suites", suites);
    setOrDelete("parking", parking);

    // Reset page
    params.delete("page");

    router.push(`/dashboard/imoveis?${params.toString()}`);
    setShowResults(false); // Close overlay if filtering table
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setType("");
    setNeighborhood("");
    setCondominiumId("");
    setSort("created_desc");
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setMaxArea("");
    setBedrooms("");
    setBathrooms("");
    setSuites("");
    setParking("");
    router.push("/dashboard/imoveis");
    setIsFiltersOpen(false);
  };

  const activeFiltersCount = [
    status, type, neighborhood, condominiumId,
    minPrice, maxPrice, minArea, maxArea,
    bedrooms, bathrooms, suites, parking
  ].filter(Boolean).length;

  const sortOptions = [
    { value: "created_desc", label: "Mais Recentes" },
    { value: "created_asc", label: "Mais Antigos" },
    { value: "price_asc", label: "Menor Preço" },
    { value: "price_desc", label: "Maior Preço" },
    { value: "area_asc", label: "Menor Área" },
    { value: "area_desc", label: "Maior Área" },
  ];

  const currentSortLabel = sortOptions.find(o => o.value === sort)?.label || "Mais Recentes";

  return (
    <div className="relative mb-6">
      {/* Main Search Bar Container */}
      <div className="flex flex-col md:flex-row gap-3 items-center">

        {/* Search Input - Material Style */}
        <div className="relative grow w-full z-20" ref={searchContainerRef}>
          <div className="relative flex items-center w-full h-12 rounded-full shadow-sm bg-white border border-gray-200 hover:shadow-md transition-shadow focus-within:shadow-md focus-within:border-gray-300 overflow-hidden">
            <div className="pl-4 text-gray-400">
              <FiSearch size={20} />
            </div>
            <input
              type="text"
              placeholder="Pesquisar por código, endereço..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (search.length >= 2) setShowResults(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyFilters();
                  setShowResults(false);
                }
              }}
              className="w-full h-full px-4 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setSearchResults([]);
                  setShowResults(false);
                }}
                className="pr-4 text-gray-400 hover:text-gray-600"
              >
                <FiX size={18} />
              </button>
            )}
          </div>

          {/* Search Results Overlay */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-[60vh] overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-[#960000] rounded-full mb-2"></div>
                  <p className="text-sm">Buscando imóveis...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Resultados encontrados ({searchResults.length})
                  </div>
                  {searchResults.map((property) => (
                    <Link
                      href={`/dashboard/edit/${property.id}`}
                      key={property.id}
                      onClick={() => setShowResults(false)}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      {/* Image Thumbnail */}
                      <div className="h-12 w-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                        {property.images && property.images[0] ? (
                          <img src={property.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <FiHome size={16} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 truncate">{property.code}</span>
                          <span className="text-sm font-semibold text-[#960000]">{formatPrice(property.sale_price)}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-0.5 truncate gap-1">
                          <FiMapPin size={10} />
                          <span className="truncate">
                            {property.address_street}, {property.address_number} - {property.address_neighborhood}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={() => applyFilters()}
                    className="w-full p-3 text-sm text-[#960000] font-medium hover:bg-gray-50 transition-colors text-center border-t border-gray-100"
                  >
                    Ver todos os resultados na tabela
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>Nenhum imóvel encontrado para "{search}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar px-1">

          {/* Filter Button */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`flex items-center gap-2 px-6 h-12 rounded-full border transition-all whitespace-nowrap
                ${isFiltersOpen || activeFiltersCount > 0
                  ? 'bg-[#E3F2FD] border-[#960000] text-[#960000] bg-opacity-10'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <FiFilter size={18} />
              <span className="font-medium">Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs text-white bg-[#960000] rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Filter Modal/Popover */}
            {isFiltersOpen && (
              <>
                {/* Backdrop for Mobile */}
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsFiltersOpen(false)} />

                {/* Panel */}
                <div className={`
                  fixed inset-0 z-50 flex flex-col bg-white md:absolute md:inset-auto md:top-full md:right-0 md:mt-2 md:w-[600px] md:max-h-[80vh] md:rounded-xl md:shadow-xl md:border md:border-gray-100 overflow-hidden
                  animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-top-2 duration-200
                `}>
                  {/* Header (Mobile) */}
                  <div className="flex items-center justify-between p-4 border-b md:hidden">
                    <button onClick={() => setIsFiltersOpen(false)} className="p-2 -ml-2 text-gray-500">
                      <FiArrowLeft size={24} />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
                    <button onClick={clearFilters} className="text-[#960000] text-sm font-medium">
                      Limpar
                    </button>
                  </div>

                  {/* Header (Desktop) */}
                  <div className="hidden md:flex items-center justify-between p-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-700">Filtrar Imóveis</h3>
                    <button onClick={clearFilters} className="text-sm text-[#960000] hover:underline">
                      Limpar tudo
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* Status & Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#960000] focus:border-transparent outline-none"
                        >
                          <option value="">Todos</option>
                          <option value="for_sale">À Venda</option>
                          <option value="sold">Vendido</option>
                          <option value="pending">Pendente</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Tipo</label>
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#960000] focus:border-transparent outline-none"
                        >
                          <option value="">Todos</option>
                          <option value="apartment">Apartamento</option>
                          <option value="house">Casa</option>
                          <option value="village_house">Casa de Vila</option>
                          <option value="penthouse">Cobertura</option>
                          <option value="flat">Flat</option>
                          <option value="kitnet">Kitnet</option>
                          <option value="loft">Loft</option>
                          <option value="studio">Studio</option>
                          <option value="allotment_land">Terreno</option>
                          <option value="building">Prédio</option>
                          <option value="farm">Fazenda</option>
                        </select>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Localização</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          className="w-full p-2 border rounded-lg bg-gray-50 outline-none"
                        >
                          <option value="">Todos Bairros</option>
                          {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>

                        <select
                          value={condominiumId}
                          onChange={(e) => setCondominiumId(e.target.value)}
                          className="w-full p-2 border rounded-lg bg-gray-50 outline-none"
                        >
                          <option value="">Todos Condomínios</option>
                          {condominiums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Preço (R$)</label>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-sm outline-none" />
                        <span className="text-gray-400">-</span>
                        <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-sm outline-none" />
                      </div>
                    </div>

                    {/* Area Range */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Área (m²)</label>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="Min" value={minArea} onChange={e => setMinArea(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-sm outline-none" />
                        <span className="text-gray-400">-</span>
                        <input type="number" placeholder="Max" value={maxArea} onChange={e => setMaxArea(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-sm outline-none" />
                      </div>
                    </div>

                    {/* Specifications */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Especificações</label>
                      <div className="grid grid-cols-4 gap-2">
                        <input type="number" placeholder="Quartos" value={bedrooms} onChange={e => setBedrooms(e.target.value)} className="p-2 border rounded-lg bg-gray-50 text-sm outline-none text-center" />
                        <input type="number" placeholder="Banhos" value={bathrooms} onChange={e => setBathrooms(e.target.value)} className="p-2 border rounded-lg bg-gray-50 text-sm outline-none text-center" />
                        <input type="number" placeholder="Suítes" value={suites} onChange={e => setSuites(e.target.value)} className="p-2 border rounded-lg bg-gray-50 text-sm outline-none text-center" />
                        <input type="number" placeholder="Vagas" value={parking} onChange={e => setParking(e.target.value)} className="p-2 border rounded-lg bg-gray-50 text-sm outline-none text-center" />
                      </div>
                    </div>

                  </div>

                  {/* Footer Action */}
                  <div className="p-4 border-t bg-white sticky bottom-0">
                    <button
                      onClick={() => { applyFilters(); setIsFiltersOpen(false); }}
                      className="w-full py-3 bg-[#960000] text-white rounded-lg font-medium hover:bg-[#7a0000] transition-colors shadow-lg active:transform active:scale-[0.98]"
                    >
                      Ver Resultados
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sort Button */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-6 h-12 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all whitespace-nowrap min-w-max"
            >
              <FiChevronDown size={18} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
              <span className="font-medium hidden sm:inline">{currentSortLabel}</span>
              <span className="font-medium sm:hidden">Ordenar</span>
            </button>

            {/* Sort Dropdown */}
            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSort(option.value);
                        setIsSortOpen(false);
                        const params = new URLSearchParams(searchParams.toString());
                        params.set("sort", option.value);
                        params.delete("page");
                        router.push(`/dashboard/imoveis?${params.toString()}`);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between
                         ${sort === option.value ? 'text-[#960000] font-medium bg-[#FDF2F2]' : 'text-gray-700'}
                       `}
                    >
                      {option.label}
                      {sort === option.value && <FiCheck />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

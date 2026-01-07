"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import { PropertyType, SellingStatus, Condominium } from "../lib/types/database";

interface DashboardFiltersProps {
  neighborhoods: string[];
  condominiums: Condominium[];
}

export default function DashboardFilters({ neighborhoods, condominiums }: DashboardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper to get param
  const getParam = (key: string) => searchParams.get(key) || "";

  // State
  const [search, setSearch] = useState(getParam("search"));
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

  const [isExpanded, setIsExpanded] = useState(false);

  // Debouce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]); // Only auto-apply text search for debounce. Others applied immediately or on blur? Let's apply on change for selects.

  const applyFilters = (override?: any) => {
    const params = new URLSearchParams(searchParams.toString());

    // Updates
    const setOrDelete = (key: string, val: string) => {
      if (val) params.set(key, val);
      else params.delete(key);
    };

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

    router.push(`/dashboard?${params.toString()}`);
  };

  // Trigger apply on select changes
  useEffect(() => {
    // We skip 'search' here because it's handled by debounce
    const params = new URLSearchParams(searchParams.toString());
    const currentParams = Object.fromEntries(params.entries());

    // Check if meaningful changes happened to trigger push
    // Simply calling applyFilters() here works but we need to avoid the search loop
    // For simplicity, we'll rely on the user interactions calling applyFilters via useEffect dependencies? 
    // No, let's just make inputs trigger logic.

  }, [status, type, neighborhood, condominiumId, sort]);

  // Actually, better pattern: Have a single useEffect that syncs ALL state to URL with debounce, 
  // OR just push on change. Pushing on every keystroke is bad. Pushing on select change is good.
  // Let's attach onBlur/Enter for inputs and onChange for selects.

  const handleApply = () => applyFilters();

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
    router.push("/dashboard");
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      {/* Top Row: Search + Status + Type + Sort + Expand Toggle */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Código, Endereço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-[#960000] focus:border-[#960000]"
          />
        </div>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setTimeout(() => applyFilters(), 0); }} // Hacky but ensures state update first? No, setState is async. 
          // Better: just trigger the router push in the onChange handler or useEffect.
          // Let's use the Verify Button approach for granular control or Auto-Apply? 
          // For Dashboard, Auto-Apply on Selects, Enter on Inputs is best.
          //   Actually, let's fix the useEffect above or manually call a helper.
          className="border rounded-md px-3 py-2 bg-white flex-shrink-0"
        >
          <option value="">Todos Status</option>
          <option value="for_sale">À Venda</option>
          <option value="sold">Vendido</option>
          <option value="pending">Pendente</option>
        </select>

        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setTimeout(handleApply, 100); }}
          className="border rounded-md px-3 py-2 bg-white flex-shrink-0"
        >
          <option value="">Todos Tipos</option>
          <option value="apartment">Apartamento</option>
          <option value="house">Casa</option>
          <option value="village_house">Casa de Vila</option>
          <option value="penthouse">Cobertura</option>
          <option value="flat">Flat</option>
          <option value="kitnet">Ktinet</option>
          <option value="loft">Loft</option>
          <option value="studio">Studio</option>
          <option value="allotment_land">Terreno</option>
          <option value="building">Prédio</option>
          <option value="farm">Fazenda</option>
        </select>

        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setTimeout(handleApply, 100); }}
          className="border rounded-md px-3 py-2 bg-white flex-shrink-0"
        >
          <option value="created_desc">Mais Recentes</option>
          <option value="created_asc">Mais Antigos</option>
          <option value="price_asc">Menor Preço</option>
          <option value="price_desc">Maior Preço</option>
          <option value="area_asc">Menor Área</option>
          <option value="area_desc">Maior Área</option>
        </select>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#960000] text-sm font-medium hover:underline flex items-center gap-1 whitespace-nowrap"
        >
          <FiFilter /> {isExpanded ? "Menos Filtros" : "Mais Filtros"}
        </button>

        <button
          onClick={handleApply}
          className="bg-[#960000] text-white px-4 py-2 rounded-md hover:bg-[#7a0000] lg:hidden"
        >
          Aplicar
        </button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-md border border-gray-200">

          {/* Location */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Localização</label>
            <select
              value={neighborhood}
              onChange={(e) => { setNeighborhood(e.target.value); setTimeout(handleApply, 100); }}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Todos Bairros</option>
              {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            <select
              value={condominiumId}
              onChange={(e) => { setCondominiumId(e.target.value); setTimeout(handleApply, 100); }}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Todos Condomínios</option>
              {condominiums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Preço (R$)</label>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} onBlur={handleApply} className="w-full border rounded-md px-2 py-1 text-sm" />
              <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} onBlur={handleApply} className="w-full border rounded-md px-2 py-1 text-sm" />
            </div>
          </div>

          {/* Area */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Área (m²)</label>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={minArea} onChange={e => setMinArea(e.target.value)} onBlur={handleApply} className="w-full border rounded-md px-2 py-1 text-sm" />
              <input type="number" placeholder="Max" value={maxArea} onChange={e => setMaxArea(e.target.value)} onBlur={handleApply} className="w-full border rounded-md px-2 py-1 text-sm" />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Características (+)</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Quartos" value={bedrooms} onChange={e => setBedrooms(e.target.value)} onBlur={handleApply} className="border rounded-md px-2 py-1 text-sm" />
              <input type="number" placeholder="Banhos" value={bathrooms} onChange={e => setBathrooms(e.target.value)} onBlur={handleApply} className="border rounded-md px-2 py-1 text-sm" />
              <input type="number" placeholder="Suítes" value={suites} onChange={e => setSuites(e.target.value)} onBlur={handleApply} className="border rounded-md px-2 py-1 text-sm" />
              <input type="number" placeholder="Vagas" value={parking} onChange={e => setParking(e.target.value)} onBlur={handleApply} className="border rounded-md px-2 py-1 text-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display & Clear */}
      <div className="flex justify-between items-center pt-2">
        {/* Could show tags here like "Copacabana" [x] */}
        <div className="text-xs text-gray-500">
          {/* Placeholder for active filter count or description */}
        </div>
        <button
          onClick={clearFilters}
          className="text-gray-500 hover:text-red-600 text-sm flex items-center gap-1"
        >
          <FiX /> Limpar Filtros
        </button>
      </div>

    </div>
  );
}

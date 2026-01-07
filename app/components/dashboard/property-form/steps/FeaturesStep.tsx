
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { PropertyFormData } from "../types";
import { cn } from "@/lib/utils";
import {
  PRIVATE_AREAS_DETAILS,
  PRIVATE_AREAS_ROOMS,
  PRIVATE_AREAS_TECH,
  COMMON_AREAS_LEISURE,
  COMMON_AREAS_SECURITY,
  COMMON_AREAS_INFRASTRUCTURE,
  NEARBY_LOCATIONS
} from "@/app/lib/constants/property-features";

interface FeaturesStepProps {
  formData: PropertyFormData;
  setFormData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleAreaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAreaBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  condoFeatures?: string[];
}

// Internal component to handle masking with cursor preservation
// This component tracks the cursor position relative to the end of the input
// to ensure it stays in the correct place during "adding machine" style masking.
const MaskedAreaInput = ({
  value,
  onChange,
  onBlur,
  name,
  id,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  name: string;
  id: string;
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cursorRef = React.useRef<number | null>(null);

  React.useLayoutEffect(() => {
    const input = inputRef.current;
    if (input && cursorRef.current !== null) {
      const newLength = input.value.length;
      // Calculate new position based on distance from end
      const newPos = Math.max(0, newLength - cursorRef.current);
      input.setSelectionRange(newPos, newPos);
      cursorRef.current = null; // Reset
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const selectionStart = input.selectionStart;
    const length = input.value.length;

    if (selectionStart !== null) {
      // Store distance from end
      cursorRef.current = length - selectionStart;
    }

    onChange(e);
  };

  return (
    <div className="flex rounded-md shadow-sm">
      <Input
        ref={inputRef}
        type="text"
        name={name}
        id={id}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        className="rounded-r-none"
        placeholder="00,00"
      />
      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground sm:text-sm">
        m²
      </span>
    </div>
  );
};

export function FeaturesStep({
  formData,
  setFormData,
  handleChange,
  handleAreaChange,
  handleAreaBlur,
  condoFeatures = []
}: FeaturesStepProps) {

  const handleFeatureToggle = (value: string) => {
    // If feature is from condo, return early (extra safety)
    if (condoFeatures.includes(value)) return;

    setFormData(prev => {
      const features = prev.features.includes(value)
        ? prev.features.filter(f => f !== value)
        : [...prev.features, value];
      return { ...prev, features };
    });
  };

  const renderFeatureSection = (title: string, items: { value: string; label: string }[], prefix: string) => (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-900 mb-3">{title}</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item) => {
          const isLocked = condoFeatures.includes(item.value);
          const isActive = formData.features.includes(item.value);
          return (
            <Card
              key={item.value}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md border-2 gap-0 p-0",
                isActive
                  ? "bg-[#fbf3f3] border-[#960000] shadow-sm"
                  : "bg-white border-gray-200 hover:border-gray-300",
                isLocked && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !isLocked && handleFeatureToggle(item.value)}
            >
              <div className="flex items-center gap-2 py-3 px-4 w-full">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                  isActive
                    ? "bg-[#960000] border-[#960000]"
                    : "bg-white border-gray-300"
                )}>
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
                  disabled={isLocked}
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-1">
          <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">Quartos</label>
          <Input type="number" name="bedrooms" id="bedrooms"
            value={formData.bedrooms} onChange={handleChange}
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">Banheiros</label>
          <Input type="number" name="bathrooms" id="bathrooms"
            value={formData.bathrooms} onChange={handleChange}
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="suites" className="block text-sm font-medium text-gray-700 mb-1">Suítes</label>
          <Input type="number" name="suites" id="suites"
            value={formData.suites} onChange={handleChange}
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="salas" className="block text-sm font-medium text-gray-700 mb-1">Salas</label>
          <Input type="number" name="salas" id="salas"
            value={formData.salas} onChange={handleChange}
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="parking_spaces" className="block text-sm font-medium text-gray-700 mb-1">Vagas</label>
          <Input type="number" name="parking_spaces" id="parking_spaces"
            value={formData.parking_spaces} onChange={handleChange}
          />
        </div>

        {/* Area Inputs with formatting */}
        <div className="sm:col-span-1">
          <label htmlFor="usable_area" className="block text-sm font-medium text-gray-700 mb-1">Área Útil</label>
          <MaskedAreaInput
            name="usable_area"
            id="usable_area"
            value={formData.usable_area}
            onChange={handleAreaChange}
            onBlur={handleAreaBlur}
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="total_area" className="block text-sm font-medium text-gray-700 mb-1">Área Total</label>
          <MaskedAreaInput
            name="total_area"
            id="total_area"
            value={formData.total_area}
            onChange={handleAreaChange}
            onBlur={handleAreaBlur}
          />
        </div>

        <div className="sm:col-span-1">
          <label htmlFor="floor_number" className="block text-sm font-medium text-gray-700 mb-1">Andar</label>
          <Input type="number" name="floor_number" id="floor_number"
            value={formData.floor_number} onChange={handleChange}
          />
        </div>
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ano Const.</label>
          <div className="flex space-x-1">
            <Select
              value={formData.construction_data?.delivery_forecast ? new Date(formData.construction_data.delivery_forecast).getMonth().toString() : ""}
              onValueChange={(month) => {
                const currentYear = formData.construction_year ? parseInt(formData.construction_year) : new Date().getFullYear();
                const newDate = new Date(currentYear, parseInt(month), 1);
                // Simple ISO string YYYY-MM
                const isoDate = `${currentYear}-${(parseInt(month) + 1).toString().padStart(2, '0')}-01`;

                // Logic: If future -> show construction fields
                const isFuture = newDate > new Date();

                setFormData(prev => ({
                  ...prev,
                  construction_data: {
                    ...prev.construction_data,
                    delivery_forecast: isoDate,
                    // Initialize other fields if not present
                    developer_name: prev.construction_data?.developer_name || "",
                    construction_company: prev.construction_data?.construction_company || "",
                    stage: prev.construction_data?.stage || "planning",
                    progress_percentage: prev.construction_data?.progress_percentage || "0",
                    started_at: prev.construction_data?.started_at || ""
                  } as any // Temporary cast until parent initializes
                }));
              }}
            >
              <SelectTrigger className="w-[70px] px-2 text-xs">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>{new Date(0, i).toLocaleString('default', { month: 'short' })}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={formData.construction_year ? formData.construction_year.toString() : ""}
              onValueChange={(year) => {
                setFormData(prev => ({ ...prev, construction_year: year }));
                // Also update delivery_forecast year if it exists
                if (formData.construction_data?.delivery_forecast) {
                  const date = new Date(formData.construction_data.delivery_forecast);
                  date.setFullYear(parseInt(year));
                  const isoDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-01`;
                  setFormData(prev => ({
                    ...prev,
                    construction_data: {
                      ...prev.construction_data,
                      delivery_forecast: isoDate
                    } as any
                  }));
                }
              }}
            >
              <SelectTrigger className="w-[80px] px-2 text-xs">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="sm:col-span-1">
          <label htmlFor="orientation" className="block text-sm font-medium text-gray-700 mb-1">Orientação Solar</label>
          <Select
            value={formData.orientation}
            onValueChange={(val) => setFormData(prev => ({ ...prev, orientation: val }))}
          >
            <SelectTrigger id="orientation" className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Sol da Manhã</SelectItem>
              <SelectItem value="afternoon">Sol da Tarde</SelectItem>
              <SelectItem value="all_day">Sol Passante</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Construction Fields - Rendered if Year/Month is in Future */}
      {(formData.construction_year && parseInt(formData.construction_year) > new Date().getFullYear()) ||
        (formData.construction_year && parseInt(formData.construction_year) === new Date().getFullYear() &&
          formData.construction_data?.delivery_forecast && new Date(formData.construction_data.delivery_forecast) > new Date()) ? (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
          <h4 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
            🚧 Informações da Construção (Lançamento)
          </h4>
          <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incorporadora</label>
              <Input
                value={formData.construction_data?.developer_name || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  construction_data: { ...prev.construction_data!, developer_name: e.target.value }
                }))}
                placeholder="Nome da incorporadora"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Construtora</label>
              <Input
                value={formData.construction_data?.construction_company || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  construction_data: { ...prev.construction_data!, construction_company: e.target.value }
                }))}
                placeholder="Nome da construtora"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estágio da Obra</label>
              <Select
                value={formData.construction_data?.stage || "planning"}
                onValueChange={(val: any) => setFormData(prev => ({
                  ...prev,
                  construction_data: { ...prev.construction_data!, stage: val }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Lançamento / Planta</SelectItem>
                  <SelectItem value="foundation">Fundação</SelectItem>
                  <SelectItem value="structure">Estrutura</SelectItem>
                  <SelectItem value="masonry">Alvenaria</SelectItem>
                  <SelectItem value="finishing">Acabamento</SelectItem>
                  <SelectItem value="ready">Pronto para Morar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Progresso (%)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="range" min="0" max="100"
                  value={formData.construction_data?.progress_percentage || "0"}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    construction_data: { ...prev.construction_data!, progress_percentage: e.target.value }
                  }))}
                  className="flex-1"
                />
                <span className="text-sm w-10 text-right">{formData.construction_data?.progress_percentage || "0"}%</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Características do Imóvel</h3>
        {renderFeatureSection("Áreas Privativas (Detalhes)", PRIVATE_AREAS_DETAILS, "feature")}
        {renderFeatureSection("Áreas Privativas (Cômodos)", PRIVATE_AREAS_ROOMS, "feature")}
        {renderFeatureSection("Áreas Privativas (Tecnologia)", PRIVATE_AREAS_TECH, "feature")}
        {renderFeatureSection("Áreas Comuns (Lazer)", COMMON_AREAS_LEISURE, "feature")}
        {renderFeatureSection("Áreas Comuns (Infraestrutura)", COMMON_AREAS_INFRASTRUCTURE, "feature")}
        {renderFeatureSection("Áreas Comuns (Segurança)", COMMON_AREAS_SECURITY, "feature")}
        {renderFeatureSection("Locations Próximas", NEARBY_LOCATIONS, "feature")}
      </div>
    </div>
  );
}

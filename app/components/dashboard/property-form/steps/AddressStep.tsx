
import React from "react";
import { FaPlus, FaSpinner } from "react-icons/fa";
import { Condominium, IbgeUF, IbgeCity } from "@/app/lib/types/database";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PropertyFormData } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddressStepProps {
  formData: PropertyFormData;
  setFormData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;

  // CEP
  handleCepChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCepBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  loadingCep: boolean;

  // Locations
  ufs: IbgeUF[];
  cities: IbgeCity[];
  loadingCities: boolean;
  handleStateChange: (stateSigla: string) => void;

  // Condominium
  condominiums: Condominium[];
  handleCondominiumChange: (val: string | number) => void;

  // Add Condominium
  condoSheetOpen: boolean;
  setCondoSheetOpen: (open: boolean) => void;
  newCondoData: {
    name: string;
    description: string;
    building_type: string;
    total_units: string;
    total_floors: string;
    tower_count: string;
    construction_year: string;
    amenities: string[];
  };
  setNewCondoData: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    building_type: string;
    total_units: string;
    total_floors: string;
    tower_count: string;
    construction_year: string;
    amenities: string[];
  }>>;
  creatingCondo: boolean;
  handleCreateCondominium: () => void;

  // Locked fields logic should be handled by parent updating formData or disabled prop?
  // We can pass `lockedAddressFields` object to disable inputs
  lockedAddressFields: {
    street: boolean;
    neighborhood: boolean;
    city: boolean;
    state: boolean;
    zone: boolean;
    zip: boolean;
    number: boolean;
  };
}

export function AddressStep({
  formData,
  setFormData,
  handleChange,
  handleCepChange,
  handleCepBlur,
  loadingCep,
  ufs,
  cities,
  loadingCities,
  handleStateChange,
  condominiums,
  handleCondominiumChange,
  condoSheetOpen,
  setCondoSheetOpen,
  newCondoData,
  setNewCondoData,
  creatingCondo,
  handleCreateCondominium,
  lockedAddressFields
}: AddressStepProps) {

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-12">
        {/* Condominium */}
        <div className="sm:col-span-3">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="condominium" className="block text-sm font-medium text-gray-700 mb-1">Condomínio</label>
            <Sheet open={condoSheetOpen} onOpenChange={setCondoSheetOpen}>
              <SheetTrigger asChild>
                <div
                  className="flex items-center text-primary hover:text-[#960000] cursor-pointer whitespace-nowrap"
                  onClick={(e) => {
                    e.preventDefault();
                    setCondoSheetOpen(true);
                  }}
                >
                  <FaPlus className="mr-1 h-2 w-2" />
                  <span className="text-xs font-medium">Adicionar</span>
                </div>
              </SheetTrigger>
              {/* Simplified Sheet Content for brevity, assume logic from main form is moved here or just reused UI structure */}
              <SheetContent className="sm:max-w-[500px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Adicionar Novo Condomínio</SheetTitle>
                  <SheetDescription>Cadastre um novo condomínio.</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 py-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <Input value={newCondoData.name} onChange={(e) => setNewCondoData({ ...newCondoData, name: e.target.value })} placeholder="Nome do condomínio" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ano Construção</label>
                      <Input type="number" value={newCondoData.construction_year} onChange={(e) => setNewCondoData({ ...newCondoData, construction_year: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Unidades</label>
                      <Input type="number" value={newCondoData.total_units} onChange={(e) => setNewCondoData({ ...newCondoData, total_units: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleCreateCondominium} disabled={!newCondoData.name || creatingCondo}>
                      {creatingCondo ? <><FaSpinner className="animate-spin mr-2" /> Salvando...</> : "Salvar Condomínio"}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex gap-2 items-center">
            <Combobox
              options={condominiums.map(c => ({ value: c.id, label: c.name }))}
              value={formData.condominium_id || ""}
              onChange={handleCondominiumChange}
              placeholder="Selecione um condomínio..."
            />
          </div>
        </div>

        {/* CEP */}
        <div className="sm:col-span-3">
          <label htmlFor="address_zip" className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
          <div className="relative rounded-md shadow-sm">
            <Input
              type="text"
              name="address_zip"
              id="address_zip"
              value={formData.address_zip}
              onChange={handleCepChange}
              onBlur={handleCepBlur}
              placeholder="00000-000"
              disabled={lockedAddressFields.zip}
              className={lockedAddressFields.zip ? "bg-gray-100" : ""}
            />
            {loadingCep && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FaSpinner className="h-4 w-4 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* State */}
        <div className="sm:col-span-3">
          <label htmlFor="address_state" className="block text-sm font-medium text-gray-700 mb-1">UF</label>
          <Combobox
            options={ufs.map(uf => ({ value: uf.sigla, label: uf.sigla }))}
            value={formData.address_state}
            onChange={(val) => handleStateChange(val)}
            placeholder="UF"
            disabled={lockedAddressFields.state}
          />
        </div>

        {/* City */}
        <div className="sm:col-span-3">
          <label htmlFor="address_city" className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
          <Combobox
            options={cities.map(c => ({ value: c.nome, label: c.nome }))}
            value={formData.address_city}
            onChange={(val) => setFormData(prev => ({ ...prev, address_city: val }))}
            placeholder={loadingCities ? "Carregando..." : "Selecione a cidade"}
            disabled={lockedAddressFields.city || loadingCities}
          />
        </div>

        {/* Zone */}
        <div className="sm:col-span-3">
          <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
          <Input type="text" name="zone" id="zone"
            value={formData.zone || ""} onChange={handleChange}
            disabled={lockedAddressFields.zone}
            className={lockedAddressFields.zone ? "bg-gray-100" : ""}
          />
        </div>

        {/* Neighborhood */}
        <div className="sm:col-span-3">
          <label htmlFor="address_neighborhood" className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
          <Input type="text" name="address_neighborhood" id="address_neighborhood"
            value={formData.address_neighborhood} onChange={handleChange}
            disabled={lockedAddressFields.neighborhood}
            className={lockedAddressFields.neighborhood ? "bg-gray-100" : ""}
          />
        </div>

        {/* Street */}
        <div className="sm:col-span-3">
          <label htmlFor="address_street" className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
          <Input type="text" name="address_street" id="address_street"
            value={formData.address_street} onChange={handleChange}
            disabled={lockedAddressFields.street}
            className={lockedAddressFields.street ? "bg-gray-100" : ""}
          />
        </div>

        {/* Number */}
        <div className="sm:col-span-3">
          <label htmlFor="address_number" className="block text-sm font-medium text-gray-700 mb-1">Número</label>
          <Input type="text" name="address_number" id="address_number"
            value={formData.address_number} onChange={handleChange}
            disabled={lockedAddressFields.number}
            className={lockedAddressFields.number ? "bg-gray-100" : ""}
          />
        </div>

        {/* Complement */}
        <div className="sm:col-span-3">
          <label htmlFor="address_complement" className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
          <Input type="text" name="address_complement" id="address_complement"
            value={formData.address_complement} onChange={handleChange}
          />
        </div>

        {/* Reference */}
        <div className="sm:col-span-3">
          <label htmlFor="address_reference" className="block text-sm font-medium text-gray-700 mb-1">Referência</label>
          <Input type="text" name="address_reference" id="address_reference"
            value={formData.address_reference} onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}

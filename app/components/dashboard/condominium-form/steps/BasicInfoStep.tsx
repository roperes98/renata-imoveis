import React from "react";
import { FaSpinner, FaPlus, FaTrash } from "react-icons/fa";
import { IbgeUF, IbgeCity } from "@/app/lib/types/database";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { CondominiumFormData, CondominiumAddressFormData } from "../types";
import { BUILDING_TYPES } from "../constants";
import { Plus } from "lucide-react";

interface BasicInfoStepProps {
  formData: CondominiumFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSelectChange: (name: string, value: string | number) => void;

  // CEP
  handleCepChange: (e: React.ChangeEvent<HTMLInputElement>, addressIndex?: number) => void;
  handleCepBlur: (e: React.FocusEvent<HTMLInputElement>, addressIndex?: number) => void;
  loadingCep: boolean;

  // Locations
  ufs: IbgeUF[];
  cities: IbgeCity[];
  loadingCities: boolean;
  handleStateChange: (stateSigla: string, addressIndex?: number) => void;

  // Locked fields logic
  lockedAddressFields: {
    street: boolean;
    neighborhood: boolean;
    city: boolean;
    state: boolean;
    zone: boolean;
    zip: boolean;
    number: boolean;
  };

  // Multiple addresses
  currentAddressIndex: number;
  setCurrentAddressIndex: (index: number) => void;
  addAddress: () => void;
  removeAddress: (index: number) => void;
  updateAddress: (index: number, field: keyof CondominiumAddressFormData, value: string) => void;
}

export function BasicInfoStep({
  formData,
  handleChange,
  handleSelectChange,
  handleCepChange,
  handleCepBlur,
  loadingCep,
  ufs,
  cities,
  loadingCities,
  handleStateChange,
  lockedAddressFields,
  currentAddressIndex,
  setCurrentAddressIndex,
  addAddress,
  removeAddress,
  updateAddress,
}: BasicInfoStepProps) {
  // Garantir que sempre há pelo menos um endereço
  const addresses = formData.addresses.length > 0 ? formData.addresses : [{
    label: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    zip: "",
    complement: "",
    zone: "",
  }];

  const renderAddressForm = (address: CondominiumAddressFormData, index: number) => {
    const isActive = index === currentAddressIndex;

    // Função para formatar o endereço de forma legível
    const formatAddressSummary = (addr: CondominiumAddressFormData) => {
      const lines: string[] = [];

      // Linha 1: Rua, Número - Complemento
      const line1Parts: string[] = [];
      if (addr.street) {
        if (addr.number) {
          line1Parts.push(`${addr.street}, ${addr.number}`);
        } else {
          line1Parts.push(addr.street);
        }
      }
      if (addr.complement) {
        line1Parts.push(`- ${addr.complement}`);
      }
      if (line1Parts.length > 0) {
        lines.push(line1Parts.join(" "));
      }

      // Linha 2: Bairro (Zona), Cidade - Estado
      const line2Parts: string[] = [];
      if (addr.neighborhood) {
        if (addr.zone) {
          line2Parts.push(`${addr.neighborhood} (${addr.zone})`);
        } else {
          line2Parts.push(addr.neighborhood);
        }
      }
      if (addr.city || addr.state) {
        const cityState = [addr.city, addr.state].filter(Boolean).join(" - ");
        if (cityState) {
          line2Parts.push(cityState);
        }
      }
      if (line2Parts.length > 0) {
        lines.push(line2Parts.join(", "));
      }

      // Linha 3: CEP
      if (addr.zip) {
        lines.push(`CEP.: ${addr.zip}`);
      }

      return lines.length > 0 ? lines : ["Nenhum endereço preenchido"];
    };

    return (
      <div
        key={index}
        className={`border rounded-lg p-4 space-y-4 border-gray-200`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-gray-900">
              {address.label || `Endereço ${index + 1}`}
            </h4>
            {!isActive && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentAddressIndex(index)}
                className="text-xs"
              >
                Editar
              </Button>
            )}
          </div>
          {addresses.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeAddress(index)}
              className="text-red-600 hover:text-red-700"
            >
              <FaTrash className="h-4 w-4" />
            </Button>
          )}
        </div>

        {!isActive && (
          <div className="text-sm text-gray-600 bg-gray-50 rounded-md p-3 border border-gray-200 whitespace-pre-line">
            {formatAddressSummary(address).join("\n")}
          </div>
        )}

        {isActive && (
          <>
            {/* Label do Endereço */}
            <div className="sm:col-span-12">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rótulo do Endereço (opcional)
              </label>
              <Input
                type="text"
                value={address.label}
                onChange={(e) => updateAddress(index, "label", e.target.value)}
                placeholder="Ex: Sede, Unidade 2, etc."
              />
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-12">
              {/* CEP */}
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <div className="relative rounded-md shadow-sm">
                  <Input
                    type="text"
                    value={address.zip}
                    onChange={(e) => handleCepChange(e, index)}
                    onBlur={(e) => handleCepBlur(e, index)}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UF
                </label>
                <Combobox
                  options={ufs.map((uf) => ({ value: uf.sigla, label: uf.sigla }))}
                  value={address.state}
                  onChange={(val) => handleStateChange(val, index)}
                  placeholder="UF"
                  disabled={lockedAddressFields.state}
                />
              </div>

              {/* City */}
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <Combobox
                  options={cities.map((c) => ({ value: c.nome, label: c.nome }))}
                  value={address.city}
                  onChange={(val) => updateAddress(index, "city", val)}
                  placeholder={loadingCities ? "Carregando..." : "Selecione a cidade"}
                  disabled={lockedAddressFields.city || loadingCities}
                />
              </div>

              {/* Zone */}
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zona
                </label>
                <Input
                  type="text"
                  value={address.zone}
                  onChange={(e) => updateAddress(index, "zone", e.target.value)}
                  disabled={lockedAddressFields.zone}
                  className={lockedAddressFields.zone ? "bg-gray-100" : ""}
                />
              </div>

              {/* Neighborhood */}
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro
                </label>
                <Input
                  type="text"
                  value={address.neighborhood}
                  onChange={(e) => updateAddress(index, "neighborhood", e.target.value)}
                  disabled={lockedAddressFields.neighborhood}
                  className={lockedAddressFields.neighborhood ? "bg-gray-100" : ""}
                />
              </div>

              {/* Street */}
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rua
                </label>
                <Input
                  type="text"
                  value={address.street}
                  onChange={(e) => updateAddress(index, "street", e.target.value)}
                  disabled={lockedAddressFields.street}
                  className={lockedAddressFields.street ? "bg-gray-100" : ""}
                />
              </div>

              {/* Number */}
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número
                </label>
                <Input
                  type="text"
                  value={address.number}
                  onChange={(e) => updateAddress(index, "number", e.target.value)}
                  disabled={lockedAddressFields.number}
                  className={lockedAddressFields.number ? "bg-gray-100" : ""}
                />
              </div>

              {/* Complement */}
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complemento
                </label>
                <Input
                  type="text"
                  value={address.complement}
                  onChange={(e) => updateAddress(index, "complement", e.target.value)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Informações Básicas */}
      <div>
        <h3 className="text-base font-medium text-gray-700 mb-4">Informações Básicas</h3>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-12">
          {/* Nome */}
          <div className="sm:col-span-3">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Condomínio *
            </label>
            <Input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome do condomínio"
              required
            />
          </div>

          {/* Tipo de Construção */}
          <div className="sm:col-span-3">
            <label htmlFor="building_type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Construção
            </label>
            <Select
              value={formData.building_type}
              onValueChange={(val) => handleSelectChange("building_type", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {BUILDING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Total de Unidades */}
          <div className="sm:col-span-3">
            <label htmlFor="total_units" className="block text-sm font-medium text-gray-700 mb-1">
              Total de Unidades
            </label>
            <Input
              type="number"
              name="total_units"
              id="total_units"
              value={formData.total_units}
              onChange={handleChange}
              placeholder="Ex: 100"
              min="0"
            />
          </div>

          {/* Total de Andares */}
          <div className="sm:col-span-3">
            <label htmlFor="total_floors" className="block text-sm font-medium text-gray-700 mb-1">
              Total de Andares
            </label>
            <Input
              type="number"
              name="total_floors"
              id="total_floors"
              value={formData.total_floors}
              onChange={handleChange}
              placeholder="Ex: 10"
              min="0"
            />
          </div>

          {/* Número de Torres */}
          <div className="sm:col-span-3">
            <label htmlFor="tower_count" className="block text-sm font-medium text-gray-700 mb-1">
              Número de Torres
            </label>
            <Input
              type="number"
              name="tower_count"
              id="tower_count"
              value={formData.tower_count}
              onChange={handleChange}
              placeholder="Ex: 2"
              min="0"
            />
          </div>

          {/* Ano de Construção */}
          <div className="sm:col-span-3">
            <label htmlFor="construction_year" className="block text-sm font-medium text-gray-700 mb-1">
              Ano de Construção
            </label>
            <Input
              type="number"
              name="construction_year"
              id="construction_year"
              value={formData.construction_year}
              onChange={handleChange}
              placeholder="Ex: 2020"
              min="1900"
              max={new Date().getFullYear() + 10}
            />
          </div>
        </div>
      </div>

      {/* Localização - Múltiplos Endereços */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-gray-700">Localização</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAddress}
            className="flex items-center gap-2 text-[13px] font-medium"
          >
            <Plus />
            Adicionar Endereço
          </Button>
        </div>
        <div className="space-y-4">
          {addresses.map((address, index) => renderAddressForm(address, index))}
        </div>
      </div>
    </div>
  );
}

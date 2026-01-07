import React from "react";
import { FaSpinner } from "react-icons/fa";
import { IbgeUF, IbgeCity } from "@/app/lib/types/database";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { CondominiumFormData } from "../types";

interface AddressStepProps {
  formData: CondominiumFormData;
  setFormData: React.Dispatch<React.SetStateAction<CondominiumFormData>>;
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
  lockedAddressFields,
}: AddressStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-12">
        {/* CEP */}
        <div className="sm:col-span-3">
          <label htmlFor="address_zip" className="block text-sm font-medium text-gray-700 mb-1">
            CEP
          </label>
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
          <label htmlFor="address_state" className="block text-sm font-medium text-gray-700 mb-1">
            UF
          </label>
          <Combobox
            options={ufs.map((uf) => ({ value: uf.sigla, label: uf.sigla }))}
            value={formData.address_state}
            onChange={(val) => handleStateChange(val)}
            placeholder="UF"
            disabled={lockedAddressFields.state}
          />
        </div>

        {/* City */}
        <div className="sm:col-span-3">
          <label htmlFor="address_city" className="block text-sm font-medium text-gray-700 mb-1">
            Cidade
          </label>
          <Combobox
            options={cities.map((c) => ({ value: c.nome, label: c.nome }))}
            value={formData.address_city}
            onChange={(val) => setFormData((prev) => ({ ...prev, address_city: val }))}
            placeholder={loadingCities ? "Carregando..." : "Selecione a cidade"}
            disabled={lockedAddressFields.city || loadingCities}
          />
        </div>

        {/* Zone */}
        <div className="sm:col-span-3">
          <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-1">
            Zona
          </label>
          <Input
            type="text"
            name="zone"
            id="zone"
            value={formData.zone || ""}
            onChange={handleChange}
            disabled={lockedAddressFields.zone}
            className={lockedAddressFields.zone ? "bg-gray-100" : ""}
          />
        </div>

        {/* Neighborhood */}
        <div className="sm:col-span-3">
          <label htmlFor="address_neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
            Bairro
          </label>
          <Input
            type="text"
            name="address_neighborhood"
            id="address_neighborhood"
            value={formData.address_neighborhood}
            onChange={handleChange}
            disabled={lockedAddressFields.neighborhood}
            className={lockedAddressFields.neighborhood ? "bg-gray-100" : ""}
          />
        </div>

        {/* Street */}
        <div className="sm:col-span-3">
          <label htmlFor="address_street" className="block text-sm font-medium text-gray-700 mb-1">
            Rua
          </label>
          <Input
            type="text"
            name="address_street"
            id="address_street"
            value={formData.address_street}
            onChange={handleChange}
            disabled={lockedAddressFields.street}
            className={lockedAddressFields.street ? "bg-gray-100" : ""}
          />
        </div>

        {/* Number */}
        <div className="sm:col-span-3">
          <label htmlFor="address_number" className="block text-sm font-medium text-gray-700 mb-1">
            Número
          </label>
          <Input
            type="text"
            name="address_number"
            id="address_number"
            value={formData.address_number}
            onChange={handleChange}
            disabled={lockedAddressFields.number}
            className={lockedAddressFields.number ? "bg-gray-100" : ""}
          />
        </div>

        {/* Complement */}
        <div className="sm:col-span-3">
          <label htmlFor="address_complement" className="block text-sm font-medium text-gray-700 mb-1">
            Complemento
          </label>
          <Input
            type="text"
            name="address_complement"
            id="address_complement"
            value={formData.address_complement}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}


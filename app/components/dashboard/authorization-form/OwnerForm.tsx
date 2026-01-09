"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import PhoneInput, { Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { getExampleNumber } from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";
import { InputGroup } from "@/components/ui/input-group";
import { CountrySelect } from "./CountrySelect";
import { NationalitySelect } from "./NationalitySelect";
import { OwnerData, MARITAL_STATUS_OPTIONS } from "./types";

interface OwnerFormProps {
  owner: OwnerData;
  index: number;
  isActive: boolean;
  totalOwners: number;
  phoneCountry: { phone: Country | undefined; cellphone: Country | undefined };
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (index: number, name: string, value: string) => void;
  onPhoneChange: (index: number, field: "phone" | "cellphone", value: string | undefined) => void;
  onPhoneCountryChange: (index: number, field: "phone" | "cellphone", country: Country | undefined) => void;
  onCpfChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onRgChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const OwnerForm = ({
  owner,
  index,
  isActive,
  totalOwners,
  phoneCountry,
  onEdit,
  onRemove,
  onChange,
  onSelectChange,
  onPhoneChange,
  onPhoneCountryChange,
  onCpfChange,
  onRgChange,
}: OwnerFormProps) => {

  const formatOwnerSummary = (owner: OwnerData) => {
    const lines: string[] = [];

    // Linha 1: Nome e E-mail
    const line1Parts: string[] = [];
    if (owner.name) {
      line1Parts.push(owner.name);
    }
    if (owner.email) {
      line1Parts.push(`(${owner.email})`);
    }
    if (line1Parts.length > 0) {
      lines.push(line1Parts.join(" "));
    }

    // Linha 2: Contatos (Celular / Telefone)
    const line2Parts: string[] = [];
    if (owner.cellphone || owner.phone) {
      const phones = [owner.cellphone, owner.phone].filter(Boolean);
      if (phones.length > 0) {
        line2Parts.push(phones.join(" / "));
      }
    }
    if (line2Parts.length > 0) {
      lines.push(line2Parts.join(" "));
    }

    // Linha 3: Documentos (CPF, RG)
    const line3Parts: string[] = [];
    if (owner.cpf) {
      line3Parts.push(`CPF: ${owner.cpf}`);
    }
    if (owner.rg) {
      const rgInfo = owner.rg_issued_at
        ? `RG: ${owner.rg} (${owner.rg_issued_at})`
        : `RG: ${owner.rg}`;
      line3Parts.push(rgInfo);
    }
    if (line3Parts.length > 0) {
      lines.push(line3Parts.join(" | "));
    }

    // Linha 4: Profissão, Estado Civil e Nacionalidade
    const line4Parts: string[] = [];
    if (owner.profession) {
      line4Parts.push(owner.profession);
    }
    if (owner.marital_status) {
      const maritalLabel = MARITAL_STATUS_OPTIONS.find(opt => opt.value === owner.marital_status)?.label || owner.marital_status;
      line4Parts.push(maritalLabel);
    }
    if (owner.nationality) {
      line4Parts.push(owner.nationality);
    }
    if (line4Parts.length > 0) {
      lines.push(line4Parts.join(" • "));
    }

    return lines.length > 0 ? lines : ["Nenhuma informação preenchida"];
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-gray-900">
            {owner.name || `Proprietário ${index + 1}`}
          </h4>
          {!isActive && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(index)}
              className="text-xs"
            >
              Editar
            </Button>
          )}
        </div>
        {totalOwners > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!isActive && (
        <div className="text-sm text-gray-600 bg-gray-50 rounded-md p-3 border border-gray-200 whitespace-pre-line">
          {formatOwnerSummary(owner).join("\n")}
        </div>
      )}

      {isActive && (
        <div className="space-y-6">
          {/* Nome */}
          <div>
            <label
              htmlFor={`name-${index}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nome <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              id={`name-${index}`}
              name="name"
              value={owner.name}
              onChange={(e) => onChange(index, e)}
              required
              placeholder="Nome completo"
            />
          </div>

          {/* Telefone e Celular */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* E-mail */}
            <div>
              <label
                htmlFor={`email-${index}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                E-mail <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                id={`email-${index}`}
                name="email"
                value={owner.email}
                onChange={(e) => onChange(index, e)}
                required
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor={`phone-${index}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Telefone
              </label>
              <InputGroup className="w-full">
                <div className="flex-1">
                  <PhoneInput
                    id={`phone-${index}`}
                    defaultCountry="BR"
                    country={phoneCountry?.phone || "BR"}
                    limitMaxLength={true}
                    placeholder={
                      phoneCountry?.phone
                        ? getExampleNumber(phoneCountry.phone, examples)?.formatNational()
                        : "(XX) XXXX-XXXX"
                    }
                    value={owner.phone || undefined}
                    onChange={(value) => onPhoneChange(index, "phone", value)}
                    onCountryChange={(country) => onPhoneCountryChange(index, "phone", country)}
                    className="w-full [&>input]:border-0 [&>input]:bg-transparent [&>input]:shadow-none [&>input]:focus-visible:ring-0 [&>input]:h-full [&>input]:pr-3 [&>input]:py-2 [&>input]:text-sm [&>input]:outline-none [&_button]:border-0 [&_button]:bg-transparent [&_button]:shadow-none [&_button]:px-2 [&_button]:focus-visible:ring-0 [&_.PhoneInputCountryIcon]:hidden [&_.PhoneInputCountrySelect]:hidden"
                    countrySelectComponent={CountrySelect}
                  />
                </div>
              </InputGroup>
            </div>
            <div>
              <label
                htmlFor={`cellphone-${index}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Celular <span className="text-red-500">*</span>
              </label>
              <InputGroup className="w-full">
                <div className="flex-1">
                  <PhoneInput
                    id={`cellphone-${index}`}
                    defaultCountry="BR"
                    country={phoneCountry?.cellphone || "BR"}
                    limitMaxLength={true}
                    placeholder={
                      phoneCountry?.cellphone
                        ? getExampleNumber(phoneCountry.cellphone, examples)?.formatNational()
                        : "(XX) XXXXX-XXXX"
                    }
                    value={owner.cellphone || undefined}
                    onChange={(value) => onPhoneChange(index, "cellphone", value)}
                    onCountryChange={(country) => onPhoneCountryChange(index, "cellphone", country)}
                    className="w-full [&>input]:border-0 [&>input]:bg-transparent [&>input]:shadow-none [&>input]:focus-visible:ring-0 [&>input]:h-full [&>input]:pr-3 [&>input]:py-2 [&>input]:text-sm [&>input]:outline-none [&_button]:border-0 [&_button]:bg-transparent [&_button]:shadow-none [&_button]:px-2 [&_button]:focus-visible:ring-0 [&_.PhoneInputCountryIcon]:hidden [&_.PhoneInputCountrySelect]:hidden"
                    countrySelectComponent={CountrySelect}
                  />
                </div>
              </InputGroup>
            </div>
          </div>

          {/* RG e Expedida em */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nacionalidade */}
            <div>
              <label
                htmlFor={`nationality-${index}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nacionalidade <span className="text-red-500">*</span>
              </label>
              <NationalitySelect
                value={owner.nationality}
                onChange={(value) => onSelectChange(index, "nationality", value)}
              />
            </div>

            <div>
              <label
                htmlFor={`rg-${index}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                RG <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                id={`rg-${index}`}
                name="rg"
                value={owner.rg}
                onChange={(e) => onRgChange(index, e)}
                required
                placeholder="00.000.000-0"
                maxLength={20}
              />
            </div>

            {/* CPF */}
            <div>
              <label
                htmlFor={`cpf-${index}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                CPF <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                id={`cpf-${index}`}
                name="cpf"
                value={owner.cpf}
                onChange={(e) => onCpfChange(index, e)}
                required
                className={owner.cpfError ? "border-red-500 focus-visible:ring-red-500" : ""}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              {owner.cpfError && (
                <p className="text-xs text-red-500 mt-1">{owner.cpfError}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Profissão */}
            <div>
              <label
                htmlFor={`profession-${index}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Profissão <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                id={`profession-${index}`}
                name="profession"
                value={owner.profession}
                onChange={(e) => onChange(index, e)}
                required
                placeholder="Ex: Engenheiro, Advogado, etc."
              />
            </div>

            {/* Estado Civil */}
            <div>
              <label
                htmlFor={`marital_status-${index}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Estado Civil <span className="text-red-500">*</span>
              </label>
              <Select
                value={owner.marital_status}
                onValueChange={(value) => onSelectChange(index, "marital_status", value)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o estado civil" />
                </SelectTrigger>
                <SelectContent>
                  {MARITAL_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

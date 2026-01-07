
import React from "react";
import { FaPlus, FaSpinner, FaTimes } from "react-icons/fa";
import { Client, Agent } from "@/app/lib/types/database";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PropertyFormData, LegalData, KeysData } from "../types";
import { PROPERTY_TYPES, SELLING_STATUSES } from "../constants";

interface BasicInfoStepProps {
  formData: PropertyFormData;
  setFormData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSelectChange: (name: string, value: string | number) => void;
  handlePriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // Owner & Agent
  clients: Client[];
  agents: Agent[];
  selectedOwnerId: string;
  setSelectedOwnerId: (id: string) => void;
  selectedAgentId: string;
  setSelectedAgentId: (id: string) => void;

  // Add Owner
  ownerSheetOpen: boolean;
  setOwnerSheetOpen: (open: boolean) => void;
  newOwnerData: { name: string; email: string; phone: string; whatsapp: string; notes: string };
  setNewOwnerData: React.Dispatch<React.SetStateAction<{ name: string; email: string; phone: string; whatsapp: string; notes: string }>>;
  creatingOwner: boolean;
  handleAddOwner: () => void;

  // Legal & Keys
  legalData: LegalData;
  setLegalData: React.Dispatch<React.SetStateAction<LegalData>>;
  keysData: KeysData;
  setKeysData: React.Dispatch<React.SetStateAction<KeysData>>;
  handleUsageTypeChange: (newUsageType: "RESIDENTIAL" | "COMMERCIAL") => void;
}

export function BasicInfoStep({
  formData,
  setFormData,
  handleChange,
  handleSelectChange,
  handlePriceChange,
  clients,
  agents,
  selectedOwnerId,
  setSelectedOwnerId,
  selectedAgentId,
  setSelectedAgentId,
  ownerSheetOpen,
  setOwnerSheetOpen,
  newOwnerData,
  setNewOwnerData,
  creatingOwner,
  handleAddOwner,
  legalData,
  setLegalData,
  keysData,
  setKeysData,
  handleUsageTypeChange
}: BasicInfoStepProps) {

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-12">
        {/* Code & Type */}
        <div className="sm:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Finalidade</label>
          <Select
            value={formData.usage_type}
            onValueChange={(val) => handleUsageTypeChange(val as "RESIDENTIAL" | "COMMERCIAL")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RESIDENTIAL">Residencial</SelectItem>
              <SelectItem value="COMMERCIAL">Comercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <Combobox
            options={PROPERTY_TYPES}
            value={formData.type}
            onChange={(val) => handleSelectChange("type", val)}
            placeholder="Selecione o tipo..."
          />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Código</label>
          <Input type="text" name="code" id="code"
            value={formData.code}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
              handleChange(e);
            }}
            placeholder="Gerado automaticamente"
          />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <Combobox
            options={SELLING_STATUSES}
            value={formData.status}
            onChange={(val) => handleSelectChange("status", val)}
            placeholder="Selecione o status..."
          />
        </div>

        {/* Owner & Agent */}
        <div className="sm:col-span-3">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="owner" className="block text-sm font-medium text-gray-700">Proprietário</label>
            <Sheet open={ownerSheetOpen} onOpenChange={setOwnerSheetOpen}>
              <SheetTrigger asChild>
                <div
                  className="flex items-center text-primary hover:text-primary/80 cursor-pointer whitespace-nowrap"
                  onClick={(e) => {
                    e.preventDefault();
                    setOwnerSheetOpen(true);
                  }}
                >
                  <FaPlus className="mr-1 h-2 w-2" />
                  <span className="text-xs font-medium">Adicionar</span>
                </div>
              </SheetTrigger>
              <SheetContent className="sm:max-w-[500px]">
                <SheetHeader>
                  <SheetTitle>Adicionar Novo Proprietário</SheetTitle>
                  <SheetDescription>
                    Preencha os dados abaixo para cadastrar um novo cliente.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 py-4 mt-4">
                  <div>
                    <label htmlFor="new-owner-name" className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <Input id="new-owner-name" value={newOwnerData.name} onChange={(e) => setNewOwnerData({ ...newOwnerData, name: e.target.value })} placeholder="Nome completo" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="new-owner-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <Input id="new-owner-email" type="email" value={newOwnerData.email} onChange={(e) => setNewOwnerData({ ...newOwnerData, email: e.target.value })} placeholder="email@exemplo.com" />
                    </div>
                    <div>
                      <label htmlFor="new-owner-phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <Input id="new-owner-phone" value={newOwnerData.phone} onChange={(e) => setNewOwnerData({ ...newOwnerData, phone: e.target.value })} placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="new-owner-whatsapp" className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                    <Input id="new-owner-whatsapp" value={newOwnerData.whatsapp} onChange={(e) => setNewOwnerData({ ...newOwnerData, whatsapp: e.target.value })} placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <label htmlFor="new-owner-notes" className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                    <Textarea id="new-owner-notes" value={newOwnerData.notes} onChange={(e) => setNewOwnerData({ ...newOwnerData, notes: e.target.value })} placeholder="Observações adicionais..." />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleAddOwner} disabled={!newOwnerData.name || creatingOwner}>
                      {creatingOwner ? <><FaSpinner className="animate-spin mr-2" /> Salvando...</> : "Salvar Cliente"}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <Combobox
            options={clients.map(c => ({ value: c.id, label: c.name }))}
            value={selectedOwnerId}
            onChange={(val) => setSelectedOwnerId(val)}
            placeholder="Buscar proprietário..."
          />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="agent" className="block text-sm font-medium text-gray-700 mb-1">Captador</label>
          <Combobox
            options={agents.map(a => ({ value: a.id, label: a.name || a.email || "Sem nome" }))}
            value={selectedAgentId}
            onChange={(val) => setSelectedAgentId(val)}
            placeholder="Buscar captador..."
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Valores</h3>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700 mb-1">Preço de Venda</label>
            <Input type="text" name="sale_price" id="sale_price"
              value={formData.sale_price} onChange={handlePriceChange}
              placeholder="R$ 0,00"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="condominium_fee" className="block text-sm font-medium text-gray-700 mb-1">Condomínio</label>
            <Input type="text" name="condominium_fee" id="condominium_fee"
              value={formData.condominium_fee} onChange={handlePriceChange}
              placeholder="R$ 0,00"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="iptu_number" className="block text-sm font-medium text-gray-700 mb-1">Número IPTU</label>
            <Input type="text" name="iptu_number" id="iptu_number"
              value={formData.iptu_number} onChange={handleChange}
              placeholder="000.000.000-0"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="property_tax" className="block text-sm font-medium text-gray-700 mb-1">IPTU</label>
            <div className="flex">
              <div className="flex-1">
                <Input type="text" name="property_tax" id="property_tax"
                  value={formData.property_tax} onChange={handlePriceChange}
                  placeholder="R$ 0,00" className="rounded-r-none border-r-0"
                />
              </div>
              <div className="w-24">
                <Select
                  value={formData.property_tax_period}
                  onValueChange={(val) => handleSelectChange("property_tax_period", val)}
                >
                  <SelectTrigger className="w-full rounded-l-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">Anual</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Jurídico e Chaves</h3>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-12">

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Autorização</label>
            <Select
              value={legalData.authorization_status || "none"}
              onValueChange={(val) => setLegalData({ ...legalData, authorization_status: val })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="written_exclusive">Autorização escrita c/ exclusividade</SelectItem>
                <SelectItem value="written_non_exclusive">Autorização escrita s/ exclusividade</SelectItem>
                <SelectItem value="verbal">Autorização verbal</SelectItem>
                <SelectItem value="none">Sem autorização</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Destaque</label>
            <Select
              value={"no"}
              onValueChange={(val) => setLegalData({ ...legalData, authorization_status: val })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Sim</SelectItem>
                <SelectItem value="no">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="matricula" className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
            <Input type="text" name="matricula" id="matricula"
              value={legalData.matricula || ""} onChange={handleChange} // Parent handleChange handles logic for legalData keys
              placeholder=""
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="incorporation_registry" className="block text-sm font-medium text-gray-700 mb-1">Registro de Incorporação</label>
            <Input type="text" name="incorporation_registry" id="incorporation_registry"
              value={legalData.incorporation_registry || ""} onChange={handleChange}
              placeholder=""
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="key_location" className="block text-sm font-medium text-gray-700 mb-1">Localização das Chaves</label>
            <Input type="text" name="key_location" id="key_location"
              value={keysData.key_location || ""} onChange={handleChange}
              placeholder="Portaria, proprietário..."
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="key_code" className="block text-sm font-medium text-gray-700 mb-1">Código da Chave</label>
            <Input type="text" name="key_code" id="key_code"
              value={keysData.key_code || ""} onChange={handleChange}
              placeholder=""
            />
          </div>
        </div>
      </div>
    </div >
  );
}

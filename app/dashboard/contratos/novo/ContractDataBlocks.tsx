"use client";

import { SaleProcess } from "@/app/lib/types/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { formatCurrency } from "./formatters";
import {
  FaUser,
  FaHome,
  FaMoneyBillWave,
  FaFileContract,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBuilding,
  FaCouch
} from "react-icons/fa";
import { MOCK_PROPERTY_ITEMS } from "./mock-sale-data";

interface ContractDataBlocksProps {
  sale: SaleProcess;
}

function DraggableField({ value, children }: { value: string | number | undefined | null, children: React.ReactNode }) {
  if (!value) return <>{children}</>;

  const stringValue = String(value);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", stringValue);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab active:cursor-grabbing hover:bg-secondary/80 bg-secondary/30 p-2 rounded-md transition-all border border-border hover:border-primary/50 group relative flex items-center gap-2"
      title="Segure e arraste para adicionar ao contrato"
    >
      <div className="text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0">
        <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 2.5C5.5 2.22386 5.27614 2 5 2C4.72386 2 4.5 2.22386 4.5 2.5V12.5C4.5 12.7761 4.72386 13 5 13C5.27614 13 5.5 12.7761 5.5 12.5V2.5ZM9.5 2.5C9.5 2.22386 9.27614 2 9 2C8.72386 2 8.5 2.22386 8.5 2.5V12.5C8.5 12.7761 8.72386 13 9 13C9.27614 13 9.5 12.7761 9.5 12.5V2.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
      </div>
      <div className="flex-1 min-w-0 break-words">
        {children}
      </div>
    </div>
  );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContractDataBlocks({ sale }: ContractDataBlocksProps) {
  const property = sale.property;
  const buyer = sale.buyer;
  const seller = sale.seller;
  const offer = sale.offer;
  const owners = property?.real_estate_owners?.map(o => o.client) || (seller ? [seller] : []);
  const agents = property?.real_estate_agents || [];

  const renderClientFields = (client: any, prefix: string) => (
    <div className="space-y-4 mb-6 border-b pb-4 last:border-0 relative">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
          <FaUser className="w-3 h-3" /> {client.name}
        </h4>
        <span className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded">{prefix}</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Dados Básicos */}
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <span className="text-gray-500 text-xs">Nome Completo:</span>
            <DraggableField value={client.name}>
              <p className="font-medium text-gray-900 text-sm">{client.name}</p>
            </DraggableField>
          </div>

          <div>
            <span className="text-gray-500 text-xs">Nacionalidade:</span>
            <DraggableField value={client.nationality}>
              <p className="font-medium text-gray-900 text-sm">{client.nationality || "-"}</p>
            </DraggableField>
          </div>

          <div>
            <span className="text-gray-500 text-xs">Profissão:</span>
            <DraggableField value={client.profession}>
              <p className="font-medium text-gray-900 text-sm">{client.profession || "-"}</p>
            </DraggableField>
          </div>
        </div>

        {/* Estado Civil e União Estável */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-gray-500 text-xs">Estado Civil:</span>
            <DraggableField value={client.marital_status}>
              <p className="font-medium text-gray-900 text-sm">{client.marital_status || "-"}</p>
            </DraggableField>
          </div>
          <div>
            <span className="text-gray-500 text-xs">União Estável:</span>
            <DraggableField value={client.union_stable ? "Sim" : "Não"}>
              <p className="font-medium text-gray-900 text-sm">{client.union_stable ? "Sim" : "Não"}</p>
            </DraggableField>
          </div>
        </div>

        {/* Documentos */}
        <div className="space-y-2 bg-slate-50 p-2 rounded border border-slate-100">
          <p className="text-xs font-semibold text-gray-500 mb-1">Documentos:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-500 text-xs">CPF:</span>
              <DraggableField value={client.cpf}>
                <p className="font-medium text-gray-900 text-sm">{client.cpf || "-"}</p>
              </DraggableField>
            </div>
            <div>
              <span className="text-gray-500 text-xs">RG/Identidade:</span>
              <DraggableField value={`${client.rg} ${client.rg_issuer ? `- ${client.rg_issuer}` : ""}`}>
                <p className="font-medium text-gray-900 text-sm">
                  {client.rg || "-"}
                  {client.rg_issuer && <span className="text-xs text-gray-500 ml-1">({client.rg_issuer})</span>}
                </p>
              </DraggableField>
              {client.rg_issue_date && (
                <DraggableField value={client.rg_issue_date}>
                  <p className="text-[10px] text-gray-400">Exp: {client.rg_issue_date}</p>
                </DraggableField>
              )}
            </div>
          </div>
        </div>

        {/* Filiação */}
        <div className="space-y-1">
          <span className="text-gray-500 text-xs">Filiação:</span>
          <div className="grid grid-cols-1 gap-1 pl-2 border-l-2 border-slate-200">
            <DraggableField value={client.father_name}>
              <p className="text-sm text-gray-800"><span className="text-xs text-gray-400 w-8 inline-block">Pai:</span> {client.father_name || "-"}</p>
            </DraggableField>
            <DraggableField value={client.mother_name}>
              <p className="text-sm text-gray-800"><span className="text-xs text-gray-400 w-8 inline-block">Mãe:</span> {client.mother_name || "-"}</p>
            </DraggableField>
          </div>
        </div>

        {/* Contato e Endereço */}
        <div>
          <span className="text-gray-500 text-xs">Email:</span>
          <DraggableField value={client.email}>
            <p className="font-medium text-gray-900 text-sm truncate">{client.email || "-"}</p>
          </DraggableField>
        </div>

        <div>
          <span className="text-gray-500 text-xs">Endereço Completo:</span>
          <DraggableField value={`${client.address_street || ""}, ${client.address_number || ""}${client.address_complement ? ` ${client.address_complement}` : ""} - ${client.address_neighborhood || ""} - ${client.address_city || ""}/${client.address_state || ""} CEP ${client.address_zip || ""}`}>
            <p className="font-medium text-gray-900 text-xs wrap-break-word">
              {client.address_street}, {client.address_number}{client.address_complement ? ` ${client.address_complement}` : ""} - {client.address_neighborhood} - {client.address_city}/{client.address_state}
            </p>
          </DraggableField>
        </div>

        {/* Cônjuge - Se houver */}
        {(client.spouse_name || client.marital_status === 'Casado') && (
          <div className="mt-2 pt-2 border-t border-dashed border-gray-300">
            <h5 className="text-xs font-bold text-primary mb-2">Dados do Cônjuge:</h5>
            <div className="pl-2 border-l-2 border-primary/20 space-y-2">
              <div>
                <span className="text-gray-500 text-xs">Nome:</span>
                <DraggableField value={client.spouse_name}>
                  <p className="font-medium text-gray-900 text-sm">{client.spouse_name}</p>
                </DraggableField>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500 text-xs">Nacionalidade:</span>
                  <DraggableField value={client.spouse_nationality}>
                    <p className="text-sm text-gray-800">{client.spouse_nationality || "-"}</p>
                  </DraggableField>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Profissão:</span>
                  <DraggableField value={client.spouse_profession}>
                    <p className="text-sm text-gray-800">{client.spouse_profession || "-"}</p>
                  </DraggableField>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500 text-xs">CPF:</span>
                  <DraggableField value={client.spouse_cpf}>
                    <p className="text-sm text-gray-800">{client.spouse_cpf || "-"}</p>
                  </DraggableField>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">RG:</span>
                  <DraggableField value={client.spouse_rg}>
                    <p className="text-sm text-gray-800">{client.spouse_rg || "-"}</p>
                  </DraggableField>
                </div>
              </div>

              {/* Filiação Cônjuge */}
              <div className="space-y-1">
                <span className="text-gray-500 text-xs">Filiação (Cônjuge):</span>
                <div className="grid grid-cols-1 gap-1 pl-2 border-l border-slate-200">
                  <DraggableField value={client.spouse_father_name}>
                    <p className="text-xs text-gray-700">Pai: {client.spouse_father_name || "-"}</p>
                  </DraggableField>
                  <DraggableField value={client.spouse_mother_name}>
                    <p className="text-xs text-gray-700">Mãe: {client.spouse_mother_name || "-"}</p>
                  </DraggableField>
                </div>
              </div>

              <div>
                <span className="text-gray-500 text-xs">Email:</span>
                <DraggableField value={client.spouse_email}>
                  <p className="text-sm text-gray-800 truncate">{client.spouse_email || "-"}</p>
                </DraggableField>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="vendedores" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="vendedores" className="text-xs px-1">Vend.</TabsTrigger>
          <TabsTrigger value="compradores" className="text-xs px-1">Comp.</TabsTrigger>
          <TabsTrigger value="imovel" className="text-xs px-1">Imóvel</TabsTrigger>
          <TabsTrigger value="transacao" className="text-xs px-1">Trans.</TabsTrigger>
          <TabsTrigger value="corretores" className="text-xs px-1">Corr.</TabsTrigger>
        </TabsList>

        <div className="overflow-y-auto pr-2 max-h-[calc(100vh-200px)] space-y-4">
          <TabsContent value="vendedores" className="mt-0">
            <Card>
              <CardContent className="pt-4">
                {owners.map((owner, idx) => (
                  <div key={owner.id || idx}>
                    {renderClientFields(owner, "vendedor")}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compradores" className="mt-0">
            <Card>
              <CardContent className="pt-4">
                {buyer && renderClientFields(buyer, "comprador")}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="imovel" className="mt-0">
            {property && (
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="border-b pb-2 mb-2">
                    <h5 className="text-xs font-bold text-primary mb-2 flex items-center gap-1"><FaBuilding className="w-3 h-3" /> Identificação</h5>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-500 text-xs">Tipo:</span>
                        <DraggableField value={property.type}>
                          <p className="font-medium text-gray-900 text-sm capitalize">{property.type}</p>
                        </DraggableField>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Endereço Completo:</span>
                        <DraggableField value={`${property.address_street}, ${property.address_number}${property.address_complement ? ` ${property.address_complement}` : ""} - ${property.address_neighborhood}, ${property.address_city}/${property.address_state} - CEP: ${property.address_zip}`}>
                          <p className="font-medium text-gray-900 text-sm wrap-break-word">
                            {property.address_street}, {property.address_number}
                            {property.address_complement && ` ${property.address_complement}`}
                            <br />
                            {property.address_neighborhood}, {property.address_city}/{property.address_state}
                            <br />
                            CEP: {property.address_zip}
                          </p>
                        </DraggableField>
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-2 mb-2">
                    <h5 className="text-xs font-bold text-primary mb-2 flex items-center gap-1"><FaFileContract className="w-3 h-3" /> Dados Registrais</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500 text-xs">Matrícula:</span>
                        <DraggableField value={property.property_legal_details?.matricula}>
                          <p className="font-medium text-gray-900 text-sm">{property.property_legal_details?.matricula || "-"}</p>
                        </DraggableField>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Insc. Fiscal (IPTU):</span>
                        <DraggableField value={property.iptu_number || property.property_legal_details?.incorporation_registry}>
                          <p className="font-medium text-gray-900 text-sm">{property.iptu_number || "-"}</p>
                        </DraggableField>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500 text-xs">Cartório de Registro:</span>
                        <DraggableField value="9º Ofício de Registro de Imóveis da Capital/RJ">
                          <p className="font-medium text-gray-900 text-sm">9º Ofício de Registro de Imóveis da Capital/RJ</p>
                        </DraggableField>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 text-xs">Aquisição Anterior:</span>
                      <DraggableField value={property.property_legal_details?.acquisition_origin}>
                        <p className="font-medium text-gray-900 text-sm">{property.property_legal_details?.acquisition_origin || "-"}</p>
                      </DraggableField>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-primary mb-2 flex items-center gap-1"><FaCouch className="w-3 h-3" /> Características e Bens</h5>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <span className="text-gray-500 text-xs">Vagas de Garagem:</span>
                        <DraggableField value={property.parking_spaces}>
                          <p className="font-medium text-gray-900 text-sm">{property.parking_spaces || 0}</p>
                        </DraggableField>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Área Útil:</span>
                        <DraggableField value={`${property.usable_area}m²`}>
                          <p className="font-medium text-gray-900 text-sm">{property.usable_area}m²</p>
                        </DraggableField>
                      </div>
                    </div>

                    {/* Lista de Bens Móveis */}
                    <div className="space-y-1 bg-slate-50 p-2 rounded">
                      <span className="text-gray-500 text-xs block mb-1">Bens Móveis Incluídos:</span>
                      <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                        {MOCK_PROPERTY_ITEMS.map((item, idx) => (
                          <DraggableField key={item.id} value={item.description}>
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                              <p className="text-xs text-gray-700">{item.description}</p>
                            </div>
                          </DraggableField>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="transacao" className="mt-0">
            {offer && (
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="border-b pb-2 mb-2">
                    <h5 className="text-xs font-bold text-primary mb-2 flex items-center gap-1"><FaMoneyBillWave className="w-3 h-3" /> Valores e Condições</h5>

                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-500 text-xs">Valor Total da Venda:</span>
                        <DraggableField value={formatCurrency(offer.offer_amount)}>
                          <p className="font-bold text-lg text-primary">
                            {formatCurrency(offer.offer_amount)}
                          </p>
                        </DraggableField>
                      </div>

                      {offer.down_payment && (
                        <div>
                          <span className="text-gray-500 text-xs">Valor do Sinal (Entrada):</span>
                          <DraggableField value={formatCurrency(offer.down_payment)}>
                            <p className="font-medium text-gray-900 text-sm">
                              {formatCurrency(offer.down_payment)}
                            </p>
                          </DraggableField>
                        </div>
                      )}

                      {offer.financing_amount && (
                        <div>
                          <span className="text-gray-500 text-xs">Valor Financiado/Saldo:</span>
                          <DraggableField value={formatCurrency(offer.financing_amount)}>
                            <p className="font-medium text-gray-900 text-sm">
                              {formatCurrency(offer.financing_amount)}
                            </p>
                          </DraggableField>
                        </div>
                      )}

                      <div>
                        <span className="text-gray-500 text-xs">Forma de Pagamento:</span>
                        <DraggableField value={offer.payment_type === "cash" ? "À vista" : offer.payment_type === "financing" ? "Financiamento" : "Misto"}>
                          <p className="font-medium text-gray-900 text-sm capitalize">
                            {offer.payment_type === "cash" ? "À vista" : offer.payment_type === "financing" ? "Financiamento" : "Misto"}
                          </p>
                        </DraggableField>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-primary mb-2 flex items-center gap-1"><FaBuilding className="w-3 h-3" /> Dados Bancários</h5>
                    <div className="space-y-4">
                      {owners.filter(o => o.bank_accounts && o.bank_accounts.length > 0).length > 0 ? (
                        owners.map((owner, idx) => (
                          owner.bank_accounts && owner.bank_accounts.length > 0 && (
                            <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-100">
                              <p className="text-xs font-semibold text-gray-700 mb-2">{owner.name}</p>
                              {owner.bank_accounts.map((acc, aIdx) => (
                                <div key={aIdx} className="space-y-2">
                                  <div>
                                    <span className="text-gray-500 text-xs">Conta:</span>
                                    <DraggableField value={`${acc.bank_name}, Ag. ${acc.agency}, ${acc.account_type || "CC"} ${acc.account_number}, Fav: ${acc.holder_name}`}>
                                      <p className="text-sm font-medium text-gray-800">{acc.bank_name}</p>
                                      <p className="text-sm text-gray-800">Ag. {acc.agency} | {acc.account_type || "CC"}: {acc.account_number}</p>
                                      <p className="text-xs text-gray-500">Fav: {acc.holder_name}</p>
                                    </DraggableField>
                                  </div>
                                  {acc.pix_key && (
                                    <div>
                                      <span className="text-gray-500 text-xs">Chave PIX:</span>
                                      <DraggableField value={`${acc.pix_key_type || "PIX"}: ${acc.pix_key}`}>
                                        <p className="text-sm font-medium text-gray-800">{acc.pix_key_type || "PIX"}: {acc.pix_key}</p>
                                      </DraggableField>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">Nenhuma conta bancária disponível.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="corretores" className="mt-0">
            <Card>
              <CardContent className="pt-4 space-y-4">
                {agents.length > 0 ? agents.map((agentRel, idx) => (
                  <div key={idx} className="border-b pb-4 last:border-0">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded mb-2 inline-block">{agentRel.agent_role}</span>

                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-500 text-xs">{agentRel.agent.is_company ? "Razão Social:" : "Nome:"}</span>
                        <DraggableField value={agentRel.agent.company_name || agentRel.agent.full_name || agentRel.agent.name}>
                          <p className="font-medium text-gray-900 text-sm">{agentRel.agent.company_name || agentRel.agent.full_name || agentRel.agent.name}</p>
                        </DraggableField>
                      </div>

                      {agentRel.agent.is_company && agentRel.agent.full_name && (
                        <div>
                          <span className="text-gray-500 text-xs">Representante:</span>
                          <DraggableField value={agentRel.agent.full_name}>
                            <p className="font-medium text-gray-900 text-sm">{agentRel.agent.full_name}</p>
                          </DraggableField>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-500 text-xs">CRECI:</span>
                          <DraggableField value={agentRel.agent.creci || agentRel.agent.phone}>
                            <p className="font-medium text-gray-900 text-sm">{agentRel.agent.creci || agentRel.agent.phone}</p>
                          </DraggableField>
                        </div>
                        {agentRel.agent.cnpj && (
                          <div>
                            <span className="text-gray-500 text-xs">CNPJ:</span>
                            <DraggableField value={agentRel.agent.cnpj}>
                              <p className="font-medium text-gray-900 text-sm">{agentRel.agent.cnpj}</p>
                            </DraggableField>
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-gray-500 text-xs">Email:</span>
                        <DraggableField value={agentRel.agent.email}>
                          <p className="font-medium text-gray-900 text-sm truncate">{agentRel.agent.email}</p>
                        </DraggableField>
                      </div>

                      {agentRel.agent.address_full && (
                        <div>
                          <span className="text-gray-500 text-xs">Endereço:</span>
                          <DraggableField value={agentRel.agent.address_full}>
                            <p className="font-medium text-gray-900 text-xs text-wrap break-words">{agentRel.agent.address_full}</p>
                          </DraggableField>
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-sm">Nenhum corretor associado.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div >
      </Tabs >
    </div >
  );
}



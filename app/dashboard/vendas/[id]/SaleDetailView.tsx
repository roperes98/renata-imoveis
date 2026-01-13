
"use client";

import { useState, useTransition } from "react";
import { SaleProcess, SaleStepChecklistItem, SaleStepStatus } from "@/app/lib/types/sales";
import { useUserRole, UserRole } from "@/app/context/UserRoleContext";
import Link from "next/link";
import {
  FaChevronLeft, FaCheck, FaClock, FaFileAlt, FaPaperclip,
  FaComment, FaBuilding, FaUser, FaMoneyBillWave, FaCloudUploadAlt, FaExternalLinkAlt, FaForward, FaBan, FaSpinner, FaCircle
} from "react-icons/fa";
import { uploadChecklistDocument, toggleChecklistItem, completeStep, skipStep } from "@/app/lib/sales-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast-context";
import RGITracker from "./RGITracker";

interface SaleDetailViewProps {
  sale: SaleProcess;
}

export default function SaleDetailView({ sale }: SaleDetailViewProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(sale.current_step_index);
  const [isPending, startTransition] = useTransition();
  const [uploadingItems, setUploadingItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { role } = useUserRole();

  // Safe guard if index is out of bounds or steps changed
  const safeIndex = activeStepIndex >= 0 && activeStepIndex < sale.steps.length ? activeStepIndex : 0;
  const activeStep = sale.steps[safeIndex];

  // Helper to check if step can be completed
  const canCompleteStep = activeStep.checklist?.every(item =>
    (!item.required) || (item.status === 'approved' || item.status === 'uploaded')
  );

  const handleFileUpload = (checklistId: string, file: File) => {
    if (!file) return;

    // Validate file size (5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O arquivo excede o limite máximo de 5MB.",
      });
      return;
    }

    // Track uploading state locally for the specific item
    setUploadingItems(prev => new Set(prev).add(checklistId));

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      await uploadChecklistDocument(sale.id, activeStep.id, checklistId, formData);
      setUploadingItems(prev => {
        const next = new Set(prev);
        next.delete(checklistId);
        return next;
      });
    });
  };

  const handleToggle = (checklistId: string, checked: boolean) => {
    startTransition(async () => {
      await toggleChecklistItem(sale.id, activeStep.id, checklistId, checked);
    });
  };

  const handleCompleteStep = () => {
    startTransition(async () => {
      await completeStep(sale.id, activeStep.id);
      if (activeStepIndex < sale.steps.length - 1) {
        setActiveStepIndex(prev => prev + 1);
      }
    });
  };

  const handleSkipStep = () => {
    startTransition(async () => {
      await skipStep(sale.id, activeStep.id);
      if (activeStepIndex < sale.steps.length - 1) {
        setActiveStepIndex(prev => prev + 1);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/vendas"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <FaChevronLeft />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Processo de Venda {sale.property?.code}</h1>
          <p className="text-sm text-gray-500">Iniciado em {new Date(sale.created_at).toLocaleDateString()}</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Em Andamento
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Timeline & Property Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[24px] border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-6">Etapas do Processo</h3>

            {/* Timeline Implementation */}
            <div className="flex flex-col relative">
              {sale.steps.map((step, index) => {
                const isCompleted = index < sale.current_step_index;
                const isCurrent = index === sale.current_step_index;
                const isActiveView = index === safeIndex;
                const isSkipped = step.status === 'skipped';
                const isLast = index === sale.steps.length - 1;

                // Incoming line status depends on previous step
                const prevStep = index > 0 ? sale.steps[index - 1] : null;
                const isPrevCompleted = prevStep ? ((index - 1) < sale.current_step_index) : false;
                const isPrevSkipped = prevStep?.status === 'skipped';

                return (
                  <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                    {/* Incoming Line (from top to center) - connects from previous item */}
                    {index > 0 && (
                      <div
                        className={`absolute left-[15px] top-0 h-4 w-0.5 z-0 transition-colors duration-300
                                ${isPrevCompleted ? "bg-[#960000]" : "bg-gray-100"}
                            `}
                      />
                    )}

                    {/* Outgoing Line (from center to bottom) - connects to next item */}
                    {!isLast && (
                      <div
                        className={`absolute left-[15px] top-4 bottom-0 w-0.5 z-0 transition-colors duration-300
                            ${isCompleted ? "bg-[#960000]" : "bg-gray-100"}
                        `}
                      />
                    )}

                    <button
                      onClick={() => setActiveStepIndex(index)}
                      className={`group flex items-start gap-4 w-full text-left relative z-10`}
                    >
                      <div className={`
                                    relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
                                    ${isSkipped ? "bg-gray-100 border-2 border-gray-300 text-gray-400" :
                          isCompleted ? "" : // Transparent for completed (show line)
                            isCurrent ? "bg-white border-2 border-[#960000] text-[#960000]" :
                              "bg-white border-2 border-gray-200 text-gray-300"}
                                `}>
                        {isSkipped ? <FaBan size={10} /> :
                          isCompleted ? <div className="w-3 h-3 bg-[#960000] rounded-full shadow-sm" /> : // Small branded dot
                            isCurrent ? <div className="w-2 h-2 rounded-full bg-[#960000]" /> : // Dot inside ring
                              <div className="w-2 h-2 rounded-full bg-gray-200" />}
                      </div>
                      <div className={`pt-1 transition-opacity duration-300 ${isActiveView ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}>
                        <p className={`text-sm font-semibold transition-colors ${isActiveView ? "text-[#960000]" : "text-gray-900"} ${isSkipped ? "line-through text-gray-400" : ""}`}>
                          {step.name}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">{step.description}</p>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Property Info Card */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-200">
            <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Informações do Imóvel</h4>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                <FaBuilding size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-900">{sale.property?.address_street}, {sale.property?.address_number}</p>
                <p className="text-sm text-gray-500">{sale.property?.address_neighborhood} - {sale.property?.address_city}</p>
                <p className="text-xs text-gray-400 mt-1">{sale.property?.code}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-gray-200">
            <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Valores</h4>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-50 rounded-lg text-green-600">
                <FaMoneyBillWave size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.offer?.offer_amount || 0)}
                </p>
                <p className="text-sm text-gray-500">
                  Forma de Pagamento: {
                    sale.offer?.payment_type === 'cash' ? 'À Vista' :
                      sale.offer?.payment_type === 'financing' ? 'Financiamento' :
                        sale.offer?.payment_type === 'mixed' ? 'Misto (Entrada + Financiamento)' :
                          sale.offer?.payment_type === 'rent_to_own' ? 'Aluguel com Opção de Compra' :
                            'Outro'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Step Detail + Action Area */}
        <div className="lg:col-span-2 space-y-6">

          {/* Step Detail Card */}
          <div className="bg-white p-8 rounded-[24px] border border-gray-200 shadow-sm transition-all text-left">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-1 block">
                  Detalhes da Etapa {safeIndex + 1}
                </span>
                <h2 className="text-2xl font-bold text-gray-900">{activeStep.name}</h2>
              </div>
              <div className="flex items-center gap-3">
                {/* Skip Button for Optional Steps */}
                {activeStep.optional && activeStep.status !== 'completed' && activeStep.status !== 'skipped' && (
                  <button
                    onClick={handleSkipStep}
                    disabled={isPending}
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    {isPending ? <FaSpinner className="animate-spin" /> : <FaForward />} Pular Etapa
                  </button>
                )}

                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2
                            ${activeStep.status === 'completed' ? 'bg-green-100 text-green-700' :
                    activeStep.status === 'skipped' ? 'bg-gray-100 text-gray-500' :
                      activeStep.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}
                        `}>
                  {activeStep.status === 'completed' ? 'Concluída' :
                    activeStep.status === 'skipped' ? 'Pulada' :
                      activeStep.status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              {activeStep.description}
            </p>

            {/* Conditional Action Area */}
            {activeStep.status === 'skipped' ? (
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 text-center">
                <FaBan className="mx-auto text-gray-300 text-4xl mb-3" />
                <p className="text-gray-500">Esta etapa foi pulada e não é necessária para este processo.</p>
              </div>
            ) : activeStep.actionType === 'upload' ? (
              activeStep.id === 'documentation' ? (
                // Tabbed Interface for Due Diligence
                <DocumentationTabsShadcn
                  checklist={activeStep.checklist || []}
                  uploadingItems={uploadingItems}
                  isPending={isPending}
                  onUpload={handleFileUpload}
                  onToggle={handleToggle}
                  userRole={role}
                />
              ) : activeStep.id === 'financing' ? (
                // Tabbed Interface for Financing
                <FinancingTabsShadcn
                  checklist={activeStep.checklist || []}
                  uploadingItems={uploadingItems}
                  isPending={isPending}
                  onUpload={handleFileUpload}
                  userRole={role}
                />
              ) : (
                // Standard Upload View for other steps
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 transition-all">
                  <h4 className="flex items-center gap-2 font-bold text-blue-900 mb-4">
                    <FaCloudUploadAlt className="text-blue-500" />
                    Documentação Necessária
                  </h4>
                  <div className="space-y-4">
                    {activeStep.checklist?.map((item) => (
                      <ChecklistItem
                        key={item.id}
                        item={item}
                        isUploading={uploadingItems.has(item.id)}
                        isPending={isPending}
                        onUpload={handleFileUpload}
                        readOnly={
                          role === 'parceiro' ||
                          ((item.id === 'itbi_paid' || item.id === 'laudemio_paid') && role !== 'admin' && role !== 'corretor')
                        }
                        canViewFile={role !== 'parceiro'}
                      />
                    ))}
                  </div>
                </div>
              )
            ) : activeStep.actionType === 'rgi_tracker' ? (
              <RGITracker step={activeStep} saleId={sale.id} />
            ) : activeStep.actionType === 'external' ? (
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                <h4 className="flex items-center gap-2 font-bold text-orange-900 mb-4">
                  <FaExternalLinkAlt className="text-orange-500" />
                  Procedimentos Externos
                </h4>
                <p className="text-sm text-orange-800 mb-4">
                  Esta etapa envolve processos externos (Cartório, Banco, etc). Marque os itens abaixo conforme forem concluídos.
                </p>
                <div className="space-y-3">
                  {activeStep.checklist?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-orange-100 transition-all hover:bg-white">
                      <input
                        type="checkbox"
                        disabled={isPending}
                        className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500 border-gray-300 cursor-pointer"
                        checked={item.status === 'approved'}
                        onChange={(e) => handleToggle(item.id, e.target.checked)}
                      />
                      <span className={`text-sm transition-all ${item.status === 'approved' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                  <FaCheck className="text-gray-400" />
                  Checklist Manual
                </h4>
                <div className="space-y-3">
                  {activeStep.checklist?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 transition-all hover:border-gray-300">
                      <input
                        type="checkbox"
                        disabled={isPending}
                        className="w-4 h-4 rounded text-[#960000] focus:ring-[#960000] cursor-pointer"
                        checked={item.status === 'approved'}
                        onChange={(e) => handleToggle(item.id, e.target.checked)}
                      />
                      <span className={`text-sm transition-all ${item.status === 'approved' ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mock Comments */}
            <div className="mt-8">
              <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                <FaComment className="text-gray-400" />
                Observações
              </h4>
              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#960000]/20 focus:border-[#960000] transition-all"
                rows={3}
                placeholder="Adicione uma observação sobre esta etapa..."
              ></textarea>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100">
              {/* Action Buttons */}
              {activeStep.status === 'in_progress' && (
                <div className="flex justify-end">
                  <button
                    onClick={handleCompleteStep}
                    disabled={!canCompleteStep || isPending}
                    className={`
                            px-6 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 flex items-center gap-2
                            ${!canCompleteStep || isPending ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#960000] hover:bg-[#7a0000] shadow-lg hover:shadow-xl'}
                        `}
                  >
                    {isPending ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                    Concluir Etapa
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component for Single Item
function ChecklistItem({ item, isUploading, isPending, onUpload, readOnly = false, canViewFile = true }: {
  item: SaleStepChecklistItem,
  isUploading: boolean,
  isPending: boolean,
  onUpload: (id: string, file: File) => void,
  readOnly?: boolean,
  canViewFile?: boolean
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (readOnly) return;
    if (item.status !== 'approved' && item.status !== 'uploaded' && !isPending && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (readOnly) return;

    if (item.status !== 'approved' && item.status !== 'uploaded' && !isPending && !isUploading) {
      const file = e.dataTransfer.files?.[0];
      if (file) {
        onUpload(item.id, file);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(item.id, file);
    }
  }

  return (
    <div
      key={item.id}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
            p-4 rounded-lg border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4
            ${isDragging
          ? 'bg-white border-[#960000] border-dashed'
          : 'bg-white border-blue-100'
        }
        `}
    >
      <div className="flex items-center gap-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${item.status === 'approved' || item.status === 'uploaded' ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-100 border-gray-300'}`}>
          {(item.status === 'approved' || item.status === 'uploaded') && <FaCheck size={10} />}
        </div>
        <div>
          <p className={`text-sm font-medium ${item.required ? 'text-gray-900' : 'text-gray-600'}`}>
            {item.label}
            {item.required && <span className="text-red-500 ml-1">*</span>}
          </p>
          {item.fileUrl ? (
            <div className="flex items-center gap-2 mt-1">
              {canViewFile ? (
                <a href={item.fileUrl} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <FaPaperclip size={10} /> Arquivo Enviado
                </a>
              ) : (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FaPaperclip size={10} /> Arquivo Enviado (Restrito)
                </span>
              )}
              {item.status === 'uploaded' && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 rounded-sm">Em análise</span>}
            </div>
          ) : (
            <p className={`text-xs mt-1 transition-colors ${isDragging ? 'text-[#960000] font-semibold' : 'text-blue-400'}`}>
              {item.status === 'approved' || item.status === 'uploaded'
                ? 'Documento enviado'
                : readOnly
                  ? 'Aguardando envio'
                  : isDragging
                    ? 'Solte o arquivo aqui'
                    : 'Pendente de envio'}
            </p>
          )}
        </div>
      </div>

      {item.status !== 'approved' && item.status !== 'uploaded' && !readOnly && (
        <div className="relative overflow-hidden">
          <input
            type="file"
            id={`file-${item.id}`}
            className="hidden"
            onChange={handleInputChange}
            disabled={isPending || isUploading}
          />
          <label
            htmlFor={`file-${item.id}`}
            className={`
                      cursor-pointer px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors shrink-0 flex items-center gap-2
                      ${(isPending || isUploading) ? "opacity-50 pointer-events-none" : ""}
                  `}
          >
            {isUploading ? <FaSpinner className="animate-spin" /> : <FaCloudUploadAlt />}
            Enviar Arquivo
          </label>
        </div>
      )}
    </div>
  )
}

// Documentation Tabs Component
function DocumentationTabs({ checklist, uploadingItems, isPending, onUpload, onToggle }: {
  checklist: SaleStepChecklistItem[],
  uploadingItems: Set<string>,
  isPending: boolean,
  onUpload: (id: string, file: File) => void,
  onToggle: (id: string, checked: boolean) => void
}) {
  const [activeTab, setActiveTab] = useState<'property' | 'seller' | 'buyer'>('property');

  const categories: Record<string, 'property' | 'seller' | 'buyer'> = {
    // Property
    "cert_rgi": "property",
    "cert_iptu": "property",
    "cert_condo": "property",
    "cert_funesbom": "property",
    "cert_fiscal_imovel": "property",

    // Seller
    "cert_fiscal_vendedores": "seller",
    "cert_interdicao_1": "seller",
    "cert_interdicao_2": "seller",
    "cert_distribuidor_civil": "seller",
    "cert_trabalhista": "seller",
    "cert_receita": "seller",
    "cert_justica": "seller",
    "cert_fiscal_fazendaria": "seller",
    "docs_seller": "seller",

    // Buyer
    "docs_buyer": "buyer"
  };

  const filteredItems = checklist.filter(item => {
    const category = categories[item.id] || 'property';
    return category === activeTab;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        <button
          onClick={() => setActiveTab('property')}
          className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors
            ${activeTab === 'property' ? 'border-[#960000] text-[#960000] bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
          `}
        >
          Imóvel
        </button>
        <button
          onClick={() => setActiveTab('seller')}
          className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors
             ${activeTab === 'seller' ? 'border-[#960000] text-[#960000] bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
          `}
        >
          Vendedores
        </button>
        <button
          onClick={() => setActiveTab('buyer')}
          className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors
             ${activeTab === 'buyer' ? 'border-[#960000] text-[#960000] bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
          `}
        >
          Compradores
        </button>
      </div>

      {/* Content */}
      <div className="p-6 bg-blue-50/30">
        <div className="space-y-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                isUploading={uploadingItems.has(item.id)}
                isPending={isPending}
                onUpload={onUpload}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              Nenhum documento necessário nesta categoria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// DocumentationTabs Component using Shadcn UI
function DocumentationTabsShadcn({ checklist, uploadingItems, isPending, onUpload, onToggle, userRole }: {
  checklist: SaleStepChecklistItem[],
  uploadingItems: Set<string>,
  isPending: boolean,
  onUpload: (id: string, file: File) => void,
  onToggle: (id: string, checked: boolean) => void,
  userRole: UserRole
}) {

  const getTabsConfig = () => {
    const allTabs = [
      { value: 'property', label: 'Imóvel' },
      { value: 'seller', label: 'Vendedores' },
      { value: 'buyer', label: 'Compradores' }
    ];

    if (userRole === 'comprador') {
      return [
        { value: 'buyer', label: 'Compradores' },
        { value: 'property', label: 'Imóvel' },
        { value: 'seller', label: 'Vendedores' }
      ];
    }

    if (userRole === 'vendedor') {
      return [
        { value: 'seller', label: 'Vendedores' },
        { value: 'property', label: 'Imóvel' },
        { value: 'buyer', label: 'Compradores' }
      ];
    }

    return allTabs;
  };

  const tabs = getTabsConfig();
  const defaultTab = tabs[0].value;

  const categories: Record<string, 'property' | 'seller' | 'buyer'> = {
    // Property
    "cert_rgi": "property",
    "cert_iptu": "property",
    "cert_condo": "property",
    "cert_funesbom": "property",
    "cert_fiscal_imovel": "property",

    // Seller
    "cert_fiscal_vendedores": "seller",
    "cert_interdicao_1": "seller",
    "cert_interdicao_2": "seller",
    "cert_distribuidor_civil": "seller",
    "cert_trabalhista": "seller",
    "cert_receita": "seller",
    "cert_justica": "seller",
    "cert_fiscal_fazendaria": "seller",
    "docs_seller": "seller",

    // Buyer
    "docs_buyer": "buyer"
  };

  const getItemsByCategory = (category: 'property' | 'seller' | 'buyer') => {
    return checklist.filter(item => {
      const itemCat = categories[item.id] || 'property';
      return itemCat === category;
    });
  };

  const isAllowedToUpload = (category: 'property' | 'seller' | 'buyer') => {
    if (userRole === 'admin' || userRole === 'corretor') return true;
    if (userRole === 'parceiro') return false;

    if (userRole === 'comprador') {
      return category === 'buyer';
    }

    if (userRole === 'vendedor') {
      return category === 'seller' || category === 'property';
    }

    return false;
  };

  const renderList = (items: SaleStepChecklistItem[], category: 'property' | 'seller' | 'buyer') => (
    <div className="space-y-4">
      {items.length > 0 ? (
        items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            isUploading={uploadingItems.has(item.id)}
            isPending={isPending}
            onUpload={onUpload}
            readOnly={!isAllowedToUpload(category)}
            canViewFile={isAllowedToUpload(category)}
          />
        ))
      ) : (
        <div className="text-center py-8 text-gray-500 text-sm">
          Nenhum documento necessário nesta categoria.
        </div>
      )}
    </div>
  );

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="grid w-full max-w-[450px] grid-cols-3 mb-6 bg-gray-100/50 p-1 rounded-xl">
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#960000] data-[state=active]:shadow-sm font-semibold transition-all"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="bg-blue-50/30 rounded-xl p-6 border border-blue-50">
        <TabsContent value="property" className="mt-0">
          {renderList(getItemsByCategory('property'), 'property')}
        </TabsContent>
        <TabsContent value="seller" className="mt-0">
          {renderList(getItemsByCategory('seller'), 'seller')}
        </TabsContent>
        <TabsContent value="buyer" className="mt-0">
          {renderList(getItemsByCategory('buyer'), 'buyer')}
        </TabsContent>
      </div>
    </Tabs>
  );
}

// FinancingTabs Component using Shadcn UI
function FinancingTabsShadcn({ checklist, uploadingItems, isPending, onUpload, userRole }: {
  checklist: SaleStepChecklistItem[],
  uploadingItems: Set<string>,
  isPending: boolean,
  onUpload: (id: string, file: File) => void,
  userRole: UserRole
}) {

  const getTabsConfig = () => {
    const allTabs = [
      { value: 'buyer', label: 'Compradores' },
      { value: 'seller', label: 'Vendedores' },
      { value: 'process', label: 'Processo' }
    ];

    if (userRole === 'comprador') {
      return [
        { value: 'buyer', label: 'Compradores' },
        { value: 'process', label: 'Processo' },
        { value: 'seller', label: 'Vendedores' }
      ];
    }

    if (userRole === 'vendedor') {
      return [
        { value: 'seller', label: 'Vendedores' },
        { value: 'process', label: 'Processo' },
        { value: 'buyer', label: 'Compradores' }
      ];
    }

    return allTabs;
  };

  const tabs = getTabsConfig();
  const defaultTab = tabs[0].value;

  const categories: Record<string, 'buyer' | 'seller' | 'process'> = {
    // Buyer
    "id_doc_buyer": "buyer",
    "civil_status_buyer": "buyer",
    "proof_residence_buyer": "buyer",
    "paystubs": "buyer",
    "irpf": "buyer",
    "pis": "buyer",
    "fgts_statement": "buyer",

    // Seller
    "id_doc_seller": "seller",
    "civil_status_seller": "seller",
    "proof_residence_seller": "seller",

    // Process
    "finance_approval": "process",
    "engineering_eval": "process",
    "bank_contract": "process"
  };

  const getItemsByCategory = (category: 'buyer' | 'seller' | 'process') => {
    return checklist.filter(item => {
      const itemCat = categories[item.id] || 'process'; // Default to process if not mapped
      return itemCat === category;
    });
  };

  const isAllowedToUpload = (category: 'buyer' | 'seller' | 'process') => {
    if (userRole === 'admin' || userRole === 'corretor') return true;
    if (userRole === 'parceiro') return false;

    if (userRole === 'comprador') {
      return category === 'buyer' || category === 'process';
    }

    if (userRole === 'vendedor') {
      return category === 'seller';
    }

    return false;
  };

  const renderList = (items: SaleStepChecklistItem[], category: 'buyer' | 'seller' | 'process') => (
    <div className="space-y-4">
      {items.length > 0 ? (
        items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            isUploading={uploadingItems.has(item.id)}
            isPending={isPending}
            onUpload={onUpload}
            readOnly={!isAllowedToUpload(category)}
            canViewFile={isAllowedToUpload(category)}
          />
        ))
      ) : (
        <div className="text-center py-8 text-gray-500 text-sm">
          Nenhum documento necessário nesta categoria.
        </div>
      )}
    </div>
  );

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="grid w-full max-w-[450px] grid-cols-3 mb-6 bg-gray-100/50 p-1 rounded-xl">
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#960000] data-[state=active]:shadow-sm font-semibold transition-all"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="bg-blue-50/30 rounded-xl p-6 border border-blue-50">
        <TabsContent value="buyer" className="mt-0">
          {renderList(getItemsByCategory('buyer'), 'buyer')}
        </TabsContent>
        <TabsContent value="seller" className="mt-0">
          {renderList(getItemsByCategory('seller'), 'seller')}
        </TabsContent>
        <TabsContent value="process" className="mt-0">
          {renderList(getItemsByCategory('process'), 'process')}
        </TabsContent>
      </div>
    </Tabs>
  );
}

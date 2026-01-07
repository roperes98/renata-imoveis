"use client";

import { useState, useTransition } from "react";
import { SaleStep, RGIData } from "@/app/lib/types/sales";
import { updateRGIData } from "@/app/lib/sales-actions";
import { FaCheck, FaSpinner, FaClipboardList, FaFileAlt, FaUniversity, FaStamp } from "react-icons/fa";

interface RGITrackerProps {
  step: SaleStep;
  saleId: string;
}

type RGIStage = "protocol" | "analysis" | "requirements" | "registered";

const STAGES: { id: RGIStage; label: string; icon: any }[] = [
  { id: "protocol", label: "Protocolado", icon: FaClipboardList },
  { id: "analysis", label: "Em Análise", icon: FaFileAlt },
  { id: "requirements", label: "Com Exigência", icon: FaUniversity },
  { id: "registered", label: "Registrado", icon: FaStamp },
];

export default function RGITracker({ step, saleId }: RGITrackerProps) {
  const [isPending, startTransition] = useTransition();
  const [protocolInput, setProtocolInput] = useState("");

  const rgiData = step.rgiData;

  const handleSetProtocol = () => {
    if (!protocolInput.trim()) return;

    const initialData: RGIData = {
      protocol: protocolInput,
      protocolDate: new Date().toISOString(),
      currentStage: "protocol",
      history: [
        { status: "current", label: "Protocolado", date: new Date().toISOString() }
      ]
    };

    startTransition(async () => {
      await updateRGIData(saleId, step.id, initialData);
    });
  };

  const handleStageChange = (newStage: RGIStage) => {
    if (!rgiData) return;

    // Logic to update history and current stage
    // For simplicity, we just set the new stage as current
    // In a real app we might want to preserve the history of previous stages properly

    const newHistory = [...rgiData.history];
    // Mark previous current as completed
    const currentIndex = newHistory.findIndex(h => h.status === "current");
    if (currentIndex !== -1) {
      newHistory[currentIndex].status = "completed";
    }

    newHistory.push({
      status: "current",
      label: STAGES.find(s => s.id === newStage)?.label || newStage,
      date: new Date().toISOString()
    });

    const newData: RGIData = {
      ...rgiData,
      currentStage: newStage,
      history: newHistory
    };

    startTransition(async () => {
      await updateRGIData(saleId, step.id, newData);
    });
  };

  if (!rgiData?.protocol) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
        <div className="mb-4 flex justify-center text-gray-400">
          <FaClipboardList size={40} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Informe o Protocolo do RGI</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
          Para iniciar o acompanhamento, insira o número do protocolo fornecido pelo cartório.
        </p>

        <div className="flex gap-3 max-w-xs mx-auto">
          <input
            type="text"
            placeholder="Nº do Protocolo"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#960000] focus:border-[#960000] outline-none transition-all"
            value={protocolInput}
            onChange={(e) => setProtocolInput(e.target.value)}
            disabled={isPending}
          />
          <button
            onClick={handleSetProtocol}
            disabled={!protocolInput.trim() || isPending}
            className="bg-[#960000] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#7a0000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? <FaSpinner className="animate-spin" /> : "Iniciar"}
          </button>
        </div>
      </div>
    );
  }

  // Stepper View
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Protocol Header */}
      <div className="bg-gray-50 p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Protocolo RGI</span>
          <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {rgiData.protocol}
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
              {new Date(rgiData.protocolDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status Atual</p>
          <p className="text-lg font-bold text-[#960000]">
            {STAGES.find(s => s.id === rgiData.currentStage)?.label}
          </p>
        </div>
      </div>

      {/* Stepper Steps */}
      <div className="p-8">
        <div className="relative flex justify-between">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0" />

          {STAGES.map((s, index) => {
            const isActive = s.id === rgiData.currentStage;
            const isPast = STAGES.findIndex(st => st.id === rgiData.currentStage) > index;
            const isFuture = !isActive && !isPast;
            const isRequirements = s.id === 'requirements' && isActive;

            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 group">
                <button
                  onClick={() => handleStageChange(s.id)}
                  disabled={isPending} // Or strict sequential enforcement
                  className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300
                      ${isActive ? (s.id === 'requirements' ? 'bg-orange-500 border-orange-200 text-white shadow-lg scale-110' : 'bg-[#960000] border-red-200 text-white shadow-lg scale-110') :
                      isPast ? 'bg-[#960000] border-[#960000] text-white' :
                        'bg-white border-gray-200 text-gray-300 hover:border-gray-300'}
                    `}
                >
                  {isPending && isActive ? <FaSpinner className="animate-spin" /> : <s.icon size={18} />}
                </button>
                <span className={`
                    text-xs font-bold whitespace-nowrap transition-colors
                    ${isActive ? (s.id === 'requirements' ? 'text-orange-600' : 'text-[#960000]') :
                    isPast ? 'text-[#960000]' : 'text-gray-400'}
                 `}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dynamic Status Message */}
      {rgiData.currentStage === 'requirements' && (
        <div className="mx-6 mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-4">
          <FaUniversity className="text-orange-500 shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-orange-900 text-sm">O Cartório emitiu uma exigência</h4>
            <p className="text-orange-800 text-sm mt-1">
              Verifique o documento de exigência no cartório e providencie os ajustes necessários para prosseguir.
            </p>
          </div>
        </div>
      )}

      {rgiData.currentStage === 'registered' && (
        <div className="mx-6 mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-4">
          <FaCheck className="text-green-500 shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-green-900 text-sm">Registro Concluído com Sucesso!</h4>
            <p className="text-green-800 text-sm mt-1">
              A transmissão de propriedade foi registrada. O processo está pronto para a entrega de chaves.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

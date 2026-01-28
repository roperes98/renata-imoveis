"use client";

import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyInfoForm } from "./components/CompanyInfoForm";
import { BusinessHoursManager } from "./components/BusinessHoursManager";

import { AddressManager } from "./components/AddressManager";
import { FinanceManager } from "./components/FinanceManager";
import { TeamManager } from "./components/TeamManager";
import { FormStepper } from "@/app/components/dashboard/property-form/FormStepper";
import { useState } from "react";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "geral";

  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações gerais da imobiliária.
        </p>
      </div>

      <FormStepper currentStep={currentStep} steps={["Geral", "Endereços", "Financeiro", "Funcionamento", "Equipe"]} onStepChange={(step) => setCurrentStep(step)} />

      {currentStep === 1 && (
        <CompanyInfoForm />
      )}

      {currentStep === 2 && (
        <AddressManager />
      )}

      {currentStep === 3 && (
        <FinanceManager />
      )}

      {currentStep === 4 && (
        <BusinessHoursManager />
      )}

      {currentStep === 5 && (
        <TeamManager />
      )}
    </div>
  );
}

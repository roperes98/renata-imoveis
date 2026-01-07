"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { ArrowLeftIcon, MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface FormStepperProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  steps: string[];
}

export function FormStepper({ currentStep, onStepChange, steps }: FormStepperProps) {
  const [modifier, setModifier] = useState("Ctrl");

  useEffect(() => {
    if (typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)) {
      setModifier("⌘");
    } else if (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('mac')) {
      setModifier("⌘");
    }
  }, []);

  return (
    <div className="w-full flex items-center justify-between mb-8">
      <Link href="/dashboard/condominios">
        <Button variant="outline" size="icon" className="rounded-full" >
          <ArrowLeftIcon />
        </Button>
      </Link>

      <div className="relative bg-gray-100 p-1 rounded-full flex w-full max-w-3xl">
        {steps.map((step, index) => {
          const isActive = currentStep === index + 1;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onStepChange(index + 1)}
              className={`flex-1 relative z-10 py-2 text-sm font-medium rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary
                ${isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
            >
              {step}
            </button>
          );
        })}
      </div>

      <ButtonGroup>
        <Button variant="outline">Salvar</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="More Options">
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                Salvar e Continuar
                <DropdownMenuShortcut><Kbd>{modifier}</Kbd> + <Kbd>S</Kbd></DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Salvar Rascunho
                <DropdownMenuShortcut><Kbd>{modifier}</Kbd> + <Kbd>R</Kbd></DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Salvar e Exportar
                <DropdownMenuShortcut><Kbd>{modifier}</Kbd> + <Kbd>E</Kbd></DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  );
}


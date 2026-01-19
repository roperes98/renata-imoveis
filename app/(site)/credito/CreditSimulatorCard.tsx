"use client";

import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function CreditSimulatorCard() {
  const [value, setValue] = useState(500000);
  const min = 200000;
  const max = 3000000;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(/\D/g, "");
    const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
    setValue(numericValue);
  };

  const handleBlur = () => {
    if (value < min) setValue(min);
    if (value > max) setValue(max);
  }

  return (
    <div className="w-full max-w-[570px] bg-white p-8 rounded-2xl shadow-lg">
      <div className="mb-3">
        <label htmlFor="property-value" className="block text-gray-500 text-sm mb-1 text-center">
          Qual o valor do imóvel?
        </label>
        <div className="flex justify-center items-center w-full h-16 border-b border-gray-200 focus-within:border-gray-400 transition-colors">
          <span className="text-4xl md:text-[42px] font-bold text-gray-400 mr-2 mb-2">R$</span>
          <input
            id="property-value"
            type="text"
            className="text-4xl md:text-[42px] font-bold text-gray-600 text-center w-auto max-w-[220px] focus:outline-none bg-transparent mb-2"
            value={value.toLocaleString("pt-BR")}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mb-6">
        Valor mínimo de {formatCurrency(min)}
      </div>

      <div className="mb-8">
        <Slider
          defaultValue={[value]}
          value={[value]}
          min={min}
          max={max}
          step={1000}
          onValueChange={(vals) => setValue(vals[0])}
          className="cursor-pointer [&_[data-slot=slider-range]]:bg-[#960000] [&_[data-slot=slider-thumb]]:border-[#960000] [&_[data-slot=slider-thumb]]:border-4 [&_[data-slot=slider-thumb]]:h-5 [&_[data-slot=slider-thumb]]:w-5"
        />
      </div>

      <Button size="lg" className="w-full h-12 text-base font-semibold bg-[#960000] hover:bg-[#960000]/90 text-white rounded-lg shadow-sm transition-all duration-200">
        Simular meu financiamento
      </Button>
    </div>
  );
}

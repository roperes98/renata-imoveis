"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { MaterialImageMask } from "@/components/ui/material-image-mask";
import { Label } from "@/components/ui/label";
import { ChevronDownIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Combobox } from "@/components/ui/combobox";

// Types
type BankSimulation = {
  name: string;
  logo: string;
  interestRate: number; // Yearly interest rate percentage
  maxTerm: number; // Max years
  maxLTV: number; // Max Loan-to-Value percentage
  link: string;
};

const banks: BankSimulation[] = [
  {
    name: "Itaú",
    logo: "/banks/itau-small.svg", // Assuming these images exist based on previous file
    interestRate: 10.49,
    maxTerm: 35,
    maxLTV: 80,
    link: "https://www.itau.com.br/emprestimos-financiamentos/credito-imobiliario/simulador/",
  },
  {
    name: "Caixa",
    logo: "/banks/caixa-small-blue.svg",
    interestRate: 9.99,
    maxTerm: 35,
    maxLTV: 80,
    link: "http://www8.caixa.gov.br/siopiinternet-web/simulaOperacaoInternet.do?method=inicializarCasoUso",
  },
  {
    name: "Bradesco",
    logo: "/banks/bradesco-small.svg",
    interestRate: 10.99,
    maxTerm: 35,
    maxLTV: 80,
    link: "https://banco.bradesco/html/classic/produtos-servicos/emprestimo-e-financiamento/encontre-seu-credito/simuladores-imoveis.shtm#box1-comprar",
  },
  {
    name: "Santander",
    logo: "/banks/santander-small.svg",
    interestRate: 11.49,
    maxTerm: 35,
    maxLTV: 80,
    link: "https://www.santander.com.br/creditos-e-financiamentos/para-sua-casa/credito-imobiliario?ic=homepf-cardsprod-creditoimobiliario#/dados-pessoais",
  },
];

import { IbgeUF } from "@/app/lib/types/database";

// Deleted static ufs array

const propertyTypes = [
  "Casa residencial",
  "Casa em condominio",
  "Apartamento em condominio",
  "Casa comercial",
  "Sala comercial",
  "Terreno"
];

export default function SimulacaoPage() {
  // Form State
  const [propertyValue, setPropertyValue] = useState<number>(500000);
  const [downPayment, setDownPayment] = useState<number>(100000);
  const [term, setTerm] = useState<number>(30);
  const [propertyType, setPropertyType] = useState<string>("Apartamento em condominio");
  const [uf, setUf] = useState<string>("RJ");
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [ufs, setUfs] = useState<IbgeUF[]>([]);

  const [simulated, setSimulated] = useState(false);

  useEffect(() => {
    fetch("https://brasilapi.com.br/api/ibge/uf/v1")
      .then(res => res.json())
      .then((data: IbgeUF[]) => {
        setUfs(data.sort((a, b) => a.sigla.localeCompare(b.sigla)));
      })
      .catch(err => console.error("Error fetching UFs:", err));
  }, []);

  // Validation Constants
  const MIN_AGE = 18;
  const MAX_AGE_PLUS_TERM = 80;
  const MAX_LOAN_AMOUNT = 20000000;
  const MIN_DOWN_PAYMENT_PERCENT = 0.10;

  // Helper to calculate minimum down payment
  const calculateMinDownPayment = (propValue: number) => {
    const byPercentage = propValue * MIN_DOWN_PAYMENT_PERCENT;
    const byLoanLimit = propValue - MAX_LOAN_AMOUNT;
    return Math.max(byPercentage, byLoanLimit);
  };

  // Helper to calculate max term based on age
  const calculateMaxTerm = (birthDate: Date | undefined) => {
    if (!birthDate) return 35;
    const age = getAge(birthDate);
    return Math.max(1, MAX_AGE_PLUS_TERM - age);
  }

  // Update Down Payment when Property Value changes
  const handlePropertyValueChange = (newVal: number) => {
    setPropertyValue(newVal);
    const minDown = calculateMinDownPayment(newVal);
    const maxDown = newVal * 0.9;

    if (downPayment < minDown) {
      setDownPayment(minDown);
    } else if (downPayment > maxDown) {
      setDownPayment(maxDown);
    }
  };

  // Handlers
  const handleCurrencyChange = (value: string, setter: (val: number) => void, isPropertyVal: boolean = false) => {
    const numericValue = parseInt(value.replace(/\D/g, ""), 10) || 0;
    if (isPropertyVal) {
      handlePropertyValueChange(numericValue);
    } else {
      setter(numericValue);
    }
  };

  const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/\D/g, ""), 10) || 0;
    setTerm(val);
  }

  const handleTermBlur = () => {
    const max = calculateMaxTerm(date);
    if (term > max) setTerm(max);
    if (term < 1) setTerm(1);
  }

  const handleDownPaymentBlur = () => {
    const minDown = calculateMinDownPayment(propertyValue);
    if (downPayment < minDown) {
      setDownPayment(minDown);
    }
    const maxDown = propertyValue * 0.9;
    if (downPayment > maxDown) {
      setDownPayment(maxDown);
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const calculateSimulation = (bank: BankSimulation) => {
    const loanAmount = propertyValue - downPayment;
    const monthlyRate = bank.interestRate / 12 / 100;
    const months = term * 12;

    // Price Table (Sistema Francês/Price) approximation for simple simulation
    // PMT = PV * i * (1 + i)^n / ((1 + i)^n - 1)
    const pmt = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);

    // Initial Installment for SAC is usually higher: (Loan / months) + (Loan * monthlyRate)
    const sacFirstInstallment = (loanAmount / months) + (loanAmount * monthlyRate);

    // We can show a range or just the SAC first installment as it's common in Brazil to show the highest first
    return {
      firstInstallment: sacFirstInstallment,
      totalAmount: sacFirstInstallment * months * 0.7, // Very rough approximation of total paid over time for SAC
      loanAmount,
    };
  };

  const handleSimulate = () => {
    setSimulated(true);
  };

  // Date Logic
  const getAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 100); // Reasonably old
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - MIN_AGE); // At least 21 years old


  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero/Header Section */}
      <section className="relative h-[400px] w-full flex items-center justify-center overflow-hidden bg-[#1e1e1e]">
        <Image
          src="/living-room.png" // Reuse existing image
          alt="Simulation background"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simulador de Crédito Imobiliário
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Compare as taxas dos principais bancos e encontre a melhor opção para realizar o seu sonho.
          </p>
        </div>
      </section>

      {/* Simulator Section */}
      <section className="container mx-auto px-4 -mt-20 relative z-20 pb-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-[#1e1e1e] mb-6 flex items-center gap-2">
            <span className="w-1.5 h-8 bg-[#960000] rounded-full block"></span>
            Dados da Simulação
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Property Value */}
            <div className="space-y-2">
              <Label htmlFor="property-value">Valor do Imóvel</Label>
              <Input
                id="property-value"
                value={propertyValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                onChange={(e) => handleCurrencyChange(e.target.value, (val) => handlePropertyValueChange(val), true)}
                className="text-sm"
              />
            </div>

            {/* Down Payment */}
            <div className="space-y-2">
              <Label htmlFor="down-payment">Valor da Entrada</Label>
              <Input
                id="down-payment"
                value={downPayment.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                onChange={(e) => handleCurrencyChange(e.target.value, setDownPayment)}
                onBlur={handleDownPaymentBlur}
                className="text-sm"
              />
              <p className="text-xs text-gray-500">
                Mínimo: {formatCurrency(calculateMinDownPayment(propertyValue))}
              </p>
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <Label htmlFor="property-type">Tipo de Imóvel</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger id="property-type" className="text-sm">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* UF */}
            <div className="space-y-2">
              <Label htmlFor="uf">Estado do Imóvel</Label>
              <Combobox
                options={ufs.map((uf) => ({ value: uf.sigla, label: `${uf.nome}` }))}
                value={uf}
                onChange={setUf}
                placeholder="Selecione o estado..."
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birth-date">Data de Nascimento</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-full justify-between font-normal text-sm"
                  >
                    {date ? date.toLocaleDateString() : "Selecione"}
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    defaultMonth={maxDate}
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={maxDate.getFullYear()}
                    startMonth={minDate}
                    endMonth={maxDate}
                    disabled={(date) => date > maxDate || date < minDate}
                    onSelect={(selectedDate) => {
                      if (selectedDate) {
                        // Validate term against new date
                        const maxForNewAge = calculateMaxTerm(selectedDate);
                        if (term > maxForNewAge) {
                          setTerm(maxForNewAge);
                        }
                      }
                      setDate(selectedDate)
                      setOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {!date && <p className="text-xs text-gray-500">Mínimo 21 anos</p>}
            </div>

            {/* Term (Now after Date) */}
            <div className="space-y-2">
              <Label htmlFor="term">Prazo (anos)</Label>
              <Input
                id="term"
                type="text"
                value={term}
                onChange={handleTermChange}
                onBlur={handleTermBlur}
                className="text-sm"
              />
              <p className="text-xs text-gray-500">
                Máximo: {calculateMaxTerm(date)} anos {date ? `(Idade + Prazo <= ${MAX_AGE_PLUS_TERM})` : ""}
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleSimulate}
              disabled={!date}
              size="lg"
              className="bg-[#960000] hover:bg-[#960000]/90 text-white min-w-[200px] text-lg h-12"
            >
              Simular Agora
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {simulated && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-500">
            <h3 className="text-3xl font-bold text-[#1e1e1e] mb-8 text-center">
              Resultados da Simulação
              <p className="text-base font-normal text-gray-500 mt-2">Valores estimados. Sujeito a análise de crédito.</p>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {banks.map((bank) => {
                const result = calculateSimulation(bank);
                return (
                  <Card key={bank.name} className="overflow-hidden pt-0 border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="pb-4 pt-6 bg-gray-50 border-b border-gray-100 flex flex-col items-center">
                      <div className="mb-2">
                        {/* Fallback simple text if image fails, otherwise use Image component properly */}
                        <Image
                          src={bank.logo}
                          alt={bank.name}
                          width={65}
                          height={65}
                          className="object-cover"
                        />
                      </div>
                      <CardTitle className="text-xl font-bold text-[#1e1e1e]">{bank.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="text-center">
                        <p className="text-gray-500 text-sm">Primeira Parcela</p>
                        <p className="text-2xl font-bold text-[#960000]">
                          {result.firstInstallment.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Taxa de Juros</span>
                        <span className="font-semibold text-[#1e1e1e]">{bank.interestRate}% a.a.</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Prazo Máximo</span>
                        <span className="font-semibold text-[#1e1e1e]">{bank.maxTerm} anos</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Entrada Mínima</span>
                        <span className="font-semibold text-[#1e1e1e]">20%</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 pb-6">
                      <Button asChild className="w-full bg-white border-2 border-[#960000] text-[#960000] hover:bg-[#960000] hover:text-white transition-colors">
                        <a href={bank.link} target="_blank" rel="noopener noreferrer">
                          Ver Detalhes
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

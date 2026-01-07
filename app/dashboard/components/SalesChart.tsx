"use client";

import { FaChartLine } from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { month: "Jan", Leblon: 40, Ipanema: 24, Copacabana: 24 },
  { month: "Fev", Leblon: 30, Ipanema: 13, Copacabana: 22 },
  { month: "Mar", Leblon: 20, Ipanema: 98, Copacabana: 22 },
  { month: "Abr", Leblon: 27, Ipanema: 39, Copacabana: 20 },
  { month: "Mai", Leblon: 18, Ipanema: 48, Copacabana: 21 },
  { month: "Jun", Leblon: 23, Ipanema: 38, Copacabana: 25 },
  { month: "Jul", Leblon: 34, Ipanema: 43, Copacabana: 21 },
];

const chartConfig = {
  Leblon: {
    label: "Leblon",
    color: "#960000", // Cor primária da aplicação
  },
  Ipanema: {
    label: "Ipanema",
    color: "#2563EB", // Azul complementar
  },
  Copacabana: {
    label: "Copacabana",
    color: "#10B981", // Verde complementar
  },
} satisfies {
  [key: string]: {
    label: string;
    color: string;
  };
};

export default function SalesChart() {
  return (
    <Card className="flex flex-col h-[400px] w-full">
      <CardHeader>
        <div className="flex items-center gap-2 text-[#8B735B] mb-1">
          <FaChartLine className="text-xs" />
          <span className="text-xs font-bold tracking-wider uppercase">VENDAS</span>
        </div>
        <CardTitle className="text-3xl font-medium text-[#1C1C1C]">Vendas por Bairro</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="fillLeblon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-Leblon)" stopOpacity={1} />
                <stop offset="95%" stopColor="var(--color-Leblon)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillIpanema" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-Ipanema)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-Ipanema)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillCopacabana" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-Copacabana)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-Copacabana)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
              horizontal={true}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis
              tick={false}
              tickLine={false}
              axisLine={false}
              width={1}
              domain={[0, 'auto']}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="Leblon"
              type="natural"
              fill="url(#fillLeblon)"
              fillOpacity={0.6}
              stroke="var(--color-Leblon)"
            />
            <Area
              dataKey="Ipanema"
              type="natural"
              fill="url(#fillIpanema)"
              fillOpacity={0.6}
              stroke="var(--color-Ipanema)"
            />
            <Area
              dataKey="Copacabana"
              type="natural"
              fill="url(#fillCopacabana)"
              fillOpacity={0.6}
              stroke="var(--color-Copacabana)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

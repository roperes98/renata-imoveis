"use client";

import { FaStar } from "react-icons/fa";

export default function LeadsCard() {
  const data = [
    { label: "Instagram", value: 120, change: "+26%", color: "bg-pink-400", dotColor: "text-pink-400" },
    { label: "Conhecidos", value: 85, change: "+17%", color: "bg-indigo-400", dotColor: "text-indigo-400" },
    { label: "Indicações", value: 20, change: "-9%", color: "bg-sky-300", dotColor: "text-sky-300" },
    { label: "Outros", value: 7, change: "+10%", color: "bg-amber-200", dotColor: "text-amber-200" },
  ];

  // Calculate total for progress bar segments
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="h-full w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 text-[#8B735B] mb-1">
        <FaStar className="text-xs" />
        <span className="text-xs font-bold tracking-wider uppercase">CLIENTES</span>
      </div>
      <h2 className="text-3xl font-medium text-[#1C1C1C] mb-6">Leads</h2>

      {/* Progress Bar */}
      <div className="flex h-2 w-full gap-1 overflow-hidden rounded-full mb-8">
        {data.map((item, index) => (
          <div
            key={index}
            style={{ width: `${(item.value / total) * 100}%` }}
            className={`h-full ${item.color}`}
          />
        ))}
      </div>

      {/* List */}
      <div className="space-y-6">
        {data.map((item, index) => {
          const isPositive = item.change.startsWith("+");
          return (
            <div key={index} className="flex items-center justify-between border-b border-[#E5E5E5] pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${item.color}`}></span>
                <span className="text-base text-[#4A4A4A]">{item.label}</span>
              </div>
              <div className="flex items-center gap-8">
                <span className="text-base font-medium text-[#4A4A4A] w-8 text-right">{item.value}</span>
                <div className="flex items-center gap-1 w-16 justify-end">
                  {isPositive ? (
                    <span className="text-[10px] text-green-500">▲</span>
                  ) : (
                    <span className="text-[10px] text-gray-400"></span>
                  )}
                  <span className={`text-sm font-medium ${isPositive ? "text-[#4A4A4A]" : "text-[#4A4A4A]"}`}>
                    {item.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

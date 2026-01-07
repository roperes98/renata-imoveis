import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: ReactNode;
  color?: "red" | "blue" | "green" | "yellow";
}

export default function StatCard({ title, value, trend, trendUp, icon, color = "red" }: StatCardProps) {
  const colorStyles = {
    red: "text-red-600 bg-red-50",
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    yellow: "text-yellow-600 bg-yellow-50",
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`rounded-lg p-3 ${colorStyles[color]}`}>
          <div className="text-xl">{icon}</div>
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`text-sm font-medium ${trendUp ? "text-green-600" : "text-red-600"
              }`}
          >
            {trendUp ? "↑" : "↓"} {trend}
          </span>
          <span className="text-sm text-gray-400">vs mês anterior</span>
        </div>
      )}
    </div>
  );
}

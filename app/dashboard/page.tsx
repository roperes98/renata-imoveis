"use client";

import { FaBuilding, FaUsers, FaCity, FaHandshake, FaPlus } from "react-icons/fa";
import StatCard from "./components/StatCard";
import SalesChart from "./components/SalesChart";
import LeadsCard from "./components/LeadsCard";
import Link from "next/link";
import Image from "next/image";
import { FiSearch } from "react-icons/fi";
import { useState } from "react";
import DashboardAddModal from "./components/DashboardAddModal";

export default function DashboardPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const links = [
    {
      title: "Calendário",
      href: "https://calendar.google.com",
      logo: "/google-calendar.svg"
    },
    {
      title: "Zap Imóveis",
      href: "https://zapimoveis.com.br",
      logo: "/zap-imoveis.svg"
    },
    {
      title: "Chaves na Mão",
      href: "https://chavesnamao.com.br",
      logo: "/chaves-na-mao.svg"
    },
    {
      title: "ImovelWeb",
      href: "https://imovelweb.com.br/",
      logo: "/imovelweb.svg"
    },
  ]

  // In a real app, you would fetch these stats from your database
  const stats = [
    {
      title: "Imóveis captados",
      value: "124",
      trend: "12%",
      trendUp: true,
      icon: <FaBuilding />,
      color: "red" as const,
    },
    {
      title: "Clientes captados",
      value: "1,294",
      trend: "3.2%",
      trendUp: true,
      icon: <FaUsers />,
      color: "blue" as const,
    },
    {
      title: "Vendas",
      value: "54",
      trend: "0%",
      trendUp: true,
      icon: <FaCity />,
      color: "green" as const,
    },
    {
      title: "Propostas Pendentes",
      value: "8",
      trend: "2.1%",
      trendUp: false,
      icon: <FaHandshake />,
      color: "yellow" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-[27px] font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-gray-500">
          Acompanhe os principais indicadores da sua imobiliária.
        </p>
      </div>

      <div className="relative flex items-center w-full h-14 rounded-full bg-white border border-gray-200 focus-within:border-gray-300 overflow-hidden">
        <div className="pl-4 text-gray-400">
          <FiSearch size={20} />
        </div>
        <input
          type="text"
          placeholder="Pesquisar por código, endereço..."
          value={""}
          readOnly
          className="w-full h-full px-4 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
        />
      </div>

      <div className="flex items-center gap-4">
        {links.map((link, index) => (
          <Link key={index} href={link.href} className="h-20 w-[276px] flex items-center gap-4 rounded-4xl bg-white border border-gray-300 px-5 py-4 hover:bg-gray-50">
            <Image src={link.logo} alt={link.title} width={30} height={30} className="w-8 h-8" />
            <div>
              <h2>{link.title}</h2>
              <p className="text-sm text-gray-500">{link.href.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}</p>
            </div>
          </Link>
        ))
        }

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="h-14 w-11.5 flex items-center justify-center rounded-full bg-[#960000] hover:cursor-pointer hover:bg-[#7a0000] transition-colors"
        >
          <FaPlus className="text-white" />
        </button>
      </div >

      {/* Stats Grid */}
      < div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" >
        {
          stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))
        }
      </div >

      {/* Charts and Lists Section */}
      < div className="grid grid-cols-1 gap-6 lg:grid-cols-2" >
        <div className="w-full">
          <SalesChart />
        </div>

        <div className="w-full">
          <LeadsCard />
        </div>
      </div >

      <DashboardAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div >
  );
}

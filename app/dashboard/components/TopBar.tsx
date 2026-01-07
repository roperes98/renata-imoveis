"use client";

import { FaSearch, FaBell, FaUserCircle } from "react-icons/fa";

export default function TopBar({ userEmail }: { userEmail?: string }) {
  return (
    <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-gray-100 bg-white px-8 shadow-sm">
      {/* Page Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="h-6 w-px bg-gray-200"></div>
        <span className="text-sm text-gray-400">Visão Geral</span>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Busque por cards, assuntos..."
            className="h-10 w-96 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-[#960000] focus:ring-1 focus:ring-[#960000]"
          />
        </div>

        {/* Action Icons */}
        <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors">
          <FaBell className="text-xl" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-900">Olá, Usuário</p>
            <p className="text-xs text-gray-500">{userEmail || "admin@renataimoveis.com"}</p>
          </div>
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-gray-100 bg-gray-100">
            <FaUserCircle className="h-full w-full text-gray-300" />
            {/* Use an image if available */}
            {/* <img src="/avatar.jpg" alt="User" className="h-full w-full object-cover" /> */}
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useUserRole, UserRole } from "@/app/context/UserRoleContext";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaSignOutAlt, FaCog } from "react-icons/fa";
import { signOut } from "next-auth/react";
import Logo from "@/app/components/Logo";
import { PiBuildingsFill } from "react-icons/pi";
import { BsBarChartFill, BsFillHousesFill } from "react-icons/bs";
import { MdPeopleAlt, MdRealEstateAgent, MdWork } from "react-icons/md";
import { LuChevronsLeft, LuChevronsRight } from "react-icons/lu";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";

const menuItems = [
  { name: "Dashboard", icon: BsBarChartFill, href: "/dashboard", roles: ["admin", "corretor", "parceiro"] },
  { name: "Imóveis", icon: BsFillHousesFill, href: "/dashboard/imoveis", roles: ["admin", "comprador", "vendedor", "corretor", "parceiro"] },
  { name: "Condomínios", icon: PiBuildingsFill, href: "/dashboard/condominios", roles: ["admin", "corretor"] },
  { name: "Vendas", icon: MdRealEstateAgent, href: "/dashboard/vendas", roles: ["admin", "comprador", "vendedor", "corretor", "parceiro"] },
  { name: "Clientes", icon: MdPeopleAlt, href: "/dashboard/clientes", roles: ["admin", "corretor"] },
  { name: "Time", icon: MdWork, href: "/dashboard/time", roles: ["admin", "comprador", "vendedor", "corretor", "parceiro"] },
];

interface SidebarProps {
  isCollapsed?: boolean;
  toggleSidebar?: () => void;
}

export default function Sidebar({ isCollapsed = false, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const { role, setRole } = useUserRole();

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname !== "/dashboard") return false;
    return pathname.startsWith(path);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 hidden flex-col text-white shadow-lg transition-all duration-300 ease-in-out md:flex ${isCollapsed ? "w-20" : "w-58"
        }`}
    >
      <div className="flex h-full flex-col">
        {/* Toggle Button */}
        {toggleSidebar && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#960000] shadow-md hover:bg-gray-100"
          >
            {isCollapsed ? <LuChevronsRight size={16} /> : <LuChevronsLeft size={16} />}
          </button>
        )}

        {/* Logo Area */}
        <div className={`flex h-20 items-center border-b border-white/20 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
          <Link href="/dashboard">
            <Logo className={isCollapsed ? "w-12 h-12" : "w-18 h-18"} colors={{ light: "white", mid: "white", dark: "white" }} />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-3 py-6">
          {menuItems.filter(item => item.roles.includes(role)).map((item) => {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${isActive(item.href)
                  ? "bg-white text-[#960000]"
                  : "text-white hover:bg-white/10"
                  } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.name : ""}
              >
                <item.icon className="text-xl" />
                {!isCollapsed && <span className={`${isActive(item.href) ? "font-bold" : ""}`}>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className={`border-t border-white/20 p-4 space-y-2 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
          <Link
            href="/dashboard/ajustes"
            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${isActive("/dashboard/ajustes")
              ? "bg-white text-[#960000]"
              : "text-white hover:bg-white/10"
              } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Ajustes" : ""}
          >
            <FaCog className="text-xl" />
            {!isCollapsed && <span className={`${isActive("/dashboard/ajustes") ? "font-bold" : ""}`}>Ajustes</span>}
          </Link>

          <Popover>
            <PopoverTrigger asChild>
              <button className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors ${isCollapsed ? "justify-center" : ""}`}>
                <FaCog className="text-xl" />
                {!isCollapsed && <span>Ajustes</span>}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48" side="top">
              <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Simular Papel</p>
              <div className="space-y-1">
                {(["comprador", "vendedor", "corretor", "parceiro"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                    }}
                    className={`block w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors ${role === r ? "bg-[#960000] text-white" : "hover:bg-gray-100"}`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors ${isCollapsed ? "justify-center" : ""
              }`}
            title={isCollapsed ? "Sair" : ""}
          >
            <FaSignOutAlt className="text-xl" />
            {!isCollapsed && <span>Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

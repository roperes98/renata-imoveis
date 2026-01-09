"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
  userEmail?: string;
}

export default function DashboardLayoutWrapper({
  children,
  userEmail,
}: DashboardLayoutWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();
  const isContractPage = pathname?.includes("/dashboard/contratos/novo");

  return (
    <div className="flex h-screen bg-[#960000]">
      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
      />
      <div
        className={`shadow-[-20px_0px_15px_-3px_rgba(0,0,0,0.05)] flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? "md:ml-20" : "md:ml-58"
          }`}
      >
        <main
          className={`flex-1 overflow-y-auto rounded-l-[36px] bg-gray-50 isolate border-l border-gray-200 ${isContractPage ? "p-0" : "p-8"}`}
          style={{
            transform: 'translate3d(0,0,0)', // Forces hardware acceleration
            WebkitMaskImage: '-webkit-radial-gradient(white, black)', // Safari/Chrome radius fix
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import WideLogo from "./WideLogo";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FaUserCircle, FaSignOutAlt, FaHeart, FaTachometerAlt } from "react-icons/fa";
import { logout } from "@/app/lib/actions";
import { PiSiren } from "react-icons/pi";

export default function Header({ user }: { user?: any }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    if (path === "/imoveis" && pathname.startsWith("/condominios")) return true;
    return pathname.startsWith(path);
  };

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/imoveis", label: "Imóveis" },
    { href: "/credito", label: "Crédito" },
    { href: "/contato", label: "Contato" },
    { href: "/sobre", label: "Sobre" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex">
            <div className="h-12 w-auto max-w-[200px]">
              <WideLogo className="w-full h-full object-contain" />
            </div>
          </Link>
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative group transition-colors font-medium ${isActive(link.href)
                    ? "text-[#960000]"
                    : "text-[#1e1e1e] hover:text-[#960000]"
                    }`}
                >
                  {link.label}
                  <span
                    className={`absolute left-0 -bottom-1 w-full h-[2px] bg-[#960000] transform origin-center transition-transform duration-300 ease-out ${isActive(link.href)
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                      }`}
                  />
                </Link>
              </li>
            ))}
            <li>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    {user.avatar_url || user.image ? (
                      <img
                        src={user.avatar_url || user.image}
                        alt={user.name || "User"}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 hover:border-[#960000]"
                      />
                    ) : (
                      <FaUserCircle className="w-10 h-10 text-gray-600 hover:text-gray-300 transition-colors" />
                    )}
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#960000]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaTachometerAlt className="mr-2" /> Dashboard
                      </Link>
                      <Link
                        href="/favoritos"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#960000]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaHeart className="mr-2" /> Favoritos
                      </Link>
                      <Link
                        href="/alertas"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#960000]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <PiSiren className="mr-2" /> Alertas
                      </Link>
                      <button
                        onClick={() => logout()}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#960000]"
                      >
                        <FaSignOutAlt className="mr-2" /> Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-[#960000] text-white px-6 py-2 rounded-lg hover:bg-[#b30000] transition-colors font-medium"
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
          <button className="md:hidden text-[#1e1e1e]">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}


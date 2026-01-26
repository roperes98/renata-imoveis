"use client";

import Link from "next/link";
import WideLogo from "./WideLogo";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FaUserCircle, FaSignOutAlt, FaHeart, FaTachometerAlt, FaHome } from "react-icons/fa";
import { logout } from "@/app/lib/actions";
import { PiSiren } from "react-icons/pi";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOutIcon, X } from "lucide-react";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export default function Header({ user }: { user?: any }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    if (path === "/imoveis" && pathname.startsWith("/condominios")) return true;
    return pathname.startsWith(path);
  };

  const navLinks = [
    { href: "/", label: "Início", icon: FaHome },
    { href: "/imoveis", label: "Imóveis", icon: FaHome },
    { href: "/credito", label: "Crédito", icon: FaHome },
    { href: "/contato", label: "Contato", icon: FaHome },
    { href: "/sobre", label: "Sobre", icon: FaHome },
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar>
                      <AvatarImage src={user.avatar_url || user.image} alt={user.name || "User"} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      <AvatarBadge className="bg-green-600 dark:bg-green-800" />
                    </Avatar>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="min-w-38">
                    <DropdownMenuItem>
                      <FaTachometerAlt className="mr-1.5" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FaHeart className="mr-1.5" />
                      Favoritos
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <PiSiren className="mr-1.5" />
                      Alertas
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      <LogOutIcon className="mr-1.5" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                // <div className="relative">
                //   <button
                //     onClick={() => setIsMenuOpen(!isMenuOpen)}
                //     className="flex items-center gap-2 focus:outline-none"
                //   >
                //     {user.avatar_url || user.image ? (
                //       <img
                //         src={user.avatar_url || user.image}
                //         alt={user.name || "User"}
                //         className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 hover:border-[#960000]"
                //       />
                //     ) : (
                //       <FaUserCircle className="w-10 h-10 text-gray-600 hover:text-gray-300 transition-colors" />
                //     )}
                //   </button>

                //   {isMenuOpen && (
                //     <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                //       <Link
                //         href="/dashboard"
                //         className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#960000]"
                //         onClick={() => setIsMenuOpen(false)}
                //       >
                //         <FaTachometerAlt className="mr-2" /> Dashboard
                //       </Link>
                //       <Link
                //         href="/favoritos"
                //         className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#960000]"
                //         onClick={() => setIsMenuOpen(false)}
                //       >
                //         <FaHeart className="mr-2" /> Favoritos
                //       </Link>
                //       <Link
                //         href="/alertas"
                //         className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#960000]"
                //         onClick={() => setIsMenuOpen(false)}
                //       >
                //         <PiSiren className="mr-2" /> Alertas
                //       </Link>
                //       <button
                //         onClick={() => logout()}
                //         className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#960000]"
                //       >
                //         <FaSignOutAlt className="mr-2" /> Sair
                //       </button>
                //     </div>
                //   )}
                // </div>

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
          <Drawer direction="right">
            <DrawerTrigger asChild>
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
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar_url || user.image} alt={user.name || "User"} />
                      <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-[#1e1e1e]">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  </div>

                  <DrawerClose>
                    <Button variant="ghost" size="icon">
                      <X className="w-6 h-6 text-[#1e1e1e]" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>
              <div className="flex flex-col gap-6 p-4">
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-lg font-medium flex items-center gap-3 px-3 ${isActive(link.href)
                        ? "text-[#960000] bg-red-300 rounded-md py-2"
                        : "text-[#1e1e1e]"
                        }`}
                    >
                      <link.icon />
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="h-px bg-gray-200 w-full" />

                <div className="flex flex-col gap-4">
                  {user ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 ml-1">
                        <Link href="/dashboard" className="flex items-center text-[#1e1e1e] gap-2">
                          <FaTachometerAlt /> Dashboard
                        </Link>
                        <Link href="/favoritos" className="flex items-center text-[#1e1e1e] gap-2">
                          <FaHeart /> Favoritos
                        </Link>
                        <Link href="/alertas" className="flex items-center text-[#1e1e1e] gap-2">
                          <PiSiren /> Alertas
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="bg-[#960000] text-white px-6 py-2 rounded-lg hover:bg-[#b30000] transition-colors font-medium text-center"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
              <DrawerFooter>
                <button onClick={() => logout()} className="flex items-center text-red-600 gap-2 text-left">
                  <LogOutIcon size={16} /> Sair
                </button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </nav>
    </header>
  );
}


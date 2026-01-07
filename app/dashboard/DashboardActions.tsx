"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaEdit, FaCalendarAlt, FaFileContract, FaExternalLinkAlt } from "react-icons/fa";

interface DashboardActionsProps {
  propertyId: string;
  propertyCode: string;
}

export default function DashboardActions({ propertyId, propertyCode }: DashboardActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <BsThreeDotsVertical className="text-lg" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-100 py-1 action-menu">
          <Link
            href={`/dashboard/edit/${propertyId}`}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#960000]"
            onClick={() => setIsOpen(false)}
          >
            <FaEdit className="mr-3" /> Editar
          </Link>
          <Link
            href={`/dashboard/visits/${propertyId}`}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#960000]"
            onClick={() => setIsOpen(false)}
          >
            <FaCalendarAlt className="mr-3" /> Visitas
          </Link>
          <Link
            href={`/dashboard/proposals/${propertyId}`}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#960000]"
            onClick={() => setIsOpen(false)}
          >
            <FaFileContract className="mr-3" /> Propostas
          </Link>
          <div className="border-t border-gray-100 my-1"></div>
          <Link
            href={`/imoveis/${propertyCode}`}
            target="_blank"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#960000]"
            onClick={() => setIsOpen(false)}
          >
            <FaExternalLinkAlt className="mr-3" /> Ver no Site
          </Link>
        </div>
      )}
    </div>
  );
}

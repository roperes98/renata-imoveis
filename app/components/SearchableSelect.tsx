"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  label?: string;
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  isLoading?: boolean;
  className?: string;
}

export default function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  disabled = false,
  required = false,
  name,
  id,
  isLoading = false,
  className = "",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Find selected option to display its label
  const selectedOption = useMemo(() =>
    options.find((opt) => String(opt.value) === String(value)),
    [options, value]
  );

  // Filter options based on search term
  const filteredOptions = useMemo(() =>
    options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [options, searchTerm]
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(""); // Reset search on close
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Hidden input for form submission if needed */}
      <input
        type="hidden"
        name={name}
        id={id}
        value={value}
        required={required}
      />

      <div
        className={`
          relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm
          ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : "cursor-pointer"}
          ${!selectedOption ? "text-gray-500" : "text-gray-900"}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="block truncate">
          {isLoading ? "Carregando..." : (selectedOption ? selectedOption.label : placeholder)}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <FaChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </span>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
            <div className="relative">
              <FaSearch className="absolute left-2 top-2.5 text-gray-400 text-xs" />
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md pl-8 pr-2 py-1 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {isLoading && (
            <div className="py-2 px-4 text-gray-500 text-sm">Carregando opções...</div>
          )}

          {!isLoading && filteredOptions.length === 0 && (
            <div className="py-2 px-4 text-gray-500 text-sm">Nenhuma opção encontrada</div>
          )}

          {!isLoading && filteredOptions.map((option) => (
            <div
              key={option.value}
              className={`
                cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-red-50
                ${String(value) === String(option.value) ? "bg-red-50 text-red-900 font-medium" : "text-gray-900"}
              `}
              onClick={() => handleSelect(option)}
            >
              <span className="block truncate">{option.label}</span>
              {String(value) === String(option.value) && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-red-600">
                  {/* Checkmark or indicator could go here */}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCountries } from "react-phone-number-input/input";
import en from "react-phone-number-input/locale/en";
import pt from "react-phone-number-input/locale/pt";

interface NationalitySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export const NationalitySelect = ({ value, onChange, error }: NationalitySelectProps) => {
  const [open, setOpen] = useState(false);
  const countries = getCountries();

  // Mapeamento de exceções para bandeiras (FlagCDN)
  const FLAG_EXCEPTIONS: Record<string, string> = {
    AC: "sh-ac", // Ascension Island
    TA: "sh-ta", // Tristan da Cunha
  };

  const getFlagUrl = (countryCode: string) => {
    const code = FLAG_EXCEPTIONS[countryCode] || countryCode.toLowerCase();
    return `https://flagcdn.com/w40/${code}.png`;
  };

  // Helper to find country code by name (reverse lookup for flag)
  const getCountryCodeByName = (name: string) => {
    if (!name) return undefined;
    const cleanName = name.toLowerCase().trim();
    // Try strict match first in PT then EN
    const found = countries.find(c =>
      (pt[c] && pt[c].toLowerCase() === cleanName) ||
      (en[c] && en[c].toLowerCase() === cleanName)
    );
    return found;
  };

  const selectedCountryCode = getCountryCodeByName(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between pl-3 font-normal",
            !value && "text-muted-foreground",
            error && "border-red-500 hover:border-red-500"
          )}
        >
          {value ? (
            <div className="flex items-center gap-2 overflow-hidden">
              {selectedCountryCode && (
                <img
                  src={getFlagUrl(selectedCountryCode)}
                  alt={value}
                  className="h-4 w-6 object-cover rounded-sm shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <span className="truncate">{value}</span>
            </div>
          ) : (
            "Selecione a nacionalidade"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar nacionalidade..." />
          <CommandList>
            <CommandEmpty>Nenhuma nacionalidade encontrada.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => {
                const countryName = pt[country] || en[country] || country;
                return (
                  <CommandItem
                    key={country}
                    value={countryName}
                    onSelect={(currentValue) => {
                      // command returns lowercase value usually, but we want the nice name
                      // currentValue here comes from the `value` prop of CommandItem if set? 
                      // Actually CommandItem value is used for filtering. 
                      // We should use the countryName we computed.
                      onChange(countryName);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === countryName ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <img
                      src={getFlagUrl(country)}
                      alt={country}
                      className="h-4 w-6 mr-2 object-cover rounded-sm box-content border border-gray-100"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="truncate">{countryName}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

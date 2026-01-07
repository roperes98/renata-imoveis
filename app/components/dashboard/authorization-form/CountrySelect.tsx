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
import { getCountries, getCountryCallingCode } from "react-phone-number-input/input";
import en from "react-phone-number-input/locale/en";
import pt from "react-phone-number-input/locale/pt";

export const CountrySelect = ({ value, onChange, labels, ...rest }: any) => {
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[70px] justify-center p-2 mr-2 text-foreground"
        >
          {value ? (
            <div className="flex items-center pl-1 gap-2">
              <img
                src={getFlagUrl(value)}
                alt={value}
                className="h-4 w-6 object-cover rounded-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="truncate text-xs pl-1 hidden">{value}</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">País</span>
          )}
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar país..." />
          <CommandList>
            <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country}
                  value={pt[country] || en[country] || country}
                  onSelect={() => {
                    onChange(country);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === country ? "opacity-100" : "opacity-0"
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
                  <span className="flex-1 truncate">{pt[country] || en[country] || country}</span>
                  <span className="text-muted-foreground text-xs">+{getCountryCallingCode(country)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

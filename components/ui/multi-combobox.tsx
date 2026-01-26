import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export type Option = {
  value: string
  label: string
  depth?: number // Level of indentation (0, 1, 2...)
}

interface MultiComboboxProps {
  options: Option[]
  value?: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  modal?: boolean
  popoverClassName?: string
}

export function MultiCombobox({
  options,
  value = [], // Default to empty array
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  className,
  disabled = false,
  modal = false,
  popoverClassName,
}: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue]
    onChange(newValue)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal h-auto min-h-9 py-2", !value.length && "text-muted-foreground", className)}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 items-center max-w-[calc(100%-20px)]">
            {value.length > 0 ? (
              value.length > 1 ? (
                // Show count if more than 1 selected
                <span className="text-foreground text-sm font-medium">{value.length} selecionados</span>
              ) : (
                // Show badge if only 1 selected
                value.map((val) => {
                  const label = options.find((opt) => opt.value === val)?.label || val
                  return (
                    <Badge variant="secondary" key={val} className="font-normal text-xs px-2 py-0.5 h-auto">
                      {label}
                    </Badge>
                  )
                })
              )
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center ml-2 shrink-0">
            {value.length > 0 && (
              <div
                role="button"
                className="mr-2 p-0.5 hover:bg-muted rounded-full cursor-pointer"
                onClick={handleClear}
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-full p-0", popoverClassName)}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                const depth = option.depth || 0;
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                    className={cn(depth > 0 && "ml-4 border-l-2 border-muted pl-2")}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

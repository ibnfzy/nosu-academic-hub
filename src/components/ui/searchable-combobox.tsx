import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SearchableComboboxOption = {
  value: string;
  label: string;
  description?: string;
  searchValue?: string;
  disabled?: boolean;
};

interface SearchableComboboxProps {
  options: SearchableComboboxOption[];
  value?: string | null;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  popoverClassName?: string;
  allowClear?: boolean;
  clearLabel?: string;
}

export function SearchableCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Pilih opsi",
  searchPlaceholder = "Cari...",
  emptyMessage = "Tidak ada data ditemukan",
  disabled = false,
  className,
  popoverClassName,
  allowClear = false,
  clearLabel = "Kosongkan pilihan",
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);

  const normalizedValue = value ?? "";

  const optionMap = useMemo(() => {
    return options.reduce((map, option) => {
      map.set(option.value, option);
      return map;
    }, new Map<string, SearchableComboboxOption>());
  }, [options]);

  const selectedOption = optionMap.get(normalizedValue) ?? null;

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue);
    setOpen(false);
  };

  const renderTriggerLabel = () => {
    if (selectedOption) {
      return (
        <div className="flex flex-col items-start">
          <span>{selectedOption.label}</span>
          {selectedOption.description ? (
            <span className="text-xs text-muted-foreground">
              {selectedOption.description}
            </span>
          ) : null}
        </div>
      );
    }

    return <span className="text-muted-foreground">{placeholder}</span>;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {renderTriggerLabel()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[var(--radix-popover-trigger-width)] p-0", popoverClassName)}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {allowClear ? (
              <CommandGroup>
                <CommandItem
                  value={clearLabel}
                  onSelect={() => handleSelect("")}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      normalizedValue ? "opacity-0" : "opacity-100"
                    )}
                  />
                  <span>{clearLabel}</span>
                </CommandItem>
              </CommandGroup>
            ) : null}
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.searchValue || option.label}
                  disabled={option.disabled}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      normalizedValue === option.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.description ? (
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    ) : null}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export type { SearchableComboboxProps };

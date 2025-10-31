import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";

export function MultiSelectKelas({ classes, subjectForm, setSubjectForm }) {
  const [open, setOpen] = useState(false);

  const toggleKelas = (id: string) => {
    setSubjectForm((prev) => {
      const selected = prev.kelasIds || [];
      return selected.includes(id)
        ? { ...prev, kelasIds: selected.filter((k) => k !== id) }
        : { ...prev, kelasIds: [...selected, id] };
    });
  };

  const selectedNames =
    subjectForm.kelasIds?.map(
      (id: string) => classes.find((c) => c.id === id)?.nama
    ) || [];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Kelas</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedNames.length > 0
              ? selectedNames.join(", ")
              : "Pilih kelas"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0">
          <Command>
            <CommandInput placeholder="Cari kelas..." />
            <CommandList>
              <CommandEmpty>Tidak ada kelas ditemukan</CommandEmpty>
              <CommandGroup>
                {classes.map((kelas) => {
                  const selected = subjectForm.kelasIds?.includes(kelas.id);
                  return (
                    <CommandItem
                      key={kelas.id}
                      value={`${kelas.nama} ${kelas.tingkat || ""}`.trim()}
                      onSelect={() => toggleKelas(kelas.id)}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          selected ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      <div className="flex flex-col">
                        <span>{kelas.nama}</span>
                        {kelas.tingkat ? (
                          <span className="text-xs text-muted-foreground">
                            Tingkat {kelas.tingkat}
                          </span>
                        ) : null}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

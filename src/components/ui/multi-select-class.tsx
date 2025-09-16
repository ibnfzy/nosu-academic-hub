import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
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
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandGroup>
              {classes.map((kelas) => {
                const selected = subjectForm.kelasIds?.includes(kelas.id);
                return (
                  <CommandItem
                    key={kelas.id}
                    onSelect={() => toggleKelas(kelas.id)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selected ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    {kelas.nama}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

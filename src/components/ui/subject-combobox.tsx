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

const SUBJECT_STORAGE_KEY = "akademik_subjects";

type SubjectLike =
  | string
  | number
  | {
      id?: string | number | null;
      subjectId?: string | number | null;
      value?: string | number | null;
      kode?: string | number | null;
      code?: string | number | null;
      subjectCode?: string | number | null;
      nama?: string | null;
      name?: string | null;
      subjectNama?: string | null;
      label?: string | null;
      [key: string]: unknown;
    };

type NormalizedSubjectOption = {
  id: string;
  label: string;
  kode?: string;
  nama?: string;
  searchValue: string;
};

interface SubjectComboboxProps {
  subjects: SubjectLike[];
  value?: string | null;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  popoverClassName?: string;
}

const toTrimmedString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
};

const resolveSubjectId = (subject: SubjectLike | Record<string, unknown>): string => {
  if (subject === null || subject === undefined) {
    return "";
  }

  if (typeof subject === "string" || typeof subject === "number") {
    const candidate = String(subject).trim();
    return candidate;
  }

  const {
    id,
    subjectId,
    value,
    kode,
    code,
    subjectCode,
  } = subject as Record<string, unknown>;

  const candidates = [id, subjectId, value, kode, code, subjectCode];
  for (const candidate of candidates) {
    const normalized = toTrimmedString(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return "";
};

const resolveSubjectKode = (subject: SubjectLike | Record<string, unknown>): string => {
  if (!subject || typeof subject !== "object") {
    return "";
  }

  const { kode, code, subjectCode } = subject as Record<string, unknown>;
  return toTrimmedString(kode ?? code ?? subjectCode);
};

const resolveSubjectNama = (subject: SubjectLike | Record<string, unknown>): string => {
  if (!subject || typeof subject !== "object") {
    return "";
  }

  const { nama, name, subjectNama, label, title } = subject as Record<string, unknown>;
  return toTrimmedString(nama ?? name ?? subjectNama ?? label ?? title);
};

const formatSubjectLabel = (kode: string, nama: string, fallback: string): string => {
  if (kode && nama) {
    return `${kode} • ${nama}`;
  }

  if (nama) {
    return nama;
  }

  if (kode) {
    return kode;
  }

  return fallback;
};

const normalizeSubject = (
  subject: SubjectLike,
  fallbackRecord?: Record<string, unknown>
): NormalizedSubjectOption | null => {
  const id = resolveSubjectId(subject);
  if (!id) {
    return null;
  }

  const kode = toTrimmedString(
    resolveSubjectKode(subject) || resolveSubjectKode(fallbackRecord || {})
  );
  const nama = toTrimmedString(
    resolveSubjectNama(subject) || resolveSubjectNama(fallbackRecord || {})
  );
  const label = formatSubjectLabel(kode, nama, id);
  const searchValue = [kode, nama, id].filter(Boolean).join(" ");

  return {
    id,
    label,
    kode: kode || undefined,
    nama: nama || undefined,
    searchValue,
  };
};

const loadStoredSubjects = (): Record<string, unknown>[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SUBJECT_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse stored subjects", error);
    return [];
  }
};

export function SubjectCombobox({
  subjects,
  value,
  onValueChange,
  placeholder = "Pilih mata pelajaran",
  emptyMessage = "Tidak ada mata pelajaran ditemukan",
  disabled = false,
  className,
  popoverClassName,
}: SubjectComboboxProps) {
  const [open, setOpen] = useState(false);

  const storedSubjects = useMemo(() => loadStoredSubjects(), []);

  const storedSubjectsMap = useMemo(() => {
    return storedSubjects.reduce((map, record) => {
      const id = resolveSubjectId(record);
      if (id) {
        map.set(id, record as Record<string, unknown>);
      }
      return map;
    }, new Map<string, Record<string, unknown>>());
  }, [storedSubjects]);

  const normalizedSubjects = useMemo(() => {
    const unique = new Map<string, NormalizedSubjectOption>();

    subjects.forEach((subject) => {
      const normalized = normalizeSubject(
        subject,
        storedSubjectsMap.get(resolveSubjectId(subject))
      );

      if (normalized) {
        unique.set(normalized.id, normalized);
      }
    });

    // Tambahkan fallback dari localStorage jika belum ada dalam daftar
    storedSubjectsMap.forEach((record, id) => {
      if (!unique.has(id)) {
        const normalized = normalizeSubject(record);
        if (normalized) {
          unique.set(id, normalized);
        }
      }
    });

    return Array.from(unique.values()).sort((a, b) => {
      return a.label.localeCompare(b.label, "id");
    });
  }, [subjects, storedSubjectsMap]);

  const selectedSubject = useMemo(() => {
    if (!value) {
      return null;
    }

    return (
      normalizedSubjects.find((subject) => subject.id === value) ||
      normalizeSubject(storedSubjectsMap.get(value) || value)
    );
  }, [normalizedSubjects, storedSubjectsMap, value]);

  const handleSelect = (nextValue: string) => {
    setOpen(false);
    if (nextValue !== value) {
      onValueChange(nextValue);
    }
  };

  const triggerLabel = selectedSubject?.label || placeholder;

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (!disabled) {
          setOpen(nextOpen);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={selectedSubject?.label || placeholder}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <span className="truncate text-left">
            {triggerLabel}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[280px] p-0", popoverClassName)} align="start">
        <Command>
          <CommandInput placeholder="Cari berdasarkan kode atau nama..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {normalizedSubjects.map((subject) => {
                const isSelected = subject.id === value;
                return (
                  <CommandItem
                    key={subject.id}
                    value={subject.searchValue}
                    onSelect={() => handleSelect(subject.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{subject.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export type { SubjectLike, SubjectComboboxProps };

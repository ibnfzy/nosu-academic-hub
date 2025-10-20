import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { Loader2 } from "lucide-react";

type EnforcementMode = "strict" | "relaxed";

type SemesterInfo = {
  id?: string | number;
  tahunAjaran?: string;
  tahun?: string;
  semester?: number | string | null;
  startDate?: string | null;
  endDate?: string | null;
  tanggalMulai?: string | null;
  tanggalSelesai?: string | null;
  activatedAt?: string | null;
  [key: string]: unknown;
} | null;

type RawSemesterEnforcementResponse = {
  mode?: string;
  activationDate?: string | null;
  activeDate?: string | null;
  activeSemester?: SemesterInfo;
  data?: RawSemesterEnforcementResponse;
  success?: boolean;
  message?: string;
  [key: string]: unknown;
} | null;

interface NormalizedSettings {
  mode: EnforcementMode;
  activationDate: string;
  rawActivationDate: string | null;
  activeSemester: SemesterInfo;
}

const MODE_OPTIONS: { value: EnforcementMode; label: string; description: string }[] = [
  {
    value: "strict",
    label: "Ketat (Strict)",
    description:
      "Hanya semester aktif yang dapat digunakan. Tentukan tanggal mulai penegakan.",
  },
  {
    value: "relaxed",
    label: "Fleksibel (Relaxed)",
    description:
      "Pengguna dapat memilih semester secara manual tanpa pembatasan tambahan.",
  },
];

const DEFAULT_SETTINGS: NormalizedSettings = {
  mode: "relaxed",
  activationDate: "",
  rawActivationDate: null,
  activeSemester: null,
};

const toDateInputValue = (value?: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const iso = date.toISOString();
  return iso.slice(0, 10);
};

const formatDateForDisplay = (value?: string | null): string => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const getSemesterLabel = (value?: number | string | null): string => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return String(value);
  }
  if (numeric === 1) return "1 (Ganjil)";
  if (numeric === 2) return "2 (Genap)";
  return `${numeric}`;
};

const normalizeSettings = (
  response: RawSemesterEnforcementResponse
): NormalizedSettings => {
  if (!response) {
    return DEFAULT_SETTINGS;
  }

  const payload =
    response && typeof response === "object" && "data" in response
      ? (response.data as RawSemesterEnforcementResponse) ?? response
      : response;

  if (!payload || typeof payload !== "object") {
    return DEFAULT_SETTINGS;
  }

  const rawMode =
    typeof payload.mode === "string" ? payload.mode.toLowerCase() : "";
  const mode: EnforcementMode = rawMode === "strict" ? "strict" : "relaxed";

  const rawActiveSemester =
    payload.activeSemester && typeof payload.activeSemester === "object"
      ? (payload.activeSemester as SemesterInfo)
      : null;

  const rawActivationDate =
    (typeof payload.activationDate === "string" && payload.activationDate) ||
    (typeof payload.activeDate === "string" && payload.activeDate) ||
    (rawActiveSemester &&
    typeof rawActiveSemester?.activatedAt === "string" &&
    rawActiveSemester.activatedAt
      ? rawActiveSemester.activatedAt
      : null);

  return {
    mode,
    activationDate: toDateInputValue(rawActivationDate),
    rawActivationDate: rawActivationDate ?? null,
    activeSemester: rawActiveSemester,
  };
};

const SemesterEnforcementSettings = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<EnforcementMode>(DEFAULT_SETTINGS.mode);
  const [activationDate, setActivationDate] = useState<string>(
    DEFAULT_SETTINGS.activationDate
  );
  const [activeSemester, setActiveSemester] = useState<SemesterInfo>(
    DEFAULT_SETTINGS.activeSemester
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const activeModeDescription = useMemo(() => {
    const current = MODE_OPTIONS.find((option) => option.value === mode);
    return current?.description ?? "";
  }, [mode]);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getSemesterEnforcementSettings();
      if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        response.success === false
      ) {
        const message =
          typeof response.message === "string"
            ? response.message
            : "Gagal memuat pengaturan semester.";
        throw new Error(message);
      }
      const normalized = normalizeSettings(response as RawSemesterEnforcementResponse);
      setMode(normalized.mode);
      setActivationDate(normalized.activationDate);
      setActiveSemester(normalized.activeSemester);
    } catch (error) {
      console.error("Failed to load semester enforcement settings", error);
      toast({
        title: "Gagal memuat pengaturan",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengambil pengaturan semester.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!MODE_OPTIONS.some((option) => option.value === mode)) {
      toast({
        title: "Mode tidak valid",
        description: "Silakan pilih mode penegakan semester yang tersedia.",
        variant: "destructive",
      });
      return;
    }

    let isoActivationDate: string | undefined;

    if (mode === "strict") {
      if (!activationDate) {
        toast({
          title: "Tanggal wajib diisi",
          description:
            "Pilih tanggal mulai penegakan semester untuk mode ketat.",
          variant: "destructive",
        });
        return;
      }

      const parsedDate = new Date(activationDate);
      if (Number.isNaN(parsedDate.getTime())) {
        toast({
          title: "Tanggal tidak valid",
          description:
            "Format tanggal tidak valid. Silakan pilih tanggal yang sesuai.",
          variant: "destructive",
        });
        return;
      }

      isoActivationDate = parsedDate.toISOString();
    }

    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = { mode };
      if (isoActivationDate) {
        payload.activationDate = isoActivationDate;
      }

      const response = await apiService.updateSemesterEnforcementSettings(
        payload
      );

      if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        response.success === false
      ) {
        const message =
          typeof response.message === "string"
            ? response.message
            : "Gagal menyimpan pengaturan semester.";
        throw new Error(message);
      }

      const normalized = normalizeSettings(
        (response as RawSemesterEnforcementResponse) ?? null
      );
      setMode(normalized.mode);
      setActivationDate(normalized.activationDate);
      setActiveSemester(normalized.activeSemester);

      const successMessage =
        response &&
        typeof response === "object" &&
        "message" in response &&
        typeof response.message === "string"
          ? response.message
          : "Pengaturan semester berhasil disimpan.";

      toast({
        title: "Berhasil",
        description: successMessage,
      });
    } catch (error) {
      console.error("Failed to save semester enforcement settings", error);
      toast({
        title: "Gagal menyimpan pengaturan",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menyimpan pengaturan semester.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Pengaturan Penegakan Semester</CardTitle>
        <CardDescription>
          Atur mode penegakan semester aktif untuk seluruh pengguna sistem.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat pengaturan semester...
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="enforcement-mode">Mode Penegakan</Label>
              <Select
                value={mode}
                onValueChange={(value) =>
                  setMode(value as EnforcementMode)
                }
              >
                <SelectTrigger id="enforcement-mode">
                  <SelectValue placeholder="Pilih mode penegakan" />
                </SelectTrigger>
                <SelectContent>
                  {MODE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeModeDescription && (
                <p className="text-sm text-muted-foreground">
                  {activeModeDescription}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="activation-date">
                Tanggal Mulai Penegakan
              </Label>
              <Input
                id="activation-date"
                type="date"
                value={activationDate}
                onChange={(event) => setActivationDate(event.target.value)}
                disabled={mode !== "strict"}
              />
              <p className="text-sm text-muted-foreground">
                Tanggal ini menentukan kapan semester aktif mulai diterapkan
                secara otomatis.{" "}
                {mode !== "strict" &&
                  "Aktifkan mode ketat untuk mengatur tanggal penegakan."}
              </p>
            </div>

            <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Semester Aktif Saat Ini
              </h3>
              {activeSemester ? (
                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Tahun Ajaran</dt>
                    <dd className="font-medium">
                      {activeSemester?.tahunAjaran ||
                        activeSemester?.tahun ||
                        "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Semester</dt>
                    <dd className="font-medium">
                      {getSemesterLabel(activeSemester?.semester)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Tanggal Mulai</dt>
                    <dd className="font-medium">
                      {formatDateForDisplay(
                        activeSemester?.startDate ??
                          activeSemester?.tanggalMulai ??
                          null
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Tanggal Selesai</dt>
                    <dd className="font-medium">
                      {formatDateForDisplay(
                        activeSemester?.endDate ??
                          activeSemester?.tanggalSelesai ??
                          null
                      )}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">Aktif Sejak</dt>
                    <dd className="font-medium">
                      {formatDateForDisplay(activeSemester?.activatedAt ?? null)}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada semester aktif yang ditetapkan melalui penegakan
                  otomatis.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Pengaturan
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default SemesterEnforcementSettings;

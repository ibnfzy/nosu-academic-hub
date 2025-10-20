import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  type DashboardSemesterMetadata,
  type DashboardSemesterRecord,
  useDashboardSemester,
} from "@/hooks/use-dashboard-semester";
import apiService from "@/services/apiService";

type EnforcementMode = "strict" | "relaxed";

type RawSemesterEnforcementResponse = {
  mode?: string;
  activationDate?: string | null;
  activeDate?: string | null;
  activeSemester?: DashboardSemesterRecord | null;
  data?: RawSemesterEnforcementResponse | null;
  success?: boolean;
  message?: string;
  [key: string]: unknown;
} | null;

interface NormalizedSemesterEnforcementSettings {
  mode: EnforcementMode;
  activationDate: string | null;
  activeSemester: DashboardSemesterRecord | null;
}

interface UseSemesterEnforcementValue {
  mode: EnforcementMode;
  activationDate: string | null;
  isStrictMode: boolean;
  isStrictModeActive: boolean;
  isRelaxedMode: boolean;
  activeSemesterRecord: DashboardSemesterRecord | null;
  activeSemesterMetadata: DashboardSemesterMetadata | null;
  hasActiveSemester: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  shouldAttachSemesterId: (semesterId?: string | number | null) => boolean;
  isSemesterExpired: (
    metadata?: DashboardSemesterMetadata | null,
    referenceDate?: Date
  ) => boolean;
}

const DEFAULT_SETTINGS: NormalizedSemesterEnforcementSettings = {
  mode: "relaxed",
  activationDate: null,
  activeSemester: null,
};

const toDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const normalizeSettings = (
  response: RawSemesterEnforcementResponse
): NormalizedSemesterEnforcementSettings => {
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

  const activeSemester =
    payload.activeSemester && typeof payload.activeSemester === "object"
      ? (payload.activeSemester as DashboardSemesterRecord)
      : null;

  const activationDate =
    (typeof payload.activationDate === "string" && payload.activationDate) ||
    (typeof payload.activeDate === "string" && payload.activeDate) ||
    (activeSemester && typeof activeSemester?.activatedAt === "string"
      ? (activeSemester.activatedAt as string)
      : null);

  return {
    mode,
    activationDate,
    activeSemester,
  };
};

const useSemesterEnforcement = (): UseSemesterEnforcementValue => {
  const { normalizeSemesterMetadata } = useDashboardSemester();

  const [mode, setMode] = useState<EnforcementMode>(DEFAULT_SETTINGS.mode);
  const [activationDate, setActivationDate] = useState<string | null>(
    DEFAULT_SETTINGS.activationDate
  );
  const [activeSemesterRecord, setActiveSemesterRecord] =
    useState<DashboardSemesterRecord | null>(DEFAULT_SETTINGS.activeSemester);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (typeof apiService.getSemesterEnforcementSettings !== "function") {
        throw new Error("Semester enforcement API tidak tersedia.");
      }
      const response = await apiService.getSemesterEnforcementSettings();
      const normalized = normalizeSettings(
        response as RawSemesterEnforcementResponse
      );
      if (!isMountedRef.current) {
        return;
      }
      setMode(normalized.mode);
      setActivationDate(normalized.activationDate);
      setActiveSemesterRecord(normalized.activeSemester);
    } catch (err) {
      console.error("Failed to load semester enforcement settings", err);
      if (!isMountedRef.current) {
        return;
      }
      const message =
        err instanceof Error
          ? err.message
          : "Gagal memuat pengaturan penegakan semester.";
      setError(message);
      setMode(DEFAULT_SETTINGS.mode);
      setActivationDate(DEFAULT_SETTINGS.activationDate);
      setActiveSemesterRecord(DEFAULT_SETTINGS.activeSemester);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadSettings();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadSettings]);

  const activeSemesterMetadata = useMemo(
    () => normalizeSemesterMetadata(activeSemesterRecord),
    [activeSemesterRecord, normalizeSemesterMetadata]
  );

  const hasActiveSemester = Boolean(activeSemesterMetadata?.id);

  const activationDateObject = useMemo(() => toDate(activationDate), [
    activationDate,
  ]);

  const isStrictMode = mode === "strict";
  const isRelaxedMode = mode === "relaxed";
  const isStrictModeActive = useMemo(() => {
    if (!isStrictMode) return false;
    if (!activationDateObject) return true;
    const now = new Date();
    return now.getTime() >= activationDateObject.getTime();
  }, [activationDateObject, isStrictMode]);

  const shouldAttachSemesterId = useCallback(
    (semesterId?: string | number | null) => {
      if (!isStrictModeActive) return false;
      const candidate =
        semesterId !== undefined && semesterId !== null && semesterId !== ""
          ? String(semesterId)
          : null;
      if (candidate) return true;
      if (activeSemesterMetadata?.id) {
        return true;
      }
      return false;
    },
    [activeSemesterMetadata?.id, isStrictModeActive]
  );

  const isSemesterExpired = useCallback(
    (
      metadata: DashboardSemesterMetadata | null = activeSemesterMetadata,
      referenceDate: Date = new Date()
    ) => {
      if (!metadata) return false;
      const rawEndDate = metadata.tanggalSelesai;
      if (!rawEndDate) return false;
      const parsedEndDate = toDate(rawEndDate);
      if (!parsedEndDate) return false;
      const endOfDay = new Date(parsedEndDate);
      endOfDay.setHours(23, 59, 59, 999);
      return endOfDay.getTime() < referenceDate.getTime();
    },
    [activeSemesterMetadata]
  );

  return {
    mode,
    activationDate,
    isStrictMode,
    isStrictModeActive,
    isRelaxedMode,
    activeSemesterRecord,
    activeSemesterMetadata,
    hasActiveSemester,
    loading,
    error,
    refresh: loadSettings,
    shouldAttachSemesterId,
    isSemesterExpired,
  };
};

export type UseSemesterEnforcementReturn = UseSemesterEnforcementValue;

export { useSemesterEnforcement };


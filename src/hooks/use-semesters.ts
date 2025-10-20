import { useCallback, useMemo } from "react";
import {
  useDashboardSemester,
  type DashboardSemesterMetadata,
  type DashboardSemesterRecord,
} from "@/hooks/use-dashboard-semester";

const isValidSemesterId = (
  value: string | number | null | undefined
): value is string | number => value !== null && value !== undefined && value !== "";

const coerceSemesterId = (value: string | number): string => String(value);

export type UseSemestersParams = {
  semesters?: DashboardSemesterRecord[];
  selectedSemesterId?: string | number | null;
};

export const useSemesters = (params: UseSemestersParams = {}) => {
  const { semesters = [], selectedSemesterId = null } = params;

  const {
    normalizeSemesterMetadata,
    resolveSemesterMetadata,
    buildSemesterLabel,
    buildSemesterTitle,
    buildSemesterPeriodLabel,
  } = useDashboardSemester({ semesters });

  const activeSemesterId = useMemo(() => {
    const activeSemester = semesters.find(
      (item) => isValidSemesterId(item?.id) && Boolean(item?.isActive)
    );
    return activeSemester && isValidSemesterId(activeSemester.id)
      ? coerceSemesterId(activeSemester.id)
      : "";
  }, [semesters]);

  const singleSemesterId = useMemo(() => {
    if (semesters.length !== 1) return "";
    const [onlySemester] = semesters;
    return onlySemester && isValidSemesterId(onlySemester.id)
      ? coerceSemesterId(onlySemester.id)
      : "";
  }, [semesters]);

  const fallbackSemesterId = useMemo(() => {
    const fallback = semesters.find((item) => isValidSemesterId(item?.id));
    return fallback && isValidSemesterId(fallback.id)
      ? coerceSemesterId(fallback.id)
      : "";
  }, [semesters]);

  const getEffectiveSemesterId = useCallback(
    (customId?: string | number | null): string => {
      if (isValidSemesterId(customId)) return coerceSemesterId(customId);
      if (isValidSemesterId(selectedSemesterId)) {
        return coerceSemesterId(selectedSemesterId);
      }
      if (activeSemesterId) return activeSemesterId;
      if (singleSemesterId) return singleSemesterId;
      if (fallbackSemesterId) return fallbackSemesterId;
      return "";
    },
    [
      activeSemesterId,
      fallbackSemesterId,
      selectedSemesterId,
      singleSemesterId,
    ]
  );

  const getEffectiveSemesterMetadata = useCallback(
    (
      customId?: string | number | null,
      fallback?: DashboardSemesterRecord | null
    ): DashboardSemesterMetadata | null => {
      const effectiveId = getEffectiveSemesterId(customId);
      if (effectiveId) {
        return resolveSemesterMetadata(effectiveId, fallback ?? null);
      }
      if (fallback) {
        return normalizeSemesterMetadata(fallback);
      }
      return null;
    },
    [getEffectiveSemesterId, normalizeSemesterMetadata, resolveSemesterMetadata]
  );

  return {
    normalizeSemesterMetadata,
    resolveSemesterMetadata,
    buildSemesterLabel,
    buildSemesterTitle,
    buildSemesterPeriodLabel,
    getEffectiveSemesterId,
    getEffectiveSemesterMetadata,
  };
};

export type UseSemestersReturn = ReturnType<typeof useSemesters>;

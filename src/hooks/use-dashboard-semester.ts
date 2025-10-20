import { useCallback } from "react";
import { formatAcademicPeriod, formatDate } from "@/utils/helpers";

export type DashboardSemesterRecord = {
  id?: string | number;
  tahunAjaran?: string | null;
  tahun?: string | null;
  academicYear?: string | null;
  year?: string | null;
  semester?: number | string | null;
  semesterNumber?: number | string | null;
  term?: number | string | null;
  tanggalMulai?: string | null;
  startDate?: string | null;
  tanggalSelesai?: string | null;
  endDate?: string | null;
  jumlahHariBelajar?: number | string | null;
  learningDays?: number | string | null;
  totalSchoolDays?: number | string | null;
  hariEfektif?: number | string | null;
  catatan?: string | null;
  notes?: string | null;
  keterangan?: string | null;
  isActive?: boolean;
  label?: string | null;
};

export type DashboardSemesterMetadata = {
  id: string | null;
  tahunAjaran: string | null;
  semesterNumber: number | string | null;
  tanggalMulai: string | null;
  tanggalSelesai: string | null;
  jumlahHariBelajar: number | string | null;
  catatan: string;
  isActive: boolean;
};

interface UseDashboardSemesterParams {
  semesters?: DashboardSemesterRecord[];
}

export const useDashboardSemester = (
  params: UseDashboardSemesterParams = {}
) => {
  const { semesters = [] } = params;

  const normalizeSemesterMetadata = useCallback(
    (
      semesterItem?: DashboardSemesterRecord | null
    ): DashboardSemesterMetadata | null => {
      if (!semesterItem) return null;

      const rawSemester =
        semesterItem.semester ??
        semesterItem.semesterNumber ??
        semesterItem.term ??
        null;

      let semesterNumber: number | string | null = null;
      if (rawSemester !== null && rawSemester !== undefined) {
        const numericValue = Number(rawSemester);
        semesterNumber = Number.isNaN(numericValue) ? rawSemester : numericValue;
      }

      return {
        id: semesterItem.id !== undefined && semesterItem.id !== null
          ? String(semesterItem.id)
          : null,
        tahunAjaran:
          semesterItem.tahunAjaran ??
          semesterItem.tahun ??
          semesterItem.academicYear ??
          semesterItem.year ??
          null,
        semesterNumber,
        tanggalMulai: semesterItem.tanggalMulai ?? semesterItem.startDate ?? null,
        tanggalSelesai: semesterItem.tanggalSelesai ?? semesterItem.endDate ?? null,
        jumlahHariBelajar:
          semesterItem.jumlahHariBelajar ??
          semesterItem.learningDays ??
          semesterItem.totalSchoolDays ??
          semesterItem.hariEfektif ??
          null,
        catatan:
          semesterItem.catatan ??
          semesterItem.notes ??
          semesterItem.keterangan ??
          "",
        isActive: Boolean(semesterItem.isActive),
      };
    },
    []
  );

  const formatSemesterNumberLabel = useCallback(
    (value: number | string | null | undefined): string | null => {
      if (value === null || value === undefined || value === "") return null;

      const numericValue = Number(value);
      if (!Number.isNaN(numericValue)) {
        if (numericValue === 1) return "Semester Ganjil";
        if (numericValue === 2) return "Semester Genap";
        return `Semester ${numericValue}`;
      }

      return typeof value === "string" ? value : null;
    },
    []
  );

  const buildSemesterTitle = useCallback(
    (
      metadata: DashboardSemesterMetadata | null,
      includeActiveFlag = false
    ): string => {
      if (!metadata) return "Semester";

      const parts: string[] = [];

      if (metadata.tahunAjaran) {
        parts.push(metadata.tahunAjaran);
      }

      const semesterLabel = formatSemesterNumberLabel(metadata.semesterNumber);
      if (semesterLabel) {
        parts.push(semesterLabel);
      }

      const baseLabel = parts.join(" - ") || "Semester";
      const suffix = includeActiveFlag && metadata.isActive ? " (Aktif)" : "";
      return `${baseLabel}${suffix}`;
    },
    [formatSemesterNumberLabel]
  );

  const buildSemesterDateRange = useCallback(
    (metadata: DashboardSemesterMetadata | null): string | null => {
      if (!metadata) return null;
      if (!metadata.tanggalMulai || !metadata.tanggalSelesai) return null;
      return `${formatDate(metadata.tanggalMulai)} - ${formatDate(
        metadata.tanggalSelesai
      )}`;
    },
    []
  );

  const formatStudyDays = useCallback(
    (metadata: DashboardSemesterMetadata | null): string => {
      if (!metadata || metadata.jumlahHariBelajar === null) return "-";
      const numericValue = Number(metadata.jumlahHariBelajar);
      if (!Number.isNaN(numericValue)) {
        return `${numericValue} hari`;
      }
      return String(metadata.jumlahHariBelajar);
    },
    []
  );

  const buildSemesterLabel = useCallback(
    (semesterItem: DashboardSemesterRecord | null): string | null => {
      if (!semesterItem) return null;

      const explicitLabel =
        typeof semesterItem.label === "string" && semesterItem.label.trim()
          ? semesterItem.label
          : null;
      if (explicitLabel) {
        return explicitLabel;
      }

      const metadata = normalizeSemesterMetadata(semesterItem);
      if (!metadata) return null;

      if (
        !metadata.tahunAjaran &&
        (metadata.semesterNumber === null || metadata.semesterNumber === undefined)
      ) {
        return null;
      }

      return formatAcademicPeriod(metadata);
    },
    [normalizeSemesterMetadata]
  );

  const getSemesterRecordById = useCallback(
    (semesterId: string | number | null): DashboardSemesterRecord | null => {
      if (!semesterId) return null;
      return (
        semesters.find((item) => String(item.id) === String(semesterId)) || null
      );
    },
    [semesters]
  );

  const resolveSemesterMetadata = useCallback(
    (
      semesterId: string | number | null,
      fallback?: DashboardSemesterRecord | null
    ): DashboardSemesterMetadata | null => {
      const record = getSemesterRecordById(semesterId) || fallback || null;
      return normalizeSemesterMetadata(record);
    },
    [getSemesterRecordById, normalizeSemesterMetadata]
  );

  const getSemesterLabelById = useCallback(
    (
      semesterId: string | number | null,
      fallback?: DashboardSemesterRecord | null
    ): string => {
      const label =
        buildSemesterLabel(getSemesterRecordById(semesterId)) ||
        buildSemesterLabel(fallback || null);

      return label ?? "-";
    },
    [buildSemesterLabel, getSemesterRecordById]
  );

  const getSemesterOptionLabel = useCallback(
    (semesterItem: DashboardSemesterRecord | null): string => {
      const metadata = normalizeSemesterMetadata(semesterItem);
      if (!metadata) return "Semester";

      const baseLabel = buildSemesterTitle(metadata, true);
      const dateRange = buildSemesterDateRange(metadata);
      return dateRange ? `${baseLabel} (${dateRange})` : baseLabel;
    },
    [buildSemesterTitle, buildSemesterDateRange, normalizeSemesterMetadata]
  );

  const buildSemesterPeriodLabel = useCallback(
    (metadata: DashboardSemesterMetadata | null): string => {
      if (!metadata) return "-";

      const numericValue =
        metadata.semesterNumber !== null && metadata.semesterNumber !== undefined
          ? Number(metadata.semesterNumber)
          : Number.NaN;
      const hasNumericSemester = !Number.isNaN(numericValue);

      if (metadata.tahunAjaran && hasNumericSemester) {
        return formatAcademicPeriod(metadata.tahunAjaran, numericValue);
      }

      return buildSemesterTitle(metadata);
    },
    [buildSemesterTitle]
  );

  return {
    normalizeSemesterMetadata,
    buildSemesterTitle,
    buildSemesterDateRange,
    formatStudyDays,
    buildSemesterLabel,
    getSemesterLabelById,
    resolveSemesterMetadata,
    getSemesterOptionLabel,
    buildSemesterPeriodLabel,
  };
};

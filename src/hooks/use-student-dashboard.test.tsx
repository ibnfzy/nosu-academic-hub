import { act, renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import apiService from "@/services/apiService";
import { printReport } from "@/utils/helpers";
import { useStudentDashboard } from "./use-student-dashboard";

const mockToast = vi.fn();

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/services/apiService", () => ({
  default: {
    getSemesters: vi.fn(),
    getStudentGrades: vi.fn(),
    getStudentAttendance: vi.fn(),
    getStudentReport: vi.fn(),
  },
}));

vi.mock("@/utils/helpers", async () => {
  const actual = await vi.importActual<typeof import("@/utils/helpers")>(
    "@/utils/helpers"
  );
  return {
    ...actual,
    printReport: vi.fn(),
  };
});

const mockSemesters = [
  {
    id: "1",
    tahunAjaran: "2024/2025",
    semester: 1,
    isActive: true,
    tanggalMulai: "2024-07-01",
    tanggalSelesai: "2024-12-31",
    jumlahHariBelajar: 120,
  },
];

const mockGrades = [
  {
    id: 1,
    studentId: 1,
    kelasId: 1,
    subjectId: 10,
    teacherId: 99,
    tahunAjaran: "2024/2025",
    semester: 1,
    tanggal: "2024-08-15",
    subjectName: "Matematika",
    jenis: "UTS",
    verified: 1,
    nilai: 90,
  },
];

const mockAttendance = [
  {
    id: 1,
    subjectName: "Matematika",
    tanggal: "2024-08-16",
    status: "hadir",
  },
];

describe("useStudentDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads semesters and student data", async () => {
    vi.mocked(apiService.getSemesters).mockResolvedValue(mockSemesters);
    vi.mocked(apiService.getStudentGrades).mockResolvedValue(mockGrades);
    vi.mocked(apiService.getStudentAttendance).mockResolvedValue(mockAttendance);

    const { result } = renderHook(() =>
      useStudentDashboard({ currentUser: { id: 1, nama: "Budi" } })
    );

    await waitFor(() => expect(result.current.grades).toHaveLength(1));

    expect(result.current.selectedSemesterId).toBe("1");
    expect(result.current.averageGrade).toBe(90);
    expect(result.current.attendanceStats.hadir).toBe(1);
  });

  it("prints raport with resolved metadata", async () => {
    vi.mocked(apiService.getSemesters).mockResolvedValue(mockSemesters);
    vi.mocked(apiService.getStudentGrades).mockResolvedValue(mockGrades);
    vi.mocked(apiService.getStudentAttendance).mockResolvedValue(mockAttendance);
    vi.mocked(apiService.getStudentReport).mockResolvedValue({
      semesterId: "1",
      semesterInfo: mockSemesters[0],
    });

    const { result } = renderHook(() =>
      useStudentDashboard({ currentUser: { id: 1, nama: "Budi" } })
    );

    await waitFor(() => expect(result.current.selectedSemesterId).toBe("1"));

    await act(async () => {
      await result.current.handlePrintReport();
    });

    expect(printReport).toHaveBeenCalledTimes(1);
    expect(printReport).toHaveBeenCalledWith(
      expect.objectContaining({
        semesterInfo: expect.objectContaining({ tahunAjaran: "2024/2025" }),
      })
    );
  });

  it("menampilkan pesan ketika semester aktif belum ditetapkan saat memuat data", async () => {
    const error = { code: "ACTIVE_SEMESTER_NOT_FOUND" } as const;
    vi.mocked(apiService.getSemesters).mockResolvedValue(mockSemesters);
    vi.mocked(apiService.getStudentGrades).mockRejectedValue(error);
    vi.mocked(apiService.getStudentAttendance).mockResolvedValue(mockAttendance);

    const { result } = renderHook(() =>
      useStudentDashboard({ currentUser: { id: 1, nama: "Budi" } })
    );

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description:
            "Belum ada semester aktif yang ditetapkan. Silakan pilih semester aktif terlebih dahulu.",
        })
      )
    );

    expect(result.current.semesterError).toBe(
      "Belum ada semester aktif yang ditetapkan. Silakan pilih semester aktif terlebih dahulu."
    );
    expect(result.current.grades).toHaveLength(0);
    expect(result.current.attendance).toHaveLength(0);
  });

  it("menampilkan pesan ketika semester belum aktif saat memuat data", async () => {
    const error = { code: "SEMESTER_NOT_ACTIVE" } as const;
    vi.mocked(apiService.getSemesters).mockResolvedValue(mockSemesters);
    vi.mocked(apiService.getStudentGrades).mockRejectedValue(error);
    vi.mocked(apiService.getStudentAttendance).mockResolvedValue(mockAttendance);

    const { result } = renderHook(() =>
      useStudentDashboard({ currentUser: { id: 1, nama: "Budi" } })
    );

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description:
            "Semester yang dipilih belum aktif. Silakan gunakan semester aktif yang berlaku.",
        })
      )
    );

    expect(result.current.semesterError).toBe(
      "Semester yang dipilih belum aktif. Silakan gunakan semester aktif yang berlaku."
    );
    expect(result.current.grades).toHaveLength(0);
    expect(result.current.attendance).toHaveLength(0);
  });

  it("menampilkan pesan saat cetak raport diblokir karena semester belum aktif", async () => {
    const error = { code: "SEMESTER_NOT_ACTIVE" } as const;
    vi.mocked(apiService.getSemesters).mockResolvedValue(mockSemesters);
    vi.mocked(apiService.getStudentGrades).mockResolvedValue(mockGrades);
    vi.mocked(apiService.getStudentAttendance).mockResolvedValue(mockAttendance);
    vi.mocked(apiService.getStudentReport).mockRejectedValue(error);

    const { result } = renderHook(() =>
      useStudentDashboard({ currentUser: { id: 1, nama: "Budi" } })
    );

    await waitFor(() => expect(result.current.selectedSemesterId).toBe("1"));

    await act(async () => {
      await result.current.handlePrintReport();
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        description:
          "Semester yang dipilih belum aktif. Cetak raport hanya bisa dilakukan pada semester aktif.",
      })
    );
  });
});

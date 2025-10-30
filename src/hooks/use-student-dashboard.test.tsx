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
    getSemesterEnforcementSettings: vi.fn(),
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
    tanggalMulai: "2099-07-01",
    tanggalSelesai: "2099-12-31",
    jumlahHariBelajar: 120,
  },
];

const relaxedSettings = {
  mode: "relaxed",
  activationDate: null,
  activeSemester: mockSemesters[0],
};

const baseCurrentUser = { id: 1, studentId: 42, nama: "Budi" } as const;

const mockGrades = [
  {
    id: 1,
    studentId: 42,
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
    vi
      .mocked(apiService.getSemesterEnforcementSettings)
      .mockResolvedValue(relaxedSettings);
  });

  it("loads semesters and student data", async () => {
    vi.mocked(apiService.getSemesters).mockResolvedValue(mockSemesters);
    vi.mocked(apiService.getStudentGrades).mockResolvedValue(mockGrades);
    vi.mocked(apiService.getStudentAttendance).mockResolvedValue(mockAttendance);

    const { result } = renderHook(() =>
      useStudentDashboard({ currentUser: baseCurrentUser })
    );

    await waitFor(() => expect(result.current.grades).toHaveLength(1));

    expect(result.current.selectedSemesterId).toBe("1");
    expect(result.current.averageGrade).toBe(90);
    expect(result.current.attendanceStats.hadir).toBe(1);
  });

  it("uses studentId from the authenticated user when fetching data", async () => {
    vi.mocked(apiService.getSemesters).mockResolvedValue(mockSemesters);
    vi.mocked(apiService.getStudentGrades).mockResolvedValue(mockGrades);
    vi.mocked(apiService.getStudentAttendance).mockResolvedValue(mockAttendance);

    renderHook(() => useStudentDashboard({ currentUser: baseCurrentUser }));

    await waitFor(() =>
      expect(apiService.getStudentGrades).toHaveBeenCalledTimes(1)
    );

    const [calledStudentId] = vi.mocked(apiService.getStudentGrades).mock.calls[0];
    expect(calledStudentId).toBe(baseCurrentUser.studentId);
  });

  it("falls back to user id when studentId is unavailable", async () => {
    const fallbackUser = { id: 7, nama: "Budi" } as const;
    vi.mocked(apiService.getSemesters).mockResolvedValue(mockSemesters);
    vi.mocked(apiService.getStudentGrades).mockResolvedValue(mockGrades);
    vi.mocked(apiService.getStudentAttendance).mockResolvedValue(mockAttendance);

    renderHook(() => useStudentDashboard({ currentUser: fallbackUser }));

    await waitFor(() =>
      expect(apiService.getStudentGrades).toHaveBeenCalledTimes(1)
    );

    const [calledStudentId] = vi.mocked(apiService.getStudentGrades).mock.calls[0];
    expect(calledStudentId).toBe(fallbackUser.id);
  });

  it("mengirim semesterId hanya ketika mode strict aktif", async () => {
    const futureSemester = {
      ...mockSemesters[0],
      id: "2",
    };

    vi
      .mocked(apiService.getSemesterEnforcementSettings)
      .mockResolvedValue({
        mode: "strict",
        activationDate: new Date(Date.now() - 86400000).toISOString(),
        activeSemester: futureSemester,
      });

    vi.mocked(apiService.getSemesters).mockResolvedValue([futureSemester]);
    vi.mocked(apiService.getStudentGrades).mockResolvedValue(mockGrades);
    vi.mocked(apiService.getStudentAttendance).mockResolvedValue(mockAttendance);

    renderHook(() => useStudentDashboard({ currentUser: baseCurrentUser }));

    await waitFor(() =>
      expect(apiService.getStudentGrades).toHaveBeenCalledTimes(1)
    );

    const strictCall = vi.mocked(apiService.getStudentGrades).mock.calls[0];
    expect(strictCall[3]).toBe("2");

    vi.mocked(apiService.getSemesterEnforcementSettings).mockResolvedValue({
      mode: "relaxed",
      activationDate: null,
      activeSemester: futureSemester,
    });

    vi.mocked(apiService.getStudentGrades).mockClear();
    vi.mocked(apiService.getStudentAttendance).mockClear();

    renderHook(() => useStudentDashboard({ currentUser: baseCurrentUser }));

    await waitFor(() =>
      expect(apiService.getStudentGrades).toHaveBeenCalledTimes(1)
    );

    const relaxedCall = vi.mocked(apiService.getStudentGrades).mock.calls[0];
    expect(relaxedCall[3]).toBeNull();
  });

  it("menampilkan peringatan ketika mode relaxed dan semester aktif telah berakhir", async () => {
    const expiredSemester = {
      ...mockSemesters[0],
      id: "3",
      tanggalSelesai: "2019-01-01",
    };

    vi.mocked(apiService.getSemesterEnforcementSettings).mockResolvedValue({
      mode: "relaxed",
      activationDate: null,
      activeSemester: expiredSemester,
    });

    vi.mocked(apiService.getSemesters).mockResolvedValue([expiredSemester]);
    vi.mocked(apiService.getStudentGrades).mockResolvedValue(mockGrades);
    vi.mocked(apiService.getStudentAttendance).mockResolvedValue(mockAttendance);

    const { result } = renderHook(() =>
      useStudentDashboard({ currentUser: baseCurrentUser })
    );

    await waitFor(() => expect(result.current.semesterWarning).not.toBe(""));

    expect(result.current.semesterWarning).toContain(
      "Semester aktif sebelumnya telah berakhir"
    );

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Informasi Semester",
        description: expect.stringContaining("semester aktif sebelumnya"),
      })
    );
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
      useStudentDashboard({ currentUser: baseCurrentUser })
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
      useStudentDashboard({ currentUser: baseCurrentUser })
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
      useStudentDashboard({ currentUser: baseCurrentUser })
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
      useStudentDashboard({ currentUser: baseCurrentUser })
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

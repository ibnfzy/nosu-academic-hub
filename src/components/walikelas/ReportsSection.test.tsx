import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ReportsSection from "./ReportsSection";

const baseProps = {
  students: [
    {
      id: "1",
      nama: "John Doe",
      nis: "1001",
      nisn: "12345",
    },
    {
      id: "2",
      nama: "Jane Smith",
      nis: "1002",
      nisn: "67890",
    },
  ],
  grades: [
    { studentId: "1", nilai: "80", verified: true },
    { studentId: "1", nilai: "90", verified: true },
  ],
  selectedSemesterPeriodLabel: "Semester Ganjil 2024/2025",
  selectedSemesterDateRange: "1 Juli 2024 - 31 Desember 2024",
  selectedSemesterMetadata: {
    jumlahHariBelajar: 120,
    catatan: "Catatan semester",
  },
  onPrintReport: vi.fn(),
  searchTerm: "",
  onSearchChange: vi.fn(),
} as const;

describe("ReportsSection", () => {
  it("menampilkan daftar siswa siap cetak", () => {
    render(<ReportsSection {...baseProps} />);

    expect(
      screen.getByRole("heading", { name: "Laporan Raport Siswa" })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Semester Ganjil 2024\/2025/i).length).toBeGreaterThan(0);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        "Cari siswa berdasarkan nama, NIS, atau NISN..."
      )
    ).toBeInTheDocument();
  });

  it("memicu handler pencarian ketika nilai berubah", () => {
    const onSearchChange = vi.fn();
    render(<ReportsSection {...baseProps} onSearchChange={onSearchChange} />);

    fireEvent.change(screen.getByLabelText(/Cari siswa untuk raport/i), {
      target: { value: "jane" },
    });

    expect(onSearchChange).toHaveBeenCalledWith("jane");
  });

  it("menampilkan pesan kosong ketika tidak ada siswa", () => {
    render(<ReportsSection {...baseProps} students={[]} />);

    expect(
      screen.getByText("Belum Ada Siswa dengan Nilai Terverifikasi")
    ).toBeInTheDocument();
  });

  it("memicu cetak raport saat tombol diklik", () => {
    const onPrintReport = vi.fn();
    render(<ReportsSection {...baseProps} onPrintReport={onPrintReport} />);

    fireEvent.click(screen.getAllByRole("button", { name: /Cetak Raport/i })[0]);

    expect(onPrintReport).toHaveBeenCalledWith(baseProps.students[0]);
  });
});

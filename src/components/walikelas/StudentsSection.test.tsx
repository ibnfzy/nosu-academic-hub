import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import StudentsSection from "./StudentsSection";

const createMatchMedia = () =>
  function matchMedia() {
    return {
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
      media: "",
    } as unknown as MediaQueryList;
  };

describe("StudentsSection", () => {
  beforeAll(() => {
    if (!window.matchMedia) {
      // @ts-expect-error - provide jsdom fallback
      window.matchMedia = createMatchMedia();
    }
  });

  const baseProps = {
    students: [
      {
        id: "1",
        nama: "John Doe",
        nisn: "12345",
        username: "john",
        email: "john@example.com",
        nomorHP: "08123",
        namaOrangTua: "Jane",
      },
    ],
    filteredStudents: [
      {
        id: "1",
        nama: "John Doe",
        nisn: "12345",
        username: "john",
        email: "john@example.com",
        nomorHP: "08123",
        namaOrangTua: "Jane",
      },
    ],
    searchTerm: "",
    onSearchChange: vi.fn(),
    onAddStudent: vi.fn(),
    onEditStudent: vi.fn(),
    onDeleteStudent: vi.fn(),
    isDialogOpen: false,
    onDialogOpenChange: vi.fn(),
    isEditing: false,
    studentForm: {
      nama: "",
      nisn: "",
      username: "",
      password: "",
      email: "",
      nomorHP: "",
      jenisKelamin: "",
      tanggalLahir: "",
      tahunMasuk: "",
      namaOrangTua: "",
      pekerjaanOrangTua: "",
      alamat: "",
    },
    onStudentFormChange: vi.fn(),
    onStudentSubmit: vi.fn(),
    onResetForm: vi.fn(),
  } as const;

  it("menampilkan siswa yang difilter", () => {
    render(<StudentsSection {...baseProps} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("12345")).toBeInTheDocument();
  });

  it("memicu pencarian ketika input berubah", () => {
    const onSearchChange = vi.fn();
    render(<StudentsSection {...baseProps} onSearchChange={onSearchChange} />);

    fireEvent.change(screen.getByLabelText(/Cari siswa/i), {
      target: { value: "jane" },
    });

    expect(onSearchChange).toHaveBeenCalledWith("jane");
  });

  it("membuka dialog ketika tombol tambah diklik", () => {
    const onAddStudent = vi.fn();
    const onDialogOpenChange = vi.fn();

    render(
      <StudentsSection
        {...baseProps}
        onAddStudent={onAddStudent}
        onDialogOpenChange={onDialogOpenChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Tambah Siswa/i }));

    expect(onAddStudent).toHaveBeenCalled();
    expect(onDialogOpenChange).toHaveBeenCalledWith(true);
  });
});

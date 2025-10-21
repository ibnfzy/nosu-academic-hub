import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import GradesSection from "./GradesSection";

vi.mock("@/components/ui/select", () => {
  const React = require("react");

  const SelectContent = ({ children }) => <>{children}</>;
  const SelectItem = ({ value, children }) => (
    <option value={value} role="option">
      {children}
    </option>
  );
  const SelectTrigger = ({ children }) => <>{children}</>;
  const SelectValue = () => null;
  const Select = ({ value, onValueChange, children }) => (
    <select
      aria-label="Jenis nilai"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;

        if (child.type === SelectContent) {
          return child.props.children;
        }

        return null;
      })}
    </select>
  );

  return { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
});

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

const baseGrades = [
  {
    id: "grade-1",
    studentId: "student-1",
    subjectId: "Matematika",
    jenis: "UH",
    nilai: 80,
    tanggal: "2024-01-01",
  },
  {
    id: "grade-2",
    studentId: "student-2",
    subjectId: "IPS",
    jenis: "UTS",
    nilai: 85,
    tanggal: "2024-02-01",
  },
  {
    id: "grade-3",
    studentId: "student-1",
    subjectId: "Matematika",
    jenis: "UH",
    nilai: 92,
    tanggal: "2024-03-01",
  },
] as const;

const baseStudents = [
  { id: "student-1", nama: "Budi" },
  { id: "student-2", nama: "Siti" },
] as const;

describe("GradesSection", () => {
  beforeAll(() => {
    if (!window.matchMedia) {
      // @ts-expect-error - provide jsdom fallback
      window.matchMedia = createMatchMedia();
    }
  });

  it("memfilter daftar nilai berdasarkan jenis yang dipilih", async () => {
    render(
      <GradesSection
        loading={false}
        unverifiedGrades={[...baseGrades]}
        students={[...baseStudents]}
        onVerifyGrade={vi.fn()}
        onVerifyAll={vi.fn()}
      />
    );

    const verifyAllButton = screen.getByRole("button", {
      name: /Verifikasi Semua/i,
    });
    expect(verifyAllButton).toHaveTextContent("Verifikasi Semua (3)");

    expect(
      screen.getAllByRole("button", { name: /Verifikasi nilai/i })
    ).toHaveLength(3);

    const combobox = screen.getByRole("combobox");
    fireEvent.change(combobox, { target: { value: "UTS" } });

    await waitFor(() => {
      expect(verifyAllButton).toHaveTextContent("Verifikasi Semua (1)");
    });

    expect(
      screen.getAllByRole("button", { name: /Verifikasi nilai/i })
    ).toHaveLength(1);

    expect(screen.getByText("Mata Pelajaran IPS")).toBeInTheDocument();
    expect(
      screen.queryByText("Mata Pelajaran Matematika")
    ).not.toBeInTheDocument();
  });

  it("meneruskan aksi verifikasi setelah filter diterapkan", async () => {
    const onVerifyAll = vi.fn();
    const onVerifyGrade = vi.fn();

    render(
      <GradesSection
        loading={false}
        unverifiedGrades={[...baseGrades]}
        students={[...baseStudents]}
        onVerifyGrade={onVerifyGrade}
        onVerifyAll={onVerifyAll}
      />
    );

    const combobox = screen.getByRole("combobox");
    fireEvent.change(combobox, { target: { value: "UH" } });

    const verifyGradeButtons = await screen.findAllByRole("button", {
      name: /Verifikasi nilai/i,
    });
    expect(verifyGradeButtons).toHaveLength(2);

    fireEvent.click(verifyGradeButtons[0]);
    expect(onVerifyGrade).toHaveBeenCalledWith("grade-1");

    const verifyAllButton = screen.getByRole("button", {
      name: /Verifikasi Semua/i,
    });
    expect(verifyAllButton).toHaveTextContent("Verifikasi Semua (2)");

    fireEvent.click(verifyAllButton);
    expect(onVerifyAll).toHaveBeenCalledTimes(1);
  });
});

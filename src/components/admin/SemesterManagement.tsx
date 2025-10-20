import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Edit, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";

interface SemesterFormState {
  id?: string | number;
  tahunAjaran: string;
  semester: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jumlahHariBelajar: string;
  catatan: string;
}

interface BackendErrors {
  [key: string]: string | string[] | undefined;
}

const initialFormState: SemesterFormState = {
  tahunAjaran: "",
  semester: "",
  tanggalMulai: "",
  tanggalSelesai: "",
  jumlahHariBelajar: "",
  catatan: "",
};

const getSemesterLabel = (semester?: number | string | null) => {
  if (semester === null || semester === undefined || semester === "") {
    return "-";
  }

  const value = Number(semester);
  if (Number.isNaN(value)) {
    return semester?.toString() ?? "-";
  }

  if (value === 1) return "1 (Ganjil)";
  if (value === 2) return "2 (Genap)";
  return `${value}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    return value;
  }
};

const extractErrorMessage = (error: string | string[] | undefined) => {
  if (!error) return undefined;
  if (Array.isArray(error)) {
    return error.join(", ");
  }
  return error;
};

interface SemesterManagementProps {
  onDataChange?: () => void;
}

export default function SemesterManagement({
  onDataChange,
}: SemesterManagementProps) {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState<SemesterFormState>(
    initialFormState
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<BackendErrors>({});
  const { toast } = useToast();

  const loadSemesters = useCallback(async () => {
    try {
      const data = await apiService.getSemesters();
      setSemesters(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load semesters", error);
      toast({
        title: "Error",
        description: "Gagal memuat data semester",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadSemesters();
  }, [loadSemesters]);

  const resetForm = () => {
    setFormState(initialFormState);
    setFormErrors({});
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const openCreateDialog = () => {
    setIsDialogOpen(true);
    setFormState(initialFormState);
    setFormErrors({});
  };

  const handleEdit = (semester: any) => {
    setIsDialogOpen(true);
    setFormErrors({});
    setFormState({
      id: semester.id,
      tahunAjaran: semester.tahunAjaran || semester.tahun || "",
      semester:
        semester.semester !== undefined && semester.semester !== null
          ? String(semester.semester)
          : "",
      tanggalMulai: semester.tanggalMulai || semester.startDate || "",
      tanggalSelesai: semester.tanggalSelesai || semester.endDate || "",
      jumlahHariBelajar:
        semester.jumlahHariBelajar !== undefined &&
        semester.jumlahHariBelajar !== null
          ? String(semester.jumlahHariBelajar)
          : "",
      catatan: semester.catatan || "",
    });
  };

  const handleDelete = async (semesterId: string | number) => {
    if (!semesterId) return;

    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus semester ini?"
    );

    if (!confirmed) return;

    try {
      const result = await apiService.deleteSemester(semesterId);
      if (result?.success) {
        toast({
          title: "Berhasil",
          description: "Semester berhasil dihapus",
        });
        loadSemesters();
        onDataChange?.();
      } else {
        const message =
          result?.message || "Gagal menghapus semester. Silakan coba lagi.";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to delete semester", error);
      toast({
        title: "Error",
        description: "Gagal menghapus semester",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const payload: Record<string, any> = {
      tahunAjaran: formState.tahunAjaran.trim(),
      semester:
        formState.semester !== "" ? Number(formState.semester) : undefined,
      tanggalMulai: formState.tanggalMulai || null,
      tanggalSelesai: formState.tanggalSelesai || null,
      jumlahHariBelajar:
        formState.jumlahHariBelajar !== ""
          ? Number(formState.jumlahHariBelajar)
          : null,
      catatan: formState.catatan.trim(),
    };

    try {
      let result;
      if (formState.id) {
        result = await apiService.updateSemester(formState.id, payload);
      } else {
        result = await apiService.createSemester(payload);
      }

      if (result?.success) {
        toast({
          title: "Berhasil",
          description: `Semester berhasil ${
            formState.id ? "diupdate" : "ditambahkan"
          }`,
        });
        closeDialog();
        loadSemesters();
        onDataChange?.();
      } else {
        const backendErrors: BackendErrors =
          (result?.errors as BackendErrors) ||
          (result?.data?.errors as BackendErrors) ||
          {};

        setFormErrors(backendErrors);

        const message =
          result?.message ||
          extractErrorMessage(backendErrors?.general) ||
          "Gagal menyimpan semester";

        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to submit semester", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan data semester",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Manajemen Semester
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Semester
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {formState.id ? "Edit Semester" : "Tambah Semester"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tahunAjaran">Tahun Ajaran *</Label>
                  <Input
                    id="tahunAjaran"
                    placeholder="Contoh: 2024/2025"
                    value={formState.tahunAjaran}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        tahunAjaran: event.target.value,
                      }))
                    }
                    required
                  />
                  {formErrors?.tahunAjaran && (
                    <p className="text-sm text-destructive">
                      {extractErrorMessage(formErrors.tahunAjaran)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Semester *</Label>
                  <Select
                    value={formState.semester}
                    onValueChange={(value) =>
                      setFormState((prev) => ({
                        ...prev,
                        semester: value,
                      }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1 (Ganjil)</SelectItem>
                      <SelectItem value="2">Semester 2 (Genap)</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors?.semester && (
                    <p className="text-sm text-destructive">
                      {extractErrorMessage(formErrors.semester)}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tanggalMulai">Tanggal Mulai *</Label>
                    <Input
                      id="tanggalMulai"
                      type="date"
                      value={formState.tanggalMulai}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          tanggalMulai: event.target.value,
                        }))
                      }
                      required
                    />
                    {formErrors?.tanggalMulai && (
                      <p className="text-sm text-destructive">
                        {extractErrorMessage(formErrors.tanggalMulai)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tanggalSelesai">Tanggal Selesai *</Label>
                    <Input
                      id="tanggalSelesai"
                      type="date"
                      value={formState.tanggalSelesai}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          tanggalSelesai: event.target.value,
                        }))
                      }
                      required
                    />
                    {formErrors?.tanggalSelesai && (
                      <p className="text-sm text-destructive">
                        {extractErrorMessage(formErrors.tanggalSelesai)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jumlahHariBelajar">Jumlah Hari Belajar</Label>
                  <Input
                    id="jumlahHariBelajar"
                    type="number"
                    min={0}
                    value={formState.jumlahHariBelajar}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        jumlahHariBelajar: event.target.value,
                      }))
                    }
                    placeholder="Masukkan jumlah hari belajar"
                  />
                  {formErrors?.jumlahHariBelajar && (
                    <p className="text-sm text-destructive">
                      {extractErrorMessage(formErrors.jumlahHariBelajar)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="catatan">Catatan</Label>
                  <Textarea
                    id="catatan"
                    rows={3}
                    placeholder="Catatan tambahan (opsional)"
                    value={formState.catatan}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        catatan: event.target.value,
                      }))
                    }
                  />
                  {formErrors?.catatan && (
                    <p className="text-sm text-destructive">
                      {extractErrorMessage(formErrors.catatan)}
                    </p>
                  )}
                </div>

                {formErrors?.general && (
                  <p className="text-sm text-destructive">
                    {extractErrorMessage(formErrors.general)}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeDialog}
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tahun Ajaran</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Tanggal Mulai</TableHead>
                <TableHead>Tanggal Selesai</TableHead>
                <TableHead className="text-center">Hari Belajar</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="w-[120px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {semesters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    Belum ada data semester.
                  </TableCell>
                </TableRow>
              ) : (
                semesters.map((semester) => (
                  <TableRow key={semester.id ?? `${semester.tahunAjaran}-${semester.semester}`}>
                    <TableCell>{semester.tahunAjaran || semester.tahun || "-"}</TableCell>
                    <TableCell>{getSemesterLabel(semester.semester)}</TableCell>
                    <TableCell>{formatDate(semester.tanggalMulai || semester.startDate)}</TableCell>
                    <TableCell>{formatDate(semester.tanggalSelesai || semester.endDate)}</TableCell>
                    <TableCell className="text-center">
                      {semester.jumlahHariBelajar ?? "-"}
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-pre-wrap">
                      {semester.catatan || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(semester)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(semester.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

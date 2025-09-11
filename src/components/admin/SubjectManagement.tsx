/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";

interface SubjectManagementProps {
  onDataChange: () => void;
}

export default function SubjectManagement({
  onDataChange,
}: SubjectManagementProps) {
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjectForm, setSubjectForm] = useState({
    nama: "",
    kode: "",
    kelasId: "",
  });

  const { toast } = useToast();

  // Load data from apiService
  const loadData = useCallback(async () => {
    try {
      const [subjectsData, classesData] = await Promise.all([
        apiService.getSubjects(),
        apiService.getClasses(),
      ]);
      setSubjects(subjectsData);
      setClasses(classesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectForm.nama || !subjectForm.kode) {
      toast({
        title: "Error",
        description: "Mohon lengkapi field wajib",
        variant: "destructive",
      });
      return;
    }

    try {
      const subjectData = {
        ...subjectForm,
        id: editingItem ? editingItem.id : Date.now().toString(),
      };

      let result;
      if (editingItem) {
        result = await apiService.updateSubject(subjectData.id, subjectData);
      } else {
        result = await apiService.addSubject(subjectData);
      }

      if (result.success) {
        toast({
          title: "Berhasil",
          description: `Mata pelajaran berhasil ${
            editingItem ? "diupdate" : "ditambahkan"
          }`,
        });

        resetSubjectForm();
        loadData(); // Reload data
        onDataChange();
        setShowSubjectDialog(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan mata pelajaran",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (
      window.confirm("Apakah Anda yakin ingin menghapus mata pelajaran ini?")
    ) {
      try {
        const result = await apiService.deleteSubject(subjectId);
        if (result.success) {
          toast({
            title: "Berhasil",
            description: "Mata pelajaran berhasil dihapus",
          });
          loadData(); // Reload data
          onDataChange();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus mata pelajaran",
          variant: "destructive",
        });
      }
    }
  };

  const resetSubjectForm = () => {
    setSubjectForm({
      nama: "",
      kode: "",
      kelasId: "",
    });
    setEditingItem(null);
  };

  const editSubject = (subject: any) => {
    setSubjectForm(subject);
    setEditingItem(subject);
    setShowSubjectDialog(true);
  };

  const getClassName = (kelasId: string) => {
    const kelas = classes.find((c) => c.id === kelasId);
    return kelas ? kelas.nama : "Semua Kelas";
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Manajemen Mata Pelajaran</CardTitle>
          <Dialog
            open={showSubjectDialog}
            onOpenChange={(open) => {
              setShowSubjectDialog(open);
              if (!open) resetSubjectForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Mata Pelajaran
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingItem
                    ? "Edit Mata Pelajaran"
                    : "Tambah Mata Pelajaran Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubjectSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Mata Pelajaran *</Label>
                  <Input
                    value={subjectForm.nama}
                    onChange={(e) =>
                      setSubjectForm((prev) => ({
                        ...prev,
                        nama: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kode Mata Pelajaran *</Label>
                  <Input
                    value={subjectForm.kode}
                    onChange={(e) =>
                      setSubjectForm((prev) => ({
                        ...prev,
                        kode: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kelas</Label>
                  <Select
                    value={subjectForm.kelasId}
                    onValueChange={(value) =>
                      setSubjectForm((prev) => ({ ...prev, kelasId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Semua Kelas</SelectItem>
                      {classes.map((kelas) => (
                        <SelectItem key={kelas.id} value={kelas.id}>
                          {kelas.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingItem ? "Update" : "Tambah"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSubjectDialog(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Mata Pelajaran</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-mono">{subject.kode}</TableCell>
                    <TableCell className="font-medium">
                      {subject.nama}
                    </TableCell>
                    <TableCell>{getClassName(subject.kelasId)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editSubject(subject)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSubject(subject.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada data mata pelajaran</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

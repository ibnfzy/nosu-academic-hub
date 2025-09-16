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
import { Plus, Edit, Trash2, School } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";

interface ClassManagementProps {
  onDataChange: () => void;
}

export default function ClassManagement({
  onDataChange,
}: ClassManagementProps) {
  const [showClassDialog, setShowClassDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [classForm, setClassForm] = useState({
    nama: "",
    tingkat: "",
    walikelasId: "",
    jurusan: "",
  });

  const { toast } = useToast();

  // Load data from apiService
  const loadData = useCallback(async () => {
    try {
      const [classesData, usersData] = await Promise.all([
        apiService.getClasses(),
        apiService.getUsers(),
      ]);
      setClasses(classesData);
      setUsers(usersData);
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

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!classForm.nama || !classForm.tingkat) {
      toast({
        title: "Error",
        description: "Mohon lengkapi field wajib",
        variant: "destructive",
      });
      return;
    }

    try {
      const classData = {
        ...classForm,
        ...(editingItem?.id && { id: editingItem.id }),
      };

      let result;
      if (editingItem) {
        result = await apiService.updateClass(classData.id, classData);
      } else {
        result = await apiService.addClass(classData);
      }

      if (result.success) {
        toast({
          title: "Berhasil",
          description: `Kelas berhasil ${
            editingItem ? "diupdate" : "ditambahkan"
          }`,
        });

        resetClassForm();
        loadData(); // Reload data
        onDataChange();
        setShowClassDialog(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan kelas",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kelas ini?")) {
      try {
        const result = await apiService.deleteClass(classId);
        if (result.success) {
          toast({
            title: "Berhasil",
            description: "Kelas berhasil dihapus",
          });
          loadData(); // Reload data
          onDataChange();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus kelas",
          variant: "destructive",
        });
      }
    }
  };

  const resetClassForm = () => {
    setClassForm({
      nama: "",
      tingkat: "",
      walikelasId: "unassigned",
      jurusan: "unassigned",
    });
    setEditingItem(null);
  };

  const editClass = (kelas: any) => {
    setClassForm(kelas);
    setEditingItem(kelas);
    setShowClassDialog(true);
  };

  const getWalikelasName = (userId: string) => {
    if (userId === "unassigned" || userId === "0" || !userId) {
      return "Belum ditentukan";
    }
    const walikelas = users.find((u) => u.id === userId);
    return walikelas ? walikelas.nama : "Belum ditentukan";
  };

  const getSeleectWalikelasName = (userId) => {
    const wk = users.find((u) => String(u.id) === String(userId));
    return wk ? wk.nama : "Pilih Walikelas";
  };

  const availableWalikelas = users.filter(
    (user) =>
      (user.role === "walikelas" || user.role === "guru") &&
      !classes.some(
        (cls) => cls.walikelasId === user.id && cls.id !== editingItem?.id
      )
  );

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Manajemen Kelas</CardTitle>
          <Dialog
            open={showClassDialog}
            onOpenChange={(open) => {
              setShowClassDialog(open);
              if (!open) resetClassForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kelas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Kelas" : "Tambah Kelas Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleClassSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Kelas *</Label>
                  <Input
                    value={classForm.nama}
                    onChange={(e) =>
                      setClassForm((prev) => ({
                        ...prev,
                        nama: e.target.value,
                      }))
                    }
                    placeholder="contoh: X IPA 1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Jurusan *</Label>
                  <Select
                    value={classForm.jurusan}
                    onValueChange={(value) =>
                      setClassForm((prev) => ({ ...prev, jurusan: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Jurusan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IPA">IPA</SelectItem>
                      <SelectItem value="IPS">IPS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tingkat *</Label>
                  <Select
                    value={classForm.tingkat}
                    onValueChange={(value) =>
                      setClassForm((prev) => ({ ...prev, tingkat: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tingkat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="X">Kelas X</SelectItem>
                      <SelectItem value="XI">Kelas XI</SelectItem>
                      <SelectItem value="XII">Kelas XII</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Wali Kelas</Label>
                  <Select
                    value={classForm.walikelasId}
                    onValueChange={(value) =>
                      setClassForm((prev) => ({ ...prev, walikelasId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih wali kelas">
                        {getSeleectWalikelasName(classForm.walikelasId)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        Belum ditentukan
                      </SelectItem>
                      {availableWalikelas.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.nama} - {teacher.nip || "Tanpa NIP"}
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
                    onClick={() => setShowClassDialog(false)}
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
                <TableHead>Nama Kelas</TableHead>
                <TableHead>Jurusan</TableHead>
                <TableHead>Tingkat</TableHead>
                <TableHead>Wali Kelas</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length > 0 ? (
                classes.map((kelas) => (
                  <TableRow key={kelas.id}>
                    <TableCell className="font-medium">{kelas.nama}</TableCell>
                    <TableCell>{kelas.jurusan}</TableCell>
                    <TableCell>Kelas {kelas.tingkat}</TableCell>
                    <TableCell>{getWalikelasName(kelas.walikelasId)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editClass(kelas)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClass(kelas.id)}
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
                    <School className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada data kelas</p>
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

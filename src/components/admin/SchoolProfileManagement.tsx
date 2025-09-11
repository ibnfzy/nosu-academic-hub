import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/apiService';

interface SchoolProfileManagementProps {
  schoolProfile: any;
  onDataChange: () => void;
}

export default function SchoolProfileManagement({ schoolProfile, onDataChange }: SchoolProfileManagementProps) {
  const [showSchoolProfileDialog, setShowSchoolProfileDialog] = useState(false);
  const [schoolProfileForm, setSchoolProfileForm] = useState({
    nama: '',
    alamat: '',
    telepon: '',
    email: '',
    website: '',
    kepalaSekolah: '',
    tahunBerdiri: '',
    akreditasi: '',
    visi: '',
    misi: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    if (schoolProfile) {
      setSchoolProfileForm(schoolProfile);
    }
  }, [schoolProfile]);

  const handleSchoolProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolProfileForm.nama) {
      toast({
        title: "Error",
        description: "Nama sekolah wajib diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await apiService.updateSchoolProfile(schoolProfileForm);
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Profil sekolah berhasil diperbarui"
        });
        
        onDataChange();
        setShowSchoolProfileDialog(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan profil sekolah",
        variant: "destructive"
      });
    }
  };

  const resetSchoolProfileForm = () => {
    if (schoolProfile) {
      setSchoolProfileForm(schoolProfile);
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Profil Sekolah
          </CardTitle>
          <Dialog open={showSchoolProfileDialog} onOpenChange={(open) => {
            setShowSchoolProfileDialog(open);
            if (!open) resetSchoolProfileForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profil
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Profil Sekolah</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSchoolProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Sekolah *</Label>
                    <Input
                      value={schoolProfileForm.nama}
                      onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, nama: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Kepala Sekolah</Label>
                    <Input
                      value={schoolProfileForm.kepalaSekolah}
                      onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, kepalaSekolah: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Alamat</Label>
                  <Textarea
                    value={schoolProfileForm.alamat}
                    onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, alamat: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telepon</Label>
                    <Input
                      value={schoolProfileForm.telepon}
                      onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, telepon: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={schoolProfileForm.email}
                      onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      value={schoolProfileForm.website}
                      onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tahun Berdiri</Label>
                    <Input
                      type="number"
                      value={schoolProfileForm.tahunBerdiri}
                      onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, tahunBerdiri: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Akreditasi</Label>
                  <Input
                    value={schoolProfileForm.akreditasi}
                    onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, akreditasi: e.target.value }))}
                    placeholder="contoh: A"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Visi</Label>
                  <Textarea
                    value={schoolProfileForm.visi}
                    onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, visi: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Misi</Label>
                  <Textarea
                    value={schoolProfileForm.misi}
                    onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, misi: e.target.value }))}
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Simpan Perubahan
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowSchoolProfileDialog(false)}
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
        {schoolProfile ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Informasi Dasar</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Nama:</span> {schoolProfile.nama || '-'}</div>
                  <div><span className="font-medium">Kepala Sekolah:</span> {schoolProfile.kepalaSekolah || '-'}</div>
                  <div><span className="font-medium">Tahun Berdiri:</span> {schoolProfile.tahunBerdiri || '-'}</div>
                  <div><span className="font-medium">Akreditasi:</span> {schoolProfile.akreditasi || '-'}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Kontak</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Telepon:</span> {schoolProfile.telepon || '-'}</div>
                  <div><span className="font-medium">Email:</span> {schoolProfile.email || '-'}</div>
                  <div><span className="font-medium">Website:</span> {schoolProfile.website || '-'}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Alamat</h3>
              <p className="text-sm text-muted-foreground">
                {schoolProfile.alamat || 'Alamat belum diisi'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Visi</h3>
              <p className="text-sm text-muted-foreground">
                {schoolProfile.visi || 'Visi belum diisi'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Misi</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {schoolProfile.misi || 'Misi belum diisi'}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Data profil sekolah belum tersedia</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
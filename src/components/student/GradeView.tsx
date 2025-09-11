import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText } from 'lucide-react';
import { formatDate, getGradeColor, getSubjectName } from '@/utils/helpers';

interface GradeViewProps {
  grades: any[];
  loading: boolean;
}

export default function GradeView({ grades, loading }: GradeViewProps) {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Daftar Nilai</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Memuat data nilai...</p>
          </div>
        ) : grades.length > 0 ? (
          <div className="space-y-4">
            {grades.map((grade) => (
              <div 
                key={grade.id}
                className="flex justify-between items-center p-4 border border-border rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-foreground">
                    {getSubjectName(grade.subjectId)}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {grade.jenis}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(grade.tanggal)}
                    </span>
                    {grade.verified && (
                      <Badge className="text-xs bg-success text-success-foreground">
                        Terverifikasi
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${getGradeColor(grade.nilai)}`}>
                    {grade.nilai}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Belum ada data nilai</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { formatDate, getGradeColor, calculateAverage } from '@/utils/helpers';

interface SubjectViewProps {
  subjectGrades: any[];
}

export default function SubjectView({ subjectGrades }: SubjectViewProps) {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Mata Pelajaran & Nilai</CardTitle>
      </CardHeader>
      <CardContent>
        {subjectGrades.length > 0 ? (
          <div className="space-y-6">
            {subjectGrades.map((subject) => {
              const avgGrade = calculateAverage(subject.grades);
              return (
                <div key={subject.subjectId} className="p-6 border border-border rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {subject.subjectName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {subject.grades.length} nilai tercatat
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${getGradeColor(avgGrade)}`}>
                        {avgGrade}
                      </p>
                      <p className="text-xs text-muted-foreground">Rata-rata</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {subject.grades.map((grade) => (
                      <div 
                        key={grade.id}
                        className="p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{grade.jenis}</span>
                          <span className={`font-bold ${getGradeColor(grade.nilai)}`}>
                            {grade.nilai}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(grade.tanggal)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Belum ada data mata pelajaran</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
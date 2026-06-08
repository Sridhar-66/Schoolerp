export interface StudentResultRow {
  exam_id: number;
  exam_name: string;
  exam_date: string | null;
  max_marks: number;
  marks_obtained: number | null;
  remarks: string | null;
  subject_id: number | null;
  subject_name: string | null;
  subject_code: string | null;
  section_id: number | null;
  section_display_name: string | null;
  academic_year_id: number | null;
  academic_year_name: string | null;
  percentage: number | null;
  grade: string | null;
}

export interface StudentResultDetail extends StudentResultRow {
  entered_at: string | null;
  admin_remarks: string | null;
  is_published: boolean;
}

export interface ResultsSummary {
  totalExams: number;
  appeared: number;
  totalMarksObtained: number;
  totalMaxMarks: number;
  overallPercentage: number | null;
  overallGrade: string | null;
  highestSubject: string | null;
  lowestSubject: string | null;
}

export function computeGrade(percentage: number | null): string | null {
  if (percentage === null) return null;
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
}

export function computeResultsSummary(results: StudentResultRow[]): ResultsSummary {
  const appeared = results.filter((r) => r.marks_obtained !== null);
  const totalMarksObtained = appeared.reduce((sum, r) => sum + (r.marks_obtained ?? 0), 0);
  const totalMaxMarks = appeared.reduce((sum, r) => sum + r.max_marks, 0);
  const overallPercentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : null;
  const sorted = [...appeared].sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0));
  return {
    totalExams: results.length,
    appeared: appeared.length,
    totalMarksObtained,
    totalMaxMarks,
    overallPercentage,
    overallGrade: computeGrade(overallPercentage),
    highestSubject: sorted[0]?.subject_name ?? null,
    lowestSubject: sorted[sorted.length - 1]?.subject_name ?? null,
  };
}
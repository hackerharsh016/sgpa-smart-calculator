export interface GradeData {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  gradePoints: number;
  grade: string;
}

export interface SGPAResult {
  courses: GradeData[];
  totalCredits: number;
  totalGradePoints: number;
  sgpa: number;
}

export interface PredictionCourse {
  id: string;
  courseName: string;
  credits: number;
  targetGrade: string;
}

export const GRADE_VALUES: Record<string, number> = {
  "O": 10,
  "A+": 9,
  "A": 8,
  "B+": 7,
  "B": 6,
  "C": 5,
  "S": 4,
  "P": 4,
  "F": 0,
};

export const GRADE_OPTIONS = Object.keys(GRADE_VALUES);

export function calculateSGPA(courses: GradeData[]): { totalCredits: number; totalGradePoints: number; sgpa: number } {
  let totalCredits = 0;
  let totalGradePoints = 0;

  for (const course of courses) {
    totalCredits += course.credits || 0;
    totalGradePoints += course.gradePoints || 0;
  }

  const sgpa = totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0;

  return { totalCredits, totalGradePoints, sgpa };
}

export function getGradePoints(credits: number, grade: string): number {
  const gradeValue = GRADE_VALUES[grade.toUpperCase()] || 0;
  return credits * gradeValue;
}

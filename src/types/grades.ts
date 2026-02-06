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

export function getGradePoints(grade: string): number {
  return GRADE_VALUES[grade?.toUpperCase()] || 0;
}

export function calculateSGPA(courses: GradeData[]): { totalCredits: number; totalGradePoints: number; sgpa: number } {
  let totalCredits = 0;
  let sumWeightedPoints = 0;

  for (const course of courses) {
    const credits = course.credits || 0;
    // Get numeric value for the letter grade (e.g., 'A' = 8)
    const gradeValue = GRADE_VALUES[course.grade?.toUpperCase()] || 0;
    
    totalCredits += credits;
    // Standard Formula: Sum of (Credits * Grade Value)
    sumWeightedPoints += (credits * gradeValue);
  }

  // Final SGPA = Sum(Credits * Grade Value) / Total Credits
  const sgpa = totalCredits > 0 ? Math.round((sumWeightedPoints / totalCredits) * 100) / 100 : 0;

  return { 
    totalCredits, 
    totalGradePoints: sumWeightedPoints, // Renamed for clarity in UI
    sgpa 
  };
}
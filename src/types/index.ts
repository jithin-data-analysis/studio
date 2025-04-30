// Placeholder types, replace with actual Supabase types later

export interface Class {
  id: string;
  name: string; // e.g., "Grade 1", "Grade 12"
  grade: number;
  sections: Section[];
}

export interface Section {
  id: string;
  name: string; // e.g., "A", "B"
  classId: string;
  students: Student[];
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  dob: string; // Consider using Date type
  gender: 'Male' | 'Female' | 'Other';
  photoUrl?: string;
  classId: string;
  sectionId: string;
  coCurricularIds: string[];
}

export interface Subject {
  id: string;
  name: string;
  classId: string;
  syllabusFileUrl?: string;
}

export interface CoCurricularActivity {
  id: string;
  name: string;
}

export interface Test {
  id: string;
  classId: string;
  sectionId?: string; // May be for a specific section or whole class
  subjectId: string;
  teacherId: string; // Assuming teacher authentication later
  date: string; // Consider using Date type
  type: 'Class Test' | 'Midterm' | 'Final' | 'Quiz' | string; // Allow custom types
  totalMarks: number;
  testPaperUrl?: string; // Link to the uploaded test paper
  aiAnalysis?: { // Store results from analyzeTestPaper
    summary?: string;
    bloomsLevel?: string;
    mcqQuestions?: string[];
  }
}

export interface Mark {
  id: string;
  studentId: string;
  testId: string;
  obtainedMarks: number;
}

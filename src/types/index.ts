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
  academicHistory?: AcademicRecord[]; // Array of past records
  documents?: StoredDocument[]; // Uploaded documents (ID proof, etc.)
  attendance?: AttendanceRecord[];
  homework?: HomeworkRecord[];
  remarks?: Remark[];
}

export interface StoredDocument {
  id: string;
  name: string;
  url: string;
  uploadDate: string; // Consider Date type
  type: 'ID Proof' | 'Report Card' | 'Other';
}

export interface AcademicRecord {
  id: string;
  subjectId: string;
  grade: string; // e.g., "A+", "B", "Fail" or percentage
  term: string; // e.g., "Term 1 2024"
  reportCardUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // Consider Date type
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  notes?: string;
}

export interface HomeworkRecord {
  id: string;
  subjectId: string;
  assignedDate: string; // Consider Date type
  dueDate: string; // Consider Date type
  title: string;
  description?: string;
  status: 'Pending' | 'Submitted' | 'Late Submission' | 'Graded';
  grade?: string | number;
  feedback?: string;
}

export interface Remark {
  id: string;
  date: string; // Consider Date type
  teacherId: string; // ID of the teacher who gave the remark
  category: 'Behavioral' | 'Academic' | 'Positive' | 'Needs Improvement';
  comment: string;
}

export interface Subject {
  id: string;
  name: string;
  classId: string;
  syllabusFileUrl?: string;
  // Structure for parsed syllabus knowledge base
  syllabusKB?: {
      chapters: {
          chapter: string;
          topics: string[];
      }[];
  }
}

export interface CoCurricularActivity {
  id: string;
  name: string;
  type?: 'Sports' | 'Arts' | 'Leadership' | 'Academic Club' | 'Other'; // Added type
  applicableClasses?: string[]; // IDs of classes this activity is for
}

export interface Test {
  id: string;
  classId: string;
  sectionId?: string; // May be for a specific section or whole class
  subjectId: string;
  teacherId: string; // Assuming teacher authentication later
  date: string; // Consider using Date type
  type: 'Class Test' | 'Midterm' | 'Final' | 'Quiz' | string; // Allow custom types
  name: string; // Added test name
  totalMarks: number;
  testPaperUrl?: string; // Link to the uploaded test paper
  syllabusTopicsCovered?: string[]; // Topics linked from syllabus KB
  difficulty?: 'Easy' | 'Medium' | 'Hard'; // Optional difficulty
  aiAnalysis?: TestAnalysis; // Store results from analyzeTestPaper
}

// Renamed from TestAiAnalysis to TestAnalysis for clarity
export interface TestAnalysis {
  summary?: string;
  bloomsLevel?: string;
  mcqQuestions?: string[];
  topicMapping?: { question: string; topic: string }[]; // From RAG analysis
  weakTopics?: string[]; // Identified weak topics for the class
  autoDetectedMarks?: number; // If marks were detected
}


export interface Mark {
  id: string;
  studentId: string;
  testId: string;
  obtainedMarks: number;
  topicWisePerformance?: { topic: string; score: number; mastery: 'Low' | 'Medium' | 'High' }[]; // Added from Marks Analyzer Agent
}

// New types based on the SATS blueprint

export interface CurricularProject {
    id: string;
    name: string;
    description?: string;
    subjectId?: string; // Link to subject
    skillsDeveloped?: string[]; // e.g., ["Problem Solving", "Teamwork"]
    assignedStudents?: string[]; // IDs of students involved
    startDate?: string; // Consider Date type
    endDate?: string; // Consider Date type
    status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
    learningOutcome?: string; // Text description of outcomes
    projectFileURL?: string; // Link to project description or files
}

export interface CounselingRecord {
    id: string;
    studentId: string;
    counselorId: string; // ID of the teacher/counselor
    date: string; // Consider Date type
    sessionType: 'Academic Guidance' | 'Behavioral Counseling' | 'Career Planning' | 'Personal';
    notes: string; // Detailed notes from the session
    followUpActions?: string;
    nextSessionDate?: string; // Consider Date type
}

// Type for AI Assistant interactions (optional)
export interface AiChatInteraction {
    id: string;
    userId: string; // Could be teacher or student ID
    timestamp: string; // Consider Date type
    userQuery: string;
    aiResponse: string;
    contextUsed?: any; // e.g., relevant documents or student data used
}

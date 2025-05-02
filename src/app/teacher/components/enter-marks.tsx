
// src/app/teacher/components/enter-marks.tsx
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PlusCircle,
  Trash2,
  Upload,
  Save,
  Loader2,
  FileText,
  Calendar,
  BookCopy,
  Tag,
  Users,
  ClipboardList,
  Download,
  Printer,
  Sparkles,
  ChevronDown,
  FileSpreadsheet,
  Pencil, // Correct import for Edit icon
  BadgeHelp
} from 'lucide-react';
import { type Class, type Subject, type CoCurricularActivity, type Student, type Test as TestType, type Mark } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { generateStudentInsights } from '@/ai/flows/generate-student-insights';
import { uploadFileAndProcessForRag, simulateSaveData, simulateFetchData } from '@/services/supabase'; // Import simulation helpers
import { Badge } from '@/components/ui/badge'; // Import Badge

// Define a type for the test form data within the component
interface TestFormData {
    id: string; // Use actual Test ID after saving, temporary before save
    name: string;
    date: string;
    totalMarks: number | '';
    file: File | null;
    fileUrl?: string; // Store URL after potential upload
    chapters: string[]; // IDs or names of selected chapters
    topics: string[]; // IDs or names of selected topics
    // Add relevant fields from TestType if needed
    classId: string;
    subjectId: string;
    type?: string; // Optional test type like Midterm, Final etc.
    sectionId?: string; // Add section ID if tests can be section-specific
}

// Mock data - replace with API calls or simulation fetch
const mockClasses: Class[] = [
   {
    id: 'cls1', name: 'Grade 1', grade: 1, sections: [{id: 'sec1a', name: 'A', classId: 'cls1', students: []}, {id: 'sec1b', name: 'B', classId: 'cls1', students: []}]
   },
   {
    id: 'cls8', name: 'Grade 8', grade: 8, sections: [{id: 'sec8a', name: 'A', classId: 'cls8', students: []}]
   },
];
const mockSubjects: Subject[] = [
    { id: 'sub1', name: 'Mathematics', classId: 'cls1' },
    { id: 'sub2', name: 'English', classId: 'cls1' },
    { id: 'sub3', name: 'Mathematics', classId: 'cls8' },
    { id: 'sub4', name: 'Science', classId: 'cls8' },
];
const mockStudents: Student[] = [
    { id: 'stu1', name: 'Alice Wonder', rollNo: '101', dob: '2016-01-15', gender: 'Female', classId: 'cls1', sectionId: 'sec1a', coCurricularIds: ['act1']} as Student,
    { id: 'stu2', name: 'Bob The Builder', rollNo: '102', dob: '2016-03-20', gender: 'Male', classId: 'cls1', sectionId: 'sec1a', coCurricularIds: []} as Student,
    { id: 'stu3', name: 'Charlie Chaplin', rollNo: '103', dob: '2016-02-10', gender: 'Male', classId: 'cls1', sectionId: 'sec1b', coCurricularIds: ['act2'] } as Student,
    { id: 'stu4', name: 'Diana Prince', rollNo: '801', dob: '2009-05-05', gender: 'Female', classId: 'cls8', sectionId: 'sec8a', coCurricularIds: ['act1', 'act3']} as Student,
    { id: 'stu5', name: 'Ethan Hunt', rollNo: '802', dob: '2009-07-12', gender: 'Male', classId: 'cls8', sectionId: 'sec8a', coCurricularIds: []} as Student,
];

// Mock syllabus data
const mockSyllabus = {
    'cls8-sub3': { // Math Grade 8
        chapters: [
            { id: 'chap1', name: 'Algebra', topics: [{id: 'top1', name: 'Linear Equations'}, {id: 'top2', name: 'Polynomials'}] },
            { id: 'chap2', name: 'Geometry', topics: [{id: 'top3', name: 'Triangles'}, {id: 'top4', name: 'Circles'}] }
        ]
    },
     'cls1-sub1': { // Math Grade 1
         chapters: [
            { id: 'chap3', name: 'Numbers', topics: [{id: 'top5', name: 'Counting'}, {id: 'top6', name: 'Addition'}] },
            { id: 'chap4', name: 'Shapes', topics: [{id: 'top7', name: 'Basic Shapes'}] }
        ]
     }
};

// Mock saved tests (will be populated by fetch/simulation)
const initialSavedTests: TestFormData[] = [
     { id: 'test1-math-cls1', name: 'Unit Test 1', date: '2024-05-10', totalMarks: 20, file: null, chapters: ['chap3'], topics: ['top5','top6'], classId: 'cls1', subjectId: 'sub1', sectionId: 'sec1a'},
     { id: 'test2-math-cls8', name: 'Midterm Exam', date: '2024-05-15', totalMarks: 50, file: null, chapters: ['chap1','chap2'], topics: ['top1', 'top3'], classId: 'cls8', subjectId: 'sub3', sectionId: 'sec8a'},
];

// Add a state for student-specific analysis results
type AnalysisResult = { studentId: string; insights: string };

export function EnterMarks() {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(''); // Added section selection
  const [definedTests, setDefinedTests] = useState<TestFormData[]>([]); // Tests being defined/edited
  const [savedTests, setSavedTests] = useState<TestFormData[]>([]); // Load initial mocks only if simulating
  const [selectedTestForMarks, setSelectedTestForMarks] = useState<string>(''); // ID of the test selected for mark entry
  const [studentsForMarkEntry, setStudentsForMarkEntry] = useState<Student[]>([]); // Students for the selected test's class/section
  const [studentMarks, setStudentMarks] = useState<{ [studentId: string]: number | '' }>({}); // Marks being entered
  const [isSavingTests, setIsSavingTests] = useState(false);
  const [isSavingMarks, setIsSavingMarks] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>([]);
  const csvInputRef = useRef<HTMLInputElement>(null); // Ref for CSV input
  const { toast } = useToast();
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]); // State for analysis results
  const [isAnalyzing, setIsAnalyzing] = useState<{[studentId: string]: boolean}>({}); // Track analysis status per student

  const [showSimulatingBadge, setShowSimulatingBadge] = useState(false); // State for client-side badge rendering
  const isSimulating = process.env.SIMULATE_AI === 'true';

  useEffect(() => {
    // This ensures the badge is only rendered client-side after hydration
    setShowSimulatingBadge(isSimulating);
  }, [isSimulating]); // Re-run if isSimulating changes (though it likely won't post-build)


  const availableSubjects = useMemo(() => {
      if (!selectedClassId) return [];
      return mockSubjects.filter(s => s.classId === selectedClassId);
  }, [selectedClassId]);

   const availableSections = useMemo(() => {
      const selectedClass = mockClasses.find(c => c.id === selectedClassId);
      return selectedClass?.sections || [];
  }, [selectedClassId]);

  const availableTestsForMarks = useMemo(() => {
      if (!selectedClassId || !selectedSubjectId) return [];
       // Filter tests based on class, subject, AND potentially section if section is selected
       // If no section is selected, show all tests for the class/subject (or maybe require section selection?)
       return savedTests.filter(t =>
           t.classId === selectedClassId &&
           t.subjectId === selectedSubjectId &&
           (!selectedSectionId || !t.sectionId || t.sectionId === selectedSectionId) // Match section if selected
       );
  }, [selectedClassId, selectedSubjectId, selectedSectionId, savedTests]);

  const currentSyllabus = useMemo(() => {
      if (!selectedClassId || !selectedSubjectId) return null;
      const syllabusKey = `${selectedClassId}-${selectedSubjectId}`;
      const syllabusData = (mockSyllabus as Record<string, { chapters: { id: string; name: string; topics: { id: string; name: string }[] }[] }>)[syllabusKey];
      return syllabusData || null;
  }, [selectedClassId, selectedSubjectId]);

  // --- Effects ---
   useEffect(() => { // Reset dependent fields when class changes
       setSelectedSubjectId('');
       setSelectedSectionId('');
       setDefinedTests([]);
       setActiveAccordionItems([]);
       setSelectedTestForMarks('');
       setStudentsForMarkEntry([]);
       setStudentMarks({});
       setAnalysisResults([]);
       setSavedTests(isSimulating ? initialSavedTests : []);
   }, [selectedClassId, isSimulating]);

    useEffect(() => { // Reset tests and mark entry when subject changes
       setDefinedTests([]);
       setActiveAccordionItems([]);
       setSelectedTestForMarks('');
       setStudentsForMarkEntry([]);
       setStudentMarks({});
       setAnalysisResults([]);
       fetchSavedTests();
   }, [selectedSubjectId]);

    useEffect(() => { // Reset mark entry when section changes
        setSelectedTestForMarks(''); // Reset test selection as available tests might change
        setStudentsForMarkEntry([]);
        setStudentMarks({});
        setAnalysisResults([]);
        // Fetch students for the new section IF a test is already selected
        if (selectedTestForMarks) {
           fetchStudentsForTest();
        }
    }, [selectedSectionId]);

    // Fetch saved tests when class/subject changes
    const fetchSavedTests = async () => {
        if (!selectedClassId || !selectedSubjectId) {
             setSavedTests(isSimulating ? initialSavedTests : []);
             return;
        }
        setIsLoadingTests(true);
        try {
            const fetchedTests: TestFormData[] = await simulateFetchData('tests', { classId: selectedClassId, subjectId: selectedSubjectId });
             // Ensure totalMarks is a number or empty string
            const cleanedTests = fetchedTests.map(test => ({
                ...test,
                totalMarks: typeof test.totalMarks === 'number' ? test.totalMarks : ''
            }));
            setSavedTests(cleanedTests);
        } catch (error) {
            console.error("Failed to fetch saved tests:", error);
            toast({ title: "Fetch Error", description: "Could not load saved tests.", variant: "destructive" });
            setSavedTests(isSimulating ? initialSavedTests : []); // Fallback to mocks if simulating, else empty
        } finally {
            setIsLoadingTests(false);
        }
    };


    // Fetch students when a test is selected for marking
    const fetchStudentsForTest = async () => {
         if (!selectedTestForMarks) {
             setStudentsForMarkEntry([]);
             setStudentMarks({});
             setAnalysisResults([]);
             return;
         }

         const testDetails = savedTests.find(t => t.id === selectedTestForMarks);
         if (!testDetails) {
              setStudentsForMarkEntry([]);
              setStudentMarks({});
              setAnalysisResults([]);
              return;
         }

         // Determine the sectionId to filter students by
         // Priority: 1. Explicitly selected section, 2. Section specified in the test itself
         const sectionIdToFetch = selectedSectionId || testDetails.sectionId;

         if (!sectionIdToFetch) {
             toast({ title: "Section Required", description: "Please select a section or ensure the test is linked to a section.", variant: "destructive" });
             setStudentsForMarkEntry([]);
             setStudentMarks({});
             setAnalysisResults([]);
             return;
         }


         setIsLoadingStudents(true);
         try {
             // Fetch students for the determined section
             const fetchedStudents: Student[] = await simulateFetchData('students', { classId: testDetails.classId, sectionId: sectionIdToFetch });
             setStudentsForMarkEntry(fetchedStudents.sort((a,b) => a.rollNo.localeCompare(b.rollNo)));

             // Fetch existing marks (simulated)
             const existingMarks: { [studentId: string]: number | '' } = {};
              // In real app: const marksData = await simulateFetchData('marks', { testId: selectedTestForMarks });
              // fetchedStudents.forEach(student => {
              //     const mark = marksData.find(m => m.studentId === student.id);
              //     existingMarks[student.id] = mark ? mark.obtainedMarks : '';
              // });
             fetchedStudents.forEach(student => { existingMarks[student.id] = ''; }); // Initialize empty
             setStudentMarks(existingMarks);
             setAnalysisResults([]);
         } catch (error) {
             console.error("Failed to fetch students or marks:", error);
             toast({ title: "Fetch Error", description: "Could not load student list or existing marks.", variant: "destructive" });
             setStudentsForMarkEntry([]);
             setStudentMarks({});
             setAnalysisResults([]);
         } finally {
              setIsLoadingStudents(false);
         }
     };

     useEffect(() => {
         fetchStudentsForTest(); // Call fetchStudentsForTest when selectedTestForMarks changes
     }, [selectedTestForMarks, savedTests, selectedSectionId]); // Dependencies adjusted


  // --- Handlers for Defining Tests ---
  const handleAddTest = () => {
      if (!selectedClassId || !selectedSubjectId) {
          toast({title: "Selection Required", description: "Please select a class and subject first.", variant: "destructive"});
          return;
      }
      const newTestId = `new-${Date.now()}`;
      const newTest: TestFormData = {
          id: newTestId,
          name: '',
          date: '',
          totalMarks: '',
          file: null,
          chapters: [],
          topics: [],
          classId: selectedClassId,
          subjectId: selectedSubjectId,
          sectionId: selectedSectionId || undefined // Pre-fill section if selected
      };
      setDefinedTests(prev => [...prev, newTest]);
      setActiveAccordionItems(prev => [...prev, newTestId]);
      toast({title: "New Test Added", description: "Fill in the details below."});
  };

  const handleRemoveTest = (testId: string) => {
      setDefinedTests(prev => prev.filter(test => test.id !== testId));
      setActiveAccordionItems(prev => prev.filter(id => id !== testId));
      toast({title: "Test Removed", description: "The unsaved test entry has been removed.", variant: "destructive"});
  };

  const handleTestChange = (testId: string, field: keyof TestFormData, value: any) => {
      setDefinedTests(prev => prev.map(test => {
          if (test.id === testId) {
              if (field === 'totalMarks') {
                  const numericValue = value === '' ? '' : parseInt(value, 10);
                   if (value === '' || (!isNaN(numericValue) && numericValue >= 0)) {
                        return { ...test, [field]: numericValue };
                   } else {
                        toast({ title: "Invalid Input", description: "Total Marks must be a non-negative number.", variant: "destructive" });
                        return test;
                   }
              }
              return { ...test, [field]: value };
          }
          return test;
      }));
  };

  const handleFileChange = async (testId: string, event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
          const file = event.target.files[0];
           const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
           if (!allowedTypes.includes(file.type)) {
                toast({ title: "Invalid File Type", description: "Please upload PDF or DOC/DOCX files.", variant: "destructive" });
                if (event.target) event.target.value = "";
                return;
           }
           // Immediately update the file state for UI feedback
           handleTestChange(testId, 'file', file);

           // Simulate or perform upload and store URL
           try {
                // Use a specific path for test papers
                const pathPrefix = `tests/${selectedClassId}/${selectedSubjectId}/${testId}/`;
                const { fileUrl } = await uploadFileAndProcessForRag(file, pathPrefix); // Use simulation-aware uploader
                handleTestChange(testId, 'fileUrl', fileUrl); // Store the URL
                 toast({ title: `File ${isSimulating ? 'Simulated Upload' : 'Uploaded'}`, description: `${file.name} linked to the test.` });
           } catch (uploadError) {
                console.error("File upload/processing failed:", uploadError);
                toast({ title: "Upload Failed", description: `Could not upload or process ${file.name}.`, variant: "destructive" });
                // Optionally revert file state if upload fails critically
                // handleTestChange(testId, 'file', null);
           }
            // Reset file input value to allow re-uploading the same file
            if (event.target) event.target.value = "";
      }
  };

    // Placeholder implementation - needs actual syllabus data access logic
   const handleChapterChange = (testId: string, chapterId: string, isChecked: boolean | string) => {
     const chapter = currentSyllabus?.chapters.find((c: any) => c.id === chapterId);
     if (!chapter) return;
     const topicIds = chapter.topics.map((t: any) => t.id);

     setDefinedTests((prev: TestFormData[]) => prev.map(test => {
         if (test.id === testId) {
             const updatedChapters = isChecked
                 ? [...new Set([...test.chapters, chapterId])]
                 : test.chapters.filter(id => id !== chapterId);

             const updatedTopics = isChecked
                 ? [...new Set([...test.topics, ...topicIds])] // Select all topics if chapter checked
                 : test.topics.filter(id => !topicIds.includes(id)); // Deselect all topics if chapter unchecked

             return { ...test, chapters: updatedChapters, topics: updatedTopics };
         }
         return test;
     }));
   };

    // Placeholder implementation - needs actual syllabus data access logic
   const handleTopicChange = (testId: string, topicId: string, isChecked: boolean | string) => {
      setDefinedTests((prev: TestFormData[]) => prev.map(test => {
         if (test.id === testId) {
              const updatedTopics = isChecked
                 ? [...new Set([...test.topics, topicId])]
                 : test.topics.filter(id => id !== topicId);

               // Auto-check/uncheck chapter based on topic selection
               let updatedChapters = [...test.chapters];
               const chapter = currentSyllabus?.chapters.find((c: any) => c.topics.some((t: any) => t.id === topicId));

               if (chapter) {
                   const allTopicIdsInChapter = chapter.topics.map((t: any) => t.id);
                   const allTopicsSelected = allTopicIdsInChapter.every(tid => updatedTopics.includes(tid));
                   const someTopicsSelected = allTopicIdsInChapter.some(tid => updatedTopics.includes(tid));

                   if (allTopicsSelected && !updatedChapters.includes(chapter.id)) {
                       updatedChapters.push(chapter.id); // Auto-check chapter
                   } else if (!someTopicsSelected && updatedChapters.includes(chapter.id)) {
                       updatedChapters = updatedChapters.filter(id => id !== chapter.id); // Auto-uncheck chapter
                   } else if (someTopicsSelected && !updatedChapters.includes(chapter.id)) {
                        // If some topics are selected but chapter isn't, check the chapter
                       updatedChapters.push(chapter.id);
                   }
               }

             return { ...test, topics: updatedTopics, chapters: [...new Set(updatedChapters)] };
         }
         return test;
     }));
   };


  const handleSaveAllDefinedTests = async () => {
    if (definedTests.length === 0) {
        toast({ title: "No New Tests", description: "Add at least one test definition to save.", variant: "destructive"});
        return;
    }

    let firstInvalidTestId: string | null = null;
    const isValid = definedTests.every(test => {
         const valid = test.name && test.date && test.totalMarks !== '' && test.totalMarks >= 0;
         if (!valid && firstInvalidTestId === null) { firstInvalidTestId = test.id; }
         return valid;
     });

    if (!isValid && firstInvalidTestId) {
        toast({ title: "Incomplete Tests", description: "Ensure all new tests have a Name, Date, and valid Total Marks.", variant: "destructive"});
        if (!activeAccordionItems.includes(firstInvalidTestId)) {
            setActiveAccordionItems(prev => [...prev, firstInvalidTestId!]);
        }
        return;
    }

    setIsSavingTests(true);

    const testsToSave = definedTests.map(test => ({
        // Map to the actual TestType structure for saving
        // id: test.id, // Let DB generate ID or use temp for simulation mapping
        classId: test.classId,
        subjectId: test.subjectId,
        sectionId: test.sectionId || null, // Save section if defined
        name: test.name,
        date: test.date,
        totalMarks: test.totalMarks as number, // Cast after validation
        testPaperUrl: test.fileUrl, // Use stored URL
        syllabusChapters: test.chapters,
        syllabusTopics: test.topics,
        type: test.type // Include if you added this field
    }));

    try {
        // Simulate or perform actual save
        await simulateSaveData(testsToSave, 'tests');

        // Update savedTests state and clear definedTests
        const newlySavedTests = definedTests.map((test, index) => ({
            ...test,
            // In a real app, use the ID returned from the database
            // For simulation, create a predictable or slightly different ID
            id: isSimulating ? `sim-saved-${test.id}` : `db-saved-${Date.now() + index}`,
            totalMarks: test.totalMarks as number, // Ensure it's number
        }));
        setSavedTests(prev => [...prev, ...newlySavedTests]);
        setDefinedTests([]); // Clear the definition section
        setActiveAccordionItems([]);

        toast({ title: `Tests Saved ${isSimulating ? '(Simulated)' : ''}`, description: `${definedTests.length} new test(s) defined successfully. You can now select them for mark entry.` });

    } catch (error) {
        console.error("Failed to save tests:", error);
        toast({ title: "Save Failed", description: `Could not save test definitions. ${isSimulating ? '(Simulated)' : ''}`, variant: "destructive" });
    } finally {
        setIsSavingTests(false);
    }
  };

  // --- Handlers for Entering Marks ---
  const handleMarkChange = (studentId: string, value: string) => {
      const testDetails = savedTests.find(t => t.id === selectedTestForMarks);
      if (!testDetails) return;

      const numericValue = value === '' ? '' : parseInt(value, 10);
      const maxMarks = testDetails.totalMarks as number;

      // Validate input: allow empty string, or numbers between 0 and totalMarks
      if (value === '' || (!isNaN(numericValue) && numericValue >= 0 && numericValue <= maxMarks)) {
         setStudentMarks(prev => ({ ...prev, [studentId]: numericValue }));
      } else {
           toast({
               title: "Invalid Mark",
               description: `Mark must be between 0 and ${maxMarks}.`,
               variant: "destructive"
           });
      }
  };

  // Trigger analysis for a single student
  const handleAnalyzeStudent = async (student: Student) => {
      const testDetails = savedTests.find(t => t.id === selectedTestForMarks);
      const obtainedMark = studentMarks[student.id];
      const subject = mockSubjects.find(s => s.id === testDetails?.subjectId);

      if (!testDetails || obtainedMark === '' || !subject) {
          toast({ title: "Missing Data", description: "Cannot analyze without test details, subject, and obtained marks.", variant: "destructive" });
          return;
      }

      setIsAnalyzing(prev => ({...prev, [student.id]: true})); // Set analyzing state for this student
      try {
          // Prepare input for the AI flow
          const input = {
              studentId: student.id,
              testId: testDetails.id,
              obtainedMarks: obtainedMark as number,
              totalMarks: testDetails.totalMarks as number,
              subject: subject.name,
              date: testDetails.date,
              type: testDetails.type || 'Test', // Provide default type if optional
              // Add historical context if available
              // historicalContext: fetchHistoricalData(student.id, subject.id),
          };

          // Call the flow (handles its own simulation)
          const result = await generateStudentInsights(input);

          // Create a combined insight string or use a specific part
          const insightText = `Trends: ${result.trends}. Weaknesses: ${result.weaknesses}. Tips: ${result.personalizedTips}. Predictions: ${result.predictiveOutcomes}`;

          // Update analysis results state
          setAnalysisResults(prev => {
              const existingIndex = prev.findIndex(r => r.studentId === student.id);
              if (existingIndex > -1) {
                  const updated = [...prev];
                  updated[existingIndex] = { studentId: student.id, insights: insightText };
                  return updated;
              } else {
                  return [...prev, { studentId: student.id, insights: insightText }];
              }
          });

           toast({ title: `Analyzed ${student.name} ${isSimulating ? '(Simulated)' : ''}`, description: "AI insights generated successfully." });

      } catch (error: any) {
          console.error(`Failed to analyze student ${student.id}:`, error);
          let errorMsg = `Could not generate insights for ${student.name}.`;
            if (process.env.SIMULATE_AI !== 'true' && error.message?.includes('GOOGLE_GENAI_API_KEY')) {
                errorMsg = 'Missing Google API Key. Set SIMULATE_AI=true in .env to test without keys.'
            } else {
                 errorMsg += ` ${error.message || ''}`;
            }
          toast({ title: "Analysis Failed", description: errorMsg, variant: "destructive" });
      } finally {
          setIsAnalyzing(prev => ({...prev, [student.id]: false})); // Reset analyzing state
      }
  };


  const handleSaveMarks = async () => {
     if (!selectedTestForMarks || studentsForMarkEntry.length === 0) {
         toast({ title: "Nothing to Save", description: "Select a test and ensure students are listed.", variant: "destructive" });
         return;
     }

     const allMarksEntered = studentsForMarkEntry.every(student => studentMarks[student.id] !== '');
     if (!allMarksEntered) {
         // Consider showing a confirmation dialog instead of just a toast
         console.warn("Some student marks are missing.");
         // toast({ title: "Incomplete Marks", description: "Some student marks are missing. Save anyway?", variant: "default" });
     }

     setIsSavingMarks(true);
     const marksToSave: Omit<Mark, 'id'>[] = [];

     for (const student of studentsForMarkEntry) {
         const obtainedMark = studentMarks[student.id];
         if (obtainedMark !== '') { // Only save if a mark is entered
             marksToSave.push({
                 studentId: student.id,
                 testId: selectedTestForMarks,
                 obtainedMarks: obtainedMark as number, // Cast after validation
             });
         }
     }

     try {
         // Simulate or perform actual save
         await simulateSaveData(marksToSave, 'marks');

         toast({ title: `Marks Saved ${isSimulating ? '(Simulated)' : ''}`, description: `Marks for ${savedTests.find(t=>t.id===selectedTestForMarks)?.name} saved.` });
         // Optionally clear marks after save or refetch?
         // setStudentMarks({}); // Clear marks form
     } catch (error) {
         console.error("Failed to save marks:", error);
         toast({ title: "Save Failed", description: `Could not save marks. ${isSimulating ? '(Simulated)' : ''}`, variant: "destructive" });
     } finally {
         setIsSavingMarks(false);
     }
  };

  const triggerCSVUpload = () => {
      csvInputRef.current?.click();
  };

  const handleUploadCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];

      if (file.type !== 'text/csv') {
          toast({ title: "Invalid File Type", description: "Please upload a CSV file.", variant: "destructive" });
          return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
          const content = e.target?.result as string;
          if (!content) {
               toast({ title: "File Error", description: "Could not read CSV content.", variant: "destructive" });
               return;
          }
          try {
             // Basic CSV Parsing (assumes Roll No, Marks columns) - use a library like Papaparse for robustness
             const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
             if (lines.length < 2) throw new Error("CSV must have at least a header and one data row.");

             const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
             // More flexible header matching
             const rollNoIndex = headers.findIndex(h => h.includes('roll') && h.includes('no'));
             const marksIndex = headers.findIndex(h => h.includes('mark') || h.includes('score') || h.includes('obtained'));


             if (rollNoIndex === -1 || marksIndex === -1) {
                 throw new Error("CSV must contain columns identifiable as 'Roll No' and 'Marks/Score'.");
             }

             const updatedMarks: { [studentId: string]: number | '' } = { ...studentMarks };
             let importedCount = 0;
             let errorCount = 0;
             const notFoundRollNos: string[] = [];

             for (let i = 1; i < lines.length; i++) {
                 const values = lines[i].split(',');
                 const rollNo = values[rollNoIndex]?.trim();
                 const markStr = values[marksIndex]?.trim();

                 if (!rollNo || markStr === undefined) continue; // Skip empty lines or missing data

                 const student = studentsForMarkEntry.find(s => s.rollNo === rollNo);
                 if (!student) {
                      console.warn(`Student with Roll No ${rollNo} not found in the current list.`);
                      if (!notFoundRollNos.includes(rollNo)) notFoundRollNos.push(rollNo);
                      errorCount++;
                      continue;
                 }

                 const markValue = markStr === '' ? '' : parseInt(markStr, 10);
                 const testDetails = savedTests.find(t => t.id === selectedTestForMarks);
                 const maxMarks = testDetails?.totalMarks as number | undefined;


                 if (markValue === '' || (!isNaN(markValue) && markValue >= 0 && (maxMarks === undefined || markValue <= maxMarks))) {
                      updatedMarks[student.id] = markValue;
                      importedCount++;
                 } else {
                     console.warn(`Invalid mark "${markStr}" for Roll No ${rollNo}. Max marks: ${maxMarks}`);
                     errorCount++;
                 }
             }

             setStudentMarks(updatedMarks);
              let description = `${importedCount} marks imported. `;
              if (notFoundRollNos.length > 0) {
                  description += `${notFoundRollNos.length} roll numbers not found: ${notFoundRollNos.slice(0, 5).join(', ')}${notFoundRollNos.length > 5 ? '...' : ''}. `;
              }
              if (errorCount > notFoundRollNos.length) {
                   description += `${errorCount - notFoundRollNos.length} invalid mark entries.`
              }
             toast({
                title: "CSV Processed",
                description: description.trim(),
                duration: notFoundRollNos.length > 0 || errorCount > 0 ? 10000 : 5000 // Longer duration if errors
            });

          } catch (parseError: any) {
               toast({ title: "CSV Parsing Error", description: parseError.message || "Failed to parse CSV file.", variant: "destructive" });
          } finally {
               // Reset file input
                if (csvInputRef.current) {
                    csvInputRef.current.value = "";
                }
          }
      };
      reader.onerror = () => {
            toast({ title: "File Read Error", description: "Could not read the selected file.", variant: "destructive" });
            if (csvInputRef.current) {
                 csvInputRef.current.value = "";
            }
      }
      reader.readAsText(file);

  };

  const handlePrintAnalysis = (studentId: string) => {
      const student = studentsForMarkEntry.find(s => s.id === studentId);
      const analysis = analysisResults.find(r => r.studentId === studentId);
      const test = savedTests.find(t => t.id === selectedTestForMarks);
      const marks = studentMarks[studentId];

      if (!student || !analysis || !test) {
          toast({ title: "Cannot Print", description: "Missing student data, analysis, or test details." });
          return;
      }

      const printWindow = window.open('', '_blank', 'height=600,width=800');
      if (!printWindow) {
          toast({ title: "Print Error", description: "Could not open print window. Check pop-up blocker.", variant: "destructive" });
          return;
      }

      // Simple HTML structure for printing
      printWindow.document.write('<html><head><title>Student Analysis Report</title>');
      // Add some basic styling
      printWindow.document.write(`
          <style>
              body { font-family: sans-serif; line-height: 1.5; padding: 20px; color: #333; }
              h1, h2 { color: #1e40af; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 20px; margin-bottom: 10px; }
              h1 { font-size: 1.5em; }
              h2 { font-size: 1.2em; }
              p { margin: 5px 0; }
              .section { margin-bottom: 15px; padding-left: 10px; border-left: 3px solid #60a5fa; background-color: #f0f9ff; padding: 10px; border-radius: 4px; }
              .label { font-weight: bold; color: #555; min-width: 120px; display: inline-block;}
              .info-grid { display: grid; grid-template-columns: auto 1fr; gap: 5px 10px; margin-bottom: 15px;}
              .print-only { display: block !important; } /* Ensure visibility */
              .no-print { display: none !important; } /* Hide buttons in print */
               @media print {
                    .no-print { display: none !important; }
                    body { padding: 10px; } /* Adjust padding for print */
               }
          </style>
      `);
      printWindow.document.write('</head><body>');
      printWindow.document.write(`<h1>Student Analysis Report ${isSimulating ? '<span style="font-size: 0.7em; color: red;">(Simulated)</span>' : ''}</h1>`);
       printWindow.document.write('<div class="info-grid">');
      printWindow.document.write(`<span class="label">Student:</span> <span>${student.name} (Roll: ${student.rollNo})</span>`);
      printWindow.document.write(`<span class="label">Test:</span> <span>${test.name} (${test.date})</span>`);
      printWindow.document.write(`<span class="label">Subject:</span> <span>${mockSubjects.find(s => s.id === test.subjectId)?.name || 'N/A'}</span>`);
      printWindow.document.write(`<span class="label">Marks Obtained:</span> <span>${marks}/${test.totalMarks}</span>`);
      printWindow.document.write('</div>');
      printWindow.document.write(`<h2>AI Insights</h2>`);
      // Format the insights nicely - assuming insightText format from handleAnalyzeStudent
      const insightsParts = analysis.insights.split('. ').filter(part => part.trim());
      insightsParts.forEach(part => {
          const [label, ...textParts] = part.split(':');
          const text = textParts.join(':').trim();
          if (label && text) {
              printWindow.document.write(`<div class="section">`);
              printWindow.document.write(`<p><span class="label">${label}:</span> ${text}</p>`);
              printWindow.document.write(`</div>`);
          }
      });

       // Add print button within the printable content
        printWindow.document.write(`
            <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 15px; background-color: #1e40af; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Print Report
            </button>
        `);

      printWindow.document.write('</body></html>');
      printWindow.document.close();
      // Delay print command slightly to ensure content is rendered
      setTimeout(() => {
         printWindow.focus(); // Focus the new window
         // printWindow.print(); // Removed: Print triggered by button inside the window
      }, 500);
  }


  return (
    <div className="space-y-6">
       {/* 1. Class, Subject, and Section Selection */}
       <Card className="shadow-lg dark:shadow-indigo-900/20 overflow-hidden border-t-4 border-indigo-500 rounded-xl bg-gradient-to-br from-indigo-50/50 via-white to-teal-50/30 dark:from-indigo-900/30 dark:via-background dark:to-teal-900/20 transition-all hover:shadow-xl">
           <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <Users className="h-6 w-6 text-indigo-500"/> Select Context
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">Choose the class, subject, and section to manage tests and marks.</CardDescription>
           </CardHeader>
           <CardContent className="p-4 md:p-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                      <Label htmlFor="classSelect" className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Class*</Label>
                      <Select value={selectedClassId} onValueChange={setSelectedClassId} required>
                        <SelectTrigger id="classSelect" className="mt-1 bg-background shadow-sm focus:ring-2 focus:ring-indigo-500 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockClasses.map(cls => (
                             <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                   </div>
                   <div>
                      <Label htmlFor="subjectSelect" className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Subject*</Label>
                       <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={!selectedClassId || availableSubjects.length === 0} required>
                        <SelectTrigger id="subjectSelect" className="mt-1 bg-background shadow-sm focus:ring-2 focus:ring-indigo-500 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
                          <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubjects.length > 0 ? (
                              availableSubjects.map(sub => (
                                  <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                              ))
                          ) : (
                               <SelectItem value="no-subjects" disabled>No subjects for this class</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                   </div>
                   <div>
                       <Label htmlFor="sectionSelect" className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Section*</Label>
                       <Select value={selectedSectionId} onValueChange={setSelectedSectionId} disabled={!selectedClassId || availableSections.length === 0} required>
                           <SelectTrigger id="sectionSelect" className="mt-1 bg-background shadow-sm focus:ring-2 focus:ring-indigo-500 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
                               <SelectValue placeholder="Select Section" />
                           </SelectTrigger>
                           <SelectContent>
                               {availableSections.length > 0 ? (
                                   availableSections.map(sec => (
                                       <SelectItem key={sec.id} value={sec.id}>Section {sec.name}</SelectItem>
                                   ))
                               ) : (
                                   <SelectItem value="no-sections" disabled>No sections for this class</SelectItem>
                               )}
                           </SelectContent>
                       </Select>
                   </div>
               </div>
           </CardContent>
       </Card>

       {/* 2. Define New Tests Section */}
       <Card className="shadow-lg dark:shadow-teal-900/20 overflow-hidden border-t-4 border-teal-500 rounded-xl bg-gradient-to-br from-teal-50/30 via-white to-indigo-50/20 dark:from-teal-900/30 dark:via-background dark:to-indigo-900/20 transition-all hover:shadow-xl">
         <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-xl md:text-2xl font-bold text-teal-700 dark:text-teal-300 flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-teal-500"/> Define New Tests
                {showSimulatingBadge && <Badge variant="destructive">SIMULATING AI</Badge>}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">Add details for new tests for the selected class, subject, and section. Saved tests will appear in the 'Enter Marks' section.</CardDescription>
         </CardHeader>
         <CardContent className="space-y-4 p-4 md:p-6">
             <Button onClick={handleAddTest} disabled={!selectedClassId || !selectedSubjectId || !selectedSectionId} variant="secondary" className="shadow-md hover:shadow-lg transition-shadow group bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 hover:bg-teal-200 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 animate-fade-in">
                  <span className="group-hover:animate-bounce mr-2">✨</span> Add New Test Definition <PlusCircle className="ml-2 h-4 w-4" />
             </Button>

             {definedTests.length === 0 && (selectedClassId && selectedSubjectId && selectedSectionId) && (
                  <div className="text-center text-muted-foreground py-10 border-2 border-dashed border-teal-200 dark:border-teal-800 rounded-lg bg-teal-50/20 dark:bg-teal-900/10 animate-fade-in">
                      <p className="font-medium">No new tests being defined.</p>
                      <p className="text-sm">Click the magic button above to start or select a saved test below to enter marks.</p>
                  </div>
              )}

              {definedTests.length > 0 && (
                  <Accordion
                      type="multiple"
                      className="w-full space-y-3" // Increased spacing
                      value={activeAccordionItems}
                      onValueChange={setActiveAccordionItems}
                  >
                     {definedTests.map((test, index) => (
                       <AccordionItem
                          value={test.id}
                          key={test.id}
                          className="border border-teal-200 dark:border-teal-800 rounded-lg overflow-hidden shadow-sm bg-background dark:bg-muted/20 hover:border-teal-400 dark:hover:border-teal-600 transition-colors duration-300 animate-fade-in"
                          style={{animationDelay: `${index * 100}ms`}} // Stagger animation
                       >
                           <AccordionTrigger className="px-4 py-3 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 hover:no-underline transition-colors duration-150 data-[state=open]:bg-teal-50/50 dark:data-[state=open]:bg-teal-900/20 rounded-t-lg">
                               <div className="flex items-center justify-between w-full">
                                   <div className="flex items-center gap-2 text-teal-800 dark:text-teal-200">
                                        <span className="font-semibold">{test.name || `Untitled Test ${index + 1}`}</span>
                                        {test.date && <span className="text-xs text-teal-600 dark:text-teal-400">({test.date})</span>}
                                   </div>
                                   <div className="flex items-center gap-2">
                                       {test.fileUrl && <FileText className="h-4 w-4 text-green-600" title={`Uploaded: ${test.fileUrl}`} />}
                                       {(test.chapters.length > 0 || test.topics.length > 0) && <BookCopy className="h-4 w-4 text-blue-600" title="Syllabus Linked" />}
                                        {(!test.name || !test.date || test.totalMarks === '' || (typeof test.totalMarks === 'number' && test.totalMarks < 0)) && ( // Added type check
                                             <span className="text-xs text-destructive font-medium">(Incomplete)</span>
                                        )}
                                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground group-data-[state=open]/accordion-trigger:rotate-180" />
                                   </div>
                               </div>
                           </AccordionTrigger>
                           <AccordionContent className="p-4 border-t border-teal-200 dark:border-teal-800 bg-teal-50/10 dark:bg-teal-900/5 rounded-b-lg">
                              {/* Test Form Fields */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                  <div>
                                      <Label htmlFor={`testName-${test.id}`} className="text-xs font-medium text-teal-700 dark:text-teal-300">Test Name*</Label>
                                      <Input id={`testName-${test.id}`} value={test.name} onChange={(e) => handleTestChange(test.id, 'name', e.target.value)} placeholder="e.g., Mid-Term Exam" required className="bg-background border-teal-200 dark:border-teal-700 focus:ring-teal-500" />
                                  </div>
                                  <div>
                                       <Label htmlFor={`testDate-${test.id}`} className="text-xs font-medium text-teal-700 dark:text-teal-300">Date*</Label>
                                        <div className="relative">
                                           <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                           <Input id={`testDate-${test.id}`} type="date" value={test.date} onChange={(e) => handleTestChange(test.id, 'date', e.target.value)} required className="bg-background pl-8 border-teal-200 dark:border-teal-700 focus:ring-teal-500" />
                                       </div>
                                   </div>
                                    <div>
                                       <Label htmlFor={`totalMarks-${test.id}`} className="text-xs font-medium text-teal-700 dark:text-teal-300">Total Marks*</Label>
                                       <Input id={`totalMarks-${test.id}`} type="number" value={test.totalMarks} onChange={(e) => handleTestChange(test.id, 'totalMarks', e.target.value)} placeholder="e.g., 100" min="0" required className="bg-background border-teal-200 dark:border-teal-700 focus:ring-teal-500" />
                                        {(typeof test.totalMarks === 'number' && test.totalMarks < 0) && <p className="text-xs text-destructive mt-1">Marks cannot be negative.</p>}
                                   </div>
                                   <div>
                                       <Label htmlFor={`fileUpload-${test.id}`} className="text-xs font-medium text-teal-700 dark:text-teal-300">Upload Paper (PDF/DOCX)</Label>
                                       <div className="relative">
                                          <Upload className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                           <Input id={`fileUpload-${test.id}`} type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(test.id, e)} className="cursor-pointer file:cursor-pointer pl-8 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 bg-background border-teal-200 dark:border-teal-700 focus:ring-teal-500" />
                                       </div>
                                       {test.file && <p className="text-xs text-muted-foreground mt-1 truncate" title={test.file.name}><FileText className="inline h-3 w-3 mr-1"/> {test.file.name}</p>}
                                        {test.fileUrl && <p className="text-xs text-green-600 mt-1 truncate" title={test.fileUrl}>Uploaded: {test.fileUrl.split('/').pop()}</p>}
                                   </div>
                              </div>

                              {/* Syllabus Linking */}
                              {currentSyllabus ? (
                                  <div className="mt-6 pt-4 border-t border-teal-200/50 dark:border-teal-800/50">
                                       <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-teal-700 dark:text-teal-300"><BookCopy className="h-4 w-4" /> Link to Syllabus Covered</h4>
                                        <ScrollArea className="h-48 w-full rounded-md border border-teal-200 dark:border-teal-700 bg-background p-3">
                                           <div className="space-y-3">
                                               {currentSyllabus.chapters.length === 0 && <p className="text-sm text-muted-foreground">No syllabus chapters found for this subject.</p>}
                                               {currentSyllabus.chapters.map((chapter) => (
                                                   <div key={chapter.id} className="pb-2">
                                                       <div className="flex items-center space-x-2 mb-1">
                                                           <Checkbox id={`chapter-${test.id}-${chapter.id}`} checked={test.chapters.includes(chapter.id)} onCheckedChange={(checked) => handleChapterChange(test.id, chapter.id, checked)} />
                                                            <label htmlFor={`chapter-${test.id}-${chapter.id}`} className="font-medium text-sm cursor-pointer">{chapter.name}</label>
                                                       </div>
                                                        <div className="pl-6 mt-1 space-y-1">
                                                            {chapter.topics.map((topic) => (
                                                                <div key={topic.id} className="flex items-center space-x-2">
                                                                    <Checkbox id={`topic-${test.id}-${topic.id}`} checked={test.topics.includes(topic.id)} onCheckedChange={(checked) => handleTopicChange(test.id, topic.id, checked)} />
                                                                     <label htmlFor={`topic-${test.id}-${topic.id}`} className="text-xs text-muted-foreground cursor-pointer">{topic.name}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                   </div>
                                               ))}
                                           </div>
                                        </ScrollArea>
                                   </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground mt-4 pt-2 border-t border-teal-200/50 dark:border-teal-800/50">Syllabus data not available for this subject to link topics.</p>
                                )}
                              <div className="flex justify-end pt-4 mt-4 border-t border-teal-200/50 dark:border-teal-800/50">
                                   <Button variant="destructive" size="sm" onClick={() => handleRemoveTest(test.id)} className="opacity-80 hover:opacity-100 transition-opacity">
                                       <Trash2 className="mr-1 h-3 w-3" /> Remove This Definition
                                   </Button>
                               </div>
                           </AccordionContent>
                       </AccordionItem>
                      ))}
                  </Accordion>
              )}
         </CardContent>
          {definedTests.length > 0 && (
               <CardFooter className="flex justify-end border-t border-teal-200 dark:border-teal-800 pt-4 mt-6 p-4 md:p-6 bg-teal-50/30 dark:bg-teal-900/20 rounded-b-xl">
                  <Button onClick={handleSaveAllDefinedTests} disabled={isSavingTests} size="lg" className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-105 animate-fade-in">
                    {isSavingTests ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save All New Test Definitions ({definedTests.length}) {isSimulating && '(Simulated)'}
                  </Button>
              </CardFooter>
          )}
       </Card>

       <Separator className="my-8 border-border/50" />

       {/* 3. Enter Marks Section */}
        <Card className="shadow-lg dark:shadow-blue-900/20 overflow-hidden border-t-4 border-blue-500 rounded-xl bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 dark:from-blue-900/30 dark:via-background dark:to-purple-900/20 transition-all hover:shadow-xl">
           <CardHeader className="bg-gradient-to-r from-blue-50 via-white to-purple-50 dark:from-blue-900/20 dark:via-background dark:to-purple-900/20 p-4 md:p-6">
                <CardTitle className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Pencil className="h-6 w-6"/> Enter Student Marks
                     {showSimulatingBadge && <Badge variant="destructive" className="ml-2">SIMULATING AI</Badge>}
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">Select a previously saved test and enter the marks obtained by each student.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-6 p-4 md:p-6">
               {/* Test Selection Dropdown */}
                <div className="max-w-md animate-fade-in">
                  <Label htmlFor="markTestSelect" className="text-sm font-medium text-blue-800 dark:text-blue-200">Select Test to Enter Marks*</Label>
                   <Select value={selectedTestForMarks} onValueChange={setSelectedTestForMarks} disabled={!selectedClassId || !selectedSubjectId || !selectedSectionId || isLoadingTests || availableTestsForMarks.length === 0} required>
                        <SelectTrigger id="markTestSelect" className="mt-1 bg-background shadow-sm focus:ring-2 focus:ring-blue-500 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
                          <SelectValue placeholder={isLoadingTests ? "Loading tests..." : "Select a saved test..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {!isLoadingTests && availableTestsForMarks.length > 0 ? (
                              availableTestsForMarks.map(test => (
                                  <SelectItem key={test.id} value={test.id}>{test.name} ({test.date}) - {test.totalMarks} Marks</SelectItem>
                              ))
                          ) : (
                              !isLoadingTests && <SelectItem value="no-saved-tests" disabled>No saved tests for this context</SelectItem>
                          )}
                           {isLoadingTests && <SelectItem value="loading" disabled>Loading...</SelectItem>}
                        </SelectContent>
                      </Select>
                </div>

                 {/* Hidden File Input for CSV */}
                <input
                     type="file"
                     ref={csvInputRef}
                     onChange={handleUploadCSV}
                     className="hidden"
                     accept=".csv"
                />

                {/* Marks Table */}
                {selectedTestForMarks && (isLoadingStudents || studentsForMarkEntry.length > 0) && (
                    <div className="space-y-4 pt-6 border-t border-blue-200/50 dark:border-blue-800/50 animate-fade-in">
                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                             <h3 className="font-semibold text-lg">
                                 Marks for: <span className="text-blue-600 dark:text-blue-400">{savedTests.find(t=>t.id===selectedTestForMarks)?.name}</span>
                                 <span className="text-muted-foreground text-sm ml-2">(Max: {savedTests.find(t=>t.id===selectedTestForMarks)?.totalMarks})</span>
                             </h3>
                              <Button variant="outline" size="sm" onClick={triggerCSVUpload} disabled={isSavingMarks || isLoadingStudents} className="bg-gradient-to-r from-green-50 to-lime-50 hover:from-green-100 hover:to-lime-100 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 shadow-sm hover:shadow-md transition-all group">
                                 <FileSpreadsheet className="mr-2 h-4 w-4 group-hover:animate-pulse" /> Bulk Upload (CSV)
                             </Button>
                        </div>

                        {isLoadingStudents ? (
                             <div className="border border-blue-200 dark:border-blue-800 rounded-md overflow-hidden shadow-sm bg-background p-4">
                                 <div className="flex items-center justify-center h-48">
                                     <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                     <p className="ml-3 text-muted-foreground">Loading students...</p>
                                 </div>
                             </div>
                        ) : (
                            <div className="border border-blue-200 dark:border-blue-800 rounded-md overflow-hidden shadow-sm bg-background">
                              <Table>
                                  <TableHeader className="bg-blue-50/50 dark:bg-blue-900/20">
                                     <TableRow>
                                         <TableHead className="w-[80px] text-center font-semibold text-blue-800 dark:text-blue-300">Roll No.</TableHead>
                                         <TableHead className="font-semibold text-blue-800 dark:text-blue-300">Student Name</TableHead>
                                         <TableHead className="w-[150px] text-center font-semibold text-blue-800 dark:text-blue-300">Obtained Marks*</TableHead>
                                         <TableHead className="w-[150px] text-center font-semibold text-blue-800 dark:text-blue-300">Analysis & Actions</TableHead> {/* New Analysis Column */}
                                     </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {studentsForMarkEntry.map((student, index) => {
                                          const analysis = analysisResults.find(r => r.studentId === student.id);
                                          const analyzing = isAnalyzing[student.id];
                                          return (
                                              <TableRow key={student.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors duration-150 group"> {/* Add group class */}
                                                  {/* Roll Number Style */}
                                                  <TableCell className="font-mono text-center text-lg font-bold text-blue-600 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-900/20 border-r border-blue-200 dark:border-blue-800">
                                                     {student.rollNo}
                                                  </TableCell>
                                                  <TableCell className="font-medium">{student.name}</TableCell>
                                                  <TableCell className="text-center">
                                                      <Input
                                                          type="number"
                                                          value={studentMarks[student.id] ?? ''}
                                                          onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                                          min="0"
                                                          max={savedTests.find(t=>t.id===selectedTestForMarks)?.totalMarks}
                                                          className="text-center bg-background h-8 w-24 focus:ring-blue-500 dark:focus:ring-blue-400 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-colors mx-auto"
                                                          placeholder="Score"
                                                          aria-label={`Marks for ${student.name}`} // Accessibility
                                                          disabled={isSavingMarks}
                                                      />
                                                  </TableCell>
                                                  <TableCell className="text-center">
                                                       <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={() => handleAnalyzeStudent(student)}
                                                          disabled={analyzing || studentMarks[student.id] === '' || isSavingMarks}
                                                          title={analyzing ? "Analyzing..." : "Analyze Student"}
                                                          className="ml-1"
                                                       >
                                                           {analyzing ? <Loader2 className="h-4 w-4 animate-spin text-purple-500"/> : <Sparkles className="h-4 w-4 text-purple-500 hover:text-purple-700"/>}
                                                       </Button>
                                                      {analysis && (
                                                         <Button variant="ghost" size="sm" onClick={() => handlePrintAnalysis(student.id)} title="Print Analysis">
                                                              <Printer className="h-4 w-4 text-gray-500 hover:text-gray-700"/>
                                                         </Button>
                                                      )}
                                                      {analysis && <span className="text-xs text-muted-foreground ml-2">(Analyzed)</span>}
                                                  </TableCell>
                                              </TableRow>
                                          );
                                      })}
                                  </TableBody>
                              </Table>
                            </div>
                        )}
                    </div>
                )}
                 {selectedTestForMarks && !isLoadingStudents && studentsForMarkEntry.length === 0 && (
                     <div className="text-center text-muted-foreground py-10 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50/10 dark:bg-blue-900/10 animate-fade-in">
                         <p>No students found for the selected test's class/section.</p>
                     </div>
                 )}
                  {!selectedTestForMarks && (selectedClassId && selectedSubjectId && selectedSectionId) && !isLoadingTests && (
                     <div className="text-center text-muted-foreground py-10 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50/10 dark:bg-blue-900/10 animate-fade-in">
                         <BadgeHelp className="mx-auto h-8 w-8 mb-2 text-blue-400"/>
                         <p className="font-medium">Select a saved test above</p>
                          <p className="text-sm">Choose a test from the dropdown to start entering marks for students.</p>
                          {availableTestsForMarks.length === 0 && <p className="text-xs mt-2">(No tests defined or saved for this context yet)</p>}
                     </div>
                 )}

           </CardContent>
            {selectedTestForMarks && !isLoadingStudents && studentsForMarkEntry.length > 0 && (
                <CardFooter className="flex flex-col sm:flex-row justify-end items-center border-t border-blue-200 dark:border-blue-800 pt-4 mt-6 p-4 md:p-6 bg-blue-50/30 dark:bg-blue-900/20 rounded-b-xl">
                     <Button onClick={handleSaveMarks} disabled={isSavingMarks} size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white w-full sm:w-auto shadow-lg hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105 animate-fade-in">
                         {isSavingMarks ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Save Marks for This Test {isSimulating && '(Simulated)'}
                     </Button>
                </CardFooter>
            )}
       </Card>
     </div>
   );
 }

 // Helper styles for animation (add to globals.css or tailwind config if preferred)
 const animationStyles = `
 @keyframes fade-in {
   from { opacity: 0; }
   to { opacity: 1; }
 }
 @keyframes fade-in-down {
   from { opacity: 0; transform: translateY(-10px); }
   to { opacity: 1; transform: translateY(0); }
 }
 .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
 .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
 .animation-delay-100 { animation-delay: 100ms; }
 .animation-delay-200 { animation-delay: 200ms; }
 .animation-delay-300 { animation-delay: 300ms; }
 /* Add more delays as needed */

 /* Add styles for print */
 @media print {
     .no-print { display: none !important; }
     body {
         padding: 10px !important; /* Reduce padding for print */
         font-size: 10pt !important; /* Adjust font size for print */
         color: #000 !important; /* Ensure text is black */
     }
     h1, h2 {
         color: #000 !important;
         border-bottom: 1px solid #ccc !important;
         page-break-after: avoid !important;
     }
     .section {
         border-left: 3px solid #ccc !important;
         background-color: #f9f9f9 !important;
         page-break-inside: avoid !important;
     }
     .label {
          color: #333 !important;
     }
     .info-grid {
          grid-template-columns: auto 1fr !important;
          gap: 2px 5px !important;
     }
      a { /* Remove link styling for print */
         text-decoration: none !important;
         color: inherit !important;
     }
     /* Hide simulation badges in print */
     .print-hide-simulation {
        display: none !important;
     }
 }

 `;

 // Inject styles (simple way, consider better approach for production)
 if (typeof window !== 'undefined') {
     const styleSheet = document.createElement("style");
     styleSheet.type = "text/css";
     styleSheet.innerText = animationStyles;
     document.head.appendChild(styleSheet);
 }

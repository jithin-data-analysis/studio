// src/app/teacher/components/enter-marks.tsx
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react'; // Added useRef
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
} from '@/components/ui/table'; // Import Table components
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
  FileSpreadsheet, // Icon for CSV Upload
  Edit, // Import the Edit icon
} from 'lucide-react';
import { type Class, type Subject, type CoCurricularActivity, type Student, type Test as TestType, type Mark } from '@/types'; // Added TestType and Mark
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator'; // Import Separator

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
}

// Mock data - replace with API calls
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

// Mock saved tests (replace with API fetch)
const mockSavedTests: TestFormData[] = [
     { id: 'test1-math-cls1', name: 'Unit Test 1', date: '2024-05-10', totalMarks: 20, file: null, chapters: ['chap3'], topics: ['top5','top6'], classId: 'cls1', subjectId: 'sub1'},
     { id: 'test2-math-cls8', name: 'Midterm Exam', date: '2024-05-15', totalMarks: 50, file: null, chapters: ['chap1','chap2'], topics: ['top1', 'top3'], classId: 'cls8', subjectId: 'sub3'},
];

export function EnterMarks() {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [definedTests, setDefinedTests] = useState<TestFormData[]>([]); // Tests being defined/edited
  const [savedTests, setSavedTests] = useState<TestFormData[]>(mockSavedTests); // Tests already saved (from DB)
  const [selectedTestForMarks, setSelectedTestForMarks] = useState<string>(''); // ID of the test selected for mark entry
  const [studentsForMarkEntry, setStudentsForMarkEntry] = useState<Student[]>([]); // Students for the selected test's class/section
  const [studentMarks, setStudentMarks] = useState<{ [studentId: string]: number | '' }>({}); // Marks being entered
  const [isSavingTests, setIsSavingTests] = useState(false);
  const [isSavingMarks, setIsSavingMarks] = useState(false);
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>([]);
  const csvInputRef = useRef<HTMLInputElement>(null); // Ref for CSV input
  const { toast } = useToast();

  const availableSubjects = useMemo(() => {
      if (!selectedClassId) return [];
      return mockSubjects.filter(s => s.classId === selectedClassId);
  }, [selectedClassId]);

  const availableTestsForMarks = useMemo(() => {
      if (!selectedClassId || !selectedSubjectId) return [];
      // Filter saved tests based on current class and subject selection
      return savedTests.filter(t => t.classId === selectedClassId && t.subjectId === selectedSubjectId);
  }, [selectedClassId, selectedSubjectId, savedTests]);

  const currentSyllabus = useMemo(() => {
      if (!selectedClassId || !selectedSubjectId) return null;
      const syllabusKey = `${selectedClassId}-${selectedSubjectId}`;
      const syllabusData = (mockSyllabus as Record<string, { chapters: { id: string; name: string; topics: { id: string; name: string }[] }[] }>)[syllabusKey];
      return syllabusData || null;
  }, [selectedClassId, selectedSubjectId]);

  // --- Effects ---
   useEffect(() => { // Reset subject, tests, and mark entry section when class changes
       setSelectedSubjectId('');
       setDefinedTests([]);
       setActiveAccordionItems([]);
       setSelectedTestForMarks('');
       setStudentsForMarkEntry([]);
       setStudentMarks({});
   }, [selectedClassId]);

    useEffect(() => { // Reset tests and mark entry section when subject changes
       setDefinedTests([]);
       setActiveAccordionItems([]);
       setSelectedTestForMarks('');
       setStudentsForMarkEntry([]);
       setStudentMarks({});
   }, [selectedSubjectId]);

    useEffect(() => { // Fetch students and potentially existing marks when a test is selected for marking
        if (selectedTestForMarks) {
            const testDetails = savedTests.find(t => t.id === selectedTestForMarks);
            if (testDetails) {
                // Fetch students for the test's class/section
                // In a real app, filter based on sectionId if the test is section-specific
                const relevantStudents = mockStudents.filter(s => s.classId === testDetails.classId /* && s.sectionId === testDetails.sectionId */ );
                setStudentsForMarkEntry(relevantStudents.sort((a,b) => a.rollNo.localeCompare(b.rollNo))); // Sort by roll number

                // Fetch existing marks for these students for this test (mocked for now)
                const existingMarks: { [studentId: string]: number | '' } = {};
                relevantStudents.forEach(student => {
                     // Mock: check if marks exist for student/test combo
                     // const mark = await fetchMark(student.id, testDetails.id);
                     // existingMarks[student.id] = mark ? mark.obtainedMarks : '';
                     existingMarks[student.id] = ''; // Default to empty
                });
                setStudentMarks(existingMarks);
            } else {
                setStudentsForMarkEntry([]);
                setStudentMarks({});
            }
        } else {
            setStudentsForMarkEntry([]);
            setStudentMarks({});
        }
   }, [selectedTestForMarks, savedTests]); // Re-run when selected test changes


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
          classId: selectedClassId, // Add classId
          subjectId: selectedSubjectId // Add subjectId
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

  const handleFileChange = (testId: string, event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
          const file = event.target.files[0];
           const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
           if (!allowedTypes.includes(file.type)) {
                toast({ title: "Invalid File Type", description: "Please upload PDF or DOC/DOCX files.", variant: "destructive" });
                if (event.target) event.target.value = "";
                return;
           }
          handleTestChange(testId, 'file', file);
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
        classId: test.classId,
        subjectId: test.subjectId,
        name: test.name,
        date: test.date,
        totalMarks: test.totalMarks as number, // Cast after validation
        // file: test.file, // Handle file upload separately
        syllabusChapters: test.chapters,
        syllabusTopics: test.topics,
        type: test.type // Include if you added this field
    }));

    try {
        console.log("Saving Defined Tests:", testsToSave);
        // Simulate API call(s) to save tests and upload files
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock: Update savedTests state and clear definedTests
        const newlySavedTests = definedTests.map(test => ({
            ...test,
            id: `saved-${test.id}`, // Replace temp ID with actual ID from DB
            totalMarks: test.totalMarks as number, // Ensure it's number
            // fileUrl: '...' // Get actual URL if file uploaded
        }));
        setSavedTests(prev => [...prev, ...newlySavedTests]);
        setDefinedTests([]); // Clear the definition section
        setActiveAccordionItems([]);

        toast({ title: "Tests Saved", description: `${definedTests.length} new test(s) defined successfully. You can now select them for mark entry.` });

    } catch (error) {
        console.error("Failed to save tests:", error);
        toast({ title: "Save Failed", description: "Could not save test definitions. Please try again.", variant: "destructive" });
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

  const handleSaveMarks = async () => {
     if (!selectedTestForMarks || studentsForMarkEntry.length === 0) {
         toast({ title: "Nothing to Save", description: "Select a test and ensure students are listed.", variant: "destructive" });
         return;
     }

     // Optional: Check if all marks are entered
     const allMarksEntered = studentsForMarkEntry.every(student => studentMarks[student.id] !== '');
     if (!allMarksEntered) {
         // Maybe show a warning dialog instead of preventing save?
         // For now, allow saving partial marks
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
         console.log("Saving Marks:", marksToSave);
         // Simulate API call to save/update marks
         await new Promise(resolve => setTimeout(resolve, 1000));

         // --- Trigger AI Marks Analysis (Placeholder) ---
         // This would likely happen server-side after successful mark saving
         // await triggerMarksAnalysis(selectedTestForMarks, marksToSave);
         // -------------------------------------------------

         toast({ title: "Marks Saved", description: `Marks for ${savedTests.find(t=>t.id===selectedTestForMarks)?.name} saved successfully.` });
         // Optionally clear marks after save or refetch?
         // setStudentMarks({}); // Clear marks form
     } catch (error) {
         console.error("Failed to save marks:", error);
         toast({ title: "Save Failed", description: "Could not save marks. Please try again.", variant: "destructive" });
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
             const rollNoIndex = headers.indexOf('roll no'); // Case insensitive search
             const marksIndex = headers.indexOf('marks');

             if (rollNoIndex === -1 || marksIndex === -1) {
                 throw new Error("CSV must contain 'Roll No' and 'Marks' columns.");
             }

             const updatedMarks: { [studentId: string]: number | '' } = { ...studentMarks };
             let importedCount = 0;
             let errorCount = 0;

             for (let i = 1; i < lines.length; i++) {
                 const values = lines[i].split(',');
                 const rollNo = values[rollNoIndex]?.trim();
                 const markStr = values[marksIndex]?.trim();

                 if (!rollNo || markStr === undefined) continue; // Skip empty lines or missing data

                 const student = studentsForMarkEntry.find(s => s.rollNo === rollNo);
                 if (!student) {
                      console.warn(`Student with Roll No ${rollNo} not found in the current list.`);
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
             toast({
                title: "CSV Processed",
                description: `${importedCount} marks imported. ${errorCount > 0 ? `${errorCount} errors (check console for details).` : 'No errors.'}`
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

  const handlePrintAnalysis = () => {
      // TODO: Implement printable analysis report generation
      // 1. Gather necessary data (student, test, marks, AI insights if available)
      // 2. Format into a printable HTML structure
      // 3. Use window.print()
      toast({ title: "Coming Soon", description: "Printable analysis report is under development." });
  }

  return (
    <div className="space-y-6">
       {/* 1. Class and Subject Selection */}
      <Card className="shadow-md dark:shadow-indigo-900/10 overflow-hidden border-t-4 border-indigo-500 rounded-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-50 via-white to-teal-50 dark:from-indigo-900/20 dark:via-background dark:to-teal-900/20 p-4 md:p-6">
             <CardTitle className="text-xl md:text-2xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                 <Users className="h-6 w-6"/> Select Class & Subject
             </CardTitle>
             <CardDescription className="text-muted-foreground mt-1">Choose the class and subject to manage tests and enter marks.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <Label htmlFor="classSelect" className="text-sm font-medium">Class*</Label>
                     <Select value={selectedClassId} onValueChange={setSelectedClassId} required>
                       <SelectTrigger id="classSelect" className="mt-1 bg-background shadow-sm">
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
                     <Label htmlFor="subjectSelect" className="text-sm font-medium">Subject*</Label>
                      <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={!selectedClassId || availableSubjects.length === 0} required>
                       <SelectTrigger id="subjectSelect" className="mt-1 bg-background shadow-sm">
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
              </div>
          </CardContent>
      </Card>

       {/* 2. Define New Tests Section */}
      <Card className="shadow-md dark:shadow-indigo-900/10 overflow-hidden border-t-4 border-teal-500 rounded-xl">
        <CardHeader className="bg-gradient-to-r from-teal-50 via-white to-indigo-50 dark:from-teal-900/20 dark:via-background dark:to-indigo-900/20 p-4 md:p-6">
           <CardTitle className="text-xl md:text-2xl font-bold text-teal-700 dark:text-teal-300 flex items-center gap-2">
               <ClipboardList className="h-6 w-6"/> Define New Tests
           </CardTitle>
           <CardDescription className="text-muted-foreground mt-1">Add details for new tests for the selected class and subject. Saved tests will appear in the 'Enter Marks' section.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6">
            <Button onClick={handleAddTest} disabled={!selectedClassId || !selectedSubjectId} variant="secondary" className="shadow-sm hover:shadow-md transition-shadow group">
                 <span className="group-hover:animate-bounce mr-2">✨</span> Add New Test Definition <PlusCircle className="ml-2 h-4 w-4" />
            </Button>

            {definedTests.length === 0 && (selectedClassId && selectedSubjectId) && (
                 <div className="text-center text-muted-foreground py-10 border-2 border-dashed border-muted rounded-lg bg-muted/20">
                     <p className="font-medium">No new tests being defined.</p>
                     <p className="text-sm">Click the magic button above to start or select a saved test below to enter marks.</p>
                 </div>
             )}

             {definedTests.length > 0 && (
                 <Accordion
                     type="multiple"
                     className="w-full space-y-2"
                     value={activeAccordionItems}
                     onValueChange={setActiveAccordionItems}
                 >
                    {definedTests.map((test, index) => (
                      <AccordionItem
                         value={test.id}
                         key={test.id}
                         className="border border-border rounded-lg overflow-hidden shadow-sm bg-background dark:bg-muted/20 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                      >
                          <AccordionTrigger className="px-4 py-3 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 hover:no-underline transition-colors duration-150 data-[state=open]:bg-teal-50/50 dark:data-[state=open]:bg-teal-900/20">
                              <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2 text-teal-800 dark:text-teal-200">
                                       <span className="font-semibold">{test.name || `Untitled Test ${index + 1}`}</span>
                                       {test.date && <span className="text-xs text-teal-600 dark:text-teal-400">({test.date})</span>}
                                  </div>
                                  <div className="flex items-center gap-2">
                                      {test.file && <FileText className="h-4 w-4 text-green-600" title="Paper Uploaded" />}
                                      {(test.chapters.length > 0 || test.topics.length > 0) && <BookCopy className="h-4 w-4 text-blue-600" title="Syllabus Linked" />}
                                       {(!test.name || !test.date || test.totalMarks === '' || (typeof test.totalMarks === 'number' && test.totalMarks < 0)) && ( // Added type check
                                            <span className="text-xs text-destructive font-medium">(Incomplete)</span>
                                       )}
                                       <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground group-data-[state=open]/accordion-trigger:rotate-180" />
                                  </div>
                              </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-4 border-t border-border bg-muted/10 dark:bg-muted/5">
                             {/* Test Form Fields */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                 <div>
                                     <Label htmlFor={`testName-${test.id}`} className="text-xs font-medium">Test Name*</Label>
                                     <Input id={`testName-${test.id}`} value={test.name} onChange={(e) => handleTestChange(test.id, 'name', e.target.value)} placeholder="e.g., Mid-Term Exam" required className="bg-background" />
                                 </div>
                                 <div>
                                      <Label htmlFor={`testDate-${test.id}`} className="text-xs font-medium">Date*</Label>
                                       <div className="relative">
                                          <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                          <Input id={`testDate-${test.id}`} type="date" value={test.date} onChange={(e) => handleTestChange(test.id, 'date', e.target.value)} required className="bg-background pl-8" />
                                      </div>
                                  </div>
                                   <div>
                                      <Label htmlFor={`totalMarks-${test.id}`} className="text-xs font-medium">Total Marks*</Label>
                                      <Input id={`totalMarks-${test.id}`} type="number" value={test.totalMarks} onChange={(e) => handleTestChange(test.id, 'totalMarks', e.target.value)} placeholder="e.g., 100" min="0" required className="bg-background" />
                                       {(typeof test.totalMarks === 'number' && test.totalMarks < 0) && <p className="text-xs text-destructive mt-1">Marks cannot be negative.</p>}
                                  </div>
                                  <div>
                                      <Label htmlFor={`fileUpload-${test.id}`} className="text-xs font-medium">Upload Paper (PDF/DOCX)</Label>
                                      <div className="relative">
                                         <Upload className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                          <Input id={`fileUpload-${test.id}`} type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(test.id, e)} className="cursor-pointer file:cursor-pointer pl-8 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 bg-background" />
                                      </div>
                                      {test.file && <p className="text-xs text-muted-foreground mt-1 truncate" title={test.file.name}><FileText className="inline h-3 w-3 mr-1"/> {test.file.name}</p>}
                                  </div>
                             </div>

                             {/* Syllabus Linking */}
                             {currentSyllabus ? (
                                 <div className="mt-6 pt-4 border-t border-border/50">
                                      <h4 className="font-medium text-sm mb-3 flex items-center gap-2"><BookCopy className="h-4 w-4" /> Link to Syllabus Covered</h4>
                                       <ScrollArea className="h-48 w-full rounded-md border border-border bg-background p-3">
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
                                   <p className="text-xs text-muted-foreground mt-4 pt-2 border-t border-border/50">Syllabus data not available for this subject to link topics.</p>
                               )}
                             <div className="flex justify-end pt-4 mt-4 border-t border-border/50">
                                  <Button variant="destructive" size="sm" onClick={() => handleRemoveTest(test.id)}>
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
              <CardFooter className="flex justify-end border-t pt-4 mt-6 p-4 md:p-6 bg-muted/30 dark:bg-muted/10">
                 <Button onClick={handleSaveAllDefinedTests} disabled={isSavingTests} size="lg" className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-teal-500/40 transition-all duration-300 transform hover:scale-105">
                   {isSavingTests ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                   Save All New Test Definitions ({definedTests.length})
                 </Button>
             </CardFooter>
         )}
      </Card>

      <Separator />

      {/* 3. Enter Marks Section */}
       <Card className="shadow-md dark:shadow-indigo-900/10 overflow-hidden border-t-4 border-blue-500 rounded-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-white to-purple-50 dark:from-blue-900/20 dark:via-background dark:to-purple-900/20 p-4 md:p-6">
               <CardTitle className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                   <Edit className="h-6 w-6"/> Enter Student Marks
               </CardTitle>
               <CardDescription className="text-muted-foreground mt-1">Select a previously saved test and enter the marks obtained by each student.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-4 md:p-6">
              {/* Test Selection Dropdown */}
               <div className="max-w-md">
                 <Label htmlFor="markTestSelect" className="text-sm font-medium">Select Test to Enter Marks*</Label>
                  <Select value={selectedTestForMarks} onValueChange={setSelectedTestForMarks} disabled={!selectedClassId || !selectedSubjectId || availableTestsForMarks.length === 0} required>
                       <SelectTrigger id="markTestSelect" className="mt-1 bg-background shadow-sm">
                         <SelectValue placeholder="Select a saved test..." />
                       </SelectTrigger>
                       <SelectContent>
                         {availableTestsForMarks.length > 0 ? (
                             availableTestsForMarks.map(test => (
                                 <SelectItem key={test.id} value={test.id}>{test.name} ({test.date}) - {test.totalMarks} Marks</SelectItem>
                             ))
                         ) : (
                              <SelectItem value="no-saved-tests" disabled>No saved tests for this class/subject</SelectItem>
                         )}
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
               {selectedTestForMarks && studentsForMarkEntry.length > 0 && (
                   <div className="space-y-4 pt-4 border-t">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <h3 className="font-semibold text-lg">
                                Marks for: <span className="text-blue-600 dark:text-blue-400">{savedTests.find(t=>t.id===selectedTestForMarks)?.name}</span>
                                <span className="text-muted-foreground text-sm ml-2">(Max: {savedTests.find(t=>t.id===selectedTestForMarks)?.totalMarks})</span>
                            </h3>
                            {/* Enhanced CSV Upload Button */}
                             <Button variant="outline" size="sm" onClick={triggerCSVUpload} disabled={isSavingMarks} className="bg-gradient-to-r from-green-50 to-lime-50 hover:from-green-100 hover:to-lime-100 border-green-300 text-green-700 shadow-sm hover:shadow-md transition-all group">
                                <FileSpreadsheet className="mr-2 h-4 w-4 group-hover:animate-pulse" /> Bulk Upload (CSV)
                            </Button>
                       </div>
                       <div className="border rounded-md overflow-hidden shadow-sm">
                         <Table>
                             <TableHeader className="bg-muted/50 dark:bg-muted/20">
                                <TableRow>
                                    <TableHead className="w-[80px] text-center font-semibold text-indigo-800 dark:text-indigo-300">Seat No.</TableHead> {/* Enhanced Header */}
                                    <TableHead className="font-semibold">Student Name</TableHead>
                                    <TableHead className="w-[150px] text-right font-semibold">Obtained Marks*</TableHead>
                                </TableRow>
                             </TableHeader>
                             <TableBody>
                                 {studentsForMarkEntry.map((student, index) => (
                                     <TableRow key={student.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors duration-150">
                                         {/* Seat Number Style */}
                                         <TableCell className="font-mono text-center text-lg font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/30 border-r"> {/* Seat Style */}
                                            {student.rollNo}
                                          </TableCell>
                                         <TableCell className="font-medium">{student.name}</TableCell>
                                         <TableCell className="text-right">
                                             <Input
                                                 type="number"
                                                 value={studentMarks[student.id] ?? ''}
                                                 onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                                 min="0"
                                                 max={savedTests.find(t=>t.id===selectedTestForMarks)?.totalMarks}
                                                 className="text-right bg-background h-8 w-24 focus:ring-blue-500 dark:focus:ring-blue-400 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-colors" // Added focus ring color + border
                                                 placeholder="Score"
                                                 aria-label={`Marks for ${student.name}`} // Accessibility
                                                 disabled={isSavingMarks}
                                             />
                                         </TableCell>
                                     </TableRow>
                                 ))}
                             </TableBody>
                         </Table>
                       </div>
                       {/* Add buttons for per-student analysis/print later if needed */}
                   </div>
               )}
                {selectedTestForMarks && studentsForMarkEntry.length === 0 && (
                    <div className="text-center text-muted-foreground py-10 border-2 border-dashed border-muted rounded-lg bg-muted/20">
                        <p>No students found for the selected test's class/section.</p>
                    </div>
                )}
                 {!selectedTestForMarks && (selectedClassId && selectedSubjectId) && (
                    <div className="text-center text-muted-foreground py-10 border-2 border-dashed border-muted rounded-lg bg-muted/20">
                        <p className="font-medium">Select a saved test above</p>
                         <p className="text-sm">Choose a test from the dropdown to start entering marks for students.</p>
                    </div>
                )}

          </CardContent>
           {selectedTestForMarks && studentsForMarkEntry.length > 0 && (
               <CardFooter className="flex flex-col sm:flex-row justify-between items-center border-t pt-4 mt-6 p-4 md:p-6 bg-muted/30 dark:bg-muted/10">
                   {/* Placeholder for future analysis/print buttons */}
                    <div className="flex gap-2 mb-4 sm:mb-0">
                        <Button variant="outline" size="sm" onClick={handlePrintAnalysis} disabled>
                           <Printer className="mr-1 h-4 w-4"/> Print Analysis (Coming Soon)
                        </Button>
                         {/* <Button variant="outline" size="sm" disabled>
                             <Sparkles className="mr-1 h-4 w-4"/> Run Analysis (Coming Soon)
                         </Button> */}
                    </div>
                    <Button onClick={handleSaveMarks} disabled={isSavingMarks} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto shadow-lg hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105">
                        {isSavingMarks ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                         Save Marks for This Test
                    </Button>
               </CardFooter>
           )}
      </Card>
    </div>
  );
}

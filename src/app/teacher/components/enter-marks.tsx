'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { PlusCircle, Trash2, Upload, Save, Loader2, FileText, Calendar } from 'lucide-react';
import { type Class, type Subject } from '@/types'; // Assuming types are defined
import { useToast } from '@/hooks/use-toast';
// Remove imports related to student/marks for now
// import { type Student, type Mark, type Test } from '@/types';
// import { generateStudentInsights } from '@/ai/flows/generate-student-insights';

// Define a type for the test form data within the component
interface TestFormData {
    id: string; // Temporary unique ID for the accordion item
    name: string;
    date: string;
    totalMarks: number | '';
    file: File | null;
    chapters: string[]; // IDs or names of selected chapters
    topics: string[]; // IDs or names of selected topics
    // Add other fields like difficulty if needed
}


// Mock data - replace with API calls
const mockClasses: Class[] = [
   {
    id: 'cls1', name: 'Grade 1', grade: 1, sections: [] // Sections not needed here for test definition
   },
   {
    id: 'cls8', name: 'Grade 8', grade: 8, sections: []
   },
];
const mockSubjects: Subject[] = [
    { id: 'sub1', name: 'Mathematics', classId: 'cls1' },
    { id: 'sub2', name: 'English', classId: 'cls1' },
    { id: 'sub3', name: 'Mathematics', classId: 'cls8' },
    { id: 'sub4', name: 'Science', classId: 'cls8' },
];

// Mock syllabus data (replace with actual fetched data based on class/subject)
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
    // Add more syllabus data as needed
};


export function EnterMarks() {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [tests, setTests] = useState<TestFormData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const availableSubjects = useMemo(() => {
      if (!selectedClassId) return [];
      return mockSubjects.filter(s => s.classId === selectedClassId);
  }, [selectedClassId]);

  const currentSyllabus = useMemo(() => {
      if (!selectedClassId || !selectedSubjectId) return null;
      return (mockSyllabus as any)[`${selectedClassId}-${selectedSubjectId}`] || null;
  }, [selectedClassId, selectedSubjectId]);

  // Reset subject and tests when class changes
   useEffect(() => {
       setSelectedSubjectId('');
       setTests([]);
   }, [selectedClassId]);

   // Reset tests when subject changes
    useEffect(() => {
       setTests([]);
   }, [selectedSubjectId]);


  const handleAddTest = () => {
      if (!selectedClassId || !selectedSubjectId) {
          toast({title: "Selection Required", description: "Please select a class and subject first.", variant: "destructive"});
          return;
      }
      const newTest: TestFormData = {
          id: `new-${Date.now()}`, // Temporary unique ID
          name: '',
          date: '',
          totalMarks: '',
          file: null,
          chapters: [],
          topics: []
      };
      setTests(prev => [...prev, newTest]);
  };

  const handleRemoveTest = (testId: string) => {
      setTests(prev => prev.filter(test => test.id !== testId));
  };

  const handleTestChange = (testId: string, field: keyof TestFormData, value: any) => {
      setTests(prev => prev.map(test => {
          if (test.id === testId) {
              if (field === 'totalMarks') {
                  const numericValue = value === '' ? '' : parseInt(value, 10);
                   if (value === '' || (!isNaN(numericValue) && numericValue >= 0)) {
                        return { ...test, [field]: numericValue };
                   } else {
                        toast({ title: "Invalid Input", description: "Total Marks must be a non-negative number.", variant: "destructive" });
                        return test; // Don't update if invalid
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
           // Add validation if needed (type, size)
           const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
           if (!allowedTypes.includes(file.type)) {
                toast({ title: "Invalid File Type", description: "Please upload PDF or DOC/DOCX files.", variant: "destructive" });
                return;
           }
          handleTestChange(testId, 'file', file);
      }
  };

   const handleChapterChange = (testId: string, chapterId: string, isChecked: boolean | string) => {
       const chapter = currentSyllabus?.chapters.find((c: any) => c.id === chapterId);
       if (!chapter) return;
       const topicIds = chapter.topics.map((t: any) => t.id);

       setTests(prev => prev.map(test => {
           if (test.id === testId) {
               const updatedChapters = isChecked
                   ? [...test.chapters, chapterId]
                   : test.chapters.filter(id => id !== chapterId);
               // Also update topics based on chapter selection
               const updatedTopics = isChecked
                   ? [...new Set([...test.topics, ...topicIds])] // Add all topics of the chapter
                   : test.topics.filter(id => !topicIds.includes(id)); // Remove all topics of the chapter

               return { ...test, chapters: updatedChapters, topics: updatedTopics };
           }
           return test;
       }));
   };

   const handleTopicChange = (testId: string, topicId: string, isChecked: boolean | string) => {
        setTests(prev => prev.map(test => {
           if (test.id === testId) {
                const updatedTopics = isChecked
                   ? [...test.topics, topicId]
                   : test.topics.filter(id => id !== topicId);

                 // Ensure related chapter is checked if any of its topics are checked
                let updatedChapters = [...test.chapters];
                 if (isChecked) {
                     const chapter = currentSyllabus?.chapters.find((c: any) => c.topics.some((t: any) => t.id === topicId));
                     if (chapter && !updatedChapters.includes(chapter.id)) {
                         updatedChapters.push(chapter.id);
                     }
                 } else {
                     // If unchecking the last topic of a chapter, uncheck the chapter
                     const chapter = currentSyllabus?.chapters.find((c: any) => c.topics.some((t: any) => t.id === topicId));
                      if (chapter && chapter.topics.every((t: any) => !updatedTopics.includes(t.id))) {
                           updatedChapters = updatedChapters.filter(id => id !== chapter.id);
                      }
                 }

               return { ...test, topics: updatedTopics, chapters: updatedChapters };
           }
           return test;
       }));
   };


  const handleSaveAllTests = async () => {
    // Validation
    if (tests.length === 0) {
        toast({ title: "No Tests", description: "Add at least one test to save.", variant: "destructive"});
        return;
    }

    const isValid = tests.every(test => test.name && test.date && test.totalMarks !== '');
    if (!isValid) {
        toast({ title: "Incomplete Tests", description: "Please ensure all tests have a Name, Date, and Total Marks.", variant: "destructive"});
        return;
    }

    setIsSaving(true);

    // Prepare data for API (replace console log)
    const testsToSave = tests.map(test => ({
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        name: test.name,
        date: test.date,
        totalMarks: test.totalMarks,
        // Handle file upload separately - get URL after upload
        // syllabusChapters: test.chapters, // Send selected chapter IDs/names
        // syllabusTopics: test.topics, // Send selected topic IDs/names
    }));

    try {
        console.log("Saving Tests:", testsToSave);
         // Simulate API call(s) to save tests and upload files
         // For each test with a file, call upload service, get URL, then save test data with URL
         await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

         // --- Trigger AI Analysis for each uploaded paper (if applicable) ---
         // This might be better handled server-side after successful save & file upload
         /*
         for (const test of tests) {
             if (test.file) {
                 // Convert file to data URI and call analyzeTestPaper flow
                 // Store results in DB associated with the test
             }
         }
         */
         // ------------------------------------------------------------------

        toast({ title: "Success", description: "Tests saved successfully." });
        // Optionally clear tests after save: setTests([]);
    } catch (error) {
        console.error("Failed to save tests:", error);
        toast({ title: "Save Failed", description: "Could not save tests. Please try again.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Tests</CardTitle>
        <CardDescription>
          Define tests for the selected class and subject. Upload papers, set details, and link to syllabus topics. Mark entry will be done separately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Class and Subject Selection */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="classSelect">Class*</Label>
             <Select value={selectedClassId} onValueChange={setSelectedClassId} required>
               <SelectTrigger id="classSelect">
                 <SelectValue placeholder="Select Class" />
               </SelectTrigger>
               <SelectContent>
                 {mockClasses.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
          </div>
          <div className="flex-1">
             <Label htmlFor="subjectSelect">Subject*</Label>
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={!selectedClassId || availableSubjects.length === 0} required>
               <SelectTrigger id="subjectSelect">
                 <SelectValue placeholder="Select Subject" />
               </SelectTrigger>
               <SelectContent>
                 {availableSubjects.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
          </div>
        </div>

        {/* Dynamic Test Accordion */}
        <div className="space-y-4">
            <Button onClick={handleAddTest} disabled={!selectedClassId || !selectedSubjectId}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Test
            </Button>

            {tests.length === 0 && (selectedClassId && selectedSubjectId) && (
                 <p className="text-muted-foreground text-center py-4">No tests added yet for this subject.</p>
             )}

             {tests.length > 0 && (
                 <Accordion type="multiple" className="w-full">
                    {tests.map((test, index) => (
                      <AccordionItem value={test.id} key={test.id} className="border bg-muted/30 rounded-md mb-2 px-4">
                          <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center justify-between w-full">
                                  <span>{test.name || `Test ${index + 1}`}</span>
                                  {/* Add indicator if file is selected */}
                                  {test.file && <FileText className="h-4 w-4 text-muted-foreground ml-2" />}
                              </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4 space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                     <Label htmlFor={`testName-${test.id}`}>Test Name*</Label>
                                     <Input
                                         id={`testName-${test.id}`}
                                         value={test.name}
                                         onChange={(e) => handleTestChange(test.id, 'name', e.target.value)}
                                         placeholder="e.g., Mid-Term Exam"
                                         required
                                     />
                                 </div>
                                 <div>
                                      <Label htmlFor={`testDate-${test.id}`}>Date*</Label>
                                      <Input
                                        id={`testDate-${test.id}`}
                                        type="date"
                                        value={test.date}
                                        onChange={(e) => handleTestChange(test.id, 'date', e.target.value)}
                                        required
                                      />
                                  </div>
                                   <div>
                                      <Label htmlFor={`totalMarks-${test.id}`}>Total Marks*</Label>
                                      <Input
                                        id={`totalMarks-${test.id}`}
                                        type="number"
                                        value={test.totalMarks}
                                        onChange={(e) => handleTestChange(test.id, 'totalMarks', e.target.value)}
                                        placeholder="e.g., 100"
                                        min="1"
                                        required
                                      />
                                  </div>
                                  <div>
                                      <Label htmlFor={`fileUpload-${test.id}`}>Upload Paper (PDF/DOCX)</Label>
                                      <Input
                                        id={`fileUpload-${test.id}`}
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => handleFileChange(test.id, e)}
                                        className="cursor-pointer file:cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                      />
                                      {test.file && <p className="text-xs text-muted-foreground mt-1">Selected: {test.file.name}</p>}
                                  </div>
                             </div>

                              {/* Syllabus Linking */}
                              {currentSyllabus ? (
                                 <div className="space-y-3 pt-4 border-t">
                                      <h4 className="font-medium text-sm">Link to Syllabus</h4>
                                      {currentSyllabus.chapters.map((chapter: any) => (
                                          <div key={chapter.id} className="pl-2">
                                              <div className="flex items-center space-x-2">
                                                  {/* Checkbox for Chapter */}
                                                  <input
                                                      type="checkbox"
                                                      id={`chapter-${test.id}-${chapter.id}`}
                                                      checked={test.chapters.includes(chapter.id)}
                                                      onChange={(e) => handleChapterChange(test.id, chapter.id, e.target.checked)}
                                                      className="form-checkbox h-4 w-4 text-primary rounded"
                                                   />
                                                   <label htmlFor={`chapter-${test.id}-${chapter.id}`} className="font-medium text-sm">{chapter.name}</label>
                                              </div>
                                               <div className="pl-6 mt-1 space-y-1">
                                                   {chapter.topics.map((topic: any) => (
                                                       <div key={topic.id} className="flex items-center space-x-2">
                                                           {/* Checkbox for Topic */}
                                                           <input
                                                              type="checkbox"
                                                               id={`topic-${test.id}-${topic.id}`}
                                                               checked={test.topics.includes(topic.id)}
                                                               onChange={(e) => handleTopicChange(test.id, topic.id, e.target.checked)}
                                                               className="form-checkbox h-3.5 w-3.5 text-primary rounded"
                                                            />
                                                            <label htmlFor={`topic-${test.id}-${topic.id}`} className="text-xs text-muted-foreground">{topic.name}</label>
                                                       </div>
                                                   ))}
                                               </div>
                                          </div>
                                      ))}
                                  </div>
                               ) : (
                                   <p className="text-xs text-muted-foreground pt-2">Syllabus data not available for this subject.</p>
                               )}


                             {/* Remove Button */}
                              <div className="flex justify-end pt-2">
                                  <Button variant="destructive" size="sm" onClick={() => handleRemoveTest(test.id)}>
                                      <Trash2 className="mr-1 h-3 w-3" /> Remove Test
                                  </Button>
                              </div>
                          </AccordionContent>
                      </AccordionItem>
                     ))}
                 </Accordion>
             )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
         {/* Save All Tests Button */}
         {tests.length > 0 && (
             <Button onClick={handleSaveAllTests} disabled={isSaving}>
               {isSaving ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Tests...
                 </>
               ) : (
                 <>
                   <Save className="mr-2 h-4 w-4" /> Save All Tests
                 </>
               )}
             </Button>
         )}
      </CardFooter>
    </Card>
  );
}

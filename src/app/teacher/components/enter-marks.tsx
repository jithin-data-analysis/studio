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
import { PlusCircle, Trash2, Upload, Save, Loader2, FileText, Calendar, BookCopy, Tag } from 'lucide-react'; // Added icons
import { type Class, type Subject, type CoCurricularActivity } from '@/types'; // Assuming types are defined
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea


// Define a type for the test form data within the component
interface TestFormData {
    id: string; // Temporary unique ID for the accordion item
    name: string;
    date: string;
    totalMarks: number | '';
    file: File | null;
    chapters: string[]; // IDs or names of selected chapters
    topics: string[]; // IDs or names of selected topics
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
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>([]); // State to control accordion open/close
  const { toast } = useToast();

  const availableSubjects = useMemo(() => {
      if (!selectedClassId) return [];
      return mockSubjects.filter(s => s.classId === selectedClassId);
  }, [selectedClassId]);

  const currentSyllabus = useMemo(() => {
      if (!selectedClassId || !selectedSubjectId) return null;
      const syllabusKey = `${selectedClassId}-${selectedSubjectId}`;
      // Explicitly type the mockSyllabus object for better safety
      const syllabusData = (mockSyllabus as Record<string, { chapters: { id: string; name: string; topics: { id: string; name: string }[] }[] }>)[syllabusKey];
      return syllabusData || null;
  }, [selectedClassId, selectedSubjectId]);

  // Reset subject and tests when class changes
   useEffect(() => {
       setSelectedSubjectId('');
       setTests([]);
       setActiveAccordionItems([]);
   }, [selectedClassId]);

   // Reset tests when subject changes
    useEffect(() => {
       setTests([]);
       setActiveAccordionItems([]);
   }, [selectedSubjectId]);


  const handleAddTest = () => {
      if (!selectedClassId || !selectedSubjectId) {
          toast({title: "Selection Required", description: "Please select a class and subject first.", variant: "destructive"});
          return;
      }
      const newTestId = `new-${Date.now()}`;
      const newTest: TestFormData = {
          id: newTestId, // Temporary unique ID
          name: '',
          date: '',
          totalMarks: '',
          file: null,
          chapters: [],
          topics: []
      };
      setTests(prev => [...prev, newTest]);
       // Automatically open the newly added accordion item
      setActiveAccordionItems(prev => [...prev, newTestId]);
       toast({title: "New Test Added", description: "Fill in the details for the new test."});
  };

  const handleRemoveTest = (testId: string) => {
      // Add confirmation later if needed
      setTests(prev => prev.filter(test => test.id !== testId));
       setActiveAccordionItems(prev => prev.filter(id => id !== testId)); // Remove from active items if present
      toast({title: "Test Removed", description: "The test entry has been removed.", variant: "destructive"});
  };

  const handleTestChange = (testId: string, field: keyof TestFormData, value: any) => {
      setTests(prev => prev.map(test => {
          if (test.id === testId) {
              if (field === 'totalMarks') {
                  const numericValue = value === '' ? '' : parseInt(value, 10);
                   if (value === '' || (!isNaN(numericValue) && numericValue >= 0)) {
                        return { ...test, [field]: numericValue };
                   } else {
                        // Optionally show inline validation message instead of toast
                        // For simplicity, using toast here
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
                if (event.target) event.target.value = ""; // Clear the input
                return;
           }
          handleTestChange(testId, 'file', file);
      }
  };

   const handleChapterChange = (testId: string, chapterId: string, isChecked: boolean | string) => {
       const chapter = currentSyllabus?.chapters.find((c) => c.id === chapterId);
       if (!chapter) return;
       const topicIds = chapter.topics.map((t) => t.id);

       setTests(prev => prev.map(test => {
           if (test.id === testId) {
               const updatedChapters = isChecked
                   ? [...new Set([...test.chapters, chapterId])] // Ensure unique chapter IDs
                   : test.chapters.filter(id => id !== chapterId);

               // Update topics: add all topics if chapter checked, remove all if unchecked
               const updatedTopics = isChecked
                   ? [...new Set([...test.topics, ...topicIds])] // Ensure unique topic IDs
                   : test.topics.filter(id => !topicIds.includes(id));

               return { ...test, chapters: updatedChapters, topics: updatedTopics };
           }
           return test;
       }));
   };

   const handleTopicChange = (testId: string, topicId: string, isChecked: boolean | string) => {
        setTests(prev => prev.map(test => {
           if (test.id === testId) {
                const updatedTopics = isChecked
                   ? [...new Set([...test.topics, topicId])] // Ensure unique
                   : test.topics.filter(id => id !== topicId);

                 // Logic to update chapter based on topic selection
                let updatedChapters = [...test.chapters];
                 const chapter = currentSyllabus?.chapters.find((c) => c.topics.some((t) => t.id === topicId));

                 if (chapter) {
                     const allTopicIdsInChapter = chapter.topics.map(t => t.id);
                     const topicsSelectedInChapter = updatedTopics.filter(tid => allTopicIdsInChapter.includes(tid));

                     if (isChecked && !updatedChapters.includes(chapter.id)) {
                          // If a topic is checked and its chapter isn't, check the chapter
                         updatedChapters.push(chapter.id);
                     } else if (!isChecked && topicsSelectedInChapter.length === 0 && updatedChapters.includes(chapter.id)) {
                         // If a topic is unchecked and it was the last selected topic of that chapter, uncheck the chapter
                          updatedChapters = updatedChapters.filter(id => id !== chapter.id);
                     }
                 }

               return { ...test, topics: updatedTopics, chapters: [...new Set(updatedChapters)] }; // Ensure unique chapters
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

    let firstInvalidTestId: string | null = null;
    const isValid = tests.every(test => {
         const valid = test.name && test.date && test.totalMarks !== '' && test.totalMarks >= 0;
         if (!valid && firstInvalidTestId === null) {
             firstInvalidTestId = test.id;
         }
         return valid;
     });

    if (!isValid && firstInvalidTestId) {
        toast({ title: "Incomplete Tests", description: "Ensure all tests have a Name, Date, and valid Total Marks.", variant: "destructive"});
        // Optionally open the first invalid accordion item
        if (!activeAccordionItems.includes(firstInvalidTestId)) {
            setActiveAccordionItems(prev => [...prev, firstInvalidTestId!]);
        }
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
        // In a real app, you'd likely upload files first, get URLs, then save test data
        // file: test.file, // Don't send the file object directly usually
        syllabusChapters: test.chapters, // Send selected chapter IDs/names
        syllabusTopics: test.topics, // Send selected topic IDs/names
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

        toast({ title: "Success", description: `${tests.length} test(s) saved successfully.` });
        // Clear tests after successful save
        setTests([]);
        setActiveAccordionItems([]);

    } catch (error) {
        console.error("Failed to save tests:", error);
        toast({ title: "Save Failed", description: "Could not save tests. Please try again.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <Card className="shadow-md dark:shadow-indigo-900/10"> {/* Added shadow */}
      <CardHeader>
        <CardTitle>Manage Tests</CardTitle>
        <CardDescription>
          Define tests for the selected class and subject. Upload papers, set details, and link to syllabus topics. Mark entry will be available after tests are saved.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Class and Subject Selection */}
        <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-muted/30 items-end">
          <div className="flex-1">
            <Label htmlFor="classSelect" className="text-xs font-semibold uppercase text-muted-foreground">Class*</Label>
             <Select value={selectedClassId} onValueChange={setSelectedClassId} required>
               <SelectTrigger id="classSelect" className="bg-background">
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
             <Label htmlFor="subjectSelect" className="text-xs font-semibold uppercase text-muted-foreground">Subject*</Label>
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={!selectedClassId || availableSubjects.length === 0} required>
               <SelectTrigger id="subjectSelect" className="bg-background">
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

        {/* Dynamic Test Accordion */}
        <div className="space-y-4">
            <Button onClick={handleAddTest} disabled={!selectedClassId || !selectedSubjectId}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Test
            </Button>

            {tests.length === 0 && (selectedClassId && selectedSubjectId) && (
                 <div className="text-center text-muted-foreground py-10 border-2 border-dashed border-muted rounded-lg">
                     <p>No tests added yet for {mockSubjects.find(s=>s.id===selectedSubjectId)?.name}.</p>
                     <p className="text-sm">Click "+ Add New Test" to start.</p>
                 </div>
             )}

             {tests.length > 0 && (
                 <Accordion
                     type="multiple"
                     className="w-full space-y-2"
                     value={activeAccordionItems}
                     onValueChange={setActiveAccordionItems} // Control open/close state
                 >
                    {tests.map((test, index) => (
                      <AccordionItem
                         value={test.id}
                         key={test.id}
                         className="border border-border rounded-lg overflow-hidden shadow-sm bg-background dark:bg-muted/20"
                      >
                          <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline transition-colors duration-150 data-[state=open]:bg-muted/50">
                              <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                       <span className="font-semibold text-primary">{test.name || `Untitled Test ${index + 1}`}</span>
                                       {test.date && <span className="text-xs text-muted-foreground">({test.date})</span>}
                                  </div>
                                  <div className="flex items-center gap-2">
                                      {test.file && <FileText className="h-4 w-4 text-green-600" title="Paper Uploaded" />}
                                      {(test.chapters.length > 0 || test.topics.length > 0) && <BookCopy className="h-4 w-4 text-blue-600" title="Syllabus Linked" />}
                                       {/* Add validation indicator if needed */}
                                       {(!test.name || !test.date || test.totalMarks === '' || test.totalMarks < 0) && (
                                            <span className="text-xs text-destructive font-medium">(Incomplete)</span>
                                       )}
                                  </div>
                              </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-4 border-t border-border bg-muted/20">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                 <div>
                                     <Label htmlFor={`testName-${test.id}`} className="text-xs font-medium">Test Name*</Label>
                                     <Input
                                         id={`testName-${test.id}`}
                                         value={test.name}
                                         onChange={(e) => handleTestChange(test.id, 'name', e.target.value)}
                                         placeholder="e.g., Mid-Term Exam"
                                         required
                                         className="bg-background"
                                     />
                                 </div>
                                 <div>
                                      <Label htmlFor={`testDate-${test.id}`} className="text-xs font-medium">Date*</Label>
                                       <div className="relative">
                                          <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                          <Input
                                            id={`testDate-${test.id}`}
                                            type="date"
                                            value={test.date}
                                            onChange={(e) => handleTestChange(test.id, 'date', e.target.value)}
                                            required
                                            className="bg-background pl-8"
                                          />
                                      </div>
                                  </div>
                                   <div>
                                      <Label htmlFor={`totalMarks-${test.id}`} className="text-xs font-medium">Total Marks*</Label>
                                      <Input
                                        id={`totalMarks-${test.id}`}
                                        type="number"
                                        value={test.totalMarks}
                                        onChange={(e) => handleTestChange(test.id, 'totalMarks', e.target.value)}
                                        placeholder="e.g., 100"
                                        min="0" // Allow 0 marks
                                        required
                                        className="bg-background"
                                      />
                                       {(test.totalMarks !== '' && test.totalMarks < 0) && <p className="text-xs text-destructive mt-1">Marks cannot be negative.</p>}
                                  </div>
                                  <div>
                                      <Label htmlFor={`fileUpload-${test.id}`} className="text-xs font-medium">Upload Paper (PDF/DOCX)</Label>
                                      <div className="relative">
                                         <Upload className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                          <Input
                                            id={`fileUpload-${test.id}`}
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => handleFileChange(test.id, e)}
                                            className="cursor-pointer file:cursor-pointer pl-8 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 bg-background"
                                          />
                                      </div>
                                      {test.file && <p className="text-xs text-muted-foreground mt-1 truncate" title={test.file.name}><FileText className="inline h-3 w-3 mr-1"/> {test.file.name}</p>}
                                  </div>
                             </div>

                              {/* Syllabus Linking - Enhanced UI */}
                              {currentSyllabus ? (
                                 <div className="mt-6 pt-4 border-t border-border/50">
                                      <h4 className="font-medium text-sm mb-3 flex items-center gap-2"><BookCopy className="h-4 w-4" /> Link to Syllabus Covered</h4>
                                       <ScrollArea className="h-48 w-full rounded-md border border-border bg-background p-3">
                                          <div className="space-y-3">
                                              {currentSyllabus.chapters.length === 0 && <p className="text-sm text-muted-foreground">No syllabus chapters found for this subject.</p>}
                                              {currentSyllabus.chapters.map((chapter) => (
                                                  <div key={chapter.id} className="pb-2">
                                                      <div className="flex items-center space-x-2 mb-1">
                                                          <Checkbox
                                                              id={`chapter-${test.id}-${chapter.id}`}
                                                              checked={test.chapters.includes(chapter.id)}
                                                              onCheckedChange={(checked) => handleChapterChange(test.id, chapter.id, checked)}
                                                          />
                                                           <label htmlFor={`chapter-${test.id}-${chapter.id}`} className="font-medium text-sm cursor-pointer">{chapter.name}</label>
                                                      </div>
                                                       <div className="pl-6 mt-1 space-y-1">
                                                           {chapter.topics.map((topic) => (
                                                               <div key={topic.id} className="flex items-center space-x-2">
                                                                   <Checkbox
                                                                      id={`topic-${test.id}-${topic.id}`}
                                                                       checked={test.topics.includes(topic.id)}
                                                                       onCheckedChange={(checked) => handleTopicChange(test.id, topic.id, checked)}
                                                                   />
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


                             {/* Remove Button */}
                              <div className="flex justify-end pt-4 mt-4 border-t border-border/50">
                                  <Button variant="destructive" size="sm" onClick={() => handleRemoveTest(test.id)}>
                                      <Trash2 className="mr-1 h-3 w-3" /> Remove This Test
                                  </Button>
                              </div>
                          </AccordionContent>
                      </AccordionItem>
                     ))}
                 </Accordion>
             )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-4 mt-6"> {/* Added border and margin */}
         {/* Save All Tests Button */}
         {tests.length > 0 && (
             <Button onClick={handleSaveAllTests} disabled={isSaving} size="lg"> {/* Larger save button */}
               {isSaving ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Tests...
                 </>
               ) : (
                 <>
                   <Save className="mr-2 h-4 w-4" /> Save All Defined Tests ({tests.length})
                 </>
               )}
             </Button>
         )}
      </CardFooter>
    </Card>
  );
}

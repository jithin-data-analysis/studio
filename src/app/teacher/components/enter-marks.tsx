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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Upload, Save, Loader2, FileUp } from 'lucide-react';
import { type Class, type Section, type Subject, type Student, type Mark, type Test } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { generateStudentInsights } from '@/ai/flows/generate-student-insights'; // Import the AI flow

// Mock data - replace with API calls
const mockClasses: Class[] = [
   {
    id: 'cls1', name: 'Grade 1', grade: 1,
    sections: [
      { id: 'sec1a', name: 'A', classId: 'cls1', students: [
          { id: 'stu1', name: 'Alice Wonder', rollNo: '101', dob: '2016-01-15', gender: 'Female', photoUrl: 'https://picsum.photos/seed/101/100', classId: 'cls1', sectionId: 'sec1a', coCurricularIds: ['act1'] },
          { id: 'stu2', name: 'Bob The Builder', rollNo: '102', dob: '2016-03-20', gender: 'Male', classId: 'cls1', sectionId: 'sec1a', coCurricularIds: [] },
       ]},
      { id: 'sec1b', name: 'B', classId: 'cls1', students: [
           { id: 'stu3', name: 'Charlie Chaplin', rollNo: '103', dob: '2016-02-10', gender: 'Male', photoUrl: 'https://picsum.photos/seed/103/100', classId: 'cls1', sectionId: 'sec1b', coCurricularIds: ['act2'] },
      ] },
    ],
  },
   {
    id: 'cls8', name: 'Grade 8', grade: 8,
    sections: [
      { id: 'sec8a', name: 'A', classId: 'cls8', students: [
           { id: 'stu4', name: 'Diana Prince', rollNo: '801', dob: '2009-05-05', gender: 'Female', classId: 'cls8', sectionId: 'sec8a', coCurricularIds: ['act1', 'act3'] },
            { id: 'stu5', name: 'Ethan Hunt', rollNo: '802', dob: '2009-07-12', gender: 'Male', classId: 'cls8', sectionId: 'sec8a', coCurricularIds: [] },
      ] },
    ],
  },
];
const mockSubjects: Subject[] = [
    { id: 'sub1', name: 'Mathematics', classId: 'cls1' },
    { id: 'sub2', name: 'English', classId: 'cls1' },
    { id: 'sub3', name: 'Mathematics', classId: 'cls8' },
    { id: 'sub4', name: 'Science', classId: 'cls8' },
];

// In a real app, this would fetch students based on class/section selection
const getStudentsForSection = (classId: string, sectionId: string): Student[] => {
    const cls = mockClasses.find(c => c.id === classId);
    if (!cls) return [];
    const sec = cls.sections.find(s => s.id === sectionId);
    return sec?.students || [];
}

export function EnterMarks() {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [testDate, setTestDate] = useState<string>('');
  const [testType, setTestType] = useState<string>('');
  const [totalMarks, setTotalMarks] = useState<number | ''>('');
  const [marks, setMarks] = useState<Record<string, number | ''>>({}); // studentId -> obtainedMarks
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const availableSections = useMemo(() => {
    const selectedClass = mockClasses.find(c => c.id === selectedClassId);
    return selectedClass?.sections || [];
  }, [selectedClassId]);

  const availableSubjects = useMemo(() => {
      if (!selectedClassId) return [];
      return mockSubjects.filter(s => s.classId === selectedClassId);
  }, [selectedClassId])

  const studentsInSection = useMemo(() => {
      if (!selectedClassId || !selectedSectionId) return [];
      return getStudentsForSection(selectedClassId, selectedSectionId);
  }, [selectedClassId, selectedSectionId])

  // Reset dependent dropdowns and marks when class/section changes
   useEffect(() => {
       setSelectedSectionId('');
       setSelectedSubjectId('');
       setMarks({});
   }, [selectedClassId]);

    useEffect(() => {
       setSelectedSubjectId('');
       setMarks({});
   }, [selectedSectionId]);

   // Initialize marks state when students load
   useEffect(() => {
       const initialMarks: Record<string, number | ''> = {};
       studentsInSection.forEach(student => {
           initialMarks[student.id] = '';
       });
       setMarks(initialMarks);
   }, [studentsInSection]);


  const handleMarkChange = (studentId: string, value: string) => {
    const numericValue = value === '' ? '' : parseInt(value, 10);
    // Basic validation: allow empty or non-negative integers <= totalMarks
    if (value === '' || (!isNaN(numericValue) && numericValue >= 0 && (totalMarks === '' || numericValue <= totalMarks))) {
        setMarks(prev => ({ ...prev, [studentId]: numericValue }));
    } else if (!isNaN(numericValue) && totalMarks !== '' && numericValue > totalMarks) {
         toast({ title: "Invalid Mark", description: `Marks cannot exceed Total Marks (${totalMarks}).`, variant: "destructive" });
    } else if (isNaN(numericValue) || numericValue < 0) {
         toast({ title: "Invalid Input", description: "Please enter a valid non-negative number.", variant: "destructive" });
    }
  };

  const handleSaveMarks = async () => {
    // Validation
    if (!selectedClassId || !selectedSectionId || !selectedSubjectId || !testDate || !testType || totalMarks === '') {
      toast({ title: "Missing Information", description: "Please fill in all test metadata fields.", variant: "destructive" });
      return;
    }
    if (studentsInSection.length === 0) {
        toast({ title: "No Students", description: "No students found for the selected class/section.", variant: "destructive" });
        return;
    }
     // Check if all marks are entered (or handle partial saves if allowed)
     const allMarksEntered = studentsInSection.every(student => marks[student.id] !== '');
     if (!allMarksEntered) {
          // Decide how to handle: block save, warn user, or allow partial save
          const confirmPartial = confirm("Not all marks have been entered. Do you want to save partially?");
          if (!confirmPartial) return;
     }

    setIsSaving(true);
    // 1. Create the Test record
    const newTest: Test = {
        id: `test${Date.now()}`, // Temporary ID
        classId: selectedClassId,
        sectionId: selectedSectionId,
        subjectId: selectedSubjectId,
        teacherId: 'teacher123', // Replace with actual logged-in teacher ID
        date: testDate,
        type: testType,
        totalMarks: totalMarks as number,
        // testPaperUrl could be linked here if uploaded separately
    }

    // 2. Prepare Mark records
    const markRecords: Mark[] = studentsInSection
        .filter(student => marks[student.id] !== '') // Filter out empty marks if saving partially
        .map(student => ({
            id: `mark${Date.now()}${student.id}`, // Temporary ID
            studentId: student.id,
            testId: newTest.id,
            obtainedMarks: marks[student.id] as number,
        }));


    // 3. Simulate API call (replace with actual calls)
    try {
      console.log("Saving Test:", newTest);
      console.log("Saving Marks:", markRecords);
      // await api.createTest(newTest);
      // await api.createMarks(markRecords);

      // --- Trigger AI Insights (Optional: Could be done server-side after save) ---
      // Fetch minimal historical context if needed (e.g., last 3 scores in this subject)
       const historicalContextExample = "Previous scores in this subject: 75, 80, 72"; // Replace with actual context fetching logic

       for (const mark of markRecords) {
            const student = studentsInSection.find(s => s.id === mark.studentId);
            const subject = availableSubjects.find(s => s.id === selectedSubjectId);
            if (student && subject) {
                 try {
                     const insights = await generateStudentInsights({
                         studentId: student.id,
                         testId: newTest.id,
                         obtainedMarks: mark.obtainedMarks,
                         totalMarks: newTest.totalMarks,
                         subject: subject.name,
                         date: newTest.date,
                         type: newTest.type,
                         historicalContext: historicalContextExample // Add historical context if available
                     });
                     console.log(`AI Insights for ${student.name}:`, insights);
                     // TODO: Store these insights in DB associated with the student/mark/test
                 } catch (insightError) {
                     console.error(`Failed to generate insights for ${student.name}:`, insightError);
                     // Don't block saving marks if insights fail, maybe log it
                 }
             }
        }
        // -----------------------------------------------------------------------------


      toast({ title: "Success", description: "Marks saved successfully." });
      // Optionally reset form fields after successful save
       // setSelectedClassId('');
       // setMarks({});
    } catch (error) {
      console.error("Failed to save marks:", error);
      toast({ title: "Save Failed", description: "Could not save marks. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Add CSV upload logic here
        // Parse CSV, validate data, populate marks state
        toast({ title: "CSV Upload", description: "CSV upload functionality not yet implemented.", variant: "default" });
        if (event.target) event.target.value = ""; // Reset file input
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Student Marks</CardTitle>
        <CardDescription>
          Select the class, section, subject, and enter test details, then input marks for each student.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Metadata Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30">
          <div>
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
          <div>
             <Label htmlFor="sectionSelect">Section*</Label>
             <Select value={selectedSectionId} onValueChange={setSelectedSectionId} disabled={!selectedClassId || availableSections.length === 0} required>
               <SelectTrigger id="sectionSelect">
                 <SelectValue placeholder="Select Section" />
               </SelectTrigger>
               <SelectContent>
                  {/* Removed the potentially empty value SelectItem */}
                 {availableSections.map(sec => (
                    <SelectItem key={sec.id} value={sec.id}>Section {sec.name}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
          </div>
           <div>
             <Label htmlFor="subjectSelect">Subject*</Label>
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={!selectedSectionId || availableSubjects.length === 0} required>
               <SelectTrigger id="subjectSelect">
                 <SelectValue placeholder="Select Subject" />
               </SelectTrigger>
               <SelectContent>
                  {/* Removed the potentially empty value SelectItem */}
                 {availableSubjects.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
          </div>
          <div>
             <Label htmlFor="testDate">Test Date*</Label>
             <Input id="testDate" type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} required/>
          </div>
          <div>
             <Label htmlFor="testType">Test Type*</Label>
             <Input id="testType" placeholder="e.g., Midterm, Unit Test" value={testType} onChange={(e) => setTestType(e.target.value)} required/>
          </div>
           <div>
             <Label htmlFor="totalMarks">Total Marks*</Label>
             <Input id="totalMarks" type="number" placeholder="e.g., 50" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value === '' ? '' : parseInt(e.target.value))} min="1" required/>
          </div>
        </div>

        {/* Marks Entry Table */}
         <div className="border rounded-md overflow-hidden">
           <div className="p-2 bg-muted/50 flex justify-between items-center">
             <h4 className="font-semibold">Enter Marks for {studentsInSection.length} Students</h4>
              <Button variant="outline" size="sm" asChild>
                  <Label htmlFor="csv-upload" className="cursor-pointer">
                     <FileUp className="mr-2 h-4 w-4" /> Upload CSV
                 </Label>
             </Button>
              <Input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
           </div>
           {selectedSectionId && studentsInSection.length > 0 && totalMarks !== '' ? (
              <div className="max-h-[400px] overflow-y-auto">
                 <Table>
                   <TableHeader className="sticky top-0 bg-background z-10">
                     <TableRow>
                       <TableHead className="w-[80px]">Roll No.</TableHead>
                       <TableHead>Student Name</TableHead>
                       <TableHead className="w-[150px]">Obtained Marks*</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {studentsInSection.sort((a,b) => a.rollNo.localeCompare(b.rollNo)).map((student) => (
                       <TableRow key={student.id}>
                         <TableCell>{student.rollNo}</TableCell>
                         <TableCell className="font-medium">{student.name}</TableCell>
                         <TableCell>
                           <Input
                             type="number"
                             value={marks[student.id] ?? ''}
                             onChange={(e) => handleMarkChange(student.id, e.target.value)}
                             placeholder={`/${totalMarks}`}
                             max={totalMarks as number}
                             min={0}
                             className="max-w-[100px]"
                           />
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
              </div>
           ) : (
                <div className="h-24 flex items-center justify-center text-muted-foreground">
                    { !selectedSectionId ? "Please select a class and section." : totalMarks === '' ? "Please enter Total Marks for the test." : "No students found for this section."}
                </div>
           )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSaveMarks} disabled={isSaving || !selectedSectionId || studentsInSection.length === 0 || totalMarks === ''}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Marks
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}


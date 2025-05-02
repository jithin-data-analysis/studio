'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Brain, Sparkles, AlertTriangle, FlaskConical, UserCheck, Users, TrendingUp, TrendingDown, Lightbulb, Clock, Info } from 'lucide-react'; // Added Info icon
import { type Class, type Section, type Student, type Test, type Subject } from '@/types';
import { generateStudentInsights } from '@/ai/flows/generate-student-insights';
import { correlateCoCurricularActivities } from '@/ai/flows/correlate-co-curricular-activities'; // Import correlation flow
import { type GenerateStudentInsightsOutput } from '@/ai/flows/generate-student-insights';
import { type CorrelateCoCurricularActivitiesOutput } from '@/ai/flows/correlate-co-curricular-activities';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { simulateFetchData } from '@/services/supabase'; // Import simulation helper

// Mock Data (Only used if SIMULATE_AI is true or fetch fails)
const mockClasses: Class[] = [
   { id: 'cls1', name: 'Grade 1', grade: 1, sections: [{ id: 'sec1a', name: 'A', classId: 'cls1', students: []},{ id: 'sec1b', name: 'B', classId: 'cls1', students: []}] },
   { id: 'cls8', name: 'Grade 8', grade: 8, sections: [{ id: 'sec8a', name: 'A', classId: 'cls8', students: []}] },
];
const mockStudents: Student[] = [
    { id: 'stu1', name: 'Alice Wonder', rollNo: '101', dob: '2016-01-15', gender: 'Female', classId: 'cls1', sectionId: 'sec1a', coCurricularIds: ['act1']} as Student,
    { id: 'stu2', name: 'Bob The Builder', rollNo: '102', dob: '2016-03-20', gender: 'Male', classId: 'cls1', sectionId: 'sec1a', coCurricularIds: []} as Student,
    { id: 'stu4', name: 'Diana Prince', rollNo: '801', dob: '2009-05-05', gender: 'Female', classId: 'cls8', sectionId: 'sec8a', coCurricularIds: ['act1', 'act3']} as Student,
    { id: 'stu5', name: 'Ethan Hunt', rollNo: '802', dob: '2009-07-12', gender: 'Male', classId: 'cls8', sectionId: 'sec8a', coCurricularIds: []} as Student,
];
const mockTests: Test[] = [
    { id: 'test1', classId: 'cls1', sectionId: 'sec1a', subjectId: 'sub1', teacherId: 't1', date: '2024-05-10', type: 'Unit Test', totalMarks: 20 },
    { id: 'test2', classId: 'cls8', sectionId: 'sec8a', subjectId: 'sub3', teacherId: 't1', date: '2024-05-15', type: 'Midterm', totalMarks: 50 },
];
const mockSubjects: Subject[] = [
    { id: 'sub1', name: 'Mathematics', classId: 'cls1' },
    { id: 'sub3', name: 'Mathematics', classId: 'cls8' },
];
// Assume mock marks exist and can be fetched based on studentId/testId
const mockMarks: { [key: string]: { obtainedMarks: number } } = { // Added type annotation
    'stu1_test1': { obtainedMarks: 15 },
    'stu2_test1': { obtainedMarks: 18 },
    'stu4_test2': { obtainedMarks: 40 },
    'stu5_test2': { obtainedMarks: 35 },
}

export function PerformanceInsights() {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>(''); // For co-curricular
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isLoadingCorrelation, setIsLoadingCorrelation] = useState(false);
  const [studentInsights, setStudentInsights] = useState<GenerateStudentInsightsOutput | null>(null);
  const [correlationInsights, setCorrelationInsights] = useState<CorrelateCoCurricularActivitiesOutput | null>(null);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [correlationError, setCorrelationError] = useState<string | null>(null);
  const { toast } = useToast();

  // Use state for fetched/mocked data
  const [students, setStudents] = useState<Student[]>([]);
  const [tests, setTests] = useState<Test[]>([]); // Maybe fetch tests too if needed

  const isSimulating = process.env.SIMULATE_AI === 'true';

  const availableSections = useMemo(() => {
    const selectedClass = mockClasses.find(c => c.id === selectedClassId);
    return selectedClass?.sections || [];
  }, [selectedClassId]);

  const availableStudents = useMemo(() => {
      // Use the 'students' state which is populated by fetch/simulation
      return students;
  }, [students]);

   // Reset dependent dropdowns
   useEffect(() => {
       setSelectedSectionId('');
       setSelectedStudentId('');
       setStudentInsights(null);
       setInsightError(null);
       setStudents([]); // Clear student list
   }, [selectedClassId]);

    useEffect(() => {
       setSelectedStudentId('');
       setStudentInsights(null);
       setInsightError(null);
       fetchStudentsForSection(); // Fetch students when section changes
   }, [selectedSectionId]);

    useEffect(() => {
        setStudentInsights(null); // Clear previous student's insights when selection changes
        setInsightError(null);
    }, [selectedStudentId])

    // Reset correlation insights when class/term changes for the correlation section
    useEffect(() => {
        setCorrelationInsights(null);
        setCorrelationError(null);
    }, [selectedClassId, selectedTerm]); // Keep this dependency


   // Fetch students for the selected section
   const fetchStudentsForSection = async () => {
       if (!selectedSectionId) {
           setStudents([]);
           return;
       }
       // In a real app, fetch students based on selectedSectionId
       try {
           const fetchedStudents = await simulateFetchData('students', { sectionId: selectedSectionId });
           setStudents(fetchedStudents);
       } catch (error) {
           console.error("Failed to fetch students:", error);
           toast({ title: "Fetch Error", description: "Could not load students for the selected section.", variant: "destructive" });
           setStudents(isSimulating ? mockStudents.filter(s => s.sectionId === selectedSectionId) : []); // Fallback
       }
   };


  const handleFetchStudentInsights = async () => {
    if (!selectedStudentId) {
        toast({ title: "Missing Selection", description: "Please select a student.", variant: "destructive" });
        return;
    }

    setIsLoadingInsights(true);
    setStudentInsights(null);
    setInsightError(null);

    try {
      // Fetch student data
      const student = students.find(s => s.id === selectedStudentId); // Use state
      if (!student) throw new Error("Student data not found in current selection.");

       // Fetch tests and marks for the student (replace with actual fetch logic)
       // This simulation finds the latest relevant test from mocks
       const relevantTests = mockTests // Replace with fetched tests if available
           .filter(t => t.classId === student.classId && (!t.sectionId || t.sectionId === student.sectionId))
           .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
       const lastTest = relevantTests[0];

      if (!lastTest) {
           setInsightError("No recent test data found for this student to generate insights.");
           setIsLoadingInsights(false);
           return;
      }

      // Simulate fetching the specific mark
      const markData = isSimulating ? mockMarks[`${student.id}_${lastTest.id}`] : await simulateFetchData('marks', { studentId: student.id, testId: lastTest.id }).then(m => m[0]);
      const subject = mockSubjects.find(s => s.id === lastTest.subjectId); // Replace with fetched subjects if needed
      const historicalContext = "Simulated: Previous scores in Math: 70%, 75%, 68%"; // Example context - fetch real data

       if (!markData || !subject) {
           setInsightError("Could not find complete mark or subject data for the latest test.");
            setIsLoadingInsights(false);
           return;
       }

       toast({ title: `Generating Insights ${isSimulating ? '(Simulated)' : ''}...`, description: `Fetching AI analysis for ${student.name}.` });

       // Call the flow (handles its own simulation)
      const result = await generateStudentInsights({
          studentId: student.id,
          testId: lastTest.id,
          obtainedMarks: markData.obtainedMarks,
          totalMarks: lastTest.totalMarks,
          subject: subject.name,
          date: lastTest.date,
          type: lastTest.type,
          historicalContext: historicalContext, // Add actual historical context fetching
      });
      setStudentInsights(result);
      toast({ title: `Insights Generated ${isSimulating ? '(Simulated)' : ''}`, description: `Analysis complete for ${student.name}.` });

    } catch (error: any) {
      console.error("Failed to fetch student insights:", error);
       let errorMsg = error.message || "An unexpected error occurred.";
       if (!isSimulating && error.message?.includes('GOOGLE_GENAI_API_KEY')) {
           errorMsg = 'Missing Google API Key. Set SIMULATE_AI=true in .env to test without keys.'
       }
      setInsightError(errorMsg);
      toast({ title: "Error Fetching Insights", description: errorMsg, variant: "destructive" });
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleFetchCorrelationInsights = async () => {
     if (!selectedClassId || !selectedTerm) {
        toast({ title: "Missing Selection", description: "Please select a class and term for correlation analysis.", variant: "destructive" });
        return;
     }
     setIsLoadingCorrelation(true);
     setCorrelationInsights(null);
     setCorrelationError(null);

     const className = mockClasses.find(c=>c.id===selectedClassId)?.name || 'Selected Class';
     toast({ title: `Analyzing Correlation ${isSimulating ? '(Simulated)' : ''}...`, description: `Fetching AI analysis for ${className} (${selectedTerm}).` });

     try {
        // Call the flow (handles its own simulation)
        const result = await correlateCoCurricularActivities({
            classId: selectedClassId,
            term: selectedTerm
        });
        setCorrelationInsights(result);
        toast({ title: `Correlation Analysis Complete ${isSimulating ? '(Simulated)' : ''}`, description: `Insights generated for ${className}.` });

     } catch (error: any) {
         console.error("Failed to fetch correlation insights:", error);
         let errorMsg = error.message || "An unexpected error occurred.";
         if (!isSimulating && error.message?.includes('GOOGLE_GENAI_API_KEY')) {
             errorMsg = 'Missing Google API Key. Set SIMULATE_AI=true in .env to test without keys.'
         }
         setCorrelationError(errorMsg);
         toast({ title: "Correlation Analysis Failed", description: errorMsg, variant: "destructive" });
     } finally {
         setIsLoadingCorrelation(false);
     }
  };


  return (
    <div className="space-y-6">
        {/* Per-Student Insights */}
        <Card className="shadow-md dark:shadow-indigo-900/10"> {/* Added shadow */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCheck /> Per-Student Performance Insights
             {isSimulating && <Badge variant="destructive">SIMULATING AI</Badge>}
            </CardTitle>
            <CardDescription>
              Select a student to view AI-generated trends, weaknesses, tips, and predictions based on their recent performance and historical data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {/* Selection Filters */}
            <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-muted/30 items-end">
              <div className="flex-1 grid gap-1.5">
                <Label htmlFor="insightClass" className="text-xs font-semibold uppercase text-muted-foreground">Class</Label>
                 <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                   <SelectTrigger id="insightClass" className="bg-background">
                     <SelectValue placeholder="Select Class" />
                   </SelectTrigger>
                   <SelectContent>
                     {mockClasses.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
              <div className="flex-1 grid gap-1.5">
                 <Label htmlFor="insightSection" className="text-xs font-semibold uppercase text-muted-foreground">Section</Label>
                 <Select value={selectedSectionId} onValueChange={setSelectedSectionId} disabled={!selectedClassId || availableSections.length === 0}>
                   <SelectTrigger id="insightSection" className="bg-background">
                     <SelectValue placeholder="Select Section" />
                   </SelectTrigger>
                   <SelectContent>
                      {availableSections.length > 0 ? (
                        availableSections.map(sec => (
                          <SelectItem key={sec.id} value={sec.id}>Section {sec.name}</SelectItem>
                        ))
                      ) : (
                          <SelectItem value="no-sections" disabled>No Sections Available</SelectItem>
                      )}
                   </SelectContent>
                 </Select>
              </div>
              <div className="flex-1 grid gap-1.5">
                 <Label htmlFor="insightStudent" className="text-xs font-semibold uppercase text-muted-foreground">Student</Label>
                 <Select value={selectedStudentId} onValueChange={setSelectedStudentId} disabled={!selectedSectionId || availableStudents.length === 0}>
                   <SelectTrigger id="insightStudent" className="bg-background">
                     <SelectValue placeholder="Select Student" />
                   </SelectTrigger>
                   <SelectContent>
                     {availableStudents.length > 0 ? (
                        availableStudents.map(stu => (
                            <SelectItem key={stu.id} value={stu.id}>{stu.name} ({stu.rollNo})</SelectItem>
                        ))
                     ) : (
                         <SelectItem value="no-students" disabled>No Students Available</SelectItem>
                     )}
                   </SelectContent>
                 </Select>
              </div>
               <Button onClick={handleFetchStudentInsights} disabled={!selectedStudentId || isLoadingInsights} className="self-end mt-4 md:mt-0 shrink-0">
                {isLoadingInsights ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Get Insights {isSimulating && '(Sim)'}
              </Button>
            </div>

             {/* Error Display */}
             {insightError && !isLoadingInsights && (
                 <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/30">
                     <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0"/>
                     <p className="text-sm font-medium">{insightError}</p>
                 </div>
             )}

             {/* Loading State */}
            {isLoadingInsights && (
                <div className="space-y-5 pt-4 border-t mt-4">
                     <Skeleton className="h-6 w-3/5 mb-3" />
                     {[...Array(4)].map((_, i) => (
                         <div key={i} className="space-y-2">
                             <Skeleton className="h-4 w-1/4" />
                             <Skeleton className="h-4 w-full" />
                             {i % 2 === 0 && <Skeleton className="h-4 w-4/5" />}
                         </div>
                    ))}
                </div>
            )}

             {/* Insights Display */}
            {studentInsights && !isLoadingInsights && (
              <div className="space-y-5 pt-4 border-t mt-4">
                <h4 className="font-semibold text-lg text-primary">Insights for {students.find(s => s.id === selectedStudentId)?.name} {isSimulating && <Badge variant='secondary'>Simulated</Badge>}</h4>
                <div className="border-l-4 border-blue-500 pl-3">
                  <h5 className="font-medium mb-1 flex items-center gap-1.5 text-sm uppercase text-muted-foreground"><TrendingUp size={16} /> Performance Trends:</h5>
                  <p className="text-sm">{studentInsights.trends || <span className="italic text-muted-foreground/70">No trend data available.</span>}</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-3">
                  <h5 className="font-medium mb-1 text-orange-600 flex items-center gap-1.5 text-sm uppercase"><AlertTriangle size={16} /> Identified Weaknesses:</h5>
                  <p className="text-sm">{studentInsights.weaknesses || <span className="italic text-muted-foreground/70">No specific weaknesses identified.</span>}</p>
                </div>
                <div className="border-l-4 border-teal-500 pl-3">
                  <h5 className="font-medium mb-1 text-accent flex items-center gap-1.5 text-sm uppercase"><Lightbulb size={16} /> Personalized Tips:</h5>
                  <p className="text-sm">{studentInsights.personalizedTips || <span className="italic text-muted-foreground/70">No personalized tips available currently.</span>}</p>
                </div>
                 <div className="border-l-4 border-purple-500 pl-3">
                  <h5 className="font-medium mb-1 flex items-center gap-1.5 text-sm uppercase text-muted-foreground"><Clock size={16} /> Predictive Outcomes:</h5>
                  <p className="text-sm">{studentInsights.predictiveOutcomes || <span className="italic text-muted-foreground/70">Prediction not available.</span>}</p>
                </div>
              </div>
            )}

             {/* Empty State */}
             {!selectedStudentId && !isLoadingInsights && !insightError && (
                 <div className="text-center text-muted-foreground py-10 border-2 border-dashed border-muted rounded-lg">
                    <UserCheck className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2"/>
                    <p>Select a student to generate AI-powered performance insights.</p>
                 </div>
             )}

          </CardContent>
        </Card>

         {/* Co-Curricular Correlation */}
         <Card className="shadow-md dark:shadow-indigo-900/10"> {/* Added shadow */}
            <CardHeader>
                 <CardTitle className="flex items-center gap-2"><FlaskConical /> Co-Curricular Correlation
                     {isSimulating && <Badge variant="destructive">SIMULATING AI</Badge>}
                 </CardTitle>
                 <CardDescription>
                     Analyze the correlation between co-curricular activities and academic performance for a selected class and term.
                 </CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
                  {/* Selection Filters */}
                 <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-muted/30 items-end">
                     <div className="flex-1 grid gap-1.5">
                         <Label htmlFor="correlationClass" className="text-xs font-semibold uppercase text-muted-foreground">Class</Label>
                         {/* Reusing selectedClassId state from above, consider if separate state is needed if classes differ */}
                         <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                             <SelectTrigger id="correlationClass" className="bg-background">
                                 <SelectValue placeholder="Select Class" />
                             </SelectTrigger>
                             <SelectContent>
                                 {mockClasses.map(cls => (
                                     <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                 ))}
                             </SelectContent>
                         </Select>
                     </div>
                      <div className="flex-1 grid gap-1.5">
                         <Label htmlFor="correlationTerm" className="text-xs font-semibold uppercase text-muted-foreground">Term</Label>
                         {/* In real app, terms might come from DB or config */}
                         <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                             <SelectTrigger id="correlationTerm" className="bg-background">
                                 <SelectValue placeholder="Select Term" />
                             </SelectTrigger>
                             <SelectContent>
                                 <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                                 <SelectItem value="Spring 2024">Spring 2024</SelectItem>
                                 <SelectItem value="Fall 2023">Fall 2023</SelectItem>
                                  {/* Add more terms as needed */}
                             </SelectContent>
                         </Select>
                     </div>
                      <Button onClick={handleFetchCorrelationInsights} disabled={!selectedClassId || !selectedTerm || isLoadingCorrelation} className="self-end mt-4 md:mt-0 shrink-0">
                         {isLoadingCorrelation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                         Analyze Correlation {isSimulating && '(Sim)'}
                     </Button>
                 </div>

                  {/* Error Display */}
                 {correlationError && !isLoadingCorrelation && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/30">
                        <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0"/>
                        <p className="text-sm font-medium">{correlationError}</p>
                    </div>
                 )}

                  {/* Loading State */}
                  {isLoadingCorrelation && (
                     <div className="space-y-5 pt-4 border-t mt-4">
                          <Skeleton className="h-6 w-2/5 mb-3" />
                          {[...Array(3)].map((_, i) => (
                             <div key={i} className="space-y-2">
                                 <Skeleton className="h-4 w-1/5" />
                                 <Skeleton className="h-4 w-full" />
                                 {i % 2 !== 0 && <Skeleton className="h-4 w-3/4" />}
                             </div>
                        ))}
                     </div>
                 )}

                 {/* Insights Display */}
                 {correlationInsights && !isLoadingCorrelation && (
                     <div className="space-y-5 pt-4 border-t mt-4">
                         <h4 className="font-semibold text-lg text-primary">Correlation Insights for {mockClasses.find(c=>c.id===selectedClassId)?.name} ({selectedTerm}) {isSimulating && <Badge variant='secondary'>Simulated</Badge>}</h4>
                          <div className="border-l-4 border-blue-500 pl-3">
                             <h5 className="font-medium mb-1 flex items-center gap-1.5 text-sm uppercase text-muted-foreground"><TrendingUp size={16} /> Balance Check:</h5>
                             <p className="text-sm">{correlationInsights.balanceCheck || <span className="italic text-muted-foreground/70">No specific balance checks available.</span>}</p>
                         </div>
                         <div className="border-l-4 border-orange-500 pl-3">
                             <h5 className="font-medium mb-1 text-orange-600 flex items-center gap-1.5 text-sm uppercase"><AlertTriangle size={16} /> Risk Flags:</h5>
                             <p className="text-sm">{correlationInsights.riskFlags || <span className="italic text-muted-foreground/70">No significant risk flags identified.</span>}</p>
                         </div>
                          <div className="border-l-4 border-teal-500 pl-3">
                             <h5 className="font-medium mb-1 text-accent flex items-center gap-1.5 text-sm uppercase"><Lightbulb size={16} /> Suggestions:</h5>
                             <p className="text-sm">{correlationInsights.suggestions || <span className="italic text-muted-foreground/70">No specific suggestions available.</span>}</p>
                         </div>
                     </div>
                 )}

                  {/* Empty State */}
                  {(!selectedClassId || !selectedTerm) && !isLoadingCorrelation && !correlationError && ( // Adjusted condition
                      <div className="text-center text-muted-foreground py-10 border-2 border-dashed border-muted rounded-lg">
                          <FlaskConical className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2"/>
                          <p>Select a class and term to analyze co-curricular correlations.</p>
                      </div>
                 )}

             </CardContent>
         </Card>

    </div>
  );
}

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
import { Label } from '@/components/ui/label'; // Import Label
import { Loader2, Brain, Sparkles, AlertTriangle, FlaskConical, UserCheck, Users } from 'lucide-react';
import { type Class, type Section, type Student, type Test, type Subject } from '@/types';
import { generateStudentInsights } from '@/ai/flows/generate-student-insights';
import { correlateCoCurricularActivities } from '@/ai/flows/correlate-co-curricular-activities'; // Import correlation flow
import { type GenerateStudentInsightsOutput } from '@/ai/flows/generate-student-insights';
import { type CorrelateCoCurricularActivitiesOutput } from '@/ai/flows/correlate-co-curricular-activities';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Mock Data (Replace with API calls)
const mockClasses: Class[] = [
   { id: 'cls1', name: 'Grade 1', grade: 1, sections: [{ id: 'sec1a', name: 'A', classId: 'cls1', students: []},{ id: 'sec1b', name: 'B', classId: 'cls1', students: []}] },
   { id: 'cls8', name: 'Grade 8', grade: 8, sections: [{ id: 'sec8a', name: 'A', classId: 'cls8', students: []}] },
];
const mockStudents: Student[] = [
    { id: 'stu1', name: 'Alice Wonder', rollNo: '101', dob: '2016-01-15', gender: 'Female', classId: 'cls1', sectionId: 'sec1a', coCurricularIds: ['act1']},
    { id: 'stu2', name: 'Bob The Builder', rollNo: '102', dob: '2016-03-20', gender: 'Male', classId: 'cls1', sectionId: 'sec1a', coCurricularIds: []},
    { id: 'stu4', name: 'Diana Prince', rollNo: '801', dob: '2009-05-05', gender: 'Female', classId: 'cls8', sectionId: 'sec8a', coCurricularIds: ['act1', 'act3']},
    { id: 'stu5', name: 'Ethan Hunt', rollNo: '802', dob: '2009-07-12', gender: 'Male', classId: 'cls8', sectionId: 'sec8a', coCurricularIds: []},
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
const mockMarks = {
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

  const availableSections = useMemo(() => {
    const selectedClass = mockClasses.find(c => c.id === selectedClassId);
    return selectedClass?.sections || [];
  }, [selectedClassId]);

  const availableStudents = useMemo(() => {
      if (!selectedSectionId) return [];
      // In real app, fetch students based on selectedSectionId
      return mockStudents.filter(s => s.sectionId === selectedSectionId);
  }, [selectedSectionId]);

   // Reset dependent dropdowns
   useEffect(() => {
       setSelectedSectionId('');
       setSelectedStudentId('');
       setStudentInsights(null);
       setInsightError(null);
   }, [selectedClassId]);

    useEffect(() => {
       setSelectedStudentId('');
       setStudentInsights(null);
       setInsightError(null);
   }, [selectedSectionId]);

    useEffect(() => {
        setStudentInsights(null);
        setInsightError(null);
    }, [selectedStudentId])

    // Reset correlation insights when class/term changes
    useEffect(() => {
        setCorrelationInsights(null);
        setCorrelationError(null);
    }, [selectedClassId, selectedTerm]);


  const handleFetchStudentInsights = async () => {
    if (!selectedStudentId) {
        toast({ title: "Missing Selection", description: "Please select a student.", variant: "destructive" });
        return;
    }

    setIsLoadingInsights(true);
    setStudentInsights(null);
    setInsightError(null);

    try {
      // Fetch last test mark for the selected student (replace with actual logic)
      const student = mockStudents.find(s => s.id === selectedStudentId);
      if (!student) throw new Error("Student not found");

      // Find the latest test for this student's class/section (example logic)
      const relevantTests = mockTests.filter(t => t.classId === student.classId && (!t.sectionId || t.sectionId === student.sectionId)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const lastTest = relevantTests[0];

      if (!lastTest) {
           setInsightError("No recent test data found for this student to generate insights.");
           setIsLoadingInsights(false);
           return;
      }

      const markData = (mockMarks as any)[`${student.id}_${lastTest.id}`];
      const subject = mockSubjects.find(s => s.id === lastTest.subjectId);
      const historicalContext = "Previous scores: 70, 75, 68"; // Example context

       if (!markData || !subject) {
           setInsightError("Could not find complete test or mark data for the latest test.");
            setIsLoadingInsights(false);
           return;
       }

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

    } catch (error: any) {
      console.error("Failed to fetch student insights:", error);
      setInsightError(error.message || "An unexpected error occurred while fetching insights.");
      toast({ title: "Error", description: "Could not fetch student insights.", variant: "destructive" });
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

     try {
        const result = await correlateCoCurricularActivities({
            classId: selectedClassId,
            term: selectedTerm
        });
        setCorrelationInsights(result);
     } catch (error: any) {
         console.error("Failed to fetch correlation insights:", error);
         setCorrelationError(error.message || "An unexpected error occurred while fetching correlation insights.");
         toast({ title: "Error", description: "Could not fetch correlation insights.", variant: "destructive" });
     } finally {
         setIsLoadingCorrelation(false);
     }
  };


  return (
    <div className="space-y-6">
        {/* Per-Student Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCheck /> Per-Student Performance Insights</CardTitle>
            <CardDescription>
              Select a student to view AI-generated trends, weaknesses, tips, and predictions based on their recent performance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="insightClass">Class</Label>
                 <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                   <SelectTrigger id="insightClass">
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
                 <Label htmlFor="insightSection">Section</Label>
                 <Select value={selectedSectionId} onValueChange={setSelectedSectionId} disabled={!selectedClassId || availableSections.length === 0}>
                   <SelectTrigger id="insightSection">
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
              <div className="flex-1">
                 <Label htmlFor="insightStudent">Student</Label>
                 <Select value={selectedStudentId} onValueChange={setSelectedStudentId} disabled={!selectedSectionId || availableStudents.length === 0}>
                   <SelectTrigger id="insightStudent">
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
               <Button onClick={handleFetchStudentInsights} disabled={!selectedStudentId || isLoadingInsights} className="self-end mt-4 md:mt-0">
                {isLoadingInsights ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Get Insights
              </Button>
            </div>

             {insightError && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{insightError}</p>}

            {isLoadingInsights && (
                <div className="space-y-4 pt-4">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                     <Skeleton className="h-4 w-1/3 mt-4" />
                    <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-1/3 mt-4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            )}

            {studentInsights && !isLoadingInsights && (
              <div className="space-y-4 pt-4 border-t mt-4">
                <h4 className="font-semibold text-lg">Insights for {mockStudents.find(s => s.id === selectedStudentId)?.name}</h4>
                <div>
                  <h5 className="font-medium mb-1">Performance Trends:</h5>
                  <p className="text-sm text-muted-foreground">{studentInsights.trends}</p>
                </div>
                <div>
                  <h5 className="font-medium mb-1 text-orange-600 flex items-center gap-1"><AlertTriangle size={16} /> Identified Weaknesses:</h5>
                  <p className="text-sm text-muted-foreground">{studentInsights.weaknesses}</p>
                </div>
                <div>
                  <h5 className="font-medium mb-1 text-accent flex items-center gap-1"><Brain size={16} /> Personalized Tips:</h5>
                  <p className="text-sm text-muted-foreground">{studentInsights.personalizedTips}</p>
                </div>
                 <div>
                  <h5 className="font-medium mb-1">Predictive Outcomes:</h5>
                  <p className="text-sm text-muted-foreground">{studentInsights.predictiveOutcomes}</p>
                </div>
              </div>
            )}

             {!selectedStudentId && !isLoadingInsights && !insightError && (
                 <p className="text-center text-muted-foreground pt-4">Select a student to view insights.</p>
             )}

          </CardContent>
        </Card>

         {/* Co-Curricular Correlation */}
         <Card>
            <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Users /> Co-Curricular Correlation</CardTitle>
                 <CardDescription>
                     Analyze the correlation between co-curricular activities and academic performance for a selected class and term.
                 </CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
                 <div className="flex flex-col md:flex-row gap-4">
                     <div className="flex-1">
                         <Label htmlFor="correlationClass">Class</Label>
                         <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                             <SelectTrigger id="correlationClass">
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
                         <Label htmlFor="correlationTerm">Term</Label>
                         {/* In real app, terms might come from DB or config */}
                         <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                             <SelectTrigger id="correlationTerm">
                                 <SelectValue placeholder="Select Term" />
                             </SelectTrigger>
                             <SelectContent>
                                 <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                                 <SelectItem value="Spring 2024">Spring 2024</SelectItem>
                                 <SelectItem value="Fall 2023">Fall 2023</SelectItem>
                             </SelectContent>
                         </Select>
                     </div>
                      <Button onClick={handleFetchCorrelationInsights} disabled={!selectedClassId || !selectedTerm || isLoadingCorrelation} className="self-end mt-4 md:mt-0">
                         {isLoadingCorrelation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FlaskConical className="mr-2 h-4 w-4" />}
                         Analyze Correlation
                     </Button>
                 </div>

                 {correlationError && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{correlationError}</p>}

                  {isLoadingCorrelation && (
                     <div className="space-y-4 pt-4">
                         <Skeleton className="h-4 w-1/4" />
                         <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-1/4 mt-4" />
                         <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/4 mt-4" />
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-1/2" />
                     </div>
                 )}

                 {correlationInsights && !isLoadingCorrelation && (
                     <div className="space-y-4 pt-4 border-t mt-4">
                         <h4 className="font-semibold text-lg">Correlation Insights for {mockClasses.find(c=>c.id===selectedClassId)?.name} ({selectedTerm})</h4>
                          <div>
                             <h5 className="font-medium mb-1">Balance Check:</h5>
                             <p className="text-sm text-muted-foreground">{correlationInsights.balanceCheck}</p>
                         </div>
                         <div>
                             <h5 className="font-medium mb-1 text-orange-600 flex items-center gap-1"><AlertTriangle size={16} /> Risk Flags:</h5>
                             <p className="text-sm text-muted-foreground">{correlationInsights.riskFlags}</p>
                         </div>
                          <div>
                             <h5 className="font-medium mb-1 text-accent flex items-center gap-1"><Brain size={16} /> Suggestions:</h5>
                             <p className="text-sm text-muted-foreground">{correlationInsights.suggestions}</p>
                         </div>
                     </div>
                 )}

                  {(!selectedClassId || !selectedTerm) && !isLoadingCorrelation && !correlationError && ( // Adjusted condition
                    <p className="text-center text-muted-foreground pt-4">Select a class and term to analyze co-curricular correlations.</p>
                 )}

             </CardContent>
         </Card>

    </div>
  );
}

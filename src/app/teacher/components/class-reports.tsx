
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
import { Input } from '@/components/ui/input'; // For date range later
import { Label } from '@/components/ui/label';
import { BarChart, LineChart, TrendingDown, TrendingUp, Users, Filter, BookOpen, CalendarIcon, Info } from 'lucide-react'; // Added Info icon
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from "@/components/ui/chart";
import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { type Class, type Section, type Subject, type Test, type Mark, type Student } from '@/types';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { Badge } from '@/components/ui/badge'; // Import Badge
import { simulateFetchData } from '@/services/supabase'; // Import simulation helper

// Mock Data (Used only if simulating or fetch fails)
const mockClasses: Class[] = [
   { id: 'cls1', name: 'Grade 1', grade: 1, sections: [{ id: 'sec1a', name: 'A', classId: 'cls1', students: []},{ id: 'sec1b', name: 'B', classId: 'cls1', students: []}] },
   { id: 'cls8', name: 'Grade 8', grade: 8, sections: [{ id: 'sec8a', name: 'A', classId: 'cls8', students: []}] },
];
const mockSubjects: Subject[] = [
    { id: 'sub1', name: 'Mathematics', classId: 'cls1' },
    { id: 'sub2', name: 'English', classId: 'cls1' },
    { id: 'sub3', name: 'Mathematics', classId: 'cls8' },
    { id: 'sub4', name: 'Science', classId: 'cls8' },
];
const mockTests: Test[] = [
    { id: 'test1', classId: 'cls1', sectionId: 'sec1a', subjectId: 'sub1', teacherId: 't1', date: '2024-03-10', type: 'Unit Test 1', totalMarks: 20 },
    { id: 'test1b', classId: 'cls1', sectionId: 'sec1b', subjectId: 'sub1', teacherId: 't1', date: '2024-03-11', type: 'Unit Test 1', totalMarks: 20 },
    { id: 'test1e', classId: 'cls1', sectionId: 'sec1a', subjectId: 'sub2', teacherId: 't1', date: '2024-03-15', type: 'Quiz', totalMarks: 10 },
    { id: 'test2', classId: 'cls8', sectionId: 'sec8a', subjectId: 'sub3', teacherId: 't1', date: '2024-04-05', type: 'Unit Test 1', totalMarks: 50 },
    { id: 'test3', classId: 'cls8', sectionId: 'sec8a', subjectId: 'sub4', teacherId: 't1', date: '2024-04-10', type: 'Unit Test 1', totalMarks: 50 },
    { id: 'test4', classId: 'cls8', sectionId: 'sec8a', subjectId: 'sub3', teacherId: 't1', date: '2024-05-15', type: 'Midterm', totalMarks: 100 },
];
const mockMarks: Mark[] = [ // Array of marks this time
    // Grade 1, Sec A, Math, Test 1
    { id: 'm1', studentId: 'stu1', testId: 'test1', obtainedMarks: 15 },
    { id: 'm2', studentId: 'stu2', testId: 'test1', obtainedMarks: 18 },
    // Grade 1, Sec B, Math, Test 1
    { id: 'm3', studentId: 'stu3', testId: 'test1b', obtainedMarks: 16 },
     // Grade 1, Sec A, English, Test 1e
    { id: 'm1e', studentId: 'stu1', testId: 'test1e', obtainedMarks: 8 },
    { id: 'm2e', studentId: 'stu2', testId: 'test1e', obtainedMarks: 9 },
    // Grade 8, Sec A, Math, Test 2
    { id: 'm4', studentId: 'stu4', testId: 'test2', obtainedMarks: 40 },
    { id: 'm5', studentId: 'stu5', testId: 'test2', obtainedMarks: 35 },
     // Grade 8, Sec A, Science, Test 3
    { id: 'm6', studentId: 'stu4', testId: 'test3', obtainedMarks: 45 },
    { id: 'm7', studentId: 'stu5', testId: 'test3', obtainedMarks: 42 },
    // Grade 8, Sec A, Math, Test 4 (Midterm)
    { id: 'm8', studentId: 'stu4', testId: 'test4', obtainedMarks: 85 },
    { id: 'm9', studentId: 'stu5', testId: 'test4', obtainedMarks: 78 },
];
const mockStudents: Student[] = [
    { id: 'stu1', name: 'Alice Wonder', rollNo: '101', classId: 'cls1', sectionId: 'sec1a', /*...*/ } as Student,
    { id: 'stu2', name: 'Bob Builder', rollNo: '102', classId: 'cls1', sectionId: 'sec1a', /*...*/ } as Student,
    { id: 'stu3', name: 'Charlie C', rollNo: '103', classId: 'cls1', sectionId: 'sec1b', /*...*/ } as Student,
    { id: 'stu4', name: 'Diana Prince', rollNo: '801', classId: 'cls8', sectionId: 'sec8a', /*...*/ } as Student,
    { id: 'stu5', name: 'Ethan Hunt', rollNo: '802', classId: 'cls8', sectionId: 'sec8a', /*...*/ } as Student,
];


// Helper to calculate average for a set of marks and total
const calculateAverage = (marks: { obtainedMarks: number }[], totalMarks: number): number | null => {
    if (!marks || marks.length === 0 || totalMarks <= 0) return null;
    const sum = marks.reduce((acc, mark) => acc + mark.obtainedMarks, 0);
    return parseFloat(((sum / marks.length / totalMarks) * 100).toFixed(1)); // Return average percentage
};

export function ClassReports() {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all-subjects'); // Default to non-empty value
  const [selectedTestTypeId, setSelectedTestTypeId] = useState<string>('all-types'); // Default to non-empty value
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  // Add date range filters later
  // const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // State for fetched data
   const [students, setStudents] = useState<Student[]>([]);
   const [tests, setTests] = useState<Test[]>([]);
   const [marks, setMarks] = useState<Mark[]>([]);

   const isSimulating = process.env.SIMULATE_AI === 'true';


  const availableSubjects = useMemo(() => {
      if (!selectedClassId) return [];
      const subjectsForClass = mockSubjects.filter(s => s.classId === selectedClassId);
      // Ensure 'all' has a valid, non-empty value like 'all-subjects'
      return [{ id: 'all-subjects', name: 'All Subjects', classId: selectedClassId }, ...subjectsForClass];
  }, [selectedClassId]);

   const availableTestTypes = useMemo(() => {
       if (!selectedClassId) return [];
       const types = new Set(tests.filter(t => t.classId === selectedClassId).map(t => t.type)); // Use fetched tests
       const uniqueTypes = Array.from(types).filter(type => type);
        // Ensure 'all' has a valid non-empty value like 'all-types'
       return ['all-types', ...uniqueTypes];
   }, [selectedClassId, tests]); // Depend on fetched tests

    // --- Data Fetching ---
    useEffect(() => {
        const fetchDataForClass = async () => {
            if (!selectedClassId) {
                setStudents([]);
                setTests([]);
                setMarks([]);
                return;
            }
            setIsLoading(true);
            try {
                // Simulate or fetch students, tests, and marks for the class
                const [fetchedStudents, fetchedTests, fetchedMarks] = await Promise.all([
                    simulateFetchData('students', { classId: selectedClassId }),
                    simulateFetchData('tests', { classId: selectedClassId }),
                    simulateFetchData('marks', { classId: selectedClassId }) // Fetch all marks for the class initially
                ]);
                setStudents(fetchedStudents);
                setTests(fetchedTests);
                setMarks(fetchedMarks);
            } catch (error) {
                 console.error("Failed to fetch class data:", error);
                 // Handle error, maybe show toast
                 setStudents(isSimulating ? mockStudents.filter(s => s.classId === selectedClassId) : []);
                 setTests(isSimulating ? mockTests.filter(t => t.classId === selectedClassId) : []);
                 setMarks(isSimulating ? mockMarks : []); // Use mock data as fallback if simulating
            } finally {
                 setIsLoading(false);
            }
        };

        fetchDataForClass();

    }, [selectedClassId, isSimulating]); // Fetch when class changes


   // Reset filters when class changes
   useEffect(() => {
       setSelectedSubjectId('all-subjects'); // Use the non-empty value
       setSelectedTestTypeId('all-types'); // Use the non-empty value
   }, [selectedClassId]);

    // --- Chart Data Calculations ---

  // 1. Class Average by Subject (for selected class and test type)
  const subjectAverageData = useMemo(() => {
      if (!selectedClassId || isLoading) return [];

      const subjectsInClass = mockSubjects.filter(s => s.classId === selectedClassId); // Use mockSubjects for available subjects list
      return subjectsInClass.map(subject => {
          const testsForSubject = tests.filter(t => t.classId === selectedClassId && t.subjectId === subject.id && (selectedTestTypeId === 'all-types' || t.type === selectedTestTypeId));
          const marksForSubjectTests = marks.filter(m => testsForSubject.some(t => t.id === m.testId));
          // const studentsInSection = students.filter(st => st.classId === selectedClassId); // Already have students state

          const testAverages = testsForSubject.map(test => {
              const marksForTest = marksForSubjectTests.filter(m => m.testId === test.id);
              // Filter marks based on students actually in the section if test is section-specific
              const relevantMarks = test.sectionId
                    ? marksForTest.filter(m => students.some(st => st.id === m.studentId && st.sectionId === test.sectionId))
                    : marksForTest;
              return calculateAverage(relevantMarks, test.totalMarks);
          }).filter(avg => avg !== null) as number[];

          let averagePercent = null;
          if (testAverages.length > 0) {
              averagePercent = parseFloat((testAverages.reduce((sum, avg) => sum + avg, 0) / testAverages.length).toFixed(1));
          }

          return {
              subject: subject.name,
              average: averagePercent,
          };
      }).filter(d => d.average !== null);

  }, [selectedClassId, selectedTestTypeId, tests, marks, students, isLoading]);

  // 2. Section A vs B Comparison (for selected class, subject, and test type)
  const sectionComparisonData = useMemo(() => {
      if (!selectedClassId || selectedSubjectId === 'all-subjects' || isLoading) return null;

       const cls = mockClasses.find(c => c.id === selectedClassId); // Use mockClasses to get section names/structure
       if (!cls || cls.sections.length < 2) return null; // Only compare if 2+ sections exist

       const subjectName = mockSubjects.find(s => s.id === selectedSubjectId)?.name || '';

        const relevantTests = tests.filter(t =>
            t.classId === selectedClassId &&
            t.subjectId === selectedSubjectId &&
            (selectedTestTypeId === 'all-types' || t.type === selectedTestTypeId)
        );

        if(relevantTests.length === 0) return { data: [], subjectName };

       const comparison = cls.sections.map(section => {
           const sectionTests = relevantTests.filter(t => !t.sectionId || t.sectionId === section.id);
           const studentsInSection = students.filter(st => st.classId === cls.id && st.sectionId === section.id);
           const marksForSectionTests = marks.filter(m =>
                sectionTests.some(t => t.testId === m.testId) &&
                studentsInSection.some(st => st.id === m.studentId) // Ensure mark belongs to a student in this section
            );

           const testAverages = sectionTests.map(test => {
                const marksForTest = marksForSectionTests.filter(m => m.testId === test.id);
                return calculateAverage(marksForTest, test.totalMarks);
           }).filter(avg => avg !== null) as number[];

           let averagePercent = null;
            if (testAverages.length > 0) {
                averagePercent = parseFloat((testAverages.reduce((sum, avg) => sum + avg, 0) / testAverages.length).toFixed(1));
            }

           return {
               section: `Section ${section.name}`,
               average: averagePercent,
           };
       }).filter(d => d.average !== null);


       return { data: comparison, subjectName };

  }, [selectedClassId, selectedSubjectId, selectedTestTypeId, tests, marks, students, isLoading]);


  // 3. High/Low Scorers (Top/Bottom 5 for selected class, subject, test type)
   const scorerData = useMemo(() => {
       if (!selectedClassId || isLoading) return { top: [], bottom: [] };

        const relevantTests = tests.filter(t =>
            t.classId === selectedClassId &&
            (selectedSubjectId === 'all-subjects' || t.subjectId === selectedSubjectId) &&
            (selectedTestTypeId === 'all-types' || t.type === selectedTestTypeId)
        );

        if (relevantTests.length === 0) return { top: [], bottom: [] };

        const studentAverages: { studentId: string; name: string; averagePercent: number }[] = [];
        const studentsInClass = students.filter(s => s.classId === selectedClassId);

        studentsInClass.forEach(student => {
             // Find tests relevant to this student (either class-wide or specific to their section)
             const studentTestIds = relevantTests.filter(t => !t.sectionId || t.sectionId === student.sectionId).map(t => t.id);
             const studentMarks = marks.filter(m => m.studentId === student.id && studentTestIds.includes(m.testId));

             let totalObtained = 0;
             let totalPossible = 0;
              studentMarks.forEach(mark => {
                  // Find the original test definition to get totalMarks
                  const test = relevantTests.find(t => t.id === mark.testId);
                  if (test && test.totalMarks > 0) { // Ensure totalMarks is valid
                     totalObtained += mark.obtainedMarks;
                     totalPossible += test.totalMarks;
                  }
             });

             if (totalPossible > 0) {
                studentAverages.push({
                    studentId: student.id,
                    name: student.name,
                    averagePercent: parseFloat(((totalObtained / totalPossible) * 100).toFixed(1)),
                });
             }
        });


       studentAverages.sort((a, b) => b.averagePercent - a.averagePercent);

       return {
           top: studentAverages.slice(0, 5),
           bottom: studentAverages.slice(-5).sort((a, b) => a.averagePercent - b.averagePercent), // Bottom 5, sorted lowest first
       };

   }, [selectedClassId, selectedSubjectId, selectedTestTypeId, tests, marks, students, isLoading]);


  // Chart Configs
  const chartConfig = {
    average: { label: "Average (%)", color: "hsl(var(--chart-1))" },
    section: { label: "Section" },
     top: { label: "Top Scorers (%)", color: "hsl(var(--chart-2))" },
     bottom: { label: "Bottom Scorers (%)", color: "hsl(var(--chart-5))" },
  } satisfies import("@/components/ui/chart").ChartConfig;

  const selectedClassName = mockClasses.find(c => c.id === selectedClassId)?.name || 'N/A';
  const selectedSubjectName = selectedSubjectId === 'all-subjects' ? 'All Subjects' : mockSubjects.find(s => s.id === selectedSubjectId)?.name || 'N/A';
  const selectedTestTypeName = selectedTestTypeId === 'all-types' ? 'All Types' : selectedTestTypeId;


  return (
    <div className="space-y-6">
      <Card className="shadow-md dark:shadow-indigo-900/10"> {/* Added shadow */}
        <CardHeader>
           <CardTitle className="flex items-center gap-2">
               Class Performance Reports
                {isSimulating && <Badge variant="destructive">SIMULATING DATA</Badge>}
            </CardTitle>
          <CardDescription>
            View aggregated performance data. Use filters to refine charts and lists. Data is based on entered marks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 border rounded-lg bg-muted/30 items-end"> {/* Increased margin */}
            <div className="flex-1 grid gap-1.5">
              <Label htmlFor="reportClass" className="text-xs font-semibold uppercase text-muted-foreground">Class</Label>
               <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                 <SelectTrigger id="reportClass" className="bg-background">
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
               <Label htmlFor="reportSubject" className="text-xs font-semibold uppercase text-muted-foreground">Subject</Label>
                <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={!selectedClassId || availableSubjects.length <= 1}> {/* Disable if only "All" is there */}
                 <SelectTrigger id="reportSubject" className="bg-background">
                   <SelectValue placeholder="Select Subject" />
                 </SelectTrigger>
                 <SelectContent>
                     {availableSubjects.map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                     ))}
                 </SelectContent>
               </Select>
            </div>
             <div className="flex-1 grid gap-1.5">
               <Label htmlFor="reportTestType" className="text-xs font-semibold uppercase text-muted-foreground">Test Type</Label>
               <Select value={selectedTestTypeId} onValueChange={setSelectedTestTypeId} disabled={!selectedClassId || availableTestTypes.length <= 1}>
                 <SelectTrigger id="reportTestType" className="bg-background">
                   <SelectValue placeholder="Select Test Type" />
                 </SelectTrigger>
                 <SelectContent>
                     {availableTestTypes.map(type => (
                        <SelectItem key={type} value={type}>
                            {type === 'all-types' ? 'All Test Types' : type}
                         </SelectItem>
                     ))}
                      {availableTestTypes.length <=1 && <SelectItem value="loading" disabled>N/A</SelectItem>}
                 </SelectContent>
               </Select>
            </div>
             {/* Add Date Range Pickers Here Later */}
             {/* <Button variant="outline" disabled={!selectedClassId}>
                 <Filter className="mr-2 h-4 w-4"/> Apply Filters
             </Button> */}
          </div>

           {/* Empty State */}
           {!selectedClassId && (
               <div className="text-center text-muted-foreground py-16 border-2 border-dashed border-muted rounded-lg">
                   <BarChart className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3"/>
                   <p className="font-medium">Please select a class to view reports.</p>
                   <p className="text-sm">Apply filters for Subject and Test Type for more specific insights.</p>
               </div>
           )}

           {/* Loading State */}
           {selectedClassId && isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className={i === 2 ? 'lg:col-span-2' : ''}>
                             <CardHeader>
                                <Skeleton className="h-5 w-3/5 mb-2" />
                                <Skeleton className="h-3 w-4/5" />
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <Skeleton className="h-full w-full" />
                            </CardContent>
                        </Card>
                     ))}
                </div>
           )}


          {/* Charts - Conditionally render only if class is selected and not loading */}
          {selectedClassId && !isLoading && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Chart 1: Class Average by Subject */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><BookOpen size={18}/> Average by Subject</CardTitle>
                         <CardDescription>
                             {selectedClassName} | Test Type: {selectedTestTypeName} {isSimulating && <Badge variant='secondary'>Simulated Data</Badge>}
                         </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {subjectAverageData && subjectAverageData.length > 0 ? (
                             <ChartContainer config={chartConfig} className="h-[300px] w-full">
                               <ResponsiveContainer>
                                   <BarChart data={subjectAverageData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                                     <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                                     <XAxis dataKey="subject" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} interval={0} angle={-30} textAnchor="end" height={50} />
                                     <YAxis domain={[0, 100]} unit="%" allowDecimals={false} fontSize={12} />
                                     <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dot" />}
                                      />
                                     {/* <ChartLegend content={<ChartLegendContent />} /> */}
                                     <Bar dataKey="average" fill="var(--color-average)" radius={4}>
                                         <LabelList position="top" offset={5} className="fill-foreground" fontSize={10} formatter={(value: number) => `${value}%`} />
                                     </Bar>
                                   </BarChart>
                               </ResponsiveContainer>
                             </ChartContainer>
                        ) : (
                            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground text-center px-4">
                                <Info className="h-8 w-8 text-muted-foreground/50 mb-2"/>
                                No average data available for the selected filters.
                             </div>
                        )}
                    </CardContent>
                </Card>

                 {/* Chart 2: Section Comparison */}
                 <Card>
                     <CardHeader>
                         <CardTitle className="text-lg flex items-center gap-2"><Users size={18}/> Section Comparison</CardTitle>
                         <CardDescription>
                              {selectedClassName} | Subject: {selectedSubjectName} | Test Type: {selectedTestTypeName} {isSimulating && <Badge variant='secondary'>Simulated Data</Badge>}
                          </CardDescription>
                     </CardHeader>
                     <CardContent>
                         {sectionComparisonData && sectionComparisonData.data.length > 0 ? (
                             <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <ResponsiveContainer>
                                    <BarChart data={sectionComparisonData.data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
                                      <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                                      <XAxis type="number" domain={[0, 100]} unit="%" allowDecimals={false} fontSize={12} />
                                      <YAxis dataKey="section" type="category" tickLine={false} tickMargin={5} axisLine={false} width={80} fontSize={12}/>
                                      <ChartTooltip
                                          cursor={false}
                                          content={<ChartTooltipContent indicator="line" />}
                                        />
                                      {/* <ChartLegend content={<ChartLegendContent />} /> */}
                                      <Bar dataKey="average" fill="var(--color-average)" radius={4} layout="vertical">
                                          <LabelList position="right" offset={5} className="fill-foreground" fontSize={10} formatter={(value: number) => `${value}%`} />
                                      </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                             </ChartContainer>
                         ) : (
                            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground text-center px-4">
                                 <Info className="h-8 w-8 text-muted-foreground/50 mb-2"/>
                                {selectedSubjectId === 'all-subjects' ? "Select a specific subject for section comparison." : (cls && cls.sections.length < 2 ? "This class has only one section." : "No comparison data available for these filters.")}
                            </div>
                        )}
                     </CardContent>
                 </Card>

                 {/* Section 3: High/Low Scorers */}
                  <Card className="lg:col-span-2">
                     <CardHeader>
                         <CardTitle className="text-lg">Top & Bottom Performers</CardTitle>
                         <CardDescription>
                              {selectedClassName} | Subject: {selectedSubjectName} | Test Type: {selectedTestTypeName} (Overall Average %) {isSimulating && <Badge variant='secondary'>Simulated Data</Badge>}
                          </CardDescription>
                     </CardHeader>
                     <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="border p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50">
                            <h4 className="font-semibold mb-3 flex items-center gap-1.5 text-green-700 dark:text-green-400"><TrendingUp size={18} /> Top 5 Performers</h4>
                             {scorerData.top.length > 0 ? (
                                 <ul className="space-y-1.5 text-sm">
                                     {scorerData.top.map((student, index) => (
                                         <li key={student.studentId} className="flex justify-between items-center p-1.5 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                                              <span>{index + 1}. {student.name}</span>
                                             <span className="font-medium text-green-800 dark:text-green-300">{student.averagePercent}%</span>
                                         </li>
                                     ))}
                                 </ul>
                             ): ( <p className="text-sm text-muted-foreground italic">No top performer data available.</p> )}
                         </div>
                         <div className="border p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50">
                             <h4 className="font-semibold mb-3 flex items-center gap-1.5 text-red-700 dark:text-red-400"><TrendingDown size={18} /> Bottom 5 Performers</h4>
                              {scorerData.bottom.length > 0 ? (
                                 <ul className="space-y-1.5 text-sm">
                                     {scorerData.bottom.map((student, index) => (
                                         <li key={student.studentId} className="flex justify-between items-center p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                              <span>{index + 1}. {student.name}</span>
                                             <span className="font-medium text-red-800 dark:text-red-300">{student.averagePercent}%</span>
                                         </li>
                                     ))}
                                 </ul>
                             ): ( <p className="text-sm text-muted-foreground italic">No bottom performer data available.</p> )}
                         </div>
                     </CardContent>
                 </Card>

             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

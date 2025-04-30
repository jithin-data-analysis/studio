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
import { BarChart, LineChart, TrendingDown, TrendingUp, Users, Filter } from 'lucide-react';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from "@/components/ui/chart";
import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { type Class, type Section, type Subject, type Test, type Mark, type Student } from '@/types';

// Mock Data (replace with actual data fetching and aggregation logic)
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
const mockMarks = [ // Array of marks this time
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
    if (marks.length === 0 || totalMarks <= 0) return null;
    const sum = marks.reduce((acc, mark) => acc + mark.obtainedMarks, 0);
    return parseFloat(((sum / marks.length / totalMarks) * 100).toFixed(1)); // Return average percentage
};

export function ClassReports() {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedTestTypeId, setSelectedTestTypeId] = useState<string>('all'); // Filter by test type
  // Add date range filters later

  const availableSubjects = useMemo(() => {
      if (!selectedClassId) return [];
      // Add 'All Subjects' option
      const subjectsForClass = mockSubjects.filter(s => s.classId === selectedClassId);
      if (subjectsForClass.length === 0) return []; // Return empty if no subjects for the class
      return [{ id: 'all', name: 'All Subjects', classId: selectedClassId }, ...subjectsForClass];
  }, [selectedClassId]);

   const availableTestTypes = useMemo(() => {
       if (!selectedClassId) return [];
       // Get unique test types for the selected class
       const types = new Set(mockTests.filter(t => t.classId === selectedClassId).map(t => t.type));
       const uniqueTypes = Array.from(types);
        // Ensure 'all' has a valid non-empty value if it's the only option potentially
       return ['all', ...uniqueTypes];
   }, [selectedClassId]);

   // Reset filters when class changes
   useEffect(() => {
       setSelectedSubjectId('all');
       setSelectedTestTypeId('all');
   }, [selectedClassId]);


  // --- Chart Data Calculations ---

  // 1. Class Average by Subject (for selected class and test type)
  const subjectAverageData = useMemo(() => {
      if (!selectedClassId) return [];

      const subjectsInClass = mockSubjects.filter(s => s.classId === selectedClassId);
      return subjectsInClass.map(subject => {
          const testsForSubject = mockTests.filter(t => t.classId === selectedClassId && t.subjectId === subject.id && (selectedTestTypeId === 'all' || t.type === selectedTestTypeId));
          const marksForSubjectTests = mockMarks.filter(m => testsForSubject.some(t => t.id === m.testId));
          const totalPossibleMarks = testsForSubject.reduce((sum, t) => sum + (t.totalMarks * (mockStudents.filter(st => st.classId === selectedClassId && (!t.sectionId || st.sectionId === t.sectionId)).length || 1)), 0); // Rough estimate
          const totalObtainedMarks = marksForSubjectTests.reduce((sum, m) => sum + m.obtainedMarks, 0);

          let averagePercent = null;
           if (totalPossibleMarks > 0) {
               // More accurate avg: Avg of avg test scores for this subject
                const testAverages = testsForSubject.map(test => {
                    const marksForTest = marksForSubjectTests.filter(m => m.testId === test.id);
                    return calculateAverage(marksForTest, test.totalMarks);
                }).filter(avg => avg !== null) as number[];

                if (testAverages.length > 0) {
                    averagePercent = parseFloat((testAverages.reduce((sum, avg) => sum + avg, 0) / testAverages.length).toFixed(1));
                }
           }


          return {
              subject: subject.name,
              average: averagePercent,
          };
      }).filter(d => d.average !== null); // Filter out subjects with no data for the filters

  }, [selectedClassId, selectedTestTypeId]);

  // 2. Section A vs B Comparison (for selected class, subject, and test type)
  // Returns an object { data: [], subjectName: "" } or an empty array []
  const sectionComparisonData = useMemo(() => {
      if (!selectedClassId || selectedSubjectId === 'all') return []; // Return empty array if no specific subject

       const cls = mockClasses.find(c => c.id === selectedClassId);
       if (!cls) return []; // Return empty array if class not found

       const subjectName = mockSubjects.find(s => s.id === selectedSubjectId)?.name || '';

       // Find tests matching the criteria
        const relevantTests = mockTests.filter(t =>
            t.classId === selectedClassId &&
            t.subjectId === selectedSubjectId &&
            (selectedTestTypeId === 'all' || t.type === selectedTestTypeId)
        );

        if(relevantTests.length === 0) return { data: [], subjectName }; // Return object with empty data if no tests found


       // Group tests by type/date if needed, for now just average over all matching tests
       const comparison = cls.sections.map(section => {
           const sectionTests = relevantTests.filter(t => !t.sectionId || t.sectionId === section.id); // Tests for this section
           const marksForSectionTests = mockMarks.filter(m => sectionTests.some(t => t.testId === m.testId) && mockStudents.some(st => st.id === m.studentId && st.sectionId === section.id));

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
       }).filter(d => d.average !== null); // Filter out sections with no data


       return { data: comparison, subjectName };


  }, [selectedClassId, selectedSubjectId, selectedTestTypeId]);


  // 3. High/Low Scorers (Top/Bottom 5 for selected class, subject, test type)
   const scorerData = useMemo(() => {
       if (!selectedClassId) return { top: [], bottom: [] };

        const relevantTests = mockTests.filter(t =>
            t.classId === selectedClassId &&
            (selectedSubjectId === 'all' || t.subjectId === selectedSubjectId) &&
            (selectedTestTypeId === 'all' || t.type === selectedTestTypeId)
        );

        if (relevantTests.length === 0) return { top: [], bottom: [] };

        const studentAverages: { studentId: string; name: string; averagePercent: number }[] = [];
        const studentsInClass = mockStudents.filter(s => s.classId === selectedClassId);

        studentsInClass.forEach(student => {
            const studentTestIds = relevantTests.filter(t => !t.sectionId || t.sectionId === student.sectionId).map(t => t.id);
            const studentMarks = mockMarks.filter(m => m.studentId === student.id && studentTestIds.includes(m.testId));

             let totalObtained = 0;
             let totalPossible = 0;
              studentMarks.forEach(mark => {
                 const test = relevantTests.find(t => t.id === mark.testId);
                 if (test) {
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
           bottom: studentAverages.slice(-5).reverse(), // Bottom 5, reversed to show lowest first
       };

   }, [selectedClassId, selectedSubjectId, selectedTestTypeId]);


  // Chart Configs
  const chartConfig = {
    average: { label: "Average (%)", color: "hsl(var(--chart-1))" },
    section: { label: "Section" },
     top: { label: "Top Scorers (%)", color: "hsl(var(--chart-2))" },
     bottom: { label: "Bottom Scorers (%)", color: "hsl(var(--chart-5))" },
  } satisfies import("@/components/ui/chart").ChartConfig;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Class Reports</CardTitle>
          <CardDescription>
            View aggregated performance data for classes and sections. Apply filters to refine the reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-lg bg-muted/30 items-end">
            <div className="flex-1 grid gap-1.5">
              <Label htmlFor="reportClass">Class</Label>
               <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                 <SelectTrigger id="reportClass">
                   <SelectValue placeholder="Select Class" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="">Select Class</SelectItem> {/* Add an explicit empty value option */}
                   {mockClasses.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>
             <div className="flex-1 grid gap-1.5">
               <Label htmlFor="reportSubject">Subject</Label>
                <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={!selectedClassId || availableSubjects.length === 0}>
                 <SelectTrigger id="reportSubject">
                   <SelectValue placeholder="Select Subject" />
                 </SelectTrigger>
                 <SelectContent>
                     {/* Ensure 'all' option has a value */}
                     {availableSubjects.map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                     ))}
                 </SelectContent>
               </Select>
            </div>
             <div className="flex-1 grid gap-1.5">
               <Label htmlFor="reportTestType">Test Type</Label>
               <Select value={selectedTestTypeId} onValueChange={setSelectedTestTypeId} disabled={!selectedClassId}>
                 <SelectTrigger id="reportTestType">
                   <SelectValue placeholder="Select Test Type" />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="all">All Test Types</SelectItem>
                     {availableTestTypes.slice(1).map(type => ( // slice(1) to skip 'all'
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                     ))}
                 </SelectContent>
               </Select>
            </div>
             {/* Add Date Range Pickers Here Later */}
             {/* <Button variant="outline" disabled={!selectedClassId}>
                 <Filter className="mr-2 h-4 w-4"/> Apply Filters
             </Button> */}
          </div>

           {!selectedClassId && <p className="text-center text-muted-foreground">Please select a class to view reports.</p>}

          {/* Charts */}
          {selectedClassId && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Chart 1: Class Average by Subject */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Average Performance by Subject</CardTitle>
                         <CardDescription>
                             Class: {mockClasses.find(c=>c.id === selectedClassId)?.name} | Test Type: {selectedTestTypeId === 'all' ? 'All' : selectedTestTypeId}
                         </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {subjectAverageData && subjectAverageData.length > 0 ? (
                             <ChartContainer config={chartConfig} className="h-[300px] w-full">
                               <BarChart data={subjectAverageData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                 <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                 <XAxis dataKey="subject" tickLine={false} tickMargin={10} axisLine={false} />
                                 <YAxis domain={[0, 100]} unit="%" allowDecimals={false} />
                                 <ChartTooltip content={<ChartTooltipContent />} />
                                  <ChartLegend content={<ChartLegendContent />} />
                                 <Bar dataKey="average" fill="var(--color-average)" radius={4}>
                                     <LabelList position="top" offset={5} className="fill-foreground" fontSize={10} formatter={(value: number) => `${value}%`} />
                                 </Bar>
                               </BarChart>
                             </ChartContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available for these filters.</div>
                        )}
                    </CardContent>
                </Card>

                 {/* Chart 2: Section Comparison */}
                 <Card>
                     <CardHeader>
                         <CardTitle className="text-lg">Section Comparison</CardTitle>
                         <CardDescription>
                              Class: {mockClasses.find(c=>c.id === selectedClassId)?.name} | Subject: {typeof sectionComparisonData === 'object' && sectionComparisonData.subjectName ? sectionComparisonData.subjectName : 'N/A'} | Test Type: {selectedTestTypeId === 'all' ? 'All' : selectedTestTypeId}
                          </CardDescription>
                     </CardHeader>
                     <CardContent>
                         {/* Check if sectionComparisonData is an object and its data array has items */}
                         {typeof sectionComparisonData === 'object' && sectionComparisonData.data && sectionComparisonData.data.length > 0 ? (
                             <ChartContainer config={chartConfig} className="h-[300px] w-full">
                               <BarChart data={sectionComparisonData.data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
                                 <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                                  <XAxis type="number" domain={[0, 100]} unit="%" allowDecimals={false} />
                                  <YAxis dataKey="section" type="category" tickLine={false} tickMargin={5} axisLine={false} width={80}/>
                                 <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                 <ChartLegend content={<ChartLegendContent />} />
                                 <Bar dataKey="average" fill="var(--color-average)" radius={4} layout="vertical">
                                     <LabelList position="right" offset={5} className="fill-foreground" fontSize={10} formatter={(value: number) => `${value}%`} />
                                 </Bar>
                               </BarChart>
                             </ChartContainer>
                         ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                {selectedSubjectId === 'all' ? "Select a specific subject for section comparison." : "No data available for these filters."}
                            </div>
                        )}
                     </CardContent>
                 </Card>

                 {/* Section 3: High/Low Scorers */}
                  <Card className="lg:col-span-2">
                     <CardHeader>
                         <CardTitle className="text-lg">Top and Bottom Performers</CardTitle>
                         <CardDescription>
                              Class: {mockClasses.find(c=>c.id === selectedClassId)?.name} | Subject: {selectedSubjectId === 'all' ? 'All' : mockSubjects.find(s=>s.id===selectedSubjectId)?.name} | Test Type: {selectedTestTypeId === 'all' ? 'All' : selectedTestTypeId}
                          </CardDescription>
                     </CardHeader>
                     <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-1 text-green-600"><TrendingUp size={18} /> Top 5 Performers</h4>
                             {scorerData.top.length > 0 ? (
                                 <ul className="space-y-1 text-sm">
                                     {scorerData.top.map(student => (
                                         <li key={student.studentId} className="flex justify-between items-center p-1 rounded hover:bg-muted/50">
                                             <span>{student.name}</span>
                                             <span className="font-medium text-green-700">{student.averagePercent}%</span>
                                         </li>
                                     ))}
                                 </ul>
                             ): ( <p className="text-sm text-muted-foreground">No data available.</p> )}
                         </div>
                         <div>
                             <h4 className="font-semibold mb-2 flex items-center gap-1 text-red-600"><TrendingDown size={18} /> Bottom 5 Performers</h4>
                              {scorerData.bottom.length > 0 ? (
                                 <ul className="space-y-1 text-sm">
                                     {scorerData.bottom.map(student => (
                                         <li key={student.studentId} className="flex justify-between items-center p-1 rounded hover:bg-muted/50">
                                             <span>{student.name}</span>
                                             <span className="font-medium text-red-700">{student.averagePercent}%</span>
                                         </li>
                                     ))}
                                 </ul>
                             ): ( <p className="text-sm text-muted-foreground">No data available.</p> )}
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



    
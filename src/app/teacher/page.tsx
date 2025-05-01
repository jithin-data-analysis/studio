'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadTestPaper } from './components/upload-test-paper';
import { EnterMarks } from './components/enter-marks'; // This now handles test definitions
import { PerformanceInsights } from './components/performance-insights';
import { ClassReports } from './components/class-reports';
import { Upload, Edit, BarChart3, TrendingUp, FileText, ListPlus } from 'lucide-react'; // Added ListPlus
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TeacherPage() {
  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8">
        <Link href="/" passHref>
         <Button variant="outline" className="mb-4">
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
         </Button>
       </Link>
      <h1 className="text-3xl font-bold text-primary mb-6">Teacher Dashboard</h1>
      <Tabs defaultValue="tests" className="w-full"> {/* Changed default tab */}
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
           {/* Changed 'marks' tab to 'tests' */}
          <TabsTrigger value="tests">
            <ListPlus className="mr-2 h-4 w-4" /> Manage Tests
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="mr-2 h-4 w-4" /> Analyze Test Paper
          </TabsTrigger>
          {/* Removed 'Enter Marks' tab - functionality merged or separate */}
          <TabsTrigger value="insights">
            <TrendingUp className="mr-2 h-4 w-4" /> Performance Insights
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart3 className="mr-2 h-4 w-4" /> Class Reports
          </TabsTrigger>
        </TabsList>
         {/* Content for the new 'tests' tab */}
        <TabsContent value="tests">
          <EnterMarks />
        </TabsContent>
        <TabsContent value="upload">
          <UploadTestPaper />
        </TabsContent>
         {/* Removed 'marks' content */}
        <TabsContent value="insights">
          <PerformanceInsights />
        </TabsContent>
        <TabsContent value="reports">
          <ClassReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}

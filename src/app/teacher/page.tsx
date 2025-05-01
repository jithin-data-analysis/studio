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
    <div className="min-h-screen bg-background p-4 md:p-8">
       <div className="flex items-center justify-between mb-8"> {/* Increased bottom margin */}
         <h1 className="text-3xl font-bold text-primary">Teacher Dashboard</h1>
         <Link href="/" passHref>
           <Button variant="outline" className="mb-0"> {/* Removed bottom margin */}
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
           </Button>
         </Link>
       </div>
      <Tabs defaultValue="tests" className="w-full"> {/* Changed default tab */}
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8"> {/* Increased bottom margin */}
           {/* Changed 'marks' tab to 'tests' */}
          <TabsTrigger value="tests" className="hover:bg-muted transition-colors duration-200">
            <ListPlus className="mr-2 h-4 w-4" /> Manage Tests
          </TabsTrigger>
          <TabsTrigger value="upload" className="hover:bg-muted transition-colors duration-200">
            <Upload className="mr-2 h-4 w-4" /> Analyze Test Paper
          </TabsTrigger>
          {/* Removed 'Enter Marks' tab - functionality merged or separate */}
          <TabsTrigger value="insights" className="hover:bg-muted transition-colors duration-200">
            <TrendingUp className="mr-2 h-4 w-4" /> Performance Insights
          </TabsTrigger>
          <TabsTrigger value="reports" className="hover:bg-muted transition-colors duration-200">
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

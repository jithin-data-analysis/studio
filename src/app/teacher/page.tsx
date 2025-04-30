'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadTestPaper } from './components/upload-test-paper';
import { EnterMarks } from './components/enter-marks';
import { PerformanceInsights } from './components/performance-insights';
import { ClassReports } from './components/class-reports';
import { Upload, Edit, BarChart3, TrendingUp, FileText } from 'lucide-react';
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
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="upload">
            <Upload className="mr-2 h-4 w-4" /> Upload Test Paper
          </TabsTrigger>
          <TabsTrigger value="marks">
            <Edit className="mr-2 h-4 w-4" /> Enter Marks
          </TabsTrigger>
          <TabsTrigger value="insights">
            <TrendingUp className="mr-2 h-4 w-4" /> Performance Insights
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart3 className="mr-2 h-4 w-4" /> Class Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <UploadTestPaper />
        </TabsContent>
        <TabsContent value="marks">
          <EnterMarks />
        </TabsContent>
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

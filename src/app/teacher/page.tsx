'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadTestPaper } from './components/upload-test-paper';
import { EnterMarks } from './components/enter-marks';
import { PerformanceInsights } from './components/performance-insights';
import { ClassReports } from './components/class-reports';
import { Upload, Edit, BarChart3, TrendingUp, ListPlus, FolderKanban, Users, MessageSquare, User, FileText } from 'lucide-react'; // Added new icons
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'; // Added Card components

// Renamed component to TeacherDashboard for clarity
export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
       <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-bold text-primary">Teacher Dashboard</h1>
         <Link href="/" passHref>
           <Button variant="outline">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
           </Button>
         </Link>
       </div>
       {/* Dashboard Overview Placeholder */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 border-l-4 border-primary">
             <CardHeader>
                 <CardTitle className="text-xl font-semibold">Quick Analytics</CardTitle>
                 <CardDescription>Your at-a-glance performance overview.</CardDescription>
             </CardHeader>
             <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                 <div className="p-3 rounded-lg bg-background/50 shadow-sm">
                     <p className="text-2xl font-bold text-primary">15</p>
                     <p className="text-xs text-muted-foreground">Students Needing Coaching</p>
                 </div>
                 <div className="p-3 rounded-lg bg-background/50 shadow-sm">
                      <p className="text-2xl font-bold text-primary">3</p>
                      <p className="text-xs text-muted-foreground">Upcoming Tests/Projects</p>
                 </div>
                 <div className="p-3 rounded-lg bg-background/50 shadow-sm">
                      <p className="text-2xl font-bold text-primary">85%</p>
                      <p className="text-xs text-muted-foreground">Avg. Attendance (Last Week)</p>
                 </div>
                 <div className="p-3 rounded-lg bg-background/50 shadow-sm">
                      <p className="text-2xl font-bold text-primary">5</p>
                      <p className="text-xs text-muted-foreground">Recent Activity Logs</p>
                 </div>
             </CardContent>
         </Card>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 mb-8"> {/* Adjusted grid for more tabs */}
           {/* Renamed 'Manage Tests' to 'Tests & Marks' for clarity */}
          <TabsTrigger value="tests" className="text-xs sm:text-sm">
            <ListPlus className="mr-1 sm:mr-2 h-4 w-4" /> Tests & Marks
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs sm:text-sm">
            <Upload className="mr-1 sm:mr-2 h-4 w-4" /> Analyze Paper
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-xs sm:text-sm">
            <TrendingUp className="mr-1 sm:mr-2 h-4 w-4" /> Insights
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm">
            <BarChart3 className="mr-1 sm:mr-2 h-4 w-4" /> Reports
          </TabsTrigger>
           {/* Added New Tabs from SATS Blueprint */}
            <TabsTrigger value="projects" className="text-xs sm:text-sm">
                <FolderKanban className="mr-1 sm:mr-2 h-4 w-4" /> Projects
            </TabsTrigger>
            <TabsTrigger value="counseling" className="text-xs sm:text-sm">
                <Users className="mr-1 sm:mr-2 h-4 w-4" /> Counseling
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm">
                <User className="mr-1 sm:mr-2 h-4 w-4" /> My Profile
            </TabsTrigger>
        </TabsList>

        <TabsContent value="tests">
          {/* EnterMarks component now likely handles both test definition and mark entry */}
          <EnterMarks />
        </TabsContent>
        <TabsContent value="upload">
          <UploadTestPaper />
        </TabsContent>
        <TabsContent value="insights">
          <PerformanceInsights />
        </TabsContent>
        <TabsContent value="reports">
          <ClassReports />
        </TabsContent>
         {/* Placeholder Content for New Tabs */}
         <TabsContent value="projects">
             <Card>
                 <CardHeader>
                     <CardTitle>Curricular Projects</CardTitle>
                     <CardDescription>Manage and track student projects.</CardDescription>
                 </CardHeader>
                 <CardContent>
                     <p className="text-muted-foreground">Project management feature coming soon!</p>
                     {/* Add UI for creating/viewing projects here */}
                 </CardContent>
             </Card>
         </TabsContent>
          <TabsContent value="counseling">
             <Card>
                 <CardHeader>
                     <CardTitle>Counseling & Coaching</CardTitle>
                     <CardDescription>Track student progress beyond academics.</CardDescription>
                 </CardHeader>
                 <CardContent>
                     <p className="text-muted-foreground">Counseling records feature coming soon!</p>
                     {/* Add UI for viewing/adding counseling notes here */}
                 </CardContent>
             </Card>
         </TabsContent>
          <TabsContent value="profile">
             <Card>
                 <CardHeader>
                     <CardTitle>My Profile</CardTitle>
                     <CardDescription>View your profile and provide feedback.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                      <p className="text-muted-foreground">Profile editing and feedback features coming soon!</p>
                      <Button variant="outline"><MessageSquare className="mr-2 h-4 w-4"/> Report Issue</Button>
                 </CardContent>
             </Card>
         </TabsContent>
      </Tabs>
    </div>
  );
}

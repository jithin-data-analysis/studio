'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadTestPaper } from './components/upload-test-paper';
import { EnterMarks } from './components/enter-marks';
import { PerformanceInsights } from './components/performance-insights';
import { ClassReports } from './components/class-reports';
import { Upload, Edit, BarChart3, TrendingUp, ListPlus, FolderKanban, Users, MessageSquare, User, FileText, Bell, Brain, Activity } from 'lucide-react'; // Added Bell, Brain, Activity
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
       {/* Dashboard Overview Placeholder - Enhanced with more color */}
        <Card className="mb-8 border-l-4 border-primary shadow-lg overflow-hidden">
             <CardHeader className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 p-4 md:p-6">
                 <CardTitle className="text-xl font-semibold text-primary">Quick Analytics & Actions</CardTitle>
                 <CardDescription>Your at-a-glance performance overview and quick links.</CardDescription>
             </CardHeader>
             {/* Use grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 for more tiles */}
             <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-4 md:p-6">
                 {/* Existing Tiles with more vibrant backgrounds */}
                 <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/30 shadow-sm border border-orange-200 dark:border-orange-800 text-center">
                     <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">15</p>
                     <p className="text-xs text-muted-foreground">Students Needing Coaching</p>
                 </div>
                 <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 shadow-sm border border-blue-200 dark:border-blue-800 text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</p>
                      <p className="text-xs text-muted-foreground">Upcoming Tests/Projects</p>
                 </div>
                 <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 shadow-sm border border-green-200 dark:border-green-800 text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">85%</p>
                      <p className="text-xs text-muted-foreground">Avg. Attendance (Last Week)</p>
                 </div>
                 <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-900/30 shadow-sm border border-teal-200 dark:border-teal-800 text-center">
                      <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">5</p>
                      <p className="text-xs text-muted-foreground">Recent Activity Logs</p>
                 </div>
                 {/* New Tiles */}
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/30 shadow-sm border border-purple-200 dark:border-purple-800 text-center">
                     <Brain className="h-6 w-6 mx-auto text-purple-600 dark:text-purple-400 mb-1"/>
                     <p className="text-xs text-muted-foreground">Latest AI Insights</p>
                 </div>
                  <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 shadow-sm border border-yellow-200 dark:border-yellow-800 text-center">
                     <Bell className="h-6 w-6 mx-auto text-yellow-600 dark:text-yellow-400 mb-1"/>
                     <p className="text-xs text-muted-foreground">New Notifications</p>
                 </div>

             </CardContent>
         </Card>

      <Tabs defaultValue="tests" className="w-full">
        {/* Adjusted grid for potentially more tabs in future, keeping 7 for now */}
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 mb-8">
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

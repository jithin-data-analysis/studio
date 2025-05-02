'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadTestPaper } from './components/upload-test-paper';
import { EnterMarks } from './components/enter-marks';
import { PerformanceInsights } from './components/performance-insights';
import { ClassReports } from './components/class-reports';
import { Upload, Edit, BarChart3, TrendingUp, ListPlus, FolderKanban, Users, MessageSquare, User as UserIcon, FileText, Bell, Brain, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react'; // Added more icons
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// Renamed component to TeacherDashboard for clarity
export default function TeacherDashboard() {
  // Mock data for overview tiles - replace with real data
  const studentsNeedingCoaching = 8;
  const upcomingTests = 2;
  const avgAttendance = 92; // Percentage
  const newInsights = 5;
  const unreadNotifications = 3;
  const projectsInProgress = 4;


  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
       {/* Header moved to dashboard/page.tsx */}
       {/* <div className="flex items-center justify-between mb-8"> ... </div> */}

       {/* Dashboard Overview Placeholder - Enhanced with more color and icons */}
        <Card className="mb-8 border-l-4 border-primary shadow-lg overflow-hidden">
             <CardHeader className="bg-gradient-to-r from-primary/10 via-white to-accent/10 dark:from-primary/20 dark:via-background dark:to-accent/20 p-4 md:p-6">
                 <CardTitle className="text-xl font-semibold text-primary">Quick Analytics & Actions</CardTitle>
                 <CardDescription>Your at-a-glance performance overview and quick links.</CardDescription>
             </CardHeader>
             <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-4 md:p-6">
                 {/* Tile 1: Students Needing Coaching */}
                 <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 shadow-sm border border-orange-200 dark:border-orange-700 text-center">
                     <AlertTriangle className="h-6 w-6 text-orange-500 mb-1"/>
                     <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{studentsNeedingCoaching}</p>
                     <p className="text-xs text-muted-foreground mt-0.5">Students Needing Coaching</p>
                 </div>
                 {/* Tile 2: Upcoming Tests/Projects */}
                 <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 shadow-sm border border-blue-200 dark:border-blue-700 text-center">
                     <Clock className="h-6 w-6 text-blue-500 mb-1"/>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{upcomingTests}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Upcoming Tests</p>
                 </div>
                  {/* Tile 3: Avg Attendance */}
                 <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-green-100 dark:bg-green-900/30 shadow-sm border border-green-200 dark:border-green-700 text-center">
                      <CheckCircle className="h-6 w-6 text-green-500 mb-1"/>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">{avgAttendance}%</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Avg. Attendance</p>
                 </div>
                 {/* Tile 4: New AI Insights */}
                 <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 shadow-sm border border-purple-200 dark:border-purple-700 text-center">
                     <Brain className="h-6 w-6 text-purple-500 mb-1"/>
                     <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{newInsights}</p>
                     <p className="text-xs text-muted-foreground mt-0.5">New AI Insights</p>
                 </div>
                 {/* Tile 5: Notifications */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 shadow-sm border border-yellow-200 dark:border-yellow-700 text-center">
                     <Bell className="h-6 w-6 text-yellow-500 mb-1"/>
                     <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{unreadNotifications}</p>
                     <p className="text-xs text-muted-foreground mt-0.5">Notifications</p>
                 </div>
                  {/* Tile 6: Projects In Progress */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-teal-100 dark:bg-teal-900/30 shadow-sm border border-teal-200 dark:border-teal-700 text-center">
                     <FolderKanban className="h-6 w-6 text-teal-500 mb-1"/>
                     <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{projectsInProgress}</p>
                     <p className="text-xs text-muted-foreground mt-0.5">Active Projects</p>
                 </div>

             </CardContent>
         </Card>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 mb-8">
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
            <TabsTrigger value="projects" className="text-xs sm:text-sm">
                <FolderKanban className="mr-1 sm:mr-2 h-4 w-4" /> Projects
            </TabsTrigger>
            <TabsTrigger value="counseling" className="text-xs sm:text-sm">
                <Users className="mr-1 sm:mr-2 h-4 w-4" /> Counseling
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm">
                <UserIcon className="mr-1 sm:mr-2 h-4 w-4" /> My Profile
            </TabsTrigger>
        </TabsList>

        <TabsContent value="tests">
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

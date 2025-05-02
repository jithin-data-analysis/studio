'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, BookOpen, BarChart2, CalendarCheck, Brain, User, FileText, Activity, GraduationCap } from 'lucide-react'; // Added Activity, GraduationCap

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-primary">Student Dashboard</h1>
        <Link href="/" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
          </Button>
        </Link>
      </div>

      {/* Enhanced grid with more colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder Cards for Student Features - Added border colors and icons */}
        <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400"><BookOpen/> My Academics</CardTitle>
            <CardDescription>View your grades, reports, and syllabus.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-teal-500 hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-teal-700 dark:text-teal-400"><FileText/> Test Reports</CardTitle>
            <CardDescription>Check your performance on tests and exams.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400"><CalendarCheck/> Homework & Attendance</CardTitle>
            <CardDescription>Track your assignments and attendance.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
          </CardContent>
        </Card>

         <Card className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400"><Brain/> Personalized Insights</CardTitle>
            <CardDescription>AI-powered tips and learning path suggestions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500 hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400"><BarChart2/> Performance Trends</CardTitle>
            <CardDescription>Visualize your progress over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
          </CardContent>
        </Card>

         <Card className="border-l-4 border-orange-500 hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400"><User/> My Profile</CardTitle>
            <CardDescription>View your profile information.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
          </CardContent>
        </Card>

        {/* Added new placeholder tile */}
        <Card className="border-l-4 border-indigo-500 hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400"><Activity/> My Activities</CardTitle>
            <CardDescription>See your co-curricular involvement.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
          </CardContent>
        </Card>

         {/* Added another new placeholder tile */}
         <Card className="border-l-4 border-pink-500 hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-400"><GraduationCap/> Learning Path</CardTitle>
            <CardDescription>Your AI-suggested learning journey.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

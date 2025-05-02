'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, LayoutDashboard, BookOpen, BarChart2, CalendarCheck, Brain, User, FileText } from 'lucide-react'; // Added FileText here

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder Cards for Student Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen/> My Academics</CardTitle>
            <CardDescription>View your grades, reports, and syllabus.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText/> Test Reports</CardTitle>
            <CardDescription>Check your performance on tests and exams.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarCheck/> Homework & Attendance</CardTitle>
            <CardDescription>Track your assignments and attendance.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain/> Personalized Insights</CardTitle>
            <CardDescription>AI-powered tips and learning path suggestions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart2/> Performance Trends</CardTitle>
            <CardDescription>Visualize your progress over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User/> My Profile</CardTitle>
            <CardDescription>View your profile information.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

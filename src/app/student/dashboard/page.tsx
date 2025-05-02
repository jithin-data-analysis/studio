'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Import Avatar
import { ArrowLeft, BookOpen, BarChart2, CalendarCheck, Brain, User as UserIcon, FileText, Activity, GraduationCap, Target as GoalIcon, MessageSquare, Bell } from 'lucide-react'; // Renamed User import, added GoalIcon, MessageSquare, Bell
import { Progress } from '@/components/ui/progress'; // Import Progress

export default function StudentDashboard() {
  // Mock data - Replace with actual student data later
  const studentName = "Alex Johnson";
  const studentClass = "Grade 8 - Section A";
  const studentPhotoUrl = "https://picsum.photos/seed/alexj/100"; // Placeholder photo
  const overallProgress = 75; // Example progress percentage

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/50 to-purple-50/50 dark:from-background dark:via-blue-900/10 dark:to-purple-900/10 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
           <Avatar className="h-16 w-16 border-2 border-primary shadow-md">
              <AvatarImage src={studentPhotoUrl} alt={studentName} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary"><UserIcon size={32}/></AvatarFallback>
           </Avatar>
           <div>
              <h1 className="text-3xl font-bold text-primary">{studentName}</h1>
              <p className="text-muted-foreground">{studentClass}</p>
           </div>
        </div>
        <Link href="/" passHref>
          <Button variant="outline" className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" /> Logout
          </Button>
        </Link>
      </div>

       {/* Overall Progress Bar */}
       <Card className="mb-8 shadow-md border-l-4 border-primary">
           <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><GoalIcon /> Overall Academic Goal</CardTitle>
              <CardDescription>Your progress towards completing this term's goals.</CardDescription>
           </CardHeader>
           <CardContent>
               <Progress value={overallProgress} className="h-3" />
               <p className="text-right text-sm text-muted-foreground mt-1">{overallProgress}% Complete</p>
           </CardContent>
       </Card>

      {/* Enhanced grid with more colors and icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Enhanced Cards for Student Features */}
        <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-200 bg-blue-50/30 dark:bg-blue-900/20 hover:border-blue-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400"><BookOpen size={20}/> My Academics</CardTitle>
            <CardDescription>View your grades, reports, and syllabus.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
            <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-blue-600">View Details →</Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-teal-500 hover:shadow-lg transition-shadow duration-200 bg-teal-50/30 dark:bg-teal-900/20 hover:border-teal-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-teal-700 dark:text-teal-400"><FileText size={20}/> Test Reports</CardTitle>
            <CardDescription>Check your performance on tests and exams.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
             <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-teal-600">View Reports →</Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-200 bg-green-50/30 dark:bg-green-900/20 hover:border-green-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400"><CalendarCheck size={20}/> Homework & Attendance</CardTitle>
            <CardDescription>Track your assignments and attendance.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
             <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-green-600">Check Status →</Button>
          </CardContent>
        </Card>

         <Card className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow duration-200 bg-purple-50/30 dark:bg-purple-900/20 hover:border-purple-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400"><Brain size={20}/> Personalized Insights</CardTitle>
            <CardDescription>AI-powered tips and learning path suggestions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
             <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-purple-600">Explore Insights →</Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500 hover:shadow-lg transition-shadow duration-200 bg-yellow-50/30 dark:bg-yellow-900/20 hover:border-yellow-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400"><BarChart2 size={20}/> Performance Trends</CardTitle>
            <CardDescription>Visualize your progress over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
             <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-yellow-600">See Trends →</Button>
          </CardContent>
        </Card>

         <Card className="border-l-4 border-orange-500 hover:shadow-lg transition-shadow duration-200 bg-orange-50/30 dark:bg-orange-900/20 hover:border-orange-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400"><UserIcon size={20}/> My Profile</CardTitle>
            <CardDescription>View and update your profile information.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
             <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-orange-600">Edit Profile →</Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-indigo-500 hover:shadow-lg transition-shadow duration-200 bg-indigo-50/30 dark:bg-indigo-900/20 hover:border-indigo-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400"><Activity size={20}/> My Activities</CardTitle>
            <CardDescription>See your co-curricular involvement.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
             <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-indigo-600">View Activities →</Button>
          </CardContent>
        </Card>

         <Card className="border-l-4 border-pink-500 hover:shadow-lg transition-shadow duration-200 bg-pink-50/30 dark:bg-pink-900/20 hover:border-pink-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-400"><GraduationCap size={20}/> Learning Path</CardTitle>
            <CardDescription>Your AI-suggested learning journey.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming Soon!</p>
             <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-pink-600">View Path →</Button>
          </CardContent>
        </Card>

        {/* Added New Tiles */}
         <Card className="border-l-4 border-red-500 hover:shadow-lg transition-shadow duration-200 bg-red-50/30 dark:bg-red-900/20 hover:border-red-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400"><Bell size={20}/> Notifications</CardTitle>
            <CardDescription>Recent updates and alerts.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">3 Unread</p>
             <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-red-600">View All →</Button>
          </CardContent>
        </Card>

         <Card className="border-l-4 border-cyan-500 hover:shadow-lg transition-shadow duration-200 bg-cyan-50/30 dark:bg-cyan-900/20 hover:border-cyan-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400"><MessageSquare size={20}/> Communicate</CardTitle>
            <CardDescription>Connect with teachers or counselors.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">Coming Soon!</p>
             <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-cyan-600">Send Message →</Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

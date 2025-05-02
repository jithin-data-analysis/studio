'use client';

import TeacherDashboardComponent from '../page'; // Import the main dashboard component
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Import Avatar
import { User as UserIcon, ArrowLeft } from 'lucide-react'; // Rename User import
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TeacherDashboardPage() {
  // Mock data - Replace with actual teacher data later
  const teacherName = "Ms. Evelyn Reed";
  const teacherSubject = "Mathematics Teacher";
  const teacherPhotoUrl = "https://picsum.photos/seed/evelynr/100"; // Placeholder photo

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-indigo-50/50 to-teal-50/50 dark:from-background dark:via-indigo-900/10 dark:to-teal-900/10 p-4 md:p-8">
       <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
             <Avatar className="h-16 w-16 border-2 border-primary shadow-md">
                <AvatarImage src={teacherPhotoUrl} alt={teacherName} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary"><UserIcon size={32}/></AvatarFallback>
             </Avatar>
             <div>
               <h1 className="text-3xl font-bold text-primary">{teacherName}</h1>
               <p className="text-muted-foreground">{teacherSubject}</p>
             </div>
          </div>
          <Link href="/" passHref>
             <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" /> Logout
             </Button>
          </Link>
       </div>
       {/* Render the main dashboard content */}
       <TeacherDashboardComponent />
    </div>
  );
}

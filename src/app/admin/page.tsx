'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClassesSections } from './components/classes-sections';
import { Students } from './components/students';
import { Subjects } from './components/subjects';
import { CoCurricular } from './components/co-curricular';
import { Building, Users, BookOpen, Activity } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Renamed component for clarity
export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
       <div className="flex items-center justify-between mb-8">
         {/* Updated Title */}
         <h1 className="text-3xl font-bold text-primary">
           Admin Configuration Portal
         </h1>
         <Link href="/" passHref>
           <Button variant="outline">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
           </Button>
         </Link>
       </div>
      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 mb-8">
           {/* Adjusted Tab Names for better alignment with SATS */}
          <TabsTrigger value="classes" className="hover:bg-muted transition-colors duration-200">
            <Building className="mr-2 h-4 w-4" /> School Structure
          </TabsTrigger>
          <TabsTrigger value="students" className="hover:bg-muted transition-colors duration-200">
            <Users className="mr-2 h-4 w-4" /> Student Management
          </TabsTrigger>
          <TabsTrigger value="subjects" className="hover:bg-muted transition-colors duration-200">
            <BookOpen className="mr-2 h-4 w-4" /> Subjects & Syllabus
          </TabsTrigger>
          <TabsTrigger value="co-curricular" className="hover:bg-muted transition-colors duration-200">
            <Activity className="mr-2 h-4 w-4" /> Co-Curricular Setup
          </TabsTrigger>
        </TabsList>
        {/* Tab content remains the same for now */}
        <TabsContent value="classes">
          <ClassesSections />
        </TabsContent>
        <TabsContent value="students">
          <Students />
        </TabsContent>
        <TabsContent value="subjects">
          <Subjects />
        </TabsContent>
        <TabsContent value="co-curricular">
          <CoCurricular />
        </TabsContent>
      </Tabs>
    </div>
  );
}

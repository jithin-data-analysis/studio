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

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8">
       <Link href="/" passHref>
         <Button variant="outline" className="mb-4">
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
         </Button>
       </Link>
      <h1 className="text-3xl font-bold text-primary mb-6">
        Admin Configuration
      </h1>
      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 mb-6">
          <TabsTrigger value="classes">
            <Building className="mr-2 h-4 w-4" /> Classes & Sections
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="mr-2 h-4 w-4" /> Students
          </TabsTrigger>
          <TabsTrigger value="subjects">
            <BookOpen className="mr-2 h-4 w-4" /> Subjects
          </TabsTrigger>
          <TabsTrigger value="co-curricular">
            <Activity className="mr-2 h-4 w-4" /> Co-Curricular
          </TabsTrigger>
        </TabsList>
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

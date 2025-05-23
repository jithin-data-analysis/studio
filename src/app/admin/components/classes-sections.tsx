// src/app/admin/components/classes-sections.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Trash2, UserPlus, Edit, BookOpen, User as UserIcon, XSquare, CheckSquare } from 'lucide-react'; // Added User, XSquare, CheckSquare
import { type Class, type Section, type Student } from '@/types';
import { StudentModal } from './student-modal';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Import Avatar

const initialClasses: Class[] = [
  // Sample data - replace with API call later
  {
    id: 'cls1',
    name: 'Grade 1',
    grade: 1,
    sections: [
      {
        id: 'sec1a',
        name: 'A',
        classId: 'cls1',
        students: [
            { id: 'stu1', name: 'Alice', rollNo: '101', dob: '2016-01-15', gender: 'Female', photoUrl: 'https://picsum.photos/seed/101/100', classId: 'cls1', sectionId: 'sec1a', coCurricularIds: ['act1'] } as Student,
            { id: 'stu2', name: 'Bob', rollNo: '102', dob: '2016-03-20', gender: 'Male', classId: 'cls1', sectionId: 'sec1a', coCurricularIds: []} as Student,
         ],
      },
      { id: 'sec1b', name: 'B', classId: 'cls1', students: [] },
    ],
  },
   {
    id: 'cls2',
    name: 'Grade 8',
    grade: 8,
    sections: [
      { id: 'sec8a', name: 'A', classId: 'cls2', students: [
          { id: 'stu4', name: 'Diana Prince', rollNo: '801', dob: '2009-05-05', gender: 'Female', photoUrl: 'https://picsum.photos/seed/801/100', classId: 'cls2', sectionId: 'sec8a', coCurricularIds: ['act1', 'act3'] } as Student,
      ] },
    ],
  },
];

// Mock activities for the modal
const mockActivities = [
    { id: 'act1', name: 'Sports Club' },
    { id: 'act2', name: 'Music Ensemble' },
    { id: 'act3', name: 'Drama Club' },
    { id: 'act4', name: 'Debate Team' },
];

export function ClassesSections() {
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [targetSection, setTargetSection] = useState<{ classId: string; sectionId: string } | null>(null);
  const { toast } = useToast();


  const handleAddClass = () => {
    if (!selectedGrade || classes.some(c => c.name === `Grade ${selectedGrade}`)) {
         toast({ title: "Cannot Add Class", description: `Grade ${selectedGrade} already exists or no grade selected.`, variant: "destructive" });
        return; // Prevent duplicates or adding without selection
    }

    const newClass: Class = {
      id: `cls${Date.now()}`, // Temporary ID generation
      name: `Grade ${selectedGrade}`,
      grade: parseInt(selectedGrade),
      sections: [{ id: `sec${Date.now()}a`, name: 'A', classId: `cls${Date.now()}`, students: [] }], // Start with Section A
    };
    // Add API call here later
    setClasses([...classes, newClass].sort((a,b) => a.grade - b.grade)); // Keep sorted
    setSelectedGrade(''); // Reset dropdown
     toast({ title: "Class Added", description: `${newClass.name} created with Section A.` });
  };

  const handleAddSection = (classId: string) => {
    setClasses(
      classes.map((cls) => {
        if (cls.id === classId) {
          const lastSectionName = cls.sections.length > 0 ? cls.sections[cls.sections.length - 1].name : '@'; // Handle empty sections case
          const nextSectionCharCode = lastSectionName.charCodeAt(0) + 1;
          // Limit sections (e.g., up to 'Z')
          if (nextSectionCharCode > 'Z'.charCodeAt(0)) {
              toast({title: "Limit Reached", description: "Maximum sections reached for this class.", variant: "destructive"});
              return cls;
          }
          const nextSectionName = String.fromCharCode(nextSectionCharCode);
          const newSection: Section = {
            id: `sec${Date.now()}${nextSectionName.toLowerCase()}`,
            name: nextSectionName,
            classId: classId,
            students: [],
          };
           // Add API call here later
           toast({ title: "Section Added", description: `Section ${nextSectionName} added to ${cls.name}.` });
          return { ...cls, sections: [...cls.sections, newSection].sort((a,b) => a.name.localeCompare(b.name)) }; // Keep sorted
        }
        return cls;
      })
    );
  };

 const handleRemoveClass = (classId: string) => {
    // Add API call here later
    const className = classes.find(c => c.id === classId)?.name;
    setClasses(classes.filter((cls) => cls.id !== classId));
    toast({ title: "Class Removed", description: `${className} has been removed.`, variant: "destructive" });
  };

   const handleRemoveSection = (classId: string, sectionId: string) => {
       const cls = classes.find(c => c.id === classId);
       const sec = cls?.sections.find(s => s.id === sectionId);
       if (!cls || !sec) return;

       if (cls.sections.length <= 1) {
          toast({ title: "Cannot Remove Section", description: "A class must have at least one section.", variant: "destructive" });
          return;
       }
       if (sec.students.length > 0) {
            toast({ title: "Cannot Remove Section", description: `Section ${sec.name} has students. Please move or remove them first.`, variant: "destructive" });
           return;
       }

        // Add API call here later
       setClasses(
         classes.map((cls) => {
           if (cls.id === classId) {
             return { ...cls, sections: cls.sections.filter((s) => s.id !== sectionId) };
           }
           return cls;
         })
       );
       toast({ title: "Section Removed", description: `Section ${sec.name} from ${cls.name} has been removed.`, variant: "destructive" });
   };

  const openAddStudentModal = (classId: string, sectionId: string) => {
      setEditingStudent(null); // Ensure it's for adding a new student
      setTargetSection({ classId, sectionId });
      setIsStudentModalOpen(true);
  };

  const openEditStudentModal = (student: Student, classId: string, sectionId: string) => {
      setEditingStudent(student);
      setTargetSection({ classId, sectionId });
      setIsStudentModalOpen(true);
  }

  const handleSaveStudent = (studentData: Partial<Student>) => {
      // Add validation here if needed (e.g., unique roll number within class/section)
      // Add API call here later
      setClasses(prevClasses => {
          return prevClasses.map(cls => {
              if (cls.id === targetSection?.classId) {
                  return {
                      ...cls,
                      sections: cls.sections.map(sec => {
                          if (sec.id === targetSection?.sectionId) {
                              let updatedStudents;
                              if (editingStudent) {
                                  // Update existing student
                                  updatedStudents = sec.students.map(s => s.id === studentData.id ? {...s, ...studentData} as Student : s);
                                   toast({ title: "Student Updated", description: `${studentData.name}'s details have been updated.` });
                              } else {
                                  // Add new student
                                  const newStudent = { ...studentData, id: `stu${Date.now()}` } as Student; // Temp ID, ensure all fields
                                  updatedStudents = [...sec.students, newStudent];
                                  toast({ title: "Student Added", description: `${newStudent.name} has been added to Section ${sec.name}.` });
                              }
                              return { ...sec, students: updatedStudents.sort((a,b)=> a.rollNo.localeCompare(b.rollNo)) }; // Keep sorted by roll no
                          }
                          return sec;
                      })
                  };
              }
              return cls;
          });
      });
      setIsStudentModalOpen(false);
      setEditingStudent(null);
      setTargetSection(null);
  };

  const handleRemoveStudent = (student: Student, classId: string, sectionId: string) => {
       // Add API call here later
       setClasses(prevClasses => {
          return prevClasses.map(cls => {
              if (cls.id === classId) {
                  return {
                      ...cls,
                      sections: cls.sections.map(sec => {
                          if (sec.id === sectionId) {
                              return { ...sec, students: sec.students.filter(s => s.id !== student.id) };
                          }
                          return sec;
                      })
                  };
              }
              return cls;
          });
      });
       toast({ title: "Student Removed", description: `${student.name} has been removed.`, variant: "destructive" });
  }


  const gradeOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  // Define a max number of slots per section (e.g., 30)
  const MAX_STUDENTS_PER_SECTION = 30;

  return (
    <Card className="shadow-md dark:shadow-primary/10 border-t-4 border-primary rounded-xl overflow-hidden"> {/* Adjusted shadow */}
      <CardHeader className="bg-gradient-to-r from-primary/10 via-white to-accent/10 dark:from-primary/20 dark:via-background dark:to-accent/20 p-4 md:p-6"> {/* Adjusted gradient */}
        <CardTitle className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
             <BookOpen className="h-6 w-6"/> Manage Classes & Sections
        </CardTitle>
        <CardDescription className="text-muted-foreground mt-1">
          Define your school's structure. Add grades, organize sections, and manage student placements visually.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-4 md:p-6">
         {/* Enhanced Add Class section */}
        <div className="flex flex-wrap items-center gap-3 p-4 border border-dashed border-primary/30 dark:border-primary/50 rounded-lg bg-primary/5 dark:bg-primary/10">
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background shadow-sm">
              <SelectValue placeholder="Select Grade Level" />
            </SelectTrigger>
            <SelectContent>
              {gradeOptions.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  Grade {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddClass}
            disabled={!selectedGrade || classes.some(c => c.name === `Grade ${selectedGrade}`)}
            className="flex-1 sm:flex-none transition-transform transform hover:scale-105 shadow hover:shadow-lg"
           >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Class
          </Button>
           {selectedGrade && classes.some(c => c.name === `Grade ${selectedGrade}`) && (
                <p className="text-xs text-destructive ml-2 w-full sm:w-auto">Grade {selectedGrade} already exists.</p>
           )}
        </div>

        <div className="space-y-4">
          {classes.length === 0 && (
             <div className="text-center text-muted-foreground py-12 bg-muted/20 rounded-lg border border-dashed">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="font-medium">No classes created yet.</p>
                <p className="text-sm">Select a grade above and click 'Add Class' to start building your school structure.</p>
             </div>
          )}
          {classes.map((cls) => (
            <Card key={cls.id} className="overflow-hidden border border-border rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white via-white to-primary/5 dark:from-background dark:via-background dark:to-primary/10"> {/* Adjusted gradient */}
              <CardHeader className="flex flex-row items-center justify-between bg-muted/30 dark:bg-muted/10 p-3 px-4 border-b">
                 <div className="flex items-center gap-2">
                   <CardTitle className="text-lg font-semibold text-primary">{cls.name}</CardTitle>
                    <Badge variant="secondary" className="font-mono text-xs">{cls.sections.length} Section(s)</Badge>
                 </div>
                 <div className="flex gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => handleAddSection(cls.id)}
                       className="hover:bg-primary/10 hover:border-primary transition-colors text-primary border-primary/50 hover:text-primary shadow-sm"
                     >
                       <PlusCircle className="mr-1 h-3 w-3" /> Add Section
                     </Button>
                     <AlertDialog>
                         <AlertDialogTrigger asChild>
                            <Button
                               variant="ghost"
                               size="icon-sm"
                               className="text-destructive hover:text-destructive hover:bg-destructive/10"
                               aria-label={`Remove ${cls.name}`}
                               disabled={cls.sections.some(s => s.students.length > 0)}
                             >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                             <AlertDialogHeader>
                                 <AlertDialogTitle>Are you sure you want to remove {cls.name}?</AlertDialogTitle>
                                 <AlertDialogDescription>
                                     This action cannot be undone. All sections within this class will also be removed. Ensure all students are moved or removed first.
                                 </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                                 <AlertDialogAction onClick={() => handleRemoveClass(cls.id)} className={buttonVariants({variant: "destructive"})}>Remove Class</AlertDialogAction>
                             </AlertDialogFooter>
                         </AlertDialogContent>
                     </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {cls.sections.length === 0 && <p className="text-sm text-muted-foreground pl-4">No sections yet. Click 'Add Section' above.</p>}
                {cls.sections.map((sec) => (
                  <div key={sec.id} className="border rounded-md p-3 bg-background shadow-sm dark:bg-muted/20 transition-all duration-200 hover:border-primary/50 dark:hover:border-primary/70"> {/* Adjusted hover border */}
                    <div className="flex justify-between items-center mb-3 pb-2 border-b">
                        <h4 className="font-semibold text-primary dark:text-primary/90">Section {sec.name}</h4> {/* Adjusted color */}
                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="sm" onClick={() => openAddStudentModal(cls.id, sec.id)} className="hover:bg-accent/80 text-xs">
                                <UserPlus className="h-4 w-4 mr-1" /> Add Student
                             </Button>
                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                  <Button
                                     variant="ghost"
                                     size="icon-sm"
                                     className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                     aria-label={`Remove Section ${sec.name}`}
                                     disabled={cls.sections.length <= 1 || sec.students.length > 0}
                                   >
                                     <Trash2 className="h-4 w-4" />
                                   </Button>
                               </AlertDialogTrigger>
                               <AlertDialogContent>
                                    <AlertDialogHeader>
                                         <AlertDialogTitle>Remove Section {sec.name} from {cls.name}?</AlertDialogTitle>
                                         <AlertDialogDescription>
                                             This action cannot be undone. Ensure all students are moved or removed first. You cannot remove the last section of a class.
                                         </AlertDialogDescription>
                                     </AlertDialogHeader>
                                    <AlertDialogFooter>
                                         <AlertDialogCancel>Cancel</AlertDialogCancel>
                                         <AlertDialogAction onClick={() => handleRemoveSection(cls.id, sec.id)} className={buttonVariants({variant: "destructive"})}>Remove Section</AlertDialogAction>
                                     </AlertDialogFooter>
                               </AlertDialogContent>
                             </AlertDialog>
                        </div>
                    </div>

                    {/* Enhanced Student Grid - "Ticket Booking" Style */}
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 p-2 bg-muted/10 dark:bg-muted/5 border border-dashed rounded-lg">
                      {Array.from({ length: MAX_STUDENTS_PER_SECTION }).map((_, index) => {
                        const student = sec.students[index];
                        const slotNumber = index + 1;

                        return student ? (
                          // Filled Slot (Student Present)
                          <div
                            key={student.id}
                            className="relative group flex flex-col items-center justify-center aspect-square border rounded-md text-center text-[10px] bg-primary/10 dark:bg-primary/20 text-primary-foreground cursor-pointer hover:bg-primary/20 dark:hover:bg-primary/30 transition-all duration-200 shadow-sm hover:shadow-md border-primary/30 dark:border-primary/50"
                            title={`${student.name} (Roll: ${student.rollNo}) - Slot ${slotNumber}`}
                          >
                             <Avatar className="h-6 w-6 mb-0.5 border-2 border-background">
                                <AvatarImage src={student.photoUrl} alt={student.name} />
                                <AvatarFallback className="text-primary text-[8px]"><UserIcon size={10}/></AvatarFallback>
                             </Avatar>
                            <p className="font-medium truncate text-primary dark:text-primary/90 text-[9px] leading-tight px-1" title={student.name}>{student.name}</p>
                            <p className="text-primary/70 dark:text-primary/60 text-[8px]">R:{student.rollNo}</p>

                            {/* Action Buttons Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center gap-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md">
                                <Button variant="ghost" size="icon-xs" className="text-white hover:text-primary bg-black/40 hover:bg-black/70 h-5 w-5 rounded-full" onClick={() => openEditStudentModal(student, cls.id, sec.id)} title="Edit Student">
                                    <Edit className="h-2.5 w-2.5"/>
                                    <span className="sr-only">Edit</span>
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon-xs" className="text-red-300 hover:text-destructive bg-black/40 hover:bg-black/70 h-5 w-5 rounded-full" title="Remove Student">
                                      <Trash2 className="h-2.5 w-2.5"/>
                                      <span className="sr-only">Remove</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Remove {student.name} ({student.rollNo})?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will remove the student from Section {sec.name}. This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleRemoveStudent(student, cls.id, sec.id)} className={buttonVariants({variant: "destructive"})}>Remove Student</AlertDialogAction>
                                      </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </div>
                          </div>
                        ) : (
                          // Empty Slot
                          <div
                            key={`empty-${index}`}
                            className="flex flex-col items-center justify-center aspect-square border-dashed border-2 border-muted/50 rounded-md text-muted-foreground/60 text-[10px] bg-background hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors cursor-pointer"
                            onClick={() => openAddStudentModal(cls.id, sec.id)}
                            title={`Add Student to Slot ${slotNumber}`}
                          >
                            <UserPlus className="h-4 w-4 mb-0.5 opacity-40" />
                            <span>{slotNumber}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
        {isStudentModalOpen && targetSection && (
             <StudentModal
                isOpen={isStudentModalOpen}
                onClose={() => {
                    setIsStudentModalOpen(false);
                    setEditingStudent(null);
                    setTargetSection(null);
                }}
                onSave={handleSaveStudent}
                studentData={editingStudent}
                classId={targetSection.classId}
                sectionId={targetSection.sectionId}
                availableActivities={mockActivities}
             />
         )}
    </Card>
  );
}

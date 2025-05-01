'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Trash2, UserPlus, Edit, GripVertical } from 'lucide-react'; // Added GripVertical
import { type Class, type Section, type Student } from '@/types'; // Assuming types are defined
import { StudentModal } from './student-modal'; // We'll create this next
import { useToast } from '@/hooks/use-toast'; // Added toast
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'; // Added AlertDialog

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
        students: [{ id: 'stu1', name: 'Alice', rollNo: '101', dob: '2016-01-15', gender: 'Female', classId: 'cls1', sectionId: 'sec1a', coCurricularIds: ['act1'] } as Student, /* more students */ ],
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
          { id: 'stu4', name: 'Diana Prince', rollNo: '801', dob: '2009-05-05', gender: 'Female', classId: 'cls2', sectionId: 'sec8a', coCurricularIds: ['act1', 'act3'] } as Student,
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
  const [editingStudent, setEditingStudent] = useState<Student | null>(null); // Use correct student type
  const [targetSection, setTargetSection] = useState<{ classId: string; sectionId: string } | null>(null);
  const { toast } = useToast(); // Init toast


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

  const handleSaveStudent = (studentData: Partial<Student>) => { // Use correct student type
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

  return (
    <Card className="shadow-md dark:shadow-indigo-900/10"> {/* Added shadow */}
      <CardHeader>
        <CardTitle>Manage Classes and Sections</CardTitle>
        <CardDescription>
          Define school structure. Add classes, then sections, then manage students within each section.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/30"> {/* Enhanced Add Class section */}
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent>
              {gradeOptions.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  Grade {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddClass} disabled={!selectedGrade || classes.some(c => c.name === `Grade ${selectedGrade}`)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Class
          </Button>
           {selectedGrade && classes.some(c => c.name === `Grade ${selectedGrade}`) && (
                <p className="text-xs text-destructive ml-2">Grade {selectedGrade} already exists.</p>
           )}
        </div>

        <div className="space-y-4">
          {classes.length === 0 && <p className="text-center text-muted-foreground py-8">No classes created yet. Select a grade and click 'Add Class' to begin.</p>}
          {classes.map((cls) => (
            <Card key={cls.id} className="overflow-hidden border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"> {/* Added hover shadow */}
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-muted/60 to-muted/30 dark:from-muted/30 dark:to-muted/10 p-3 px-4">
                 <div className="flex items-center gap-2">
                   <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" /> {/* Added drag handle icon (visual only) */}
                   <CardTitle className="text-lg font-semibold text-primary">{cls.name}</CardTitle>
                 </div>
                 <div className="flex gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => handleAddSection(cls.id)}
                       className="hover:bg-primary/10 hover:border-primary transition-colors"
                     >
                       <PlusCircle className="mr-1 h-3 w-3" /> Add Section
                     </Button>
                      {/* Confirmation Dialog for Class Removal */}
                     <AlertDialog>
                         <AlertDialogTrigger asChild>
                            <Button
                               variant="destructive"
                               size="icon-sm"
                               aria-label={`Remove ${cls.name}`}
                               disabled={cls.sections.some(s => s.students.length > 0)} // Disable if class has students
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
                  <div key={sec.id} className="border rounded-md p-3 bg-background shadow-sm dark:bg-muted/20">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b"> {/* Added border bottom */}
                        <h4 className="font-semibold text-indigo-700 dark:text-indigo-400">Section {sec.name}</h4>
                        <div className="flex items-center gap-2">
                             <Button variant="ghost" size="sm" onClick={() => openAddStudentModal(cls.id, sec.id)} className="hover:bg-accent/80">
                                <UserPlus className="h-4 w-4 mr-1" /> Add Student
                             </Button>

                              {/* Confirmation Dialog for Section Removal */}
                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                  <Button
                                     variant="ghost"
                                     size="icon-sm"
                                     className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                     aria-label={`Remove Section ${sec.name}`}
                                     disabled={cls.sections.length <= 1 || sec.students.length > 0} // Disable removing last section or if students exist
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
                    {/* Student Grid - Enhanced Styling */}
                    {sec.students.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                        {sec.students.map((student) => (
                          <div
                             key={student.id}
                             className="relative group border rounded-md p-2 text-center text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                           >
                             <p className="font-medium truncate" title={student.name}>{student.name}</p>
                             <p className="text-indigo-500 dark:text-indigo-400 text-[10px]">R: {student.rollNo}</p>
                             {/* Action Buttons Overlay */}
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center gap-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md">
                                 <Button variant="ghost" size="icon-xs" className="text-white hover:text-primary bg-black/30 hover:bg-black/50 h-5 w-5" onClick={() => openEditStudentModal(student, cls.id, sec.id)} title="Edit Student">
                                     <Edit className="h-3 w-3"/>
                                      <span className="sr-only">Edit</span>
                                 </Button>
                                  {/* Confirmation Dialog for Student Removal */}
                                  <AlertDialog>
                                     <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon-xs" className="text-red-300 hover:text-destructive bg-black/30 hover:bg-black/50 h-5 w-5" title="Remove Student">
                                           <Trash2 className="h-3 w-3"/>
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
                        ))}
                         {/* Optional: Add empty slots visual */}
                         {/* Array.from({ length: Math.max(0, (cls.maxStudents ?? 30) - sec.students.length) }).map((_, i) => (
                             <div key={`empty-${i}`} className="border-dashed border-2 border-muted rounded-md p-2 h-12 flex items-center justify-center text-muted-foreground text-xs">
                                 Empty
                             </div>
                         )) */}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-4">No students assigned yet. Click 'Add Student'.</p>
                    )}
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
                studentData={editingStudent} // Pass existing data if editing
                classId={targetSection.classId}
                sectionId={targetSection.sectionId}
                availableActivities={mockActivities} // Pass mock activities
             />
         )}
    </Card>
  );
}

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
import { PlusCircle, Trash2, UserPlus, Edit } from 'lucide-react';
import { type Class, type Section } from '@/types'; // Assuming types are defined
import { StudentModal } from './student-modal'; // We'll create this next

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
        students: [{ id: 'stu1', name: 'Alice', rollNo: '101', dob: '2016-01-15', gender: 'Female', classId: 'cls1', sectionId: 'sec1a', coCurricularIds: ['act1'] }, /* more students */ ],
      },
      { id: 'sec1b', name: 'B', classId: 'cls1', students: [] },
    ],
  },
   {
    id: 'cls2',
    name: 'Grade 8',
    grade: 8,
    sections: [
      { id: 'sec8a', name: 'A', classId: 'cls2', students: [] },
    ],
  },
];

export function ClassesSections() {
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null); // Use correct student type later
  const [targetSection, setTargetSection] = useState<{ classId: string; sectionId: string } | null>(null);


  const handleAddClass = () => {
    if (!selectedGrade || classes.some(c => c.name === `Grade ${selectedGrade}`)) return; // Prevent duplicates

    const newClass: Class = {
      id: `cls${Date.now()}`, // Temporary ID generation
      name: `Grade ${selectedGrade}`,
      grade: parseInt(selectedGrade),
      sections: [{ id: `sec${Date.now()}a`, name: 'A', classId: `cls${Date.now()}`, students: [] }], // Start with Section A
    };
    setClasses([...classes, newClass]);
    setSelectedGrade(''); // Reset dropdown
  };

  const handleAddSection = (classId: string) => {
    setClasses(
      classes.map((cls) => {
        if (cls.id === classId) {
          const nextSectionCharCode =
            cls.sections.length > 0
              ? cls.sections[cls.sections.length - 1].name.charCodeAt(0) + 1
              : 'A'.charCodeAt(0);
          const nextSectionName = String.fromCharCode(nextSectionCharCode);
          const newSection: Section = {
            id: `sec${Date.now()}${nextSectionName.toLowerCase()}`,
            name: nextSectionName,
            classId: classId,
            students: [],
          };
          return { ...cls, sections: [...cls.sections, newSection] };
        }
        return cls;
      })
    );
  };

 const handleRemoveClass = (classId: string) => {
    // Add confirmation dialog later
    setClasses(classes.filter((cls) => cls.id !== classId));
  };

   const handleRemoveSection = (classId: string, sectionId: string) => {
    // Add confirmation dialog later
    setClasses(
      classes.map((cls) => {
        if (cls.id === classId) {
          // Prevent removing the last section if needed, or handle appropriately
          if (cls.sections.length <= 1) {
              alert("Cannot remove the only section of a class."); // Simple alert for now
              return cls;
          }
          return { ...cls, sections: cls.sections.filter((sec) => sec.id !== sectionId) };
        }
        return cls;
      })
    );
  };

  const openAddStudentModal = (classId: string, sectionId: string) => {
      setEditingStudent(null); // Ensure it's for adding a new student
      setTargetSection({ classId, sectionId });
      setIsStudentModalOpen(true);
  };

  const openEditStudentModal = (student: any, classId: string, sectionId: string) => { // Use correct student type
      setEditingStudent(student);
      setTargetSection({ classId, sectionId });
      setIsStudentModalOpen(true);
  }

  const handleSaveStudent = (studentData: any) => { // Use correct student type
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
                                  updatedStudents = sec.students.map(s => s.id === studentData.id ? studentData : s);
                              } else {
                                  // Add new student
                                  const newStudent = { ...studentData, id: `stu${Date.now()}` }; // Temp ID
                                  updatedStudents = [...sec.students, newStudent];
                              }
                              return { ...sec, students: updatedStudents };
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
      // Add toast notification for success
  };

  const handleRemoveStudent = (studentId: string, classId: string, sectionId: string) => {
       // Add confirmation dialog later
       setClasses(prevClasses => {
          return prevClasses.map(cls => {
              if (cls.id === classId) {
                  return {
                      ...cls,
                      sections: cls.sections.map(sec => {
                          if (sec.id === sectionId) {
                              return { ...sec, students: sec.students.filter(s => s.id !== studentId) };
                          }
                          return sec;
                      })
                  };
              }
              return cls;
          });
      });
       // Add toast notification
  }


  const gradeOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Classes and Sections</CardTitle>
        <CardDescription>
          Add new classes and sections, and manage student placements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2">
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-[180px]">
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
        </div>

        <div className="space-y-4">
          {classes.length === 0 && <p className="text-muted-foreground">No classes created yet.</p>}
          {classes.sort((a,b) => a.grade - b.grade).map((cls) => (
            <Card key={cls.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-muted/50 p-4">
                <CardTitle className="text-lg">{cls.name}</CardTitle>
                 <div className="flex gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => handleAddSection(cls.id)}
                     >
                       <PlusCircle className="mr-1 h-3 w-3" /> Add Section
                     </Button>
                    <Button
                      variant="destructive"
                      size="icon-sm" // Assuming you have or can create this size
                       onClick={() => handleRemoveClass(cls.id)}
                       aria-label={`Remove ${cls.name}`}
                     >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {cls.sections.length === 0 && <p className="text-sm text-muted-foreground pl-4">No sections yet.</p>}
                {cls.sections.sort((a,b) => a.name.localeCompare(b.name)).map((sec) => (
                  <div key={sec.id} className="border rounded-md p-3 bg-background shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Section {sec.name}</h4>
                        <div className="flex items-center gap-2">
                             <Button variant="ghost" size="sm" onClick={() => openAddStudentModal(cls.id, sec.id)}>
                                <UserPlus className="h-4 w-4 mr-1" /> Add Student
                             </Button>
                             <Button
                               variant="ghost"
                               size="icon-sm"
                               className="text-destructive hover:text-destructive hover:bg-destructive/10"
                               onClick={() => handleRemoveSection(cls.id, sec.id)}
                               aria-label={`Remove Section ${sec.name}`}
                               disabled={cls.sections.length <= 1} // Disable removing last section
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                        </div>
                    </div>
                    {/* Student Grid Placeholder */}
                    {sec.students.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {sec.students.map((student) => (
                          <div key={student.id} className="relative group border rounded p-2 text-center text-xs bg-secondary cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                            {student.name} ({student.rollNo})
                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Button variant="ghost" size="icon-xs" className="text-white hover:text-primary" onClick={() => openEditStudentModal(student, cls.id, sec.id)}>
                                     <Edit className="h-3 w-3"/>
                                 </Button>
                                  <Button variant="ghost" size="icon-xs" className="text-red-400 hover:text-destructive" onClick={() => handleRemoveStudent(student.id, cls.id, sec.id)}>
                                     <Trash2 className="h-3 w-3"/>
                                 </Button>
                             </div>
                          </div>
                        ))}
                         {/* Add Empty Slots if needed */}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No students assigned yet.</p>
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
                // Pass available co-curricular activities here later
                availableActivities={[]}
             />
         )}
    </Card>
  );
}

// Add missing sizes to buttonVariants if needed in `components/ui/button.tsx`
// e.g., add `icon-sm: "h-8 w-8"`, `icon-xs: "h-6 w-6"`

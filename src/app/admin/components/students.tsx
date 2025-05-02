// src/app/admin/components/students.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Edit, Trash2, Search, Filter, Users } from 'lucide-react';
import { type Student, type Class, type Section } from '@/types';
import { StudentModal } from './student-modal';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Mock data - replace with API calls
const mockClasses: Class[] = [
   {
    id: 'cls1',
    name: 'Grade 1',
    grade: 1,
    sections: [
      { id: 'sec1a', name: 'A', classId: 'cls1', students: [
          { id: 'stu1', name: 'Alice Wonder', rollNo: '101', dob: '2016-01-15', gender: 'Female', photoUrl: 'https://picsum.photos/seed/101/100', classId: 'cls1', sectionId: 'sec1a', coCurricularIds: ['act1'] },
          { id: 'stu2', name: 'Bob The Builder', rollNo: '102', dob: '2016-03-20', gender: 'Male', classId: 'cls1', sectionId: 'sec1a', coCurricularIds: [] },
       ]},
      { id: 'sec1b', name: 'B', classId: 'cls1', students: [
           { id: 'stu3', name: 'Charlie Chaplin', rollNo: '103', dob: '2016-02-10', gender: 'Male', photoUrl: 'https://picsum.photos/seed/103/100', classId: 'cls1', sectionId: 'sec1b', coCurricularIds: ['act2'] },
      ] },
    ],
  },
   {
    id: 'cls2',
    name: 'Grade 8',
    grade: 8,
    sections: [
      { id: 'sec8a', name: 'A', classId: 'cls2', students: [
           { id: 'stu4', name: 'Diana Prince', rollNo: '801', dob: '2009-05-05', gender: 'Female', classId: 'cls2', sectionId: 'sec8a', coCurricularIds: ['act1', 'act3'] },
      ] },
    ],
  },
];

// Flatten students from mock data
const getAllStudents = (classes: Class[]): Student[] => {
    return classes.reduce((acc: Student[], cls) => {
        cls.sections.forEach(sec => {
            acc.push(...sec.students);
        });
        return acc;
    }, []);
}

const mockStudents: Student[] = getAllStudents(mockClasses);
const mockActivities = [
    { id: 'act1', name: 'Sports' },
    { id: 'act2', name: 'Music' },
    { id: 'act3', name: 'Theatre' }
]; // Replace with actual data

export function Students() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassId, setFilterClassId] = useState<string>('all');
  const [filterSectionId, setFilterSectionId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { toast } = useToast(); // Initialize toast

  // Derive available sections based on selected class for filtering
  const availableSections = useMemo(() => {
    if (filterClassId === 'all') return [];
    const selectedClass = mockClasses.find(c => c.id === filterClassId);
    return selectedClass?.sections || [];
  }, [filterClassId]);

   // Reset section filter if class changes
   useEffect(() => {
       setFilterSectionId('all');
   }, [filterClassId]);


  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = filterClassId === 'all' || student.classId === filterClassId;
      const matchesSection = filterSectionId === 'all' || student.sectionId === filterSectionId;
      return matchesSearch && matchesClass && matchesSection;
    });
  }, [students, searchTerm, filterClassId, filterSectionId]);

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleRemove = (student: Student) => {
    // Add API call to delete
     setStudents(students.filter((s) => s.id !== student.id));
     toast({ title: "Student Removed", description: `${student.name} (${student.rollNo}) has been removed.`, variant: "destructive" });
  };

  const handleSaveStudent = (studentData: Partial<Student>) => {
      if (editingStudent) {
          // Update existing student
           setStudents(prev => prev.map(s => s.id === studentData.id ? { ...s, ...studentData } as Student : s));
           toast({ title: "Student Updated", description: `${studentData.name}'s details have been updated.` });
           // Add API call to update
      } else {
          // This modal is primarily for editing here. Adding is done via Class/Section tab.
          console.warn("Attempted to add student from Students tab modal. Use Class/Section tab.");
           toast({ title: "Info", description: "To add new students, please use the 'Classes & Sections' tab.", variant: "default" });
      }
       setIsModalOpen(false);
       setEditingStudent(null);
  };

   const findClassName = (classId: string) => mockClasses.find(c => c.id === classId)?.name || 'N/A';
   const findSectionName = (classId: string, sectionId: string) => {
       const cls = mockClasses.find(c => c.id === classId);
       return cls?.sections.find(s => s.id === sectionId)?.name || 'N/A';
   }

  return (
    <Card className="shadow-md dark:shadow-indigo-900/10 border-t-4 border-primary rounded-xl overflow-hidden"> {/* Added styles */}
       <CardHeader className="bg-gradient-to-r from-indigo-50 via-white to-teal-50 dark:from-indigo-900/20 dark:via-background dark:to-teal-900/20 p-4 md:p-6"> {/* Gradient header */}
         <CardTitle className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
            <Users className="h-6 w-6"/> Manage Students
         </CardTitle>
        <CardDescription className="text-muted-foreground mt-1">
          View, filter, edit, or remove student records. Adding new students is done via the 'Classes & Sections' tab for better organization.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6"> {/* Adjusted padding */}
         {/* Enhanced Filter Section */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 border border-dashed border-indigo-200 dark:border-indigo-800 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or roll no..."
              className="pl-8 w-full bg-background shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap md:flex-nowrap"> {/* Allow wrapping on smaller screens */}
             {/* <Filter className="h-5 w-5 text-muted-foreground mt-2 mr-1 hidden md:block" /> */}
             <Select value={filterClassId} onValueChange={setFilterClassId}>
               <SelectTrigger className="w-full md:w-[180px] bg-background shadow-sm"> {/* Adjusted width */}
                 <SelectValue placeholder="Filter by Class" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Classes</SelectItem>
                 {mockClasses.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
              <Select value={filterSectionId} onValueChange={setFilterSectionId} disabled={filterClassId === 'all' || availableSections.length === 0}>
               <SelectTrigger className="w-full md:w-[180px] bg-background shadow-sm"> {/* Adjusted width */}
                 <SelectValue placeholder="Filter by Section" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Sections</SelectItem>
                  {availableSections.map(sec => (
                    <SelectItem key={sec.id} value={sec.id}>Section {sec.name}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
          </div>
        </div>

        <div className="border rounded-md overflow-hidden shadow-sm"> {/* Added shadow */}
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[60px]">Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Roll No.</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground italic">
                          {searchTerm || filterClassId !== 'all' || filterSectionId !== 'all'
                           ? "No students found matching your criteria."
                           : "No student data available. Add students via 'Classes & Sections'."}
                      </TableCell>
                  </TableRow>
              )}
              {filteredStudents.sort((a,b) => a.rollNo.localeCompare(b.rollNo)).map((student) => (
                // Ensure no extra whitespace around TableRow
                <TableRow key={student.id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors duration-150">
                  <TableCell>
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={student.photoUrl} alt={student.name} />
                      <AvatarFallback><User size={16} /></AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.rollNo}</TableCell>
                  <TableCell>{findClassName(student.classId)}</TableCell>
                  <TableCell>{findSectionName(student.classId, student.sectionId)}</TableCell>
                  <TableCell>{student.dob}</TableCell>
                  <TableCell>{student.gender}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleEdit(student)} title="Edit Student"> {/* Added hover color */}
                      <Edit className="h-4 w-4" />
                       <span className="sr-only">Edit Student</span>
                    </Button>
                     {/* Confirmation Dialog for Student Removal */}
                     <AlertDialog>
                         <AlertDialogTrigger asChild>
                             <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 ml-1"
                              title="Remove Student"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove Student</span>
                            </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                             <AlertDialogHeader>
                                 <AlertDialogTitle>Remove {student.name} ({student.rollNo})?</AlertDialogTitle>
                                 <AlertDialogDescription>
                                     This will permanently remove the student record. This action cannot be undone.
                                 </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                                 <AlertDialogAction onClick={() => handleRemove(student)} className={buttonVariants({variant: "destructive"})}>Remove Student</AlertDialogAction>
                             </AlertDialogFooter>
                         </AlertDialogContent>
                     </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
       {isModalOpen && editingStudent && (
         <StudentModal
            isOpen={isModalOpen}
            onClose={() => {
                setIsModalOpen(false);
                setEditingStudent(null);
            }}
            onSave={handleSaveStudent}
            studentData={editingStudent}
            classId={editingStudent.classId} // Pass necessary context
            sectionId={editingStudent.sectionId}
            availableActivities={mockActivities} // Pass available activities
         />
     )}
    </Card>
  );
}
'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { User, Edit, Trash2, Search, Filter } from 'lucide-react';
import { type Student, type Class, type Section } from '@/types'; // Assuming types are defined
import { StudentModal } from './student-modal'; // Re-use the modal

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

  const handleRemove = (studentId: string) => {
    // Add confirmation dialog
    setStudents(students.filter((s) => s.id !== studentId));
    // Add API call to delete
    // Add toast notification
  };

  const handleSaveStudent = (studentData: Partial<Student>) => {
      if (editingStudent) {
          // Update existing student
           setStudents(prev => prev.map(s => s.id === studentData.id ? { ...s, ...studentData } as Student : s));
           // Add API call to update
      } else {
          // This modal is primarily for editing here. Adding is done via Class/Section tab.
          console.warn("Attempted to add student from Students tab modal. Use Class/Section tab.");
      }
       setIsModalOpen(false);
       setEditingStudent(null);
       // Add toast notification
  };

   const findClassName = (classId: string) => mockClasses.find(c => c.id === classId)?.name || 'N/A';
   const findSectionName = (classId: string, sectionId: string) => {
       const cls = mockClasses.find(c => c.id === classId);
       return cls?.sections.find(s => s.id === sectionId)?.name || 'N/A';
   }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Students</CardTitle>
        <CardDescription>
          View, filter, edit, or remove student records. Adding students is done via the 'Classes & Sections' tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or roll no..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <Filter className="h-5 w-5 text-muted-foreground mt-2 mr-1 hidden md:block" />
             <Select value={filterClassId} onValueChange={setFilterClassId}>
               <SelectTrigger className="w-full md:w-[160px]">
                 <SelectValue placeholder="Filter by Class" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Classes</SelectItem>
                 {mockClasses.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
              <Select value={filterSectionId} onValueChange={setFilterSectionId} disabled={filterClassId === 'all'}>
               <SelectTrigger className="w-full md:w-[160px]">
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

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Roll No.</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          No students found matching your criteria.
                      </TableCell>
                  </TableRow>
              )}
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Avatar className="h-9 w-9">
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
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(student)}>
                      <Edit className="h-4 w-4" />
                       <span className="sr-only">Edit Student</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 ml-1"
                      onClick={() => handleRemove(student.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove Student</span>
                    </Button>
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

'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { PlusCircle, Trash2, Upload, Download, Eye, FileText } from 'lucide-react';
import { type Subject, type Class } from '@/types';
import { uploadFile } from '@/services/supabase'; // Assuming this handles upload and returns URL
import { useToast } from '@/hooks/use-toast';

// Mock data - replace with API calls
const mockClasses: Class[] = [
   { id: 'cls1', name: 'Grade 1', grade: 1, sections: [] },
   { id: 'cls2', name: 'Grade 8', grade: 8, sections: [] },
   { id: 'cls10', name: 'Grade 10', grade: 10, sections: [] },
];

const mockSubjects: Subject[] = [
    { id: 'sub1', name: 'Mathematics', classId: 'cls1', syllabusFileUrl: 'https://example.com/math1.pdf' },
    { id: 'sub2', name: 'English', classId: 'cls1' },
    { id: 'sub3', name: 'Mathematics', classId: 'cls8' },
    { id: 'sub4', name: 'Physics', classId: 'cls10', syllabusFileUrl: 'https://example.com/phy10.pdf' },
    { id: 'sub5', name: 'Chemistry', classId: 'cls10' },
];

export function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [filterClassId, setFilterClassId] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingSubjectId, setUploadingSubjectId] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredSubjects = useMemo(() => {
    if (filterClassId === 'all') return subjects;
    return subjects.filter((subject) => subject.classId === filterClassId);
  }, [subjects, filterClassId]);

  const handleAddSubject = async () => {
    if (!newSubjectName || !selectedClassId) {
       toast({ title: "Error", description: "Please enter subject name and select a class.", variant: "destructive" });
       return;
    }
    // Check for duplicates within the same class
    if (subjects.some(s => s.name === newSubjectName && s.classId === selectedClassId)) {
       toast({ title: "Error", description: `Subject "${newSubjectName}" already exists for this class.`, variant: "destructive" });
        return;
    }

    const newSubject: Subject = {
      id: `sub${Date.now()}`, // Temporary ID
      name: newSubjectName,
      classId: selectedClassId,
    };

    // Add API call to save the subject
    try {
        // await api.createSubject(newSubject); // Replace with actual API call
        setSubjects([...subjects, newSubject]);
        setNewSubjectName('');
        setSelectedClassId('');
        toast({ title: "Success", description: `Subject "${newSubject.name}" added.` });
    } catch (error) {
        console.error("Failed to add subject:", error);
        toast({ title: "Error", description: "Could not add subject. Please try again.", variant: "destructive" });
    }
  };

  const handleRemoveSubject = async (subjectId: string) => {
    // Add confirmation dialog later
    // Add API call to delete
     try {
        // await api.deleteSubject(subjectId); // Replace with actual API call
        const subjectName = subjects.find(s => s.id === subjectId)?.name;
        setSubjects(subjects.filter((sub) => sub.id !== subjectId));
        toast({ title: "Success", description: `Subject "${subjectName}" removed.` });
    } catch (error) {
        console.error("Failed to remove subject:", error);
        toast({ title: "Error", description: "Could not remove subject. Please try again.", variant: "destructive" });
    }
  };

  const triggerFileUpload = (subjectId: string) => {
    setUploadingSubjectId(subjectId);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !uploadingSubjectId) {
      setUploadingSubjectId(null);
      return;
    }

    const file = event.target.files[0];
    const subjectIdToUpdate = uploadingSubjectId;
    setUploadingSubjectId(null); // Reset immediately

    // Basic validation (e.g., file type, size) - Add more robust checks
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
        toast({ title: "Error", description: "Invalid file type. Please upload PDF or DOC/DOCX.", variant: "destructive" });
        return;
    }

     // Show uploading indicator/toast
     const uploadToast = toast({ title: "Uploading Syllabus...", description: `Uploading ${file.name}...` });

    try {
      const { fileUrl } = await uploadFile(file); // Use the service function

      // Update subject in state and potentially via API
       // await api.updateSubjectSyllabus(subjectIdToUpdate, fileUrl); // Replace with actual API call
      setSubjects((prevSubjects) =>
        prevSubjects.map((sub) =>
          sub.id === subjectIdToUpdate ? { ...sub, syllabusFileUrl: fileUrl } : sub
        )
      );

      uploadToast.update({ id: uploadToast.id, title: "Upload Complete", description: `Syllabus for ${subjects.find(s=>s.id === subjectIdToUpdate)?.name} updated.` });

    } catch (error) {
      console.error('Upload failed:', error);
       uploadToast.update({ id: uploadToast.id, title: "Upload Failed", description: "Could not upload syllabus. Please try again.", variant: "destructive" });
    } finally {
       // Reset file input value to allow re-uploading the same file
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  };

  const findClassName = (classId: string) => mockClasses.find(c => c.id === classId)?.name || 'N/A';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Subjects</CardTitle>
        <CardDescription>
          Add subjects for each class and upload syllabus documents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-lg bg-muted/30">
           <div className="flex-1 grid gap-1.5">
               <Label htmlFor="subjectName">New Subject Name</Label>
               <Input
                  id="subjectName"
                 placeholder="e.g., Algebra II"
                 value={newSubjectName}
                 onChange={(e) => setNewSubjectName(e.target.value)}
               />
           </div>
            <div className="flex-1 grid gap-1.5">
                <Label htmlFor="classSelect">Assign to Class</Label>
               <Select value={selectedClassId} onValueChange={setSelectedClassId} name="classSelect">
                 <SelectTrigger>
                   <SelectValue placeholder="Select Class" />
                 </SelectTrigger>
                 <SelectContent>
                   {mockClasses.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>
          <Button onClick={handleAddSubject} className="self-end mt-4 md:mt-0" disabled={!newSubjectName || !selectedClassId}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
          </Button>
        </div>

         {/* Hidden file input */}
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx" // Define accepted types
        />


        <div className="flex items-center gap-2 mb-4">
           <Label>Filter by Class:</Label>
           <Select value={filterClassId} onValueChange={setFilterClassId}>
             <SelectTrigger className="w-[180px]">
               <SelectValue placeholder="Filter by Class" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Classes</SelectItem>
               {mockClasses.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
               ))}
             </SelectContent>
           </Select>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Syllabus</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No subjects found {filterClassId !== 'all' ? `for ${findClassName(filterClassId)}` : ''}.
                      </TableCell>
                  </TableRow>
              )}
              {filteredSubjects.sort((a,b) => a.name.localeCompare(b.name)).map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>{findClassName(subject.classId)}</TableCell>
                  <TableCell>
                    {subject.syllabusFileUrl ? (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={subject.syllabusFileUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-1" /> View
                          </a>
                        </Button>
                         <Button variant="outline" size="sm" asChild>
                             <a href={subject.syllabusFileUrl} download>
                               <Download className="h-4 w-4 mr-1" /> Download
                             </a>
                         </Button>
                        <Button variant="secondary" size="sm" onClick={() => triggerFileUpload(subject.id)}>
                          <Upload className="h-4 w-4 mr-1" /> Replace
                        </Button>
                      </div>
                    ) : (
                      <Button variant="secondary" size="sm" onClick={() => triggerFileUpload(subject.id)}>
                        <Upload className="h-4 w-4 mr-1" /> Upload Syllabus
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveSubject(subject.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                       <span className="sr-only">Remove Subject</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

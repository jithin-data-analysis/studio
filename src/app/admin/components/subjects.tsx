// src/app/admin/components/subjects.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react'; // Added useEffect import
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button'; // Import buttonVariants
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
import { PlusCircle, Trash2, Upload, Download, Eye, FileText, BookOpen, Filter, Loader2 } from 'lucide-react'; // Added Loader2
import { type Subject, type Class } from '@/types';
import { uploadFileAndProcessForRag, simulateSaveData, simulateFetchData } from '@/services/supabase'; // Use the RAG-enabled uploader + simulation
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'; // Added AlertDialog
import { Badge } from '@/components/ui/badge'; // Import Badge

// Mock data - only used if simulating or fetch fails
const mockClasses: Class[] = [
   { id: 'cls1', name: 'Grade 1', grade: 1, sections: [] },
   { id: 'cls8', name: 'Grade 8', grade: 8, sections: [] }, // Corrected ID
   { id: 'cls10', name: 'Grade 10', grade: 10, sections: [] },
];

const initialMockSubjects: Subject[] = [
    { id: 'sub1', name: 'Mathematics', classId: 'cls1', syllabusFileUrl: 'https://example.com/math1.pdf' },
    { id: 'sub2', name: 'English', classId: 'cls1' },
    { id: 'sub3', name: 'Mathematics', classId: 'cls8' }, // Kept corrected ID
    { id: 'sub4', name: 'Physics', classId: 'cls10', syllabusFileUrl: 'https://example.com/phy10.pdf' },
    { id: 'sub5', name: 'Chemistry', classId: 'cls10' },
];

export function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>(initialMockSubjects); // Start with mocks for initial render
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [filterClassId, setFilterClassId] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingSubjectId, setUploadingSubjectId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false); // Added uploading state
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const { toast } = useToast();

  const isSimulating = process.env.SIMULATE_AI === 'true';

  // --- Data Fetching ---
  useEffect(() => {
      const fetchSubjects = async () => {
          setIsLoadingSubjects(true);
          try {
              const fetchedSubjects = await simulateFetchData('subjects'); // Fetch all subjects initially
              setSubjects(fetchedSubjects);
          } catch (error) {
              console.error("Failed to fetch subjects:", error);
              toast({ title: "Fetch Error", description: "Could not load subjects.", variant: "destructive" });
              if (isSimulating) setSubjects(initialMockSubjects); // Fallback to mocks if simulating
          } finally {
              setIsLoadingSubjects(false);
          }
      };
       // Fetch only if not simulating, otherwise keep initial mocks
       if (!isSimulating) {
           fetchSubjects();
       }
  }, [isSimulating, toast]); // Added toast to dependency array


  const filteredSubjects = useMemo(() => {
    if (filterClassId === 'all') return subjects;
    return subjects.filter((subject) => subject.classId === filterClassId);
  }, [subjects, filterClassId]);

  const handleAddSubject = async () => {
    if (!newSubjectName || !selectedClassId) {
       toast({ title: "Missing Info", description: "Please enter a subject name and select the class it belongs to.", variant: "destructive" });
       return;
    }
    // Check for duplicates within the same class
    if (subjects.some(s => s.name.trim().toLowerCase() === newSubjectName.trim().toLowerCase() && s.classId === selectedClassId)) {
       toast({ title: "Duplicate Subject", description: `Heads up! "${newSubjectName.trim()}" already exists for this class.`, variant: "destructive" });
        return;
    }

    const newSubjectData = {
      // id: isSimulating ? `sim-sub-${Date.now()}` : undefined, // Let DB handle ID if not simulating
      name: newSubjectName.trim(),
      classId: selectedClassId,
    };
     const tempId = `temp-sub-${Date.now()}`; // Temporary client-side ID
     const newSubjectWithTempId = {...newSubjectData, id: tempId};

    // Optimistically update UI
    setSubjects(prev => [...prev, newSubjectWithTempId]);
    setNewSubjectName('');
    setSelectedClassId('');

    try {
         // Simulate or perform actual save
        await simulateSaveData(newSubjectData, 'subjects'); // Send data without temp ID
        // In a real app, you'd get the actual ID back and update the state:
        // const savedSubject = await api.createSubject(newSubjectData);
        // setSubjects(prev => prev.map(s => s.id === tempId ? savedSubject : s));
        toast({ title: `Subject Added! ${isSimulating ? '(Simulated)' : ''}`, description: `"${newSubjectData.name}" is ready for ${findClassName(selectedClassId)}.`, });
    } catch (error) {
        console.error("Failed to add subject:", error);
        toast({ title: "Add Error", description: `Could not add subject. ${isSimulating ? '(Simulated)' : ''}`, variant: "destructive" });
         // Revert optimistic update on error
        setSubjects(prev => prev.filter(s => s.id !== tempId));
    }
  };

  const handleRemoveSubject = async (subject: Subject) => { // Pass full subject object
     const subjectIdToRemove = subject.id;
     const subjectName = subject.name;
     const className = findClassName(subject.classId);

     // Optimistically remove from UI
     setSubjects(prev => prev.filter((sub) => sub.id !== subjectIdToRemove));

    try {
         // Simulate or perform actual delete
         await simulateSaveData({ id: subjectIdToRemove }, 'subjects_delete'); // Use a specific type or method for delete simulation/call
        toast({ title: `Subject Removed ${isSimulating ? '(Simulated)' : ''}`, description: `"${subjectName}" for ${className} has been removed.`, variant: "destructive" });
    } catch (error) {
        console.error("Failed to remove subject:", error);
        toast({ title: "Remove Error", description: `Could not remove subject. ${isSimulating ? '(Simulated)' : ''}`, variant: "destructive" });
         // Revert optimistic update on error
         setSubjects(prev => [...prev, subject].sort((a, b) => a.name.localeCompare(b.name))); // Add back and re-sort
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
    const subject = subjects.find(s => s.id === subjectIdToUpdate);
    if (!subject) return;

    setIsUploading(true); // Set loading state
    const originalSubjectState = { ...subject }; // Store original state for potential revert
    setUploadingSubjectId(subjectIdToUpdate); // Keep track while uploading

    // Basic validation (e.g., file type, size) - Add more robust checks
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
        toast({ title: "Invalid File Type", description: "Please upload a PDF, DOC, or DOCX file.", variant: "destructive" });
         if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
         setIsUploading(false);
         setUploadingSubjectId(null);
        return;
    }

     // Show uploading indicator/toast
     const uploadToast = toast({
         title: `Uploading & Processing Syllabus ${isSimulating ? '(Simulating)' : ''}...`,
         description: `Working on ${file.name}... This might take a moment.`
     });

    try {
      // Use the service function that includes RAG processing (and simulation check)
      const pathPrefix = `syllabi/${subject.classId}/${subject.id}/`;
      const { fileUrl } = await uploadFileAndProcessForRag(file, pathPrefix);

      // Update subject in state and potentially via API
       const updatedSubjectData = { syllabusFileUrl: fileUrl };
       // Simulate or perform actual update
       await simulateSaveData({ id: subjectIdToUpdate, ...updatedSubjectData }, 'subjects_update'); // Simulate/call update

       // Update UI state
      setSubjects((prevSubjects) =>
        prevSubjects.map((sub) =>
          sub.id === subjectIdToUpdate ? { ...sub, syllabusFileUrl: fileUrl } : sub
        )
      );

      uploadToast.update({ id: uploadToast.id, title: `Upload & Processing Complete! ${isSimulating ? '(Simulated)' : ''}`, description: `Syllabus for ${subject.name} updated and indexed for AI analysis.` });

    } catch (error) {
      console.error('Upload or RAG processing failed:', error);
       let errorMsg = `Could not upload/process the syllabus. ${isSimulating ? '(Simulated)' : ''}`;
       if (!isSimulating && error instanceof Error && error.message.includes("RAG processing")) {
           errorMsg = `File uploaded, but RAG processing failed: ${error.message.split(': ').slice(1).join(': ')}`;
           // Update UI even if RAG fails, maybe with a warning?
            // setSubjects((prevSubjects) =>
            //     prevSubjects.map((sub) =>
            //         sub.id === subjectIdToUpdate ? { ...sub, syllabusFileUrl: `https://example.com/${pathPrefix}${encodeURIComponent(file.name)}` } : sub // Update with simulated URL anyway
            //     )
            // );
       } else if (error instanceof Error) {
            errorMsg = error.message; // Use the error message directly
       }
       uploadToast.update({ id: uploadToast.id, title: "Upload/Processing Failed", description: errorMsg, variant: "destructive" });
       // Revert UI state if necessary (optional, depends on desired UX)
        // setSubjects((prevSubjects) =>
        //     prevSubjects.map((sub) =>
        //         sub.id === subjectIdToUpdate ? originalSubjectState : sub
        //     )
        // );
    } finally {
       // Reset file input value to allow re-uploading the same file
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setIsUploading(false); // Reset loading state
        setUploadingSubjectId(null); // Clear uploading ID
    }
  };

  const findClassName = (classId: string) => mockClasses.find(c => c.id === classId)?.name || 'N/A';

  return (
     <Card className="shadow-md dark:shadow-indigo-900/10 border-t-4 border-primary rounded-xl overflow-hidden"> {/* Added styles */}
       <CardHeader className="bg-gradient-to-r from-indigo-50 via-white to-teal-50 dark:from-indigo-900/20 dark:via-background dark:to-teal-900/20 p-4 md:p-6"> {/* Gradient header */}
         <CardTitle className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
            <BookOpen className="h-6 w-6"/> Manage Subjects & Syllabi
             {isSimulating && <Badge variant="destructive">SIMULATING</Badge>}
         </CardTitle>
        <CardDescription className="text-muted-foreground mt-1">
          Define subjects and upload syllabus documents. Uploaded syllabi are processed for AI analysis (RAG).
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6"> {/* Adjusted padding */}
         {/* Enhanced Add Subject Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border border-dashed border-indigo-200 dark:border-indigo-800 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 items-end">
           <div className="flex-1 grid gap-1.5">
               <Label htmlFor="subjectName" className="text-sm font-semibold text-muted-foreground">New Subject Name</Label>
               <Input
                  id="subjectName"
                 placeholder="e.g., World History, Creative Writing..."
                 value={newSubjectName}
                 onChange={(e) => setNewSubjectName(e.target.value)}
                 className="bg-background shadow-sm"
               />
           </div>
            <div className="flex-1 grid gap-1.5">
                <Label htmlFor="classSelect" className="text-sm font-semibold text-muted-foreground">Assign to Class</Label>
               <Select value={selectedClassId} onValueChange={setSelectedClassId} name="classSelect">
                 <SelectTrigger className="bg-background shadow-sm">
                   <SelectValue placeholder="Select Class" />
                 </SelectTrigger>
                 <SelectContent>
                   {mockClasses.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>
           <Button
              onClick={handleAddSubject}
              className="self-end mt-4 md:mt-0 transition-transform transform hover:scale-105 shadow hover:shadow-lg"
              disabled={!newSubjectName || !selectedClassId}
            >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Subject {isSimulating && '(Sim)'}
          </Button>
        </div>

         {/* Hidden file input */}
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx" // Define accepted types
            disabled={isUploading} // Disable while uploading
        />

        {/* Filter Section */}
        <div className="flex items-center gap-2 mb-4">
           <Filter className="h-4 w-4 text-muted-foreground" />
           <Label htmlFor="filterClassSelect" className="text-sm font-medium">Filter by Class:</Label> {/* Added htmlFor */}
           <Select value={filterClassId} onValueChange={setFilterClassId} name="filterClassSelect"> {/* Added name */}
             <SelectTrigger className="w-[180px] bg-background shadow-sm">
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

        <div className="border rounded-md overflow-hidden shadow-sm"> {/* Added shadow */}
          <Table>
             <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Subject Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Syllabus Document</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead> {/* Adjusted width */}
              </TableRow>
            </TableHeader>
            <TableBody>
               {isLoadingSubjects && (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Loading subjects...</span>
                             </div>
                         </TableCell>
                    </TableRow>
               )}
              {!isLoadingSubjects && filteredSubjects.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                           {filterClassId !== 'all' ? `No subjects found for ${findClassName(filterClassId)}.` : "No subjects defined yet. Add subjects above!"}
                      </TableCell>
                  </TableRow>
              )}
              {!isLoadingSubjects && filteredSubjects.sort((a,b) => a.name.localeCompare(b.name)).map((subject) => (
                 <TableRow key={subject.id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors duration-150"> {/* Added hover effect */}
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>{findClassName(subject.classId)}</TableCell>
                  <TableCell>
                    {/* Upload Button/Status */}
                    <div className="flex items-center gap-2 flex-wrap">
                       {subject.syllabusFileUrl ? (
                          <>
                              <Button variant="outline" size="sm" asChild className="hover:bg-accent/80 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300">
                                 <a href={subject.syllabusFileUrl} target="_blank" rel="noopener noreferrer" title="View Syllabus">
                                     <Eye className="h-4 w-4 mr-1" /> View
                                 </a>
                              </Button>
                              <Button variant="outline" size="sm" asChild className="hover:bg-accent/80 border-gray-300 dark:border-gray-700">
                                  <a href={subject.syllabusFileUrl} download title="Download Syllabus">
                                     <Download className="h-4 w-4 mr-1" /> Download
                                  </a>
                              </Button>
                              <Button
                                 variant="secondary"
                                 size="sm"
                                 onClick={() => triggerFileUpload(subject.id)}
                                 className="hover:bg-secondary/80 shadow-sm"
                                 disabled={isUploading && uploadingSubjectId === subject.id} // Disable specific button while uploading
                              >
                                  {isUploading && uploadingSubjectId === subject.id ? (
                                     <Loader2 className="h-4 w-4 mr-1 animate-spin"/>
                                  ) : (
                                      <Upload className="h-4 w-4 mr-1"/>
                                  )}
                                  Replace
                              </Button>
                          </>
                       ) : (
                           <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => triggerFileUpload(subject.id)}
                              className="hover:bg-secondary/80 shadow-sm"
                              disabled={isUploading && uploadingSubjectId === subject.id} // Disable specific button while uploading
                           >
                               {isUploading && uploadingSubjectId === subject.id ? (
                                   <Loader2 className="h-4 w-4 mr-1 animate-spin"/>
                               ) : (
                                   <Upload className="h-4 w-4 mr-1"/>
                               )}
                              Upload Syllabus
                           </Button>
                       )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                     {/* Confirmation Dialog for Subject Removal */}
                     <AlertDialog>
                         <AlertDialogTrigger asChild>
                             <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              title="Remove Subject"
                              disabled={isUploading} // Disable delete while any upload is in progress
                            >
                              <Trash2 className="h-4 w-4" />
                               <span className="sr-only">Remove Subject</span>
                            </Button>
                         </AlertDialogTrigger>
                          <AlertDialogContent>
                             <AlertDialogHeader>
                                 <AlertDialogTitle>Remove "{subject.name}" for {findClassName(subject.classId)}?</AlertDialogTitle>
                                 <AlertDialogDescription>
                                     This will remove the subject entry. Make sure no tests or marks are associated with it. This action cannot be undone.
                                 </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                                 <AlertDialogAction onClick={() => handleRemoveSubject(subject)} className={buttonVariants({variant: "destructive"})}>Remove Subject</AlertDialogAction>
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
    </Card>
  );
}

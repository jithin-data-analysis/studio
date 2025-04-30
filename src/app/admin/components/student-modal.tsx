import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Checkbox } from '@/components/ui/checkbox';
import { type CoCurricularActivity, type Student } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Partial<Student>) => void; // Use Partial for saving
  studentData?: Student | null; // Existing data for editing
  classId: string;
  sectionId: string;
  availableActivities: CoCurricularActivity[];
}

export function StudentModal({
  isOpen,
  onClose,
  onSave,
  studentData,
  classId,
  sectionId,
  availableActivities,
}: StudentModalProps) {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  useEffect(() => {
    if (studentData) {
      setName(studentData.name);
      setRollNo(studentData.rollNo);
      setDob(studentData.dob); // Assuming dob is string 'YYYY-MM-DD'
      setGender(studentData.gender || '');
      setPhotoUrl(studentData.photoUrl);
      setSelectedActivities(studentData.coCurricularIds || []);
    } else {
      // Reset form for new student
      setName('');
      setRollNo('');
      setDob('');
      setGender('');
      setPhotoUrl(undefined);
      setSelectedActivities([]);
    }
  }, [studentData, isOpen]); // Rerun effect when modal opens or data changes

  const handleActivityChange = (activityId: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleSaveClick = () => {
    // Basic validation
    if (!name || !rollNo || !dob || !gender) {
        alert("Please fill in all required fields: Name, Roll No., DOB, Gender.");
        return;
    }

    const savedData: Partial<Student> = {
      id: studentData?.id, // Include id if editing
      name,
      rollNo,
      dob,
      gender: gender as 'Male' | 'Female' | 'Other', // Cast here after validation
      photoUrl,
      classId,
      sectionId,
      coCurricularIds: selectedActivities,
    };
    onSave(savedData);
  };

  // Basic photo upload simulation (replace with actual upload logic)
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => {
             // In a real app, upload the file (event.target.files[0]) to storage (e.g., Supabase storage)
             // and get the URL. For now, we'll use a placeholder or the data URL (for preview only).
             // Using a placeholder for simplicity now. Replace with actual URL from storage.
             setPhotoUrl('https://picsum.photos/seed/' + rollNo + '/100/100'); // Placeholder
        };
         reader.readAsDataURL(event.target.files[0]);
      }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{studentData ? 'Edit Student' : 'Add Student'}</DialogTitle>
          <DialogDescription>
            Enter the details for the student. Click save when finished.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
                 <Avatar className="h-16 w-16">
                   <AvatarImage src={photoUrl} alt={name} />
                   <AvatarFallback><User /></AvatarFallback>
                 </Avatar>
                 <div className="grid gap-1.5">
                      <Label htmlFor="photo">Photo (Optional)</Label>
                     <Input id="photo" type="file" accept="image/*" onChange={handlePhotoUpload} className="text-xs"/>
                 </div>
            </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name*
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rollNo" className="text-right">
              Roll No.*
            </Label>
            <Input
              id="rollNo"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dob" className="text-right">
              DOB*
            </Label>
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gender" className="text-right">
              Gender*
            </Label>
            <Select value={gender} onValueChange={(value) => setGender(value as 'Male' | 'Female' | 'Other' | '')} required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-start gap-4">
             <Label className="text-right pt-2">Co-curricular</Label>
             <ScrollArea className="col-span-3 h-24 rounded-md border p-2">
                {availableActivities.length === 0 && <p className="text-sm text-muted-foreground">No activities available.</p>}
               {availableActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-2 mb-1">
                    <Checkbox
                      id={`activity-${activity.id}`}
                      checked={selectedActivities.includes(activity.id)}
                      onCheckedChange={() => handleActivityChange(activity.id)}
                    />
                    <label
                      htmlFor={`activity-${activity.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {activity.name}
                    </label>
                  </div>
                ))}
             </ScrollArea>
           </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSaveClick}>Save Student</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

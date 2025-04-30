'use client';

import React, { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { type CoCurricularActivity } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Mock data - replace with API calls
const mockActivities: CoCurricularActivity[] = [
    { id: 'act1', name: 'Sports Club' },
    { id: 'act2', name: 'Music Ensemble' },
    { id: 'act3', name: 'Drama Club' },
    { id: 'act4', name: 'Debate Team' },
];

export function CoCurricular() {
  const [activities, setActivities] = useState<CoCurricularActivity[]>(mockActivities);
  const [newActivityName, setNewActivityName] = useState('');
  const [editingActivity, setEditingActivity] = useState<CoCurricularActivity | null>(null);
  const { toast } = useToast();

  const handleAddOrUpdateActivity = async () => {
    const name = editingActivity ? editingActivity.name : newActivityName;
    if (!name.trim()) {
        toast({ title: "Error", description: "Activity name cannot be empty.", variant: "destructive" });
        return;
    }

     // Check for duplicates (case-insensitive)
     const isDuplicate = activities.some(
        act => act.name.toLowerCase() === name.trim().toLowerCase() && act.id !== editingActivity?.id
     );
     if (isDuplicate) {
        toast({ title: "Error", description: `Activity "${name.trim()}" already exists.`, variant: "destructive" });
         return;
     }


    if (editingActivity) {
        // Update existing activity
        // Add API call to update
         try {
            // await api.updateActivity(editingActivity.id, { name: name.trim() }); // Replace with actual API call
            setActivities(activities.map(act => act.id === editingActivity.id ? { ...act, name: name.trim() } : act));
            toast({ title: "Success", description: `Activity "${name.trim()}" updated.` });
            setEditingActivity(null);
         } catch (error) {
             console.error("Failed to update activity:", error);
             toast({ title: "Error", description: "Could not update activity. Please try again.", variant: "destructive" });
         }

    } else {
        // Add new activity
        const newActivity: CoCurricularActivity = {
          id: `act${Date.now()}`, // Temporary ID
          name: name.trim(),
        };
        // Add API call to create
        try {
            // await api.createActivity(newActivity); // Replace with actual API call
            setActivities([...activities, newActivity]);
            toast({ title: "Success", description: `Activity "${newActivity.name}" added.` });
            setNewActivityName('');
        } catch (error) {
             console.error("Failed to add activity:", error);
             toast({ title: "Error", description: "Could not add activity. Please try again.", variant: "destructive" });
        }
    }
  };

  const handleEdit = (activity: CoCurricularActivity) => {
    setEditingActivity(activity);
     // Focus input or scroll to edit section if needed
  };

  const handleCancelEdit = () => {
      setEditingActivity(null);
      setNewActivityName(''); // Clear input field as well
  }

  const handleRemove = async (activityId: string) => {
    // Add confirmation dialog
    // Check if activity is assigned to any student before deleting (optional, depends on requirements)
    // Add API call to delete
    try {
        // await api.deleteActivity(activityId); // Replace with actual API call
        const activityName = activities.find(a => a.id === activityId)?.name;
        setActivities(activities.filter((act) => act.id !== activityId));
        toast({ title: "Success", description: `Activity "${activityName}" removed.` });
         if (editingActivity?.id === activityId) {
            setEditingActivity(null); // Clear edit state if the deleted item was being edited
        }
    } catch (error) {
         console.error("Failed to remove activity:", error);
         toast({ title: "Error", description: "Could not remove activity. Please try again.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Co-Curricular Activities</CardTitle>
        <CardDescription>
          Define the co-curricular activities available for students. These can be assigned via the student modal in 'Classes & Sections'.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-lg bg-muted/30">
          <div className="flex-1 grid gap-1.5">
             <Label htmlFor="activityName">{editingActivity ? 'Edit Activity Name' : 'New Activity Name'}</Label>
            <Input
              id="activityName"
              placeholder="e.g., Science Olympiad"
              value={editingActivity ? editingActivity.name : newActivityName}
              onChange={(e) => editingActivity ? setEditingActivity({...editingActivity, name: e.target.value }) : setNewActivityName(e.target.value)}
            />
          </div>
          <div className="flex gap-2 self-end mt-4 md:mt-0">
            {editingActivity && (
                <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel Edit
                </Button>
            )}
            <Button onClick={handleAddOrUpdateActivity}>
              {editingActivity ? <Edit className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              {editingActivity ? 'Update Activity' : 'Add Activity'}
            </Button>
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity Name</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                          No co-curricular activities defined yet.
                      </TableCell>
                  </TableRow>
              )}
              {activities.sort((a,b) => a.name.localeCompare(b.name)).map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.name}</TableCell>
                  <TableCell className="text-right">
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(activity)}
                        disabled={!!editingActivity && editingActivity.id === activity.id} // Disable edit if already editing this one
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Activity</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 ml-1"
                      onClick={() => handleRemove(activity.id)}
                      disabled={!!editingActivity && editingActivity.id === activity.id} // Optionally disable delete while editing
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove Activity</span>
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

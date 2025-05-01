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
import { PlusCircle, Trash2, Edit, X } from 'lucide-react'; // Added X icon for cancel
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
        act => act.name.trim().toLowerCase() === name.trim().toLowerCase() && act.id !== editingActivity?.id
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
            setNewActivityName(''); // Clear input after update
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
    setEditingActivity({ ...activity }); // Edit a copy
    setNewActivityName(''); // Clear new activity input when editing
     // Focus input or scroll to edit section if needed
  };

  const handleCancelEdit = () => {
      setEditingActivity(null);
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
          Define activities available for students. Assign them in the 'Classes & Sections' tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-lg bg-muted/30 items-end">
          <div className="flex-1 grid gap-1.5">
             <Label htmlFor="activityName">{editingActivity ? `Editing: ${activities.find(a => a.id === editingActivity.id)?.name}` : 'New Activity Name'}</Label>
            <Input
              id="activityName"
              placeholder={editingActivity ? 'Enter updated name...' : 'e.g., Science Olympiad'}
              value={editingActivity ? editingActivity.name : newActivityName}
              onChange={(e) => editingActivity ? setEditingActivity({...editingActivity, name: e.target.value }) : setNewActivityName(e.target.value)}
              disabled={!editingActivity && !!activities.find(a => a.name.toLowerCase() === newActivityName.trim().toLowerCase())} // Disable if adding and name exists
            />
              {/* Show warning if duplicate name while adding */}
              {!editingActivity && newActivityName.trim() && activities.find(a => a.name.toLowerCase() === newActivityName.trim().toLowerCase()) && (
                  <p className="text-xs text-destructive">This activity name already exists.</p>
              )}
          </div>
          <div className="flex gap-2 self-end mt-4 md:mt-0">
            {editingActivity && (
                <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="mr-2 h-4 w-4" /> Cancel Edit
                </Button>
            )}
            <Button
                onClick={handleAddOrUpdateActivity}
                disabled={
                    (editingActivity && editingActivity.name.trim() === '') ||
                    (!editingActivity && newActivityName.trim() === '') ||
                    (!editingActivity && !!activities.find(a => a.name.toLowerCase() === newActivityName.trim().toLowerCase())) // Disable add if duplicate
                }
            >
              {editingActivity ? <Edit className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              {editingActivity ? 'Update Activity' : 'Add Activity'}
            </Button>
          </div>
        </div>

        <div className="border rounded-md overflow-hidden"> {/* Added overflow-hidden */}
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
                <TableRow key={activity.id} className="hover:bg-muted/50 transition-colors"> {/* Added hover effect */}
                  <TableCell className="font-medium">{activity.name}</TableCell>
                  <TableCell className="text-right">
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-primary" /* Added hover color */
                        onClick={() => handleEdit(activity)}
                        disabled={!!editingActivity && editingActivity.id === activity.id} // Disable edit if already editing this one
                        title="Edit Activity"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Activity</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 ml-1"
                      onClick={() => handleRemove(activity.id)}
                      disabled={!!editingActivity && editingActivity.id === activity.id} // Optionally disable delete while editing
                      title="Remove Activity"
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

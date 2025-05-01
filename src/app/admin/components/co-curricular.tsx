// src/app/admin/components/co-curricular.tsx
'use client';

import React, { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Trash2, Edit, X, Activity, Sparkles } from 'lucide-react'; // Added X icon for cancel, Activity, Sparkles
import { type CoCurricularActivity } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'; // Added AlertDialog

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
        toast({ title: "Oops!", description: "Activity name cannot be empty. Let's give it a name!", variant: "destructive" });
        return;
    }

     // Check for duplicates (case-insensitive)
     const isDuplicate = activities.some(
        act => act.name.trim().toLowerCase() === name.trim().toLowerCase() && act.id !== editingActivity?.id
     );
     if (isDuplicate) {
        toast({ title: "Duplicate Alert!", description: `An activity named "${name.trim()}" already exists. Try a different name.`, variant: "destructive" });
         return;
     }


    if (editingActivity) {
        // Update existing activity
        // Add API call to update
         try {
            // await api.updateActivity(editingActivity.id, { name: name.trim() }); // Replace with actual API call
            setActivities(activities.map(act => act.id === editingActivity.id ? { ...act, name: name.trim() } : act));
            toast({ title: "Activity Updated!", description: `"${name.trim()}" has been refreshed.`, });
            setEditingActivity(null);
            setNewActivityName(''); // Clear input after update
         } catch (error) {
             console.error("Failed to update activity:", error);
             toast({ title: "Update Error", description: "Could not update activity. Please try again.", variant: "destructive" });
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
            toast({ title: "Activity Added!", description: `"${newActivity.name}" is now available. ✨`, });
            setNewActivityName('');
        } catch (error) {
             console.error("Failed to add activity:", error);
             toast({ title: "Add Error", description: "Could not add activity. Please try again.", variant: "destructive" });
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

  const handleRemove = async (activity: CoCurricularActivity) => { // Pass the full activity object
    // Check if activity is assigned to any student before deleting (requires student data access)
    // Add API call to delete
    try {
        // await api.deleteActivity(activityId); // Replace with actual API call
        setActivities(activities.filter((act) => act.id !== activity.id));
        toast({ title: "Activity Removed", description: `"${activity.name}" has been removed.`, variant: "destructive"});
         if (editingActivity?.id === activity.id) {
            setEditingActivity(null); // Clear edit state if the deleted item was being edited
        }
    } catch (error) {
         console.error("Failed to remove activity:", error);
         toast({ title: "Remove Error", description: "Could not remove activity. Please try again.", variant: "destructive" });
    }
  };

  return (
    <Card className="shadow-md dark:shadow-indigo-900/10 border-t-4 border-primary rounded-xl overflow-hidden"> {/* Added styles */}
      <CardHeader className="bg-gradient-to-r from-indigo-50 via-white to-teal-50 dark:from-indigo-900/20 dark:via-background dark:to-teal-900/20 p-4 md:p-6"> {/* Gradient header */}
        <CardTitle className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
            <Activity className="h-6 w-6"/> Manage Co-Curricular Activities
        </CardTitle>
        <CardDescription className="text-muted-foreground mt-1">
          Define the exciting activities students can join. These can be assigned later in the 'Classes & Sections' tab.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6"> {/* Adjusted padding */}
        {/* Enhanced Add/Edit Section */}
         <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border border-dashed border-indigo-200 dark:border-indigo-800 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 items-end">
          <div className="flex-1 grid gap-1.5">
             <Label htmlFor="activityName" className="text-sm font-semibold text-muted-foreground">
                 {editingActivity ? `Editing: ${activities.find(a => a.id === editingActivity.id)?.name}` : 'New Activity Name'}
             </Label>
            <Input
              id="activityName"
              placeholder={editingActivity ? 'Enter updated name...' : 'e.g., Robotics Club, Photography...'}
              value={editingActivity ? editingActivity.name : newActivityName}
              onChange={(e) => editingActivity ? setEditingActivity({...editingActivity, name: e.target.value }) : setNewActivityName(e.target.value)}
              disabled={!editingActivity && !!activities.find(a => a.name.toLowerCase() === newActivityName.trim().toLowerCase())} // Disable if adding and name exists
              className="bg-background shadow-sm"
            />
              {/* Show warning if duplicate name while adding */}
              {!editingActivity && newActivityName.trim() && activities.find(a => a.name.toLowerCase() === newActivityName.trim().toLowerCase()) && (
                  <p className="text-xs text-destructive">Heads up! This activity name already exists.</p>
              )}
          </div>
          <div className="flex gap-2 self-end mt-4 md:mt-0 flex-wrap"> {/* Allow wrap */}
            {editingActivity && (
                <Button variant="outline" onClick={handleCancelEdit} className="shadow-sm">
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
                 className="transition-transform transform hover:scale-105 shadow hover:shadow-lg"
            >
              {editingActivity ? <Edit className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />} {/* Using Sparkles for Add */}
              {editingActivity ? 'Update Activity' : 'Add Activity'}
            </Button>
          </div>
        </div>

        <div className="border rounded-md overflow-hidden shadow-sm"> {/* Added shadow */}
          <Table>
            <TableHeader className="bg-muted/50"> {/* Styled header */}
              <TableRow>
                <TableHead>Activity Name</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center text-muted-foreground italic">
                          No co-curricular activities defined yet. Let's add some spark! ✨
                      </TableCell>
                  </TableRow>
              )}
              {activities.sort((a,b) => a.name.localeCompare(b.name)).map((activity) => (
                <TableRow key={activity.id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors duration-150"> {/* Added hover effect */}
                  <TableCell className="font-medium">{activity.name}</TableCell>
                  <TableCell className="text-right">
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:bg-primary/10" /* Added hover color */
                        onClick={() => handleEdit(activity)}
                        disabled={!!editingActivity && editingActivity.id === activity.id} // Disable edit if already editing this one
                        title="Edit Activity"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Activity</span>
                    </Button>
                     {/* Confirmation Dialog for Activity Removal */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 ml-1"
                              disabled={!!editingActivity && editingActivity.id === activity.id} // Optionally disable delete while editing
                              title="Remove Activity"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove Activity</span>
                            </Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                             <AlertDialogHeader>
                                 <AlertDialogTitle>Remove "{activity.name}"?</AlertDialogTitle>
                                 <AlertDialogDescription>
                                      Are you sure you want to remove this activity? This cannot be undone. Check if students are assigned first.
                                 </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                                 {/* Pass the activity object to handleRemove */}
                                 <AlertDialogAction onClick={() => handleRemove(activity)} className={buttonVariants({variant: "destructive"})}>Remove Activity</AlertDialogAction>
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

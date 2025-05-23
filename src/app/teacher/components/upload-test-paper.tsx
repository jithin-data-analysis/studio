'use client';

import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Loader2, BrainCircuit, ListChecks, Target, CheckCircle, FileWarning, FileText } from 'lucide-react'; // Added icons
import { analyzeTestPaper } from '@/ai/flows/analyze-test-paper';
import { type AnalyzeTestPaperOutput } from '@/ai/flows/analyze-test-paper';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { uploadFileAndProcessForRag } from '@/services/supabase'; // Import simulation-aware uploader

export function UploadTestPaper() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeTestPaperOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Basic validation
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
       if (!allowedTypes.includes(file.type)) {
           toast({ title: "Invalid File Type", description: "Please upload PDF or DOC/DOCX files.", variant: "destructive" });
           setSelectedFile(null);
           if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
           return;
       }
       // Optional: Size validation
       // if (file.size > 5 * 1024 * 1024) { // 5MB limit example
       //     toast({ title: "File Too Large", description: "Please upload files smaller than 5MB.", variant: "destructive" });
       //     setSelectedFile(null);
       //     if (fileInputRef.current) fileInputRef.current.value = "";
       //     return;
       // }
      setSelectedFile(file);
      setAnalysisResult(null); // Reset previous analysis
      setError(null); // Reset previous error
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
       toast({ title: "No File Selected", description: "Please select a test paper to analyze.", variant: "destructive" });
       return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    const currentFileName = selectedFile.name; // Store filename for messages

    try {
        // 1. Upload file (or simulate) - RAG processing happens here if not simulating
        // We pass a generic path prefix, adjust if needed per subject/class
        const { fileUrl } = await uploadFileAndProcessForRag(selectedFile, 'test-papers/');
        console.log(`File ${process.env.SIMULATE_AI === 'true' ? 'simulation' : ''} uploaded/processed: ${fileUrl}`);

        // 2. Convert file to data URI for AI analysis flow
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);

        reader.onloadend = async () => {
            const base64data = reader.result as string;
            if (!base64data) {
                 throw new Error("Could not read file data for analysis.");
            }

            try {
                // 3. Call the analyzeTestPaper flow (handles its own simulation)
                const result = await analyzeTestPaper({ testPaperDataUri: base64data });
                setAnalysisResult(result);
                toast({
                    title: `Analysis Complete ${process.env.SIMULATE_AI === 'true' ? '(Simulated)' : ''}`,
                    description: `Analysis for ${currentFileName} finished.`
                });
            } catch (aiError: any) { // Catch specific AI error
                 console.error('AI Analysis failed:', aiError);
                 let errorMsg = `Failed to analyze ${currentFileName}.`;
                 if (aiError.message?.includes('quota')) {
                     errorMsg += ' API quota might be exceeded.';
                 } else if (aiError.message?.includes('format')) {
                     errorMsg += ' Document format might be incompatible or corrupted.';
                 } else if (process.env.SIMULATE_AI !== 'true' && aiError.message?.includes('GOOGLE_GENAI_API_KEY')) {
                     errorMsg = 'Missing Google API Key. Set SIMULATE_AI=true in .env to test without keys.'
                 } else {
                    errorMsg += ` ${aiError.message || 'The AI model might be unavailable.'}`;
                 }
                 setError(errorMsg);
                 toast({ title: "Analysis Failed", description: errorMsg, variant: "destructive" });
            } finally {
                setIsAnalyzing(false); // Stop loading after analysis attempt
            }
        };

         reader.onerror = (errorEvent) => {
             console.error("Error reading file:", errorEvent);
             // Stop loading and show error if reader fails
             setIsAnalyzing(false);
             setError("Error reading file before analysis.");
             toast({ title: "File Read Error", description: "Could not read the file data.", variant: "destructive" });
         };

    } catch (err: any) {
      // Catches errors from uploadFileAndProcessForRag or initial file reading issues
      console.error('File processing/upload error:', err);
      setError(err.message || 'An error occurred during file processing or upload.');
       toast({ title: "Processing Error", description: err.message || "Could not process the file.", variant: "destructive" });
      setIsAnalyzing(false); // Ensure loading stops
    }
  };

   // Function to handle drag over
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault(); // Necessary to allow drop
      event.currentTarget.classList.add('border-primary', 'bg-primary/10'); // Add highlight
    };

    // Function to handle drag leave
    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.classList.remove('border-primary', 'bg-primary/10'); // Remove highlight
    };

     // Function to handle drop
     const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
         event.preventDefault();
         event.currentTarget.classList.remove('border-primary', 'bg-primary/10'); // Remove highlight
         if (event.dataTransfer.files && event.dataTransfer.files[0]) {
             const file = event.dataTransfer.files[0];
             // Trigger file change logic, reusing validation etc.
             if (fileInputRef.current) {
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(file);
                  fileInputRef.current.files = dataTransfer.files;
                  // Manually trigger the onChange handler
                  const changeEvent = new Event('change', { bubbles: true });
                  fileInputRef.current.dispatchEvent(changeEvent);
             }
         }
     };

  return (
    <Card className="shadow-md dark:shadow-indigo-900/10"> {/* Added shadow */}
      <CardHeader>
        <CardTitle>Upload and Analyze Test Paper</CardTitle>
        <CardDescription>
          Upload a test paper (PDF/DOCX) for AI analysis: summary, Bloom's level, marks, and question extraction.
          {process.env.SIMULATE_AI === 'true' && <Badge variant="destructive" className="ml-2">SIMULATING AI</Badge>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enhanced Upload Area */}
        <div
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted rounded-lg text-center cursor-pointer hover:border-primary transition-colors duration-200 bg-background dark:bg-muted/20"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
          <UploadCloud className="h-12 w-12 text-muted-foreground mb-2" />
          <Label htmlFor="test-paper-upload" className="font-semibold text-primary cursor-pointer">
             {selectedFile ? `Selected: ${selectedFile.name}` : 'Click or Drag & Drop to Upload'}
          </Label>
           <p className="text-xs text-muted-foreground mt-1">
               {selectedFile ? 'Click again or drop a file to replace' : 'PDF or DOCX (Max 5MB recommended)'}
           </p>
          <Input
            id="test-paper-upload"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="hidden" // Hide the default input visually
          />
        </div>

        {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/30">
                <FileWarning className="h-5 w-5 mt-0.5 flex-shrink-0"/>
                <p className="text-sm font-medium">{error}</p>
            </div>
        )}

        {/* Analysis Results Section */}
         {isAnalyzing && (
             <Card className="bg-muted/50 animate-pulse">
                 <CardHeader>
                     <CardTitle className="text-lg flex items-center gap-2">
                         <Loader2 className="animate-spin h-5 w-5"/> Analyzing Paper... {process.env.SIMULATE_AI === 'true' && '(Simulating)'}
                     </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-5 pt-2">
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>
                     <div className="flex gap-4">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-md" />
                     </div>
                      <div className="space-y-1.5">
                         <Skeleton className="h-4 w-1/4" />
                         <Skeleton className="h-4 w-3/4" />
                         <Skeleton className="h-4 w-1/2" />
                     </div>
                 </CardContent>
             </Card>
         )}

        {analysisResult && !isAnalyzing && (
          <Card className="bg-muted/50 border border-green-200 dark:border-green-800/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle /> Analysis Results {process.env.SIMULATE_AI === 'true' && <Badge variant='secondary'>Simulated</Badge>}
              </CardTitle>
               <CardDescription>File: {selectedFile?.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-2"> {/* Increased spacing */}
               <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-1.5 text-sm uppercase text-muted-foreground"><BrainCircuit size={16} /> Summary & Concepts:</h4>
                  <p className="text-sm pl-6">{analysisResult.summary || <span className="italic text-muted-foreground/70">Not available</span>}</p>
               </div>
                <div className="flex items-center gap-4">
                    <div>
                       <h4 className="font-semibold mb-1 flex items-center gap-1.5 text-sm uppercase text-muted-foreground"><Target size={16} /> Bloom's Level:</h4>
                       <Badge variant="secondary" className="ml-6 text-base">{analysisResult.bloomsLevel || 'N/A'}</Badge> {/* Larger badge */}
                    </div>
                     <div>
                        <h4 className="font-semibold mb-1 text-sm uppercase text-muted-foreground">Total Marks:</h4>
                        <Badge variant="outline" className="ml-0 text-base">{analysisResult.totalMarks ?? 'N/A'}</Badge> {/* Larger badge */}
                     </div>
                </div>
                 <div>
                     <h4 className="font-semibold mb-1 flex items-center gap-1.5 text-sm uppercase text-muted-foreground"><ListChecks size={16}/> Extracted MCQs ({analysisResult.mcqQuestions?.length ?? 0}):</h4>
                     {analysisResult.mcqQuestions && analysisResult.mcqQuestions.length > 0 ? (
                         <ul className="list-decimal list-inside pl-6 text-sm space-y-1.5 mt-1"> {/* Use decimal list */}
                             {analysisResult.mcqQuestions.map((mcq, index) => (
                                 <li key={index}>{mcq}</li>
                             ))}
                         </ul>
                     ) : (
                         <p className="text-sm text-muted-foreground/70 pl-6 italic">No MCQ-style questions were automatically extracted.</p>
                     )}
                 </div>
                 {/* Display Topic Mapping if available */}
                 {analysisResult.topicMapping && analysisResult.topicMapping.length > 0 && (
                      <div>
                          <h4 className="font-semibold mb-1 flex items-center gap-1.5 text-sm uppercase text-muted-foreground"><ListChecks size={16}/> Question-Topic Mapping ({analysisResult.topicMapping.length}):</h4>
                          <ul className="list-disc list-inside pl-6 text-sm space-y-1.5 mt-1">
                              {analysisResult.topicMapping.map((mapping, index) => (
                                  <li key={index}><b>Q:</b> "{mapping.question}" → <b>Topic:</b> {mapping.topic}</li>
                              ))}
                          </ul>
                      </div>
                  )}
            </CardContent>
          </Card>
        )}

      </CardContent>
      <CardFooter className="border-t pt-4"> {/* Added border */}
        <Button onClick={handleAnalyze} disabled={!selectedFile || isAnalyzing} size="lg"> {/* Larger button */}
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing... {process.env.SIMULATE_AI === 'true' && '(Simulating)'}
            </>
          ) : (
             <>
              <BrainCircuit className="mr-2 h-4 w-4" /> Analyze Paper
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

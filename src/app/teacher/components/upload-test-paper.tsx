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
import { UploadCloud, Loader2, BrainCircuit, ListChecks, Target, CheckCircle } from 'lucide-react';
import { analyzeTestPaper } from '@/ai/flows/analyze-test-paper';
import { type AnalyzeTestPaperOutput } from '@/ai/flows/analyze-test-paper';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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

    try {
        // Convert file to data URI
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onloadend = async () => {
            const base64data = reader.result as string;

            if (!base64data) {
                 throw new Error("Could not read file data.");
            }

            try {
                const result = await analyzeTestPaper({ testPaperDataUri: base64data });
                setAnalysisResult(result);
                 toast({ title: "Analysis Complete", description: "Test paper analysis finished successfully." });
            } catch (aiError) {
                 console.error('AI Analysis failed:', aiError);
                 setError('Failed to analyze the test paper. The AI model might be unavailable or the document format could be incompatible.');
                 toast({ title: "Analysis Failed", description: "Could not analyze the test paper.", variant: "destructive" });
            } finally {
                 setIsAnalyzing(false);
            }
        };
         reader.onerror = () => {
             throw new Error("Error reading file.");
         };

    } catch (err: any) {
      console.error('File processing error:', err);
      setError(err.message || 'An error occurred during file processing.');
       toast({ title: "File Error", description: err.message || "Could not process the file.", variant: "destructive" });
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload and Analyze Test Paper</CardTitle>
        <CardDescription>
          Upload a test paper (PDF/DOCX) to get an AI-powered analysis, including summary, Bloom's level, and extracted questions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="test-paper-upload">Select Test Paper</Label>
          <Input
            id="test-paper-upload"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          {selectedFile && <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>}
        </div>

        {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>
        )}

        {analysisResult && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="text-green-600" /> Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-1"><BrainCircuit size={16} /> Summary & Concepts:</h4>
                  <p className="text-sm text-muted-foreground pl-5">{analysisResult.summary}</p>
               </div>
                <div>
                   <h4 className="font-semibold mb-1 flex items-center gap-1"><Target size={16} /> Bloom's Taxonomy Level:</h4>
                   <Badge variant="secondary" className="ml-5">{analysisResult.bloomsLevel}</Badge>
                </div>
                 <div>
                    <h4 className="font-semibold mb-1">Total Marks Detected:</h4>
                    <Badge variant="outline" className="ml-5">{analysisResult.totalMarks}</Badge>
                 </div>
                 {analysisResult.mcqQuestions && analysisResult.mcqQuestions.length > 0 && (
                     <div>
                         <h4 className="font-semibold mb-1 flex items-center gap-1"><ListChecks size={16}/> Extracted MCQs ({analysisResult.mcqQuestions.length}):</h4>
                         <ul className="list-disc list-inside pl-5 text-sm text-muted-foreground space-y-1">
                             {analysisResult.mcqQuestions.map((mcq, index) => (
                                 <li key={index}>{mcq}</li>
                             ))}
                         </ul>
                     </div>
                 )}
                 {analysisResult.mcqQuestions && analysisResult.mcqQuestions.length === 0 && (
                     <p className="text-sm text-muted-foreground pl-5">No MCQ-style questions were automatically extracted.</p>
                 )}
            </CardContent>
          </Card>
        )}

      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalyze} disabled={!selectedFile || isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
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

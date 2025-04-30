'use server';
/**
 * @fileOverview Analyzes a test paper to extract key information.
 *
 * - analyzeTestPaper - A function that analyzes the test paper.
 * - AnalyzeTestPaperInput - The input type for the analyzeTestPaper function.
 * - AnalyzeTestPaperOutput - The return type for the analyzeTestPaper function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeTestPaperInputSchema = z.object({
  testPaperDataUri: z
    .string()
    .describe(
      "A test paper as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeTestPaperInput = z.infer<typeof AnalyzeTestPaperInputSchema>;

const AnalyzeTestPaperOutputSchema = z.object({
  summary: z.string().describe('A summary of the subjects and concepts covered in the test paper.'),
  bloomsLevel: z.string().describe('The Bloom\'s taxonomy level of the test paper (e.g., Knowledge, Comprehension, Application...).'),
  totalMarks: z.number().describe('The total marks detected in the test paper.'),
  mcqQuestions: z.array(z.string()).describe('An array of MCQ-style questions extracted from the test paper.'),
});
export type AnalyzeTestPaperOutput = z.infer<typeof AnalyzeTestPaperOutputSchema>;

export async function analyzeTestPaper(input: AnalyzeTestPaperInput): Promise<AnalyzeTestPaperOutput> {
  return analyzeTestPaperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTestPaperPrompt',
  input: {
    schema: z.object({
      testPaperDataUri: z
        .string()
        .describe(
          "A test paper as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summary of the subjects and concepts covered in the test paper.'),
      bloomsLevel: z.string().describe('The Bloom\'s taxonomy level of the test paper (e.g., Knowledge, Comprehension, Application...).'),
      totalMarks: z.number().describe('The total marks detected in the test paper.'),
      mcqQuestions: z.array(z.string()).describe('An array of MCQ-style questions extracted from the test paper.'),
    }),
  },
  prompt: `You are an educational document analyzer. Read the uploaded question paper and return:
- Summary of subjects and concepts
- Bloom’s taxonomy level (e.g., Knowledge, Comprehension, Application…)
- Total marks detected
- If possible, extract MCQ-style questions into structured JSON.\n\nTest Paper: {{media url=testPaperDataUri}}`,
});

const analyzeTestPaperFlow = ai.defineFlow<
  typeof AnalyzeTestPaperInputSchema,
  typeof AnalyzeTestPaperOutputSchema
>({
  name: 'analyzeTestPaperFlow',
  inputSchema: AnalyzeTestPaperInputSchema,
  outputSchema: AnalyzeTestPaperOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});

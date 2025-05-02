'use server';

/**
 * @fileOverview Generates personalized insights and suggestions for students based on their performance data.
 *
 * - generateStudentInsights - A function that generates insights for a given student based on their marks and test metadata.
 * - GenerateStudentInsightsInput - The input type for the generateStudentInsights function.
 * - GenerateStudentInsightsOutput - The return type for the generateStudentInsights function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateStudentInsightsInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  testId: z.string().describe('The ID of the test.'),
  obtainedMarks: z.number().describe('The marks obtained by the student in the test.'),
  totalMarks: z.number().describe('The total marks for the test.'),
  subject: z.string().describe('The subject of the test.'),
  date: z.string().describe('The date of the test.'),
  type: z.string().describe('The type of the test (e.g., Midterm, Final).'),
  historicalContext: z.string().optional().describe('Historical performance data of the student.'),
});
export type GenerateStudentInsightsInput = z.infer<typeof GenerateStudentInsightsInputSchema>;

const GenerateStudentInsightsOutputSchema = z.object({
  trends: z.string().describe('A summary of the student\'s performance trends.'),
  weaknesses: z.string().describe('Identified weaknesses of the student.'),
  personalizedTips: z.string().describe('Personalized tips for the student to improve.'),
  predictiveOutcomes: z.string().describe('Predictive outcomes for the student based on their performance.'),
});
export type GenerateStudentInsightsOutput = z.infer<typeof GenerateStudentInsightsOutputSchema>;

// Mock data for simulation
const mockInsightsOutput: GenerateStudentInsightsOutput = {
  trends: "Simulated: The student shows consistent performance in this subject, with a slight upward trend in recent tests.",
  weaknesses: "Simulated: Difficulty observed in applying concepts to complex word problems.",
  personalizedTips: "Simulated: Recommend practicing multi-step word problems and reviewing foundational concepts X and Y.",
  predictiveOutcomes: "Simulated: Based on current trends, the student is likely to maintain their performance level in the upcoming assessment. Focusing on weaknesses could lead to improvement."
};

export async function generateStudentInsights(input: GenerateStudentInsightsInput): Promise<GenerateStudentInsightsOutput> {
  if (process.env.SIMULATE_AI === 'true') {
    console.log(`--- SIMULATING generateStudentInsights for student ${input.studentId} ---`);
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockInsightsOutput;
  }
  return generateStudentInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudentInsightsPrompt',
  input: {
    schema: GenerateStudentInsightsInputSchema,
  },
  output: {
    schema: GenerateStudentInsightsOutputSchema,
  },
  prompt: `You are an AI education assistant. Analyze the student's test performance data and historical context to provide insights and personalized tips.

  Student ID: {{{studentId}}}
  Test ID: {{{testId}}}
  Obtained Marks: {{{obtainedMarks}}}
  Total Marks: {{{totalMarks}}}
  Subject: {{{subject}}}
  Date: {{{date}}}
  Type: {{{type}}}
  Historical Context: {{{historicalContext}}}

  Provide the following insights:
  - Trends: A summary of the student's performance trends.
  - Weaknesses: Identified weaknesses of the student.
  - Personalized Tips: Personalized tips for the student to improve.
  - Predictive Outcomes: Predictive outcomes for the student based on their performance.
  `,
});

const generateStudentInsightsFlow = ai.defineFlow<
  typeof GenerateStudentInsightsInputSchema,
  typeof GenerateStudentInsightsOutputSchema
>({
  name: 'generateStudentInsightsFlow',
  inputSchema: GenerateStudentInsightsInputSchema,
  outputSchema: GenerateStudentInsightsOutputSchema,
}, async input => {
   if (process.env.SIMULATE_AI !== 'true' && !process.env.GOOGLE_GENAI_API_KEY) {
     throw new Error('Missing GOOGLE_GENAI_API_KEY environment variable. Cannot call AI.');
   }
   console.log("Calling AI prompt for student insights...");
  const {output} = await prompt(input);
   console.log("AI insights received:", output);
  return output!;
});

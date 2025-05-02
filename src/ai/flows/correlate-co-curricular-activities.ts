// src/ai/flows/correlate-co-curricular-activities.ts
'use server';
/**
 * @fileOverview A flow that analyzes the correlation between students' co-curricular activities and their academic performance.
 *
 * - correlateCoCurricularActivities - A function that handles the correlation analysis process.
 * - CorrelateCoCurricularActivitiesInput - The input type for the correlateCoCurricularActivities function.
 * - CorrelateCoCurricularActivitiesOutput - The return type for the correlateCoCurricularActivities function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const CorrelateCoCurricularActivitiesInputSchema = z.object({
  classId: z.string().describe('The ID of the class to analyze.'),
  term: z.string().describe('The term for which to analyze the data (e.g., Fall 2024).'),
});
export type CorrelateCoCurricularActivitiesInput = z.infer<
  typeof CorrelateCoCurricularActivitiesInputSchema
>;

const CorrelateCoCurricularActivitiesOutputSchema = z.object({
  balanceCheck: z
    .string()
    .describe(
      'Analysis of whether students in certain co-curricular activities perform better in specific types of tests (e.g., teamwork-based tests).' // Corrected typo here
    ),
  riskFlags: z
    .string()
    .describe(
      'Identification of potential risks, such as students involved in too many activities having lower scores in certain subjects.'
    ),
  suggestions: z
    .string()
    .describe(
      'Suggestions for administrators and teachers regarding how to address any identified imbalances or risks.'
    ),
});
export type CorrelateCoCurricularActivitiesOutput = z.infer<
  typeof CorrelateCoCurricularActivitiesOutputSchema
>;

// Mock data for simulation
const mockCorrelationOutput: CorrelateCoCurricularActivitiesOutput = {
  balanceCheck: "Simulated: Students participating in the Debate Team show slightly higher scores in subjects requiring critical analysis. Music Ensemble members perform well in creative writing tasks.",
  riskFlags: "Simulated: A small group of students involved in 3+ activities show a decline in Math scores compared to the class average. Monitor their workload.",
  suggestions: "Simulated: Consider scheduling study support sessions for students juggling multiple activities. Explore integrating teamwork elements into Science projects to leverage skills from sports clubs."
};

export async function correlateCoCurricularActivities(
  input: CorrelateCoCurricularActivitiesInput
): Promise<CorrelateCoCurricularActivitiesOutput> {
  if (process.env.SIMULATE_AI === 'true') {
    console.log(`--- SIMULATING correlateCoCurricularActivities for class ${input.classId} ---`);
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 700));
    return mockCorrelationOutput;
  }
  return correlateCoCurricularActivitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correlateCoCurricularActivitiesPrompt',
  input: {
    schema: z.object({
      classId: z.string().describe('The ID of the class to analyze.'),
      term: z.string().describe('The term for which to analyze the data (e.g., Fall 2024).'),
    }),
  },
  output: {
    schema: z.object({
      balanceCheck: z
        .string()
        .describe(
          'Analysis of whether students in certain co-curricular activities perform better in specific types of tests (e.g., teamwork-based tests).'
        ),
      riskFlags: z
        .string()
        .describe(
          'Identification of potential risks, such as students involved in too many activities having lower scores in certain subjects.'
        ),
      suggestions: z
        .string()
        .describe(
          'Suggestions for administrators and teachers regarding how to address any identified imbalances or risks.'
        ),
    }),
  },
  prompt: `You are an AI assistant that analyzes student data to identify correlations between co-curricular activities and academic performance.

  Analyze the provided student data for class ID {{{classId}}} for the term {{{term}}}.

  Return insights in the following format:

  - balanceCheck: Analysis of whether students in certain co-curricular activities perform better in specific types of tests (e.g., teamwork-based tests).
  - riskFlags: Identification of potential risks, such as students involved in too many activities having lower scores in certain subjects.
  - suggestions: Suggestions for administrators and teachers regarding how to address any identified imbalances or risks.

  Ensure the insights are clear, concise, and actionable.
  `,
});

const correlateCoCurricularActivitiesFlow = ai.defineFlow<
  typeof CorrelateCoCurricularActivitiesInputSchema,
  typeof CorrelateCoCurricularActivitiesOutputSchema
>(
  {
    name: 'correlateCoCurricularActivitiesFlow',
    inputSchema: CorrelateCoCurricularActivitiesInputSchema,
    outputSchema: CorrelateCoCurricularActivitiesOutputSchema,
  },
  async input => {
     if (process.env.SIMULATE_AI !== 'true' && !process.env.GOOGLE_GENAI_API_KEY) {
        throw new Error('Missing GOOGLE_GENAI_API_KEY environment variable. Cannot call AI.');
     }
     console.log("Calling AI prompt for co-curricular correlation...");
     // In a real app, fetch actual student, marks, and activity data here based on input.classId and input.term
     // Pass this aggregated data to the prompt (might need to adjust prompt schema)
    const {output} = await prompt(input); // Pass fetched data here if needed
     console.log("AI correlation insights received:", output);
    return output!;
  }
);

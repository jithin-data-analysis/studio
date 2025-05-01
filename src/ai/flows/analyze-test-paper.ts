'use server';
/**
 * @fileOverview Analyzes a test paper to extract key information,
 * using RAG to provide syllabus context.
 *
 * - analyzeTestPaper - A function that analyzes the test paper.
 * - AnalyzeTestPaperInput - The input type for the analyzeTestPaper function.
 * - AnalyzeTestPaperOutput - The return type for the analyzeTestPaper function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {
    dataUriToBlob,
    processDocumentFromBlob,
    getEmbeddings,
    ensureVectorStore,
    retrieveRelevantDocuments
} from '../rag/rag-utils'; // Import RAG utils

const AnalyzeTestPaperInputSchema = z.object({
  testPaperDataUri: z
    .string()
    .describe(
      "A test paper as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  // Optional: Add classId/subjectId if syllabus context is specific
  // classId: z.string().optional().describe("The class ID for syllabus context."),
  // subjectId: z.string().optional().describe("The subject ID for syllabus context."),
});
export type AnalyzeTestPaperInput = z.infer<typeof AnalyzeTestPaperInputSchema>;

const AnalyzeTestPaperOutputSchema = z.object({
  summary: z.string().describe('A summary of the subjects and concepts covered in the test paper.'),
  bloomsLevel: z.string().describe('The Bloom\'s taxonomy level of the test paper (e.g., Knowledge, Comprehension, Application...).'),
  totalMarks: z.number().describe('The total marks detected in the test paper.'),
  mcqQuestions: z.array(z.string()).describe('An array of MCQ-style questions extracted from the test paper.'),
  topicMapping: z.array(z.object({ // Added topic mapping based on RAG
      question: z.string().describe("The question or a summary of it."),
      topic: z.string().describe("The syllabus topic it most likely relates to."),
  })).optional().describe("Mapping of questions to syllabus topics based on retrieved context."),
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
       relevantSyllabusSnippets: z.array(z.string()).optional().describe("Snippets from the syllabus relevant to the test paper content."), // Add RAG context to input schema
    }),
  },
  output: {
    schema: z.object({ // Align output schema with AnalyzeTestPaperOutputSchema
      summary: z.string().describe('A summary of the subjects and concepts covered in the test paper.'),
      bloomsLevel: z.string().describe('The Bloom\'s taxonomy level of the test paper (e.g., Knowledge, Comprehension, Application...).'),
      totalMarks: z.number().describe('The total marks detected in the test paper.'),
      mcqQuestions: z.array(z.string()).describe('An array of MCQ-style questions extracted from the test paper.'),
      topicMapping: z.array(z.object({
          question: z.string().describe("The question or a summary of it."),
          topic: z.string().describe("The syllabus topic it most likely relates to."),
      })).optional().describe("Mapping of questions to syllabus topics based on retrieved context."),
    }),
  },
  prompt: `You are an educational document analyzer. Read the uploaded question paper and analyze it using the provided syllabus context.

Return the following information in the specified JSON format:
- Summary of subjects and concepts
- Bloom’s taxonomy level (e.g., Knowledge, Comprehension, Application…)
- Total marks detected
- If possible, extract MCQ-style questions into structured JSON.
- Map questions (or summarized questions) to the most relevant syllabus topic using the provided context.

Test Paper Content: {{media url=testPaperDataUri}}

{{#if relevantSyllabusSnippets}}
Relevant Syllabus Context:
{{#each relevantSyllabusSnippets}}
- {{{this}}}
{{/each}}
{{else}}
(No specific syllabus context provided or retrieved)
{{/if}}
`,
});

const analyzeTestPaperFlow = ai.defineFlow<
  typeof AnalyzeTestPaperInputSchema,
  typeof AnalyzeTestPaperOutputSchema
>({
  name: 'analyzeTestPaperFlow',
  inputSchema: AnalyzeTestPaperInputSchema,
  outputSchema: AnalyzeTestPaperOutputSchema,
}, async input => {

    // --- RAG Integration ---
    let relevantSnippets: string[] = [];
    let queryText = '';

    try {
        console.log("Starting RAG process...");
        const blob = dataUriToBlob(input.testPaperDataUri); // Convert Data URI to Blob

        // Process the document to get text chunks for the RAG query
        const chunks = await processDocumentFromBlob(blob); // Process the Blob
        queryText = chunks.map(chunk => chunk.pageContent).join("\n").substring(0, 1000); // Use first 1000 chars as query

        if (queryText) {
            const embeddings = getEmbeddings();
            const vectorStore = await ensureVectorStore(embeddings); // Load existing store

            console.log("Retrieving relevant documents from ChromaDB...");
            const relevantDocs = await retrieveRelevantDocuments(queryText, vectorStore, 3); // Retrieve top 3 relevant docs
            relevantSnippets = relevantDocs.map(doc => doc.pageContent);
            console.log(`Retrieved ${relevantSnippets.length} relevant snippets.`);
        } else {
            console.warn("Could not extract text from the document for RAG query.");
        }

    } catch (ragError) {
        console.warn("RAG process failed or vector store might be empty:", ragError);
        // Proceed without RAG context if it fails
    }
    // --- End RAG Integration ---

    console.log("Calling AI prompt with test paper and RAG context...");
    const {output} = await prompt({
        testPaperDataUri: input.testPaperDataUri,
        relevantSyllabusSnippets: relevantSnippets.length > 0 ? relevantSnippets : undefined, // Pass snippets if available
    });

    if (!output) {
         console.error("AI prompt did not return an output.");
         throw new Error("Failed to get analysis from AI model.");
    }
     console.log("AI analysis received:", output);

     // Ensure the output matches the expected schema, especially the optional topicMapping
     const finalOutput: AnalyzeTestPaperOutput = {
        summary: output.summary,
        bloomsLevel: output.bloomsLevel,
        totalMarks: output.totalMarks,
        mcqQuestions: output.mcqQuestions || [],
        topicMapping: output.topicMapping || undefined,
     };


    return finalOutput;
});

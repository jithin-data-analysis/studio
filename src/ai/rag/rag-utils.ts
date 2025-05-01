// src/ai/rag/rag-utils.ts
'use server';
/**
 * @fileOverview Utilities for Retrieval-Augmented Generation (RAG)
 * using Langchain, Google Embeddings, and ChromaDB.
 */

import {GoogleGenerativeAiEmbeddings} from '@langchain/google-genai';
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// Changed from fs/pdf to web/pdf and renamed to WebPDFLoader
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import type { Document } from "@langchain/core/documents";
import fs from 'fs/promises'; // Import fs promises for checking directory existence
import path from 'path';

const MODEL_NAME = 'models/embedding-001'; // Recommended model by Google
const CHROMA_DB_PATH = path.resolve(process.cwd(), ".chromadb"); // Store DB in project root
const CHROMA_COLLECTION_NAME = "syllabus_collection"; // Name for the Chroma collection

/**
 * Converts a data URI string to a Blob object.
 * @param dataURI The data URI string (e.g., "data:application/pdf;base64,...").
 * @returns A promise that resolves to a Blob object representing the file data.
 */
export async function dataUriToBlob(dataURI: string): Promise<Blob> { // Made async
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

/**
 * Loads and processes a document from a Blob into text chunks using WebPDFLoader.
 * @param blob The Blob object containing the document data (e.g., PDF).
 * @returns A promise that resolves to an array of Document chunks.
 */
export async function processDocumentFromBlob(blob: Blob): Promise<Document[]> {
  // Use WebPDFLoader which accepts a Blob directly
  const loader = new WebPDFLoader(blob);

  try {
    const documents = await loader.load();
    if (!documents || documents.length === 0) {
        console.warn("WebPDFLoader returned no documents.");
        return [];
    }
    // Adjust chunk size and overlap as needed
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 150 });
    const chunks = await textSplitter.splitDocuments(documents);
    console.log(`Split document into ${chunks.length} chunks.`);
    return chunks;
  } catch (error) {
     console.error("Error loading or splitting document with WebPDFLoader:", error);
     throw new Error(`Failed to process document: ${error instanceof Error ? error.message : String(error)}`);
  }
}


/**
 * Retrieves the Google Generative AI Embeddings instance.
 * Requires GOOGLE_GENAI_API_KEY environment variable.
 * @returns A GoogleGenerativeAiEmbeddings instance.
 */
export async function getEmbeddings(): Promise<GoogleGenerativeAiEmbeddings> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GENAI_API_KEY environment variable.');
  }
  return new GoogleGenerativeAiEmbeddings({
    apiKey,
    model: MODEL_NAME,
    // taskType: TaskType.RETRIEVAL_DOCUMENT, // Optional: Specify task type if needed
  });
}


/**
 * Initializes the Chroma vector store instance.
 * @param embeddings The embeddings model instance.
 * @returns A Chroma vector store instance.
 */
async function getVectorStoreInstance(embeddings: GoogleGenerativeAiEmbeddings): Promise<Chroma> {
    // Ensure the directory exists before trying to initialize Chroma
    try {
        await fs.mkdir(CHROMA_DB_PATH, { recursive: true });
    } catch (err) {
        // Ignore error if directory already exists
        if (err instanceof Error && 'code' in err && err.code !== 'EEXIST') {
             console.error(`Could not create Chroma directory: ${CHROMA_DB_PATH}`, err);
             throw err; // Re-throw unexpected errors
        }
        // console.warn(`Chroma directory already exists or could not be created: ${CHROMA_DB_PATH}`);
    }

     try {
         const vectorStore = new Chroma(embeddings, {
             collectionName: CHROMA_COLLECTION_NAME,
             url: `file://${CHROMA_DB_PATH}`, // Use file protocol for local path
         });
         return vectorStore;
     } catch (initError) {
         console.error("Error initializing Chroma:", initError);
         throw new Error("Failed to initialize vector store.");
     }
}

/**
 * Ensures the vector store exists, adds new documents if provided, and persists.
 * Loads existing collection if documents are not provided.
 * @param embeddings The embeddings model instance.
 * @param documents Optional array of documents to add to the store.
 * @returns A promise that resolves to the Chroma vector store instance.
 */
export async function ensureVectorStore(
  embeddings: GoogleGenerativeAiEmbeddings,
  documents?: Document[]
): Promise<Chroma> {
    const vectorStore = await getVectorStoreInstance(embeddings);

    if (documents && documents.length > 0) {
        try {
            console.log(`Adding ${documents.length} documents to Chroma collection: ${CHROMA_COLLECTION_NAME}`);
            // Split adding documents into smaller batches if necessary
            const batchSize = 100; // Example batch size
            for (let i = 0; i < documents.length; i += batchSize) {
                const batch = documents.slice(i, i + batchSize);
                await vectorStore.addDocuments(batch);
                console.log(`Added batch ${Math.floor(i / batchSize) + 1}`);
                 // Optional delay between batches if rate limiting is an issue
                 // await new Promise(resolve => setTimeout(resolve, 500));
            }
            console.log("Documents added successfully.");
            // Persistence is typically handled by Chroma when using a URL/path.
            // Check Chroma documentation for specific persistence guarantees/methods if needed.
             // await vectorStore.persist(); // Explicit persist call if required by your Chroma version/setup
        } catch (error) {
            console.error("Error adding documents to Chroma:", error);
            throw new Error("Failed to add documents to vector store.");
        }
    } else {
        // console.log(`Accessing existing Chroma collection: ${CHROMA_COLLECTION_NAME}`);
         // Verify collection exists or load it - Chroma might handle this implicitly
         // You might need to add checks or initialization logic depending on the Chroma client version
         try {
             // Attempt a simple operation to ensure connection/collection exists
             const count = await vectorStore.collection?.count();
             console.log(`Collection '${CHROMA_COLLECTION_NAME}' contains ${count} documents.`);
         } catch (loadError) {
             console.warn(`Could not verify existing collection (might be empty or error during check): ${loadError}`);
             // Depending on requirements, you might want to throw an error if loading fails
         }
    }

    return vectorStore;
}


/**
 * Retrieves relevant documents from the Chroma vector store based on a query.
 * @param query The query string.
 * @param vectorStore The Chroma vector store instance.
 * @param numDocuments The number of relevant documents to retrieve. Defaults to 5.
 * @returns A promise that resolves to an array of relevant Document objects.
 */
export async function retrieveRelevantDocuments(
    query: string,
    vectorStore: Chroma,
    numDocuments: number = 3 // Reduced default for potentially smaller context windows
): Promise<Document[]> {
    console.log(`Retrieving ${numDocuments} documents for query (first 50 chars): "${query.substring(0, 50)}..."`);
    try {
         // Ensure the collection is loaded/exists before searching
         if (!vectorStore.collection) {
            console.warn("Chroma collection is not available for searching.");
            // Attempt to re-initialize or load if necessary, or throw
            return []; // Return empty if collection isn't ready
         }
        const results = await vectorStore.similaritySearch(query, numDocuments);
        console.log(`Retrieved ${results.length} documents.`);
        return results;
    } catch (error) {
        console.error("Error during similarity search:", error);
        // Consider returning empty array or re-throwing depending on desired behavior
        // throw new Error("Failed to retrieve relevant documents.");
        return []; // Return empty on error for now
    }
}

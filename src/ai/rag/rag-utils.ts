'use server';
/**
 * @fileOverview Utilities for Retrieval-Augmented Generation (RAG)
 * using Langchain, Google Embeddings, and ChromaDB.
 */

import {GoogleGenerativeAIEmbeddings} from '@langchain/google-genai'; // Corrected import name
import { Chroma } from "@langchain/community/vectorstores/chroma"; // Use Langchain's Chroma wrapper
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// Changed from fs/pdf to web/pdf and renamed to WebPDFLoader
import { WebPDFLoader } from "langchain/document_loaders/web/pdf"; // Corrected import path
import type { Document } from "@langchain/core/documents";
import type { Embeddings } from "@langchain/core/embeddings";
import fs from 'fs/promises'; // Import fs promises for checking directory existence
import path from 'path';

const MODEL_NAME = 'models/embedding-001'; // Recommended model by Google
const CHROMA_DB_PATH = path.resolve(process.cwd(), ".chromadb"); // Store DB in project root
const CHROMA_COLLECTION_NAME = "syllabus_collection"; // Name for the Chroma collection

/**
 * Converts a data URI string to a Blob object.
 * Made async to comply with Server Action file requirements.
 * @param dataURI The data URI string (e.g., "data:application/pdf;base64,...").
 * @returns A promise that resolves to a Blob object representing the file data.
 */
export async function dataUriToBlob(dataURI: string): Promise<Blob> {
  // This function runs potentially on the client and server, atob is fine here.
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
 * Made async to comply with Server Action file requirements.
 * @returns A promise that resolves to a GoogleGenerativeAIEmbeddings instance.
 */
export async function getEmbeddings(): Promise<GoogleGenerativeAIEmbeddings> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GENAI_API_KEY environment variable.');
  }
  return new GoogleGenerativeAIEmbeddings({ // Corrected class name
    apiKey,
    model: MODEL_NAME,
    // taskType: TaskType.RETRIEVAL_DOCUMENT, // Optional: Specify task type if needed
  });
}


/**
 * Initializes or loads the Chroma vector store using Langchain wrapper.
 * Creates the directory if it doesn't exist.
 * @param embeddings The embeddings model instance.
 * @returns A promise that resolves to the Chroma vector store instance.
 */
async function initializeVectorStore(embeddings: Embeddings): Promise<Chroma> {
    // Ensure the directory exists before trying to initialize Chroma
    try {
        await fs.mkdir(CHROMA_DB_PATH, { recursive: true });
        console.log(`Ensured Chroma directory exists: ${CHROMA_DB_PATH}`);
    } catch (err) {
        if (err instanceof Error && 'code' in err && err.code !== 'EEXIST') {
             console.error(`Could not create Chroma directory: ${CHROMA_DB_PATH}`, err);
             throw err;
        }
    }

     try {
         // Initialize Chroma using Langchain's wrapper
         // It handles loading the collection if it exists or creating if not.
         const vectorStore = new Chroma(embeddings, {
             collectionName: CHROMA_COLLECTION_NAME,
             url: `file://${CHROMA_DB_PATH}`, // Langchain Chroma uses 'url' for local path with file:// protocol
             // collectionMetadata: { "hnsw:space": "cosine" }, // Optional: configure space
         });
          console.log(`Langchain Chroma vector store initialized for collection: ${CHROMA_COLLECTION_NAME}`);
         return vectorStore;
     } catch (initError) {
         console.error("Error initializing Langchain Chroma vector store:", initError);
         throw new Error("Failed to initialize vector store.");
     }
}


/**
 * Ensures the vector store exists and adds new documents if provided using Langchain's Chroma.
 * @param embeddings The embeddings model instance.
 * @param documents Optional array of documents to add to the store.
 * @returns A promise that resolves to the Chroma vector store instance.
 */
export async function ensureVectorStore(
  embeddings: Embeddings,
  documents?: Document[]
): Promise<Chroma> {
    const vectorStore = await initializeVectorStore(embeddings);

    if (documents && documents.length > 0) {
        try {
            console.log(`Adding ${documents.length} documents to Chroma collection via Langchain: ${CHROMA_COLLECTION_NAME}`);
            // Use Langchain's addDocuments method
            await vectorStore.addDocuments(documents);
            console.log("Documents added successfully via Langchain.");
             // Persistence is handled implicitly by Chroma when initialized with a path/url
        } catch (error) {
            console.error("Error adding documents to Chroma via Langchain:", error);
            throw new Error("Failed to add documents to vector store via Langchain.");
        }
    } else {
        console.log(`Accessing existing Chroma collection via Langchain: ${CHROMA_COLLECTION_NAME}`);
         // Verification happens during initialization with Langchain's Chroma class
    }

    return vectorStore;
}


/**
 * Retrieves relevant documents from the Chroma vector store based on a query using Langchain.
 * @param query The query string.
 * @param vectorStore The Langchain Chroma vector store instance.
 * @param numDocuments The number of relevant documents to retrieve. Defaults to 3.
 * @returns A promise that resolves to an array of relevant Document objects.
 */
export async function retrieveRelevantDocuments(
    query: string,
    vectorStore: Chroma,
    numDocuments: number = 3
): Promise<Document[]> {
    console.log(`Retrieving ${numDocuments} documents via Langchain for query (first 50 chars): "${query.substring(0, 50)}..."`);
    try {
        // Use Langchain's similaritySearch method
        const results = await vectorStore.similaritySearch(query, numDocuments);
        console.log(`Retrieved ${results.length} documents via Langchain.`);
        return results;
    } catch (error) {
        console.error("Error during similarity search via Langchain:", error);
        return []; // Return empty on error
    }
}

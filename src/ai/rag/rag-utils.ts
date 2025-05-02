'use server';
/**
 * @fileOverview Utilities for Retrieval-Augmented Generation (RAG)
 * using Langchain, Google Embeddings, and ChromaDB.
 */

import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import type { Document } from "@langchain/core/documents";
import type { Embeddings } from "@langchain/core/embeddings";
import fs from 'fs/promises';
import path from 'path';

const MODEL_NAME = 'models/embedding-001';
// Allow custom path through environment variable with fallback
const CHROMA_DB_PATH = path.resolve(
  process.env.CHROMA_DB_PATH || path.join(process.cwd(), ".chromadb")
);
const CHROMA_COLLECTION_NAME = "syllabus_collection";

/**
 * Converts a data URI string to a Blob object.
 * Made async to comply with Server Action file requirements.
 * @param dataURI The data URI string (e.g., "data:application/pdf;base64,...").
 * @returns A promise that resolves to a Blob object representing the file data.
 */
export async function dataUriToBlob(dataURI: string): Promise<Blob> {
  if (!dataURI || !dataURI.includes(',')) {
    throw new Error('Invalid data URI format');
  }

  try {
    // Use Buffer in Node.js environment instead of atob
    const byteString = Buffer.from(dataURI.split(',')[1], 'base64').toString('binary');
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  } catch (error) {
    console.error('Error converting data URI to Blob:', error);
    throw new Error(`Failed to convert data URI: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Loads and processes a document from a Blob into text chunks using WebPDFLoader.
 * @param blob The Blob object containing the document data (e.g., PDF).
 * @returns A promise that resolves to an array of Document chunks.
 */
export async function processDocumentFromBlob(blob: Blob): Promise<Document[]> {
  if (!blob) {
    throw new Error("Received empty or null blob");
  }

  if (blob.type !== 'application/pdf') {
    console.warn(`Expected PDF but received ${blob.type}. Attempting to process anyway.`);
    // Consider adding more robust handling for non-PDF types if necessary
  }

  // Use WebPDFLoader which accepts a Blob directly
  const loader = new WebPDFLoader(blob);

  try {
    const documents = await loader.load();
    if (!documents || documents.length === 0) {
      console.warn("WebPDFLoader returned no documents.");
      return [];
    }
    // Adjust chunk size and overlap as needed
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 150
    });
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
    console.error('Missing GOOGLE_GENAI_API_KEY environment variable.');
    throw new Error('Google Generative AI API key is required. Please set GOOGLE_GENAI_API_KEY environment variable.');
  }

  try {
    return new GoogleGenerativeAIEmbeddings({
      apiKey,
      model: MODEL_NAME,
    });
  } catch (error) {
    console.error('Error initializing Google Generative AI Embeddings:', error);
    throw new Error(`Failed to initialize embeddings: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Verifies ChromaDB access by checking if the directory exists and is accessible.
 * Only relevant when using a local path.
 * @returns A promise that resolves to a boolean indicating whether ChromaDB path exists.
 */
async function verifyChromaDbPathExists(): Promise<boolean> {
  // Only check local path if not using a server URL
  if (process.env.CHROMA_SERVER_URL) {
    return true; // Assume server URL is valid, access check happens on connection
  }
  try {
    // Check if Chroma directory exists
    await fs.access(CHROMA_DB_PATH);
    console.log(`ChromaDB directory found: ${CHROMA_DB_PATH}`);
    return true;
  } catch (error) {
    // Path doesn't exist
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.log(`ChromaDB directory not found: ${CHROMA_DB_PATH}`);
      return false;
    }
    // Other access error
    console.error(`Error accessing ChromaDB path: ${CHROMA_DB_PATH}`, error);
    throw new Error(`Cannot access ChromaDB path: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Initializes or loads the Chroma vector store using Langchain wrapper.
 * Creates the directory if it doesn't exist when using a local path.
 * @param embeddings The embeddings model instance.
 * @returns A promise that resolves to the Chroma vector store instance.
 */
async function initializeVectorStore(embeddings: Embeddings): Promise<Chroma> {
  const useServerUrl = !!process.env.CHROMA_SERVER_URL;
  const configOptions = useServerUrl
    ? { url: process.env.CHROMA_SERVER_URL }
    : { path: CHROMA_DB_PATH };

  // Create directory only if using local path and it doesn't exist
  if (!useServerUrl) {
    const pathExists = await verifyChromaDbPathExists();
    if (!pathExists) {
      console.log(`ChromaDB directory does not exist, creating: ${CHROMA_DB_PATH}`);
      try {
        await fs.mkdir(CHROMA_DB_PATH, { recursive: true });
        console.log(`Created Chroma directory: ${CHROMA_DB_PATH}`);
      } catch (err) {
        console.error(`Could not create Chroma directory: ${CHROMA_DB_PATH}`, err);
        throw new Error(`Failed to create ChromaDB directory: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  try {
    // Initialize Chroma using Langchain's wrapper
    const vectorStore = new Chroma(embeddings, {
      collectionName: CHROMA_COLLECTION_NAME,
      ...configOptions, // Use path or URL based on environment
      // collectionMetadata: { "hnsw:space": "cosine" }, // Keep or remove based on need
    });
    console.log(`Langchain Chroma vector store initialized for collection: ${CHROMA_COLLECTION_NAME} using ${useServerUrl ? 'server URL' : 'local path'}`);
    return vectorStore;
  } catch (initError) {
    console.error("Error initializing Langchain Chroma vector store:", initError);
    throw new Error(`Failed to initialize vector store: ${initError instanceof Error ? initError.message : String(initError)}`);
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
  if (documents && !Array.isArray(documents)) {
    throw new TypeError("Expected documents to be an array of Document objects");
  }

  const vectorStore = await initializeVectorStore(embeddings);

  if (documents && documents.length > 0) {
    try {
      console.log(`Adding ${documents.length} documents to Chroma collection via Langchain: ${CHROMA_COLLECTION_NAME}`);
      // Use Langchain's addDocuments method
      await vectorStore.addDocuments(documents);
      console.log("Documents added successfully via Langchain.");
      // Chroma library might handle persistence differently depending on setup (local vs server)
      // For local path persistence, it should handle it automatically.
    } catch (error) {
      console.error("Error adding documents to Chroma via Langchain:", error);
      throw new Error(`Failed to add documents to vector store: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    console.log(`Accessed existing Chroma collection via Langchain: ${CHROMA_COLLECTION_NAME}`);
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
  if (!query || typeof query !== 'string') {
    console.warn('Empty or invalid query string provided');
    return [];
  }

  console.log(`Retrieving ${numDocuments} documents via Langchain for query (first 50 chars): "${query.substring(0, 50)}..."`);
  try {
    // Use Langchain's similaritySearch method
    const results = await vectorStore.similaritySearch(query, numDocuments);
    console.log(`Retrieved ${results.length} documents via Langchain.`);
    return results;
  } catch (error) {
    console.error("Error during similarity search via Langchain:", error);
    // Consider specific error handling (e.g., Chroma connection issues)
    return []; // Return empty on error
  }
}

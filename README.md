# Samiksha.AI - GenAI School Progress & Analytics Platform

This is a Next.js application designed as an AI-powered platform to help manage school structures, track student progress, and gain AI-driven insights.

## Key Features

*   **Admin Configuration**: Manage classes, sections, students, subjects, and co-curricular activities.
*   **Teacher Dashboard**: Upload assessments, enter marks, view performance insights, and generate reports.
*   **AI Insights**: Utilizes AI agents (powered by Google Gemini via Genkit) to:
    *   Analyze uploaded test papers (summary, Bloom's level, marks, MCQs).
    *   Generate personalized student insights (trends, weaknesses, tips, predictions) based on performance data.
    *   Correlate co-curricular activities with academic performance.

## Is this an Agentic Application?

This application incorporates AI agents for specific analytical tasks. For example, when a teacher uploads a test paper or saves marks, AI flows (built with Genkit) are triggered to call the Gemini model for analysis and insight generation.

However, these agents primarily function as sophisticated analysis tools that respond to specific user actions or scheduled triggers. They provide insights and suggestions *to the users* (teachers, administrators). The application does **not** currently feature agents that act autonomously to make decisions or take actions within the school environment based on their analysis (e.g., automatically assigning remedial work).

Therefore, it's best described as an **AI-augmented application with agentic components** rather than a fully autonomous agentic system. The AI assists humans by processing information and generating insights, but the final decisions and actions are taken by the users.

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Set up environment variables**:
    Create a `.env` file in the root directory and add your Google AI API key:
    ```env
    GOOGLE_GENAI_API_KEY=YOUR_API_KEY_HERE
    ```
3.  **Run the Genkit development server** (for AI flow testing/debugging, in a separate terminal):
    ```bash
    npm run genkit:watch
    ```
4.  **Run the Next.js development server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

## Project Structure

*   `src/app/`: Next.js App Router pages (Admin, Teacher dashboards).
*   `src/components/`: Reusable UI components (mostly ShadCN).
*   `src/ai/`: Genkit configuration and AI flows.
    *   `ai-instance.ts`: Configures the Genkit instance and Google AI plugin.
    *   `dev.ts`: Entry point for the Genkit development server.
    *   `flows/`: Contains the specific AI agent logic (e.g., `analyze-test-paper.ts`).
    *   `rag/`: Contains Retrieval-Augmented Generation utilities.
*   `src/lib/`: Utility functions.
*   `src/hooks/`: Custom React hooks.
*   `src/services/`: Backend service interactions (e.g., Supabase).
*   `src/types/`: TypeScript type definitions.

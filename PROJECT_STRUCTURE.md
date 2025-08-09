# Mallu Slangify - Project Structure Overview

This document provides a high-level overview of the project's architecture. The application is built with Next.js and is organized into three main layers: Frontend (UI), Server Actions (Bridge), and AI Flows (Backend Logic).

---

## 1. Frontend (The User Interface)

This layer is responsible for everything the user sees and interacts with in the browser. It's built with React and ShadCN UI components.

-   **`src/app/page.tsx`**
    -   **Purpose:** The main entry point for the application page.
    -   **Contains:** The overall page layout, including the header and the main content area where the translator is rendered.

-   **`src/components/dialect-translator.tsx`**
    -   **Purpose:** **This is the core UI component.** It manages all user interactions for the translation feature.
    -   **Contains:**
        -   The form for entering the Manglish sentence and selecting slang intensity.
        -   The "Convert Dialects" button and its `onSubmit` handler.
        -   The logic to display the 14 translated dialect cards.
        -   The interactive Kerala map.
        -   The logic for the "Listen," "Copy," and "Translate Back" buttons on each card.
        -   State management for loading indicators, analysis results, and cultural insights.

-   **`src/components/kerala-map.tsx`**
    -   **Purpose:** A visual, interactive map of Kerala's districts.
    -   **Functionality:** Highlights a district when it's selected and allows clicking on districts to update the UI.

-   **`src/components/ui/`**
    -   **Purpose:** Contains all the reusable, low-level UI building blocks (e.g., `Button.tsx`, `Card.tsx`, `Slider.tsx`). These are standard ShadCN components that provide the application's look and feel.

---

## 2. Server Actions (The Bridge)

This layer acts as a secure bridge between the frontend UI and the backend AI flows. It ensures that your API key and backend logic are never exposed to the client's browser.

-   **`src/app/actions.ts`**
    -   **Purpose:** To define asynchronous functions that can be called directly from the frontend components but run exclusively on the server.
    -   **Contains functions like:**
        -   `getDialectTranslations()`: Called when the user clicks "Convert." It invokes the dialect translation AI flow.
        -   `textToSpeechApi()`: Called by the "Listen" button. It invokes the text-to-speech AI flow.
        -   `getCulturalInsightsApi()`: Fetches cultural information for a selected district.

---

## 3. AI Flows (The Backend Logic)

This is the "brain" of the application where all the AI-powered processing happens. These flows are built with Genkit and are responsible for communicating with the Google AI models.

-   **`src/ai/genkit.ts`**
    -   **Purpose:** Initializes and configures the Genkit instance, specifying which plugins (like `googleAI`) to use.

-   **`src/ai/flows/dialect-translation.ts`**
    -   **Purpose:** Translates a Manglish sentence into 14 different Malayalam dialects.
    -   **How it Works:** Defines a detailed prompt that instructs the Gemini model on how to perform the translation accurately, including rules for slang intensity and meaning preservation.

-   **`src/ai/flows/text-to-speech.ts`**
    -   **Purpose:** Converts a string of text into playable audio.
    -   **How it Works:** Calls the `gemini-2.5-flash-preview-tts` model and requests the audio directly in `MP3` format, which is then sent back to the frontend for playback.

-   **Other AI Flows (`cultural-insights.ts`, `sentence-analysis.ts`, `reverse-translation.ts`)**
    -   **Purpose:** These files power the other AI features of the application, such as analyzing the input text, providing cultural facts, and translating slang back to standard Malayalam. Each file contains a specific prompt tailored to its task.

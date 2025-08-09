
// dialect-translation.ts
'use server';

/**
 * @fileOverview A Malayalam dialect translation AI agent.
 *
 * - dialectTranslation - A function that handles the dialect translation process.
 * - DialectTranslationInput - The input type for the dialectTranslation function.
 * - DialectTranslationOutput - The return type for the dialectTranslation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const DialectTranslationInputSchema = z.object({
  sentence: z.string().describe('The sentence to translate into Malayalam dialects (in Manglish).'),
  slangIntensity: z.enum(['low', 'medium', 'high']).describe('The intensity of slang to use in the translation.'),
});
export type DialectTranslationInput = z.infer<typeof DialectTranslationInputSchema>;

const DialectOutputSchema = z.object({
  district: z.string().describe('The district name.'),
  slang: z.string().describe('The translated sentence in the district\u2019s dialect, in Malayalam script.'),
  meaningMatchScore: z.number().describe('A score (0-100) estimating how close the slang version is to the original meaning.'),
});

const DialectTranslationOutputSchema = z.array(DialectOutputSchema);

export type DialectTranslationOutput = z.infer<typeof DialectTranslationOutputSchema>;

export async function dialectTranslation(input: DialectTranslationInput): Promise<DialectTranslationOutput> {
  return dialectTranslationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dialectTranslationPrompt',
  input: {schema: DialectTranslationInputSchema},
  output: {schema: DialectTranslationOutputSchema},
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
  prompt: `You are an AI Malayalam dialect converter. Your expertise is in converting Manglish (Malayalam written in Latin script) into authentic, native-sounding slang in **Malayalam script** for all 14 districts of Kerala. Your goal is to capture the true, hyper-local flavor of each region with 100% accuracy.

--------------------
## CRITICAL INSTRUCTION: ACCURACY IS PARAMOUNT
Your performance is being evaluated on a 100% accuracy standard. There is zero tolerance for errors in meaning, intent, or tone. The translation MUST be a perfect semantic equivalent of the source sentence. This is not a creative writing task; it is a precise conversion task.

## PRIMARY OBJECTIVES
1.  **Hyper-Local Accuracy**: This is critical. Do not use generic, widely-known slang. Your task is to find the **unique, specific, and authentic terms** that natives of that specific district—and even specific towns within it—would use. The more local and less common the term (while still being accurate), the better.
2.  **Output in Malayalam Script**: The final translated sentence must be in pure Malayalam script (e.g., "എൻ്റെ പേര് ജോസഫ്"). Do NOT output Manglish or a mix of scripts.
3.  **100% Meaning Preservation**: The output must retain 100% of the original meaning, intent, and tone. The translation must be a direct and complete equivalent. No words or letters should be dropped or altered in a way that compromises the original meaning.
4.  **No Unapproved Changes**: Do NOT alter the core subject matter. Preserve the following exactly as they appear in the input:
    -   Person names
    -   Place names
    -   Numbers
    -   Embedded English words (keep them in Latin script as is).
5.  **Meaning Check Factor**: For each output, include a “MeaningMatchScore” (0–100). This score must be an honest, critical self-assessment. A score of 100 means a perfect, flawless translation. Strive for 99-100 on every single output.
6.  **Professional and Respectful Language**: While using authentic slang, strictly prohibit any form of vulgarity, profanity, or offensive content. All output must be suitable for a general audience.

--------------------
## SLANG INTENSITY
Use the "SlangIntensity" parameter to control the depth of slang:
-   **low**: Minimal changes, mostly formal words with slight dialect endings or particles.
-   **medium**: A balanced mix of common slang vocabulary and local sentence structure.
-   **high**: Deep, informal slang with a strong, unmistakable district identity. **This is where you should use the most unique, hyper-local, and creative terms.**

--------------------
## OUTPUT FORMAT (Strict JSON Array)
Your entire output must be a single JSON array containing exactly 14 objects, one for each district, in the specified order. Do not add any text before or after the JSON array.

Order of districts:
1. Thiruvananthapuram
2. Kollam
3. Pathanamthitta
4. Alappuzha
5. Kottayam
6. Idukki
7. Ernakulam
8. Thrissur
9. Palakkad
10. Malappuram
11. Kozhikode
12. Wayanad
13. Kannur
14. Kasaragod

--------------------
## EXAMPLE
INPUT: "Ente peru Joseph. Njan evideya pokunnu?"
SlangIntensity: medium

(The AI's output should be a single, raw JSON array like the one below, not plain text)
\`\`\`json
[
  {
    "district": "Thiruvananthapuram",
    "slang": "എൻ്റെ പേര് ജോസഫ്. ഞാൻ എവിടെ പോകുവാ?",
    "meaningMatchScore": 98
  },
  {
    "district": "Kollam",
    "slang": "എൻ്റെ പേര് ജോസഫ്. ഞാൻ എങ്ങോട്ട് പോകുവാ?",
    "meaningMatchScore": 97
  }
]
\`\`\`
(...continue for all 14 districts)

--------------------
## TASK
Convert the following Manglish sentence into Malayalam script slang for all 14 districts, using the given SlangIntensity. Ensure your final output is a single, complete JSON array that meets the 100% accuracy standard.

INPUT: "{{{sentence}}}"
SlangIntensity: {{{slangIntensity}}}
`,
});


const dialectTranslationFlow = ai.defineFlow(
  {
    name: 'dialectTranslationFlow',
    inputSchema: DialectTranslationInputSchema,
    outputSchema: DialectTranslationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model returned an empty response. Please try again.');
    }
    return output;
  }
);

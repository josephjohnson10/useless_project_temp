'use server';

/**
 * @fileOverview An AI agent for analyzing Malayalam sentences.
 *
 * - analyzeSentence - A function that handles the sentence analysis process.
 * - SentenceAnalysisInput - The input type for the analyzeSentence function.
 * - SentenceAnalysisOutput - The return type for the analyzeSentence function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const districtEnum = z.enum([
    'Thiruvananthapuram',
    'Kollam',
    'Pathanamthitta',
    'Alappuzha',
    'Kottayam',
    'Idukki',
    'Ernakulam',
    'Thrissur',
    'Palakkad',
    'Malappuram',
    'Kozhikode',
    'Wayanad',
    'Kannur',
    'Kasaragod',
    'Standard',
]);

const SentenceAnalysisInputSchema = z.object({
  sentence: z.string().describe('The sentence to analyze (in Manglish).'),
});
export type SentenceAnalysisInput = z.infer<typeof SentenceAnalysisInputSchema>;

const SentenceAnalysisOutputSchema = z.object({
  isStandard: z
    .boolean()
    .describe(
      'Whether the sentence is standard Manglish or contains dialect.'
    ),
  dialect: districtEnum.describe(
    'The detected dialect. "Standard" if no specific dialect is detected.'
  ),
  confidence: z
    .number()
    .describe(
      'A confidence score (0-100) for the detected dialect.'
    ),
});
export type SentenceAnalysisOutput = z.infer<typeof SentenceAnalysisOutputSchema>;

export async function analyzeSentence(input: SentenceAnalysisInput): Promise<SentenceAnalysisOutput> {
  return analyzeSentenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sentenceAnalysisPrompt',
  input: { schema: SentenceAnalysisInputSchema },
  output: { schema: SentenceAnalysisOutputSchema },
  prompt: `You are an AI expert in Malayalam dialects, specializing in Manglish (Malayalam written in Latin script). Your task is to analyze the input sentence and determine if it's standard Manglish or if it belongs to a specific regional dialect of Kerala.

  ## INSTRUCTIONS
  1.  **Analyze the Sentence**: Carefully examine the vocabulary, phrasing, and sentence structure.
  2.  **Identify Dialect**: Determine if the sentence uses slang or grammar specific to one of the 14 districts of Kerala.
  3.  **Determine "isStandard"**:
      - If the sentence is standard, formal, or bookish Manglish with no discernible dialect, set \`isStandard\` to \`true\`.
      - If it contains any regional slang, set \`isStandard\` to \`false\`.
  4.  **Set "dialect"**:
      - If \`isStandard\` is true, set \`dialect\` to "Standard".
      - If \`isStandard\` is false, set \`dialect\` to the name of the district it most closely matches.
  5.  **Set "confidence"**: Provide a confidence score from 0 to 100 for your dialect identification.

  ## EXAMPLE
  - Input: "Njan avide pokunju."
  - Output: \`{"isStandard": false, "dialect": "Thiruvananthapuram", "confidence": 95}\`

  - Input: "Njan avide pokunnu."
  - Output: \`{"isStandard": true, "dialect": "Standard", "confidence": 99}\`
  
  ## TASK
  Analyze the following sentence:
  
  INPUT: "{{{sentence}}}"
  `,
});

const analyzeSentenceFlow = ai.defineFlow(
  {
    name: 'analyzeSentenceFlow',
    inputSchema: SentenceAnalysisInputSchema,
    outputSchema: SentenceAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

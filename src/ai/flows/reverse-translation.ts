'use server';
/**
 * @fileOverview An AI agent for translating Malayalam slang back to standard Malayalam.
 *
 * - reverseTranslation - A function that handles the reverse translation process.
 * - ReverseTranslationInput - The input type for the reverseTranslation function.
 * - ReverseTranslationOutput - The return type for the reverseTranslation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ReverseTranslationInputSchema = z.object({
  slangSentence: z
    .string()
    .describe('The sentence in a specific Malayalam dialect (in Malayalam script).'),
  district: z.string().describe('The district the slang belongs to.'),
});
export type ReverseTranslationInput = z.infer<
  typeof ReverseTranslationInputSchema
>;

const ReverseTranslationOutputSchema = z.object({
  standardSentence: z
    .string()
    .describe('The sentence translated back to standard, formal Malayalam script.'),
});
export type ReverseTranslationOutput = z.infer<
  typeof ReverseTranslationOutputSchema
>;

export async function reverseTranslation(
  input: ReverseTranslationInput
): Promise<ReverseTranslationOutput> {
  return reverseTranslationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reverseTranslationPrompt',
  input: { schema: ReverseTranslationInputSchema },
  output: { schema: ReverseTranslationOutputSchema },
  prompt: `You are an AI expert in Malayalam dialects. Your task is to convert a sentence from a specific district's slang (in Malayalam script) back into standard, formal Malayalam script.

  ## INSTRUCTIONS
  1.  **Analyze the Input**: You will receive a sentence in a specific dialect (in Malayalam script) and the name of the district.
  2.  **Identify Slang**: Recognize the unique words, phrases, and grammar of the given district's slang.
  3.  **Convert to Standard Malayalam**: Translate the sentence into its equivalent in formal, "bookish" Malayalam in Malayalam script. The output should be something anyone from Kerala could understand, regardless of their native dialect.
  4.  **Preserve Meaning**: Ensure the original meaning, intent, and any proper nouns (names, places) are fully preserved.

  ## EXAMPLE
  - Input Sentence: "ഞാൻ അവിടെ പോകുവാ."
  - Input District: "Thiruvananthapuram"
  - Output: \`{"standardSentence": "ഞാൻ അവിടെ പോകുന്നു."}\`

  ## TASK
  Convert the following slang sentence from the given district back to standard Malayalam script.

  - Input Sentence: "{{{slangSentence}}}"
  - Input District: "{{{district}}}"
  `,
});

const reverseTranslationFlow = ai.defineFlow(
  {
    name: 'reverseTranslationFlow',
    inputSchema: ReverseTranslationInputSchema,
    outputSchema: ReverseTranslationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

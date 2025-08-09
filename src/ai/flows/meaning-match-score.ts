'use server';

/**
 * @fileOverview This file defines a Genkit flow for estimating the meaning match score
 * between an original sentence and its slang conversion.
 *
 * - meaningMatchScore - A function that estimates the meaning match score.
 * - MeaningMatchScoreInput - The input type for the meaningMatchScore function.
 * - MeaningMatchScoreOutput - The return type for the meaningMatchScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MeaningMatchScoreInputSchema = z.object({
  originalSentence: z
    .string()
    .describe('The original sentence in Malayalam (Manglish).'),
  convertedSentence: z
    .string()
    .describe('The converted sentence in Malayalam slang (Manglish).'),
  district: z.string().describe('The district for which the slang was generated.'),
});

export type MeaningMatchScoreInput = z.infer<typeof MeaningMatchScoreInputSchema>;

const MeaningMatchScoreOutputSchema = z.object({
  meaningMatchScore: z
    .number()
    .describe(
      'A score between 0 and 100 estimating how close the slang version is to the original meaning.'
    ),
});

export type MeaningMatchScoreOutput = z.infer<typeof MeaningMatchScoreOutputSchema>;

export async function meaningMatchScore(input: MeaningMatchScoreInput): Promise<MeaningMatchScoreOutput> {
  return meaningMatchScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'meaningMatchScorePrompt',
  input: {schema: MeaningMatchScoreInputSchema},
  output: {schema: MeaningMatchScoreOutputSchema},
  prompt: `You are an AI expert in Malayalam slang, tasked with evaluating the semantic similarity between two sentences.\n\n  You will receive an original sentence and a converted sentence (slang). Your job is to provide a "MeaningMatchScore" that indicates how well the converted sentence retains the meaning of the original sentence.\n\n  Consider nuances, idioms, and contextual relevance in your evaluation. Provide only a number between 0 and 100.
\n  Original Sentence: {{{originalSentence}}}\n  Converted Sentence: {{{convertedSentence}}}\n  District: {{{district}}}\n\n  MeaningMatchScore:`,
});

const meaningMatchScoreFlow = ai.defineFlow(
  {
    name: 'meaningMatchScoreFlow',
    inputSchema: MeaningMatchScoreInputSchema,
    outputSchema: MeaningMatchScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // The prompt returns just a number, so we need to parse it and return it in the correct format.
    return {meaningMatchScore: Number(output)};
  }
);

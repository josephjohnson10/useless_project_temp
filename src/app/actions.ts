'use server';

import { z } from 'zod';
import { dialectTranslation, DialectTranslationOutput } from '@/ai/flows/dialect-translation';
import { analyzeSentence, SentenceAnalysisInput, SentenceAnalysisOutput } from '@/ai/flows/sentence-analysis';
import { reverseTranslation, ReverseTranslationInput, ReverseTranslationOutput } from '@/ai/flows/reverse-translation';
import { getCulturalInsights, CulturalInsightInput, CulturalInsightOutput } from '@/ai/flows/cultural-insights';
import { textToSpeech, TextToSpeechInput, TextToSpeechOutput } from '@/ai/flows/text-to-speech';


const DialectTranslationInputSchema = z.object({
  sentence: z.string().describe('The sentence to translate into Malayalam dialects (in Manglish).'),
  slangIntensity: z.enum(['low', 'medium', 'high']).describe('The intensity of slang to use in the translation.'),
});

export type DialectTranslationServerInput = z.infer<typeof DialectTranslationInputSchema>;

export async function getDialectTranslations(input: DialectTranslationServerInput): Promise<DialectTranslationOutput> {
  const parsedInput = DialectTranslationInputSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new Error('Invalid input');
  }
  
  try {
    const result = await dialectTranslation(parsedInput.data);
    return result;
  } catch (error) {
    console.error('Error in dialect translation flow:', error);
    throw new Error('Failed to get dialect translations due to a server error.');
  }
}

const SentenceAnalysisRequestSchema = z.object({
  sentence: z.string().describe('The sentence to analyze (in Manglish).'),
});

export async function analyzeSentenceApi(input: SentenceAnalysisInput): Promise<SentenceAnalysisOutput> {
    const parsedInput = SentenceAnalysisRequestSchema.safeParse(input);
    if (!parsedInput.success) {
        throw new Error('Invalid input for sentence analysis');
    }

    try {
        const result = await analyzeSentence(parsedInput.data);
        return result;
    } catch(error) {
        console.error('Error in sentence analysis flow:', error);
        throw new Error('Failed to analyze sentence due to a server error.');
    }
}

const ReverseTranslationRequestSchema = z.object({
  slangSentence: z.string(),
  district: z.string(),
});

export async function reverseTranslateApi(input: ReverseTranslationInput): Promise<ReverseTranslationOutput> {
  const parsedInput = ReverseTranslationRequestSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new Error('Invalid input for reverse translation');
  }

  try {
    const result = await reverseTranslation(parsedInput.data);
    return result;
  } catch (error) {
    console.error('Error in reverse translation flow:', error);
    throw new Error('Failed to reverse translate due to a server error.');
  }
}

const CulturalInsightRequestSchema = z.object({
  district: z.string(),
});

export async function getCulturalInsightsApi(input: CulturalInsightInput): Promise<CulturalInsightOutput> {
  const parsedInput = CulturalInsightRequestSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new Error('Invalid input for cultural insights');
  }

  try {
    const result = await getCulturalInsights(parsedInput.data);
    return result;
  } catch (error) {
    console.error('Error in cultural insights flow:', error);
    throw new Error('Failed to get cultural insights due to a server error.');
  }
}

const TextToSpeechRequestSchema = z.object({
    text: z.string(),
});

export async function textToSpeechApi(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
    const parsedInput = TextToSpeechRequestSchema.safeParse(input);
    if (!parsedInput.success) {
        throw new Error('Invalid input for text-to-speech');
    }

    try {
        const result = await textToSpeech(parsedInput.data);
        return result;
    } catch (error) {
        console.error('Error in text-to-speech flow:', error);
        throw new Error('Failed to generate audio due to a server error.');
    }
}

'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/dialect-translation.ts';
import '@/ai/flows/meaning-match-score.ts';
import '@/ai/flows/sentence-analysis.ts';
import '@/ai/flows/reverse-translation.ts';
import '@/ai/flows/cultural-insights.ts';
import '@/ai/flows/text-to-speech.ts';

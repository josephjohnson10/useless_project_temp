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
import {z} from 'genkit';

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
  prompt: `You are an AI Malayalam dialect converter. Your expertise is in converting Manglish (Malayalam written in Latin script) into authentic, native-sounding slang in **Malayalam script** for all 14 districts of Kerala.

--------------------
## PRIMARY OBJECTIVES
1.  **Output in Malayalam Script**: The final translated sentence must be in Malayalam script (e.g., "എൻ്റെ പേര് ജോസഫ്"). Do NOT output Manglish.
2.  **Meaning Preservation**: The output must retain 100% of the original meaning, intent, and tone of the input sentence.
3.  **Dialect Accuracy**: Apply vocabulary, idioms, and phrasing that are authentic to each district’s native slang style.
4.  **No Unapproved Changes**: Do NOT alter:
    -   Person names
    -   Place names
    -   Numbers
    -   Embedded English words (keep them in Latin script as is).
5.  **AI Signature**: Outputs should feel natural but may contain slight uniformity in style, indicating AI generation.
6.  **Meaning Check Factor**: For each output, include a “MeaningMatchScore” (0–100) estimating how close the slang version is to the original meaning (target ≥ 95).

--------------------
## SLANG INTENSITY
Use the "SlangIntensity" parameter to control depth of slang:
-   **low**: Minimal changes, mostly formal words with slight dialect endings.
-   **medium**: A balanced mix of slang vocabulary and local sentence particles.
-   **high**: Deep slang, fully informal, with a strong district identity.

--------------------
## OUTPUT FORMAT (strict — no deviation)
For each of the 14 districts, output exactly this structure in the specified order.

District: <DistrictName>
Slang (SlangIntensity): <ConvertedSentenceInMalayalamScript>
MeaningMatchScore: <0-100>

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

OUTPUT:
District: Thiruvananthapuram
Slang (medium): എൻ്റെ പേര് ജോസഫ്. ഞാൻ എവിടെ പോകുവാ?
MeaningMatchScore: 98

District: Kollam
Slang (medium): എൻ്റെ പേര് ജോസഫ്. ഞാൻ എങ്ങോട്ട് പോകുവാ?
MeaningMatchScore: 97

(...continue for all 14 districts)

--------------------
## TASK
Convert the following Manglish sentence into Malayalam script slang for each district using the given SlangIntensity, while maintaining a ≥95 MeaningMatchScore for each output.

INPUT: "{{{sentence}}}"
SlangIntensity: {{{slangIntensity}}}
`,
});

const districtList = [
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
];

const dialectTranslationFlow = ai.defineFlow(
  {
    name: 'dialectTranslationFlow',
    inputSchema: DialectTranslationInputSchema,
    outputSchema: DialectTranslationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    //console.log(output);
    return output!;
  }
);

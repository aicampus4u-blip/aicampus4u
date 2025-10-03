'use server';

/**
 * @fileOverview An AI agent for general knowledge questions.
 *
 * - answerGeneralKnowledgeQuestion - A function that answers a wide range of questions.
 * - GeneralKnowledgeInput - The input type for the answerGeneralKnowledgeQuestion function.
 * - GeneralKnowledgeOutput - The return type for the answerGeneralKnowledgeQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneralKnowledgeInputSchema = z.object({
  query: z.string().describe('The question to answer.'),
});
export type GeneralKnowledgeInput = z.infer<typeof GeneralKnowledgeInputSchema>;

const GeneralKnowledgeOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type GeneralKnowledgeOutput = z.infer<typeof GeneralKnowledgeOutputSchema>;

export async function answerGeneralKnowledgeQuestion(input: GeneralKnowledgeInput): Promise<GeneralKnowledgeOutput> {
  return generalKnowledgeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generalKnowledgePrompt',
  input: {schema: GeneralKnowledgeInputSchema},
  output: {schema: GeneralKnowledgeOutputSchema},
  prompt: `You are a general knowledge AI bot. Answer the following question to the best of your ability.\n\nQuestion: {{{query}}}`,
});

const generalKnowledgeFlow = ai.defineFlow(
  {
    name: 'generalKnowledgeFlow',
    inputSchema: GeneralKnowledgeInputSchema,
    outputSchema: GeneralKnowledgeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

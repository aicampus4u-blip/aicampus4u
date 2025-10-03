'use server';

/**
 * @fileOverview AI flow for profession-specific AI bots.
 *
 * This file defines a Genkit flow for creating AI bots that specialize in specific careers.
 * - `professionAIBot`: The main function to interact with the flow.
 * - `ProfessionAIBotInput`: Input type for the flow.
 * - `ProfessionAIBotOutput`: Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProfessionAIBotInputSchema = z.object({
  profession: z
    .string()
    .describe('The specific profession this bot should specialize in (e.g., Doctor, Chef, Teacher).'),
  query: z.string().describe('The user query or question related to the profession.'),
});
export type ProfessionAIBotInput = z.infer<typeof ProfessionAIBotInputSchema>;

const ProfessionAIBotOutputSchema = z.object({
  response: z.string().describe('The AI bot’s response to the user query.'),
});
export type ProfessionAIBotOutput = z.infer<typeof ProfessionAIBotOutputSchema>;

export async function professionAIBot(input: ProfessionAIBotInput): Promise<ProfessionAIBotOutput> {
  return professionAIBotFlow(input);
}

const professionAIBotPrompt = ai.definePrompt({
  name: 'professionAIBotPrompt',
  input: {schema: ProfessionAIBotInputSchema},
  output: {schema: ProfessionAIBotOutputSchema},
  prompt: `You are a helpful AI assistant specializing in the profession of {{profession}}.

  Your goal is to provide informative and helpful answers related to this profession.
  If a question is outside of your expertise as it relates to the specified profession, politely redirect the user to create a more appropriate bot.

  User Query: {{{query}}}
  `, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  }
});

const professionAIBotFlow = ai.defineFlow(
  {
    name: 'professionAIBotFlow',
    inputSchema: ProfessionAIBotInputSchema,
    outputSchema: ProfessionAIBotOutputSchema,
  },
  async input => {
    const {output} = await professionAIBotPrompt(input);
    return output!;
  }
);

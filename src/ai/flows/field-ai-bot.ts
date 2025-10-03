'use server';

/**
 * @fileOverview Implements the Genkit flow for the FieldAIBot, allowing users to interact with specialized AI bots in various academic fields.
 *
 * - fieldAIBot - A function that handles the interaction with the field-specific AI bot.
 * - FieldAIBotInput - The input type for the fieldAIBot function.
 * - FieldAIBotOutput - The return type for the fieldAIBot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FieldAIBotInputSchema = z.object({
  field: z
    .string()
    .describe("The academic field of study (e.g., 'Medicine', 'Law', 'Engineering', 'Business')."),
  query: z.string().describe('The user query related to the specified field.'),
});
export type FieldAIBotInput = z.infer<typeof FieldAIBotInputSchema>;

const FieldAIBotOutputSchema = z.object({
  response: z.string().describe('The AI bot response to the user query.'),
});
export type FieldAIBotOutput = z.infer<typeof FieldAIBotOutputSchema>;

export async function fieldAIBot(input: FieldAIBotInput): Promise<FieldAIBotOutput> {
  return fieldAIBotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fieldAIBotPrompt',
  input: {schema: FieldAIBotInputSchema},
  output: {schema: FieldAIBotOutputSchema},
  prompt: `You are an AI bot specializing in the field of {{{field}}}.
  Your expertise lies within this academic domain, and you should provide accurate and helpful information related to it.

  If a question is outside your expertise, politely redirect the user to create a more appropriate bot or seek information from a different source.

  Now, respond to the following query:
  {{query}}`,
});

const fieldAIBotFlow = ai.defineFlow(
  {
    name: 'fieldAIBotFlow',
    inputSchema: FieldAIBotInputSchema,
    outputSchema: FieldAIBotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

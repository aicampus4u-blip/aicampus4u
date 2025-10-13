'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating custom AI bots.
 *
 * It allows users to tailor the bot's expertise to a specific academic field, profession or topic.
 * - createCustomBot - A function that creates a custom AI bot.
 * - CustomBotInput - The input type for the createCustomBot function.
 * - CustomBotOutput - The return type for the createCustomBot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomBotInputSchema = z.object({
  botType: z.enum(['Field', 'Profession', 'Topic']).describe('The type of the bot: Field, Profession or Topic.'),
  field: z.string().optional().describe('The academic field of study for the bot (e.g., Astrophysics). Required if botType is Field.'),
  profession: z.string().optional().describe('The career for the bot (e.g., Graphic Designer). Required if botType is Profession.'),
  topic: z.string().optional().describe('The topic for the bot (e.g., "The History of Rome"). Required if botType is Topic.'),
  description: z.string().describe('A detailed description of the bot and its intended purpose.'),
});

export type CustomBotInput = z.infer<typeof CustomBotInputSchema>;

const CustomBotOutputSchema = z.object({
  persona: z.string().describe('A detailed persona for the custom bot, including its scope of knowledge and rules for handling out-of-scope questions.'),
});

export type CustomBotOutput = z.infer<typeof CustomBotOutputSchema>;

export async function createCustomBot(input: CustomBotInput): Promise<CustomBotOutput> {
  return createCustomBotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customBotPrompt',
  input: {schema: CustomBotInputSchema},
  output: {schema: CustomBotOutputSchema},
//   prompt: `You are an AI expert specializing in creating AI bot personas.

// You will receive the bot type, field, profession, topic and a description of the bot.

// Based on this information, you will create a detailed persona for the bot, including its scope of knowledge and rules for handling out-of-scope questions. The AI should politely redirect users to create a more appropriate bot when a question is outside its expertise.

// Bot Type: {{{botType}}}
// {{#if field}}
// Field: {{{field}}}
// {{/if}}
// {{#if profession}}
// Profession: {{{profession}}}
// {{/if}}
// {{#if topic}}
// Topic: {{{topic}}}
// {{/if}}
// Description: {{{description}}}

// Persona:`,
prompt: `You are an AI expert who helps define the personality and behavior of custom AI assistants.

You will receive information about the bot type (Field, Profession, or Topic), along with optional details and a description of what the bot should do.

Your goal is to write a **short, practical persona** that describes how this bot should speak and what knowledge it focuses on.

Keep the tone friendly, conversational, and helpful — **avoid creating lesson plans, courses, or syllabus-like structures**. The persona should sound like a real human expert who gives clear, direct answers.

Bot Type: {{{botType}}}
{{#if field}}
Field: {{{field}}}
{{/if}}
{{#if profession}}
Profession: {{{profession}}}
{{/if}}
{{#if topic}}
Topic: {{{topic}}}
{{/if}}
Description: {{{description}}}

Persona:`,

});

// const createCustomBotFlow = ai.defineFlow(
//   {
//     name: 'createCustomBotFlow',
//     inputSchema: CustomBotInputSchema,
//     outputSchema: CustomBotOutputSchema,
//   },
//   async input => {
//     const {output} = await prompt(input);
//     return output!;
//   }
// );


//Keeps your actual Gemini logic intact.
//Adds a graceful fallback when the API limit is hit (no crash).
//Generates a mock persona dynamically so bots can still be created for testing. 
const createCustomBotFlow = ai.defineFlow(
  {
    name: 'createCustomBotFlow',
    inputSchema: CustomBotInputSchema,
    outputSchema: CustomBotOutputSchema,
  },
  async input => {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch (error) {
      console.error("Gemini API error, using fallback persona:", error);
      // fallback persona if API fails or quota is exceeded
      const context = input.field || input.profession || input.topic || 'General Knowledge';
      // return {
      //   persona: `This is a mock AI assistant specializing in ${context}. It can discuss topics within ${context}, provide helpful insights, and politely redirect users when questions go beyond its expertise.`,
      // };
      return {
  persona: `This is a friendly AI assistant specializing in ${context}. It gives clear, direct answers about ${context} and helps users learn or solve problems in a natural way.`,
};

    }
  }
);

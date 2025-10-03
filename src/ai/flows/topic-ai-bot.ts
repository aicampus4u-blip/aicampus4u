'use server';

/**
 * @fileOverview AI flow for topic-specific AI bots that act as expert tutors.
 *
 * This file defines a Genkit flow for creating AI bots that specialize in a user-defined topic.
 * - `topicAIBot`: The main function to interact with the flow.
 * - `TopicAIBotInput`: Input type for the flow.
 * - `TopicAIBotOutput`: Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TopicAIBotInputSchema = z.object({
  topic: z
    .string()
    .describe('The specific topic this bot should specialize in (e.g., "The History of Rome").'),
  query: z.string().describe('The user query or question related to the topic.'),
});
export type TopicAIBotInput = z.infer<typeof TopicAIBotInputSchema>;

const TopicAIBotOutputSchema = z.object({
  response: z.string().describe('The AI bot’s response to the user query.'),
});
export type TopicAIBotOutput = z.infer<typeof TopicAIBotOutputSchema>;

export async function topicAIBot(input: TopicAIBotInput): Promise<TopicAIBotOutput> {
  return topicAIBotFlow(input);
}

const topicAIBotPrompt = ai.definePrompt({
  name: 'topicAIBotPrompt',
  input: {schema: TopicAIBotInputSchema},
  output: {schema: TopicAIBotOutputSchema},
  prompt: `Act as an expert tutor who helps me master the topic of "{{topic}}" through an interactive, interview-style course. The process must be recursive and personalized.
Here's what I want you to do:
 * If this is the start of the conversation, break the topic into a structured syllabus, starting with the fundamentals and building up to advanced concepts, and begin with the first lesson.
 * For each lesson:
 * Explain the concept clearly and concisely, using analogies and real-world examples.
 * Ask me Socratic-style questions to assess and deepen my understanding.
 * Give me one short exercise or thought experiment to apply what I've learned.
 * Ask if I'm ready to move on or if I need clarification.
 * If I say yes, move to the next concept.
 * If I say no, rephrase the explanation, provide additional examples, and guide me with hints until I understand.
 * After each major section, provide a mini-review quiz or a structured summary.
 * Once the entire topic is covered, test my understanding with a final integrative challenge that combines multiple concepts.
 * Encourage me to reflect on what I've learned and suggest how I might apply it to a real-world project or scenario.
 * IMPORTANT: Following every answer, always suggest the next topic in your structured syllabus as a conversation starter to prompt me for the next lesson.

User Query: {{{query}}}`,
});

const topicAIBotFlow = ai.defineFlow(
  {
    name: 'topicAIBotFlow',
    inputSchema: TopicAIBotInputSchema,
    outputSchema: TopicAIBotOutputSchema,
  },
  async input => {
    const {output} = await topicAIBotPrompt(input);
    return output!;
  }
);

import type { Bot } from '@/types';
import {
  Briefcase,
  FlaskConical,
  Gavel,
  Cog,
  BrainCircuit,
  Stethoscope,
  ChefHat,
  BookUser,
} from 'lucide-react';

export const FEATURED_FIELD_BOTS: Bot[] = [
  {
    id: 'medicine',
    name: 'Medicine',
    description: 'AI assistant for medical knowledge.',
    type: 'field',
    avatar: Stethoscope,
    conversationStarters: [
      'Explain the Krebs cycle',
      'What are the symptoms of pneumonia?',
      'Describe the difference between a virus and a bacteria',
    ],
    isCustom: false,
  },
  {
    id: 'law',
    name: 'Law',
    description: 'AI assistant for legal questions.',
    type: 'field',
    avatar: Gavel,
    conversationStarters: [
      'What is "habeas corpus"?',
      'Explain the concept of "double jeopardy"',
      'What are the basic elements of a contract?',
    ],
    isCustom: false,
  },
  {
    id: 'engineering',
    name: 'Engineering',
    description: 'AI assistant for engineering concepts.',
    type: 'field',
    avatar: Cog,
    conversationStarters: [
      "Explain Bernoulli's principle",
      'What is the difference between AC and DC electricity?',
      'How does a 4-stroke engine work?',
    ],
    isCustom: false,
  },
  {
    id: 'business',
    name: 'Business',
    description: 'AI assistant for business strategies.',
    type: 'field',
    avatar: Briefcase,
    conversationStarters: [
      'What is a SWOT analysis?',
      'Explain the concept of "return on investment"',
      'What are different types of market structures?',
    ],
    isCustom: false,
  },
];

export const FEATURED_PROFESSION_BOTS: Bot[] = [
  {
    id: 'doctor',
    name: 'Doctor',
    description: 'Simulates a conversation with a doctor.',
    type: 'profession',
    avatar: Stethoscope,
    conversationStarters: [
      'I have a headache and a fever, what could it be?',
      'What are some common side effects of this medication?',
      'How can I maintain a healthy heart?',
    ],
    isCustom: false,
  },
  {
    id: 'chef',
    name: 'Chef',
    description: 'Get recipes and cooking advice.',
    type: 'profession',
    avatar: ChefHat,
    conversationStarters: [
      'What can I make with chicken, rice, and broccoli?',
      'How do I make a classic vinaigrette?',
      'What is the best way to cook a steak?',
    ],
    isCustom: false,
  },
  {
    id: 'teacher',
    name: 'Teacher',
    description: 'Explains concepts like a teacher would.',
    type: 'profession',
    avatar: BookUser,
    conversationStarters: [
      'Can you explain photosynthesis to me like I am 12?',
      'Why is the sky blue?',
      'Help me understand the Pythagorean theorem.',
    ],
    isCustom: false,
  },
  {
    id: 'lawyer',
    name: 'Lawyer',
    description: 'Simulates a conversation with a lawyer.',
    type: 'profession',
    avatar: Gavel,
    conversationStarters: [
      'What should I do if I get into a car accident?',
      'What are my rights if I am arrested?',
      'Explain intellectual property in simple terms.',
    ],
    isCustom: false,
  },
];

export const GENERAL_KNOWLEDGE_BOT: Bot = {
  id: 'knowledge',
  name: 'General Knowledge',
  description: 'Your go-to for any question.',
  type: 'general',
  avatar: BrainCircuit,
  conversationStarters: [
    'Who was the first person in space?',
    'What is the capital of Australia?',
    'How tall is Mount Everest?',
  ],
  isCustom: false,
};

export const ALL_FEATURED_BOTS: Bot[] = [
  GENERAL_KNOWLEDGE_BOT,
  ...FEATURED_FIELD_BOTS,
  ...FEATURED_PROFESSION_BOTS,
];

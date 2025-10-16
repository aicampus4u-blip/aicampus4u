# AI Campus 4U

This is a Next.js application built with Firebase Studio, featuring AI-powered educational bots and subscription management.

## Preview the Project

This project is configured with Firebase Studio's preview functionality. The preview is automatically enabled and will start when you open the workspace.

### In Firebase Studio (IDX)
- The preview will start automatically when you open the workspace
- Click the preview button in the toolbar to view the running application
- The application will be accessible at the provided preview URL

### Local Development
To run the project locally:

```bash
# Install dependencies
npm install

# Set up environment variables
# Copy .env.local.example to .env.local and fill in your Firebase credentials
cp .env.local.example .env.local

# Run the development server
npm run dev

# The app will be available at http://localhost:3000
```

**Note**: You need to configure Firebase credentials in `.env.local` for the application to work properly. See `.env.local.example` for the required environment variables.

## Project Structure

- `src/app/` - Next.js app directory with pages and API routes
- `src/components/` - React components including UI components and custom bots
- `src/hooks/` - Custom React hooks for auth, subscriptions, and bot management
- `src/lib/` - Utility libraries and Firebase configuration
- `src/ai/` - AI-powered features using Genkit

## Available Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the production application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run genkit:dev` - Start Genkit development server
- `npm run genkit:watch` - Start Genkit in watch mode

## Features

- 🤖 Custom AI bots with different types (Field, Profession, Topic)
- 🔐 Firebase Authentication
- 💳 Subscription management (Free and Pro plans)
- 📚 Educational content delivery
- 🎨 Modern UI with Radix UI and Tailwind CSS

## Getting Started

To get started with development, take a look at:
- `src/app/page.tsx` - Main application entry point
- `src/components/create-bot-dialog.tsx` - Custom bot creation interface
- `src/hooks/use-custom-bots.ts` - Bot management logic

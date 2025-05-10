# Project Brief: Reflectly

## Overview
Reflectly is a transcription and reflection application with OpenAI integration. The application helps users transcribe audio content, organize notes, manage projects, and interact with an AI assistant for insights and information processing.

## Core Requirements

1. **Audio Transcription**
   - Upload and process audio files
   - Convert speech to text with high accuracy
   - Support for multiple audio formats
   - Video transcription with synchronized playback

2. **Notes Management**
   - Create, edit, and organize notes
   - Categorize and tag notes
   - Search functionality
   - Rich text editing with TipTap

3. **Project Organization**
   - Group related content into projects
   - Track project progress with Kanban-style planner
   - Manage project resources
   - Visual whiteboard for diagrams and sketches

4. **AI Chat Integration**
   - Conversational interface with OpenAI
   - Context-aware responses
   - History tracking for conversations
   - Subscription-based usage limits

5. **User Authentication**
   - Secure sign-up and sign-in with Clerk
   - SSO with Google and other providers
   - User profile management
   - Row-level security with Supabase

6. **Subscription Management**
   - Free and premium plans
   - Usage tracking and limits
   - Payment processing with Lemon Squeezy
   - Subscription management UI

## Technical Implementation

- **Frontend**: Next.js 14/15 with App Router and React 18
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: PostgreSQL via Supabase
- **Authentication**: Clerk with Supabase integration
- **Payment**: Lemon Squeezy subscription management
- **AI**: OpenAI API (GPT-4) and Whisper
- **Media**: FFmpeg for video processing
- **Drawing**: Konva and React Konva

## Project Scope

The application should provide a seamless experience for users to record thoughts, transcribe meetings or lectures, organize information, and gain insights through AI assistance. The focus is on creating a tool that enhances productivity and knowledge management through advanced transcription and AI capabilities.

## Current Status

The application has several key features implemented:
- Functional authentication flow with SSO support
- Audio and video transcription with OpenAI Whisper
- Basic notes and projects management
- Kanban-style planner for organization
- Whiteboard for visual note-taking
- Subscription management with tiered plans
- AI chat integration with GPT-4

Recent improvements include:
- Optimized authentication middleware for SSO redirects
- Improved Supabase client architecture with singleton pattern
- Enhanced subscription management and usage tracking
- Production readiness with deployment checks and validations

## Success Criteria

- Accurate transcription of audio and video files
- Intuitive note-taking and organization
- Responsive and accessible user interface
- Secure data handling and user authentication
- Meaningful AI interactions that provide value to users
- Seamless subscription management
- Reliable performance across devices

## Next Steps

- Enhance security with improved environment variable handling
- Expand collaboration features for team usage
- Optimize mobile experience
- Implement advanced AI features for content analysis
- Add analytics dashboard for usage tracking 
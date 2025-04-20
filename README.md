# Reflectly - Video Transcription App

Reflectly is a modern web application that allows users to upload video files and generate interactive transcripts with speaker identification using OpenAI's Whisper API.

## Features

- **Video Upload**: Upload MP4 video files directly in the browser
- **AI Transcription**: Generate accurate transcripts using OpenAI's Whisper API
- **Speaker Identification**: Automatically label different speakers in the transcript
- **Interactive Navigation**: Click on any transcript segment to jump to that point in the video
- **Responsive Design**: Clean, modern UI that works on all device sizes
- **Project Management**: Manage projects with video uploads and transcripts
- **Digital Whiteboard**: Sketch ideas on a digital whiteboard with Excalidraw
- **Kanban-style Project Planner**: Plan projects using a kanban board
- **Authentication**: Email and Google login via Clerk
- **Persistent Storage**: Store data in Supabase

## Technology Stack

- **Frontend**: Next.js with React and TypeScript
- **UI Components**: shadcn UI library
- **Styling**: Tailwind CSS
- **Authentication**: Clerk for authentication
- **API Integration**: OpenAI Whisper for transcription
- **Database**: Supabase for persistent storage
- **Whiteboard**: Excalidraw integration for collaborative drawing

## Setup Instructions

### Prerequisites

- Node.js 16+
- npm or yarn
- An OpenAI account (for transcript generation)
- A Clerk account (for authentication)
- A Supabase account (for database)

### Environment Variables

Create a `.env.local` file in the root directory using the `.env.example` template:

```
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret

# Clerk Routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup

For detailed Supabase setup instructions, please refer to [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

Quick setup:
1. Create a new Supabase project
2. Use the SQL migrations in `supabase/migrations/` to set up your database schema:
   - Run `supabase/migrations/20240601000000_whiteboard_setup.sql` first
   - Then run `supabase/schema.sql` if needed
3. Configure your environment variables with Supabase URL and anon key
4. Enable authentication methods in Supabase dashboard

### Clerk Setup

1. Create a new Clerk application
2. Enable email and Google authentication methods
3. Configure the redirect URLs for your application
4. Create a webhook endpoint that points to `/api/clerk-webhook` with all user events

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/ShaikMoosa/Reflectly.git
   cd Reflectly
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deployment to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in the Vercel project settings
4. Deploy your application

## Development

To run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Upload a video file by clicking on the upload area
2. Wait for the video to process
3. Click "Generate Transcript" to create a transcript using OpenAI's Whisper API
4. Browse through the transcript and click on any segment to navigate the video
5. Use the whiteboard feature to sketch ideas related to your projects
6. Organize tasks using the kanban board planner

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- [OpenAI](https://openai.com/) for the Whisper API
- [shadcn/ui](https://ui.shadcn.com/) for the UI components
- [Next.js](https://nextjs.org/) for the framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Clerk](https://clerk.dev/) for authentication
- [Supabase](https://supabase.io/) for persistent storage
- [Excalidraw](https://excalidraw.com/) for the whiteboard functionality

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.dev/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Excalidraw Documentation](https://github.com/excalidraw/excalidraw) 
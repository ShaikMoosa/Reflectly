# Reflectly - Video Transcription App

Reflectly is a modern web application that allows users to upload video files and generate interactive transcripts with speaker identification using OpenAI's Whisper API.

## Features

- **Video Upload**: Upload MP4 video files directly in the browser
- **AI Transcription**: Generate accurate transcripts using OpenAI's Whisper API
- **Speaker Identification**: Automatically label different speakers in the transcript
- **Interactive Navigation**: Click on any transcript segment to jump to that point in the video
- **Responsive Design**: Clean, modern UI that works on all device sizes

## Technology Stack

- **Frontend**: Next.js with React and TypeScript
- **UI Components**: shadcn UI library
- **Styling**: Tailwind CSS
- **Authentication**: None (local application)
- **API Integration**: OpenAI Whisper for transcription

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- An OpenAI API key

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

3. Create a `.env.local` file in the project root with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Upload a video file by clicking on the upload area
2. Wait for the video to process
3. Click "Generate Transcript" to create a transcript using OpenAI's Whisper API
4. Browse through the transcript and click on any segment to navigate the video
5. If OpenAI API is not configured or encounters an error, the app will fall back to generating mock transcript data

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- [OpenAI](https://openai.com/) for the Whisper API
- [shadcn/ui](https://ui.shadcn.com/) for the UI components
- [Next.js](https://nextjs.org/) for the framework
- [Tailwind CSS](https://tailwindcss.com/) for styling 
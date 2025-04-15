'use client';

import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';

// Dynamically import to avoid SSR issues
const WhiteboardComponent = dynamic(
  () => import('../components/Whiteboard'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Loading Whiteboard...</p>
        </div>
      </div>
    )
  }
);

// --- Types ---
interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: number;
  start_time: number;
  end_time: number;
}

interface ProjectInfo {
  name: string;
  description: string;
}

interface ProjectInfoFormProps {
  value: ProjectInfo;
  onChange: (data: ProjectInfo) => void;
}

// --- Utility: Split transcript into segments based on video duration ---
function splitTranscriptWithDuration(
  transcript: string,
  videoDuration: number
): TranscriptSegment[] {
  const sentences = transcript.split(/(?<=[.?!])\s+/).filter(Boolean);
  const segmentLength = videoDuration / Math.max(sentences.length, 1);

  return sentences.map((text, i) => ({
    id: uuidv4(),
    text: text.trim(),
    timestamp: i * segmentLength,
    start_time: i * segmentLength,
    end_time: (i + 1) * segmentLength,
  }));
}

export default function WhiteboardPage() {
  // --- State ---
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({ name: '', description: '' });

  // --- Refs ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setTranscripts([]); // Clear previous transcript
    }
  };

  const handleGenerateTranscript = async () => {
    if (!videoFile || !videoRef.current) return;
    setIsTranscribing(true);

    const formData = new FormData();
    formData.append('file', videoFile);

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      const segments = splitTranscriptWithDuration(
        data.transcript,
        videoRef.current.duration || 60
      );
      setTranscripts(segments);
    } else {
      alert('Transcription failed');
    }
    setIsTranscribing(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleSeekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
      setCurrentTime(time);
    }
  };

  const handleExportTranscript = () => {
    if (!transcripts.length) return;
    const exportData = transcripts.map(({ id, text, start_time, end_time }) => ({
      id, text, start_time, end_time
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTranscript = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setTranscripts(imported.map((seg, i) => ({
            id: seg.id || uuidv4(),
            text: seg.text || '',
            start_time: seg.start_time ?? i * 5,
            end_time: seg.end_time ?? (i + 1) * 5,
            timestamp: seg.start_time ?? i * 5,
          })));
        }
      } catch {
        alert('Invalid transcript file');
      }
    };
    reader.readAsText(file);
  };

  // --- UI ---
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Whiteboard</h1>
      <p className="mb-4">Use this whiteboard to sketch out your ideas.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Video + Transcript */}
        <div>
          <div className="card bg-base-200 shadow-xl mb-6">
            <div className="card-body p-4">
              <h2 className="card-title">Video & Transcript</h2>
              <input
                type="file"
                accept="video/mp4"
                onChange={handleVideoUpload}
                className="mb-4"
              />
              {videoUrl && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="w-full mb-4"
                  onTimeUpdate={handleTimeUpdate}
                />
              )}
              {videoFile && (
                <div className="flex gap-2 mb-4">
                  <button
                    className="btn btn-secondary"
                    onClick={() => importInputRef.current?.click()}
                    disabled={isTranscribing}
                  >
                    Import Transcript (JSON)
                  </button>
                  <input
                    type="file"
                    ref={importInputRef}
                    accept=".json"
                    className="hidden"
                    onChange={handleImportTranscript}
                  />
                  <button
                    className="btn btn-accent"
                    onClick={handleExportTranscript}
                    disabled={transcripts.length === 0}
                  >
                    Export Transcript (JSON)
                  </button>
                </div>
              )}
              {transcripts.length > 0 && (
                <div className="border rounded p-2 max-h-96 overflow-y-auto">
                  {transcripts.map(segment => (
                    <div
                      key={segment.id}
                      className={`cursor-pointer px-2 py-1 rounded transition ${
                        currentTime >= segment.start_time &&
                        currentTime < segment.end_time
                          ? 'bg-blue-100 font-bold'
                          : ''
                      }`}
                      onClick={() => handleSeekTo(segment.start_time)}
                    >
                      <span className="text-xs text-gray-500 mr-2">
                        {formatTime(segment.start_time)}
                      </span>
                      {segment.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Right: Whiteboard */}
        <div>
          <div className="card bg-base-200 shadow-xl h-full">
            <div className="card-body p-4">
              <h2 className="card-title">My Whiteboard</h2>
              <div className="h-[600px] w-full">
                <WhiteboardComponent />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper: Format seconds as mm:ss ---
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
} 
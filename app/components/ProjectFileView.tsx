'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, X } from 'lucide-react';
import TabMenu from './TabMenu';
import VideoPlayer from './VideoPlayer';
import TranscriptPlayer from './TranscriptPlayer';
import { TranscriptSegmentData } from './TranscriptSegment';
import NotesPanel from './NotesPanel';
import ChatPanel from './ChatPanel';
import FileUploadStep, { UploadedFile } from './FileUploadStep';
import { Project } from './ProjectPage';
import { v4 as uuidv4 } from 'uuid';
import MyNotesPanel, { Annotation } from './MyNotesPanel';
import TimelineSegments from './TimelineSegments';
import { supabaseClient } from '../utils/supabase/client';

export interface ProjectFileViewProps {
  project: Project;
  onBackToProjects: () => void;
  onSaveProject: (updatedProject: Project) => void;
  userId?: string;
}

interface TranscriptData {
  segments: TranscriptSegmentData[];
  loading: boolean;
  hasTranscript: boolean;
}

interface Note {
  text: string;
  timestamp: number;
  tags?: string[];
  comment?: string;
  isHighlighted?: boolean;
}

const ProjectFileView: React.FC<ProjectFileViewProps> = ({
  project,
  onBackToProjects,
  onSaveProject
}) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<'transcript' | 'notes' | 'ai-chat'>('transcript');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Video state
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Transcript state
  const [transcriptData, setTranscriptData] = useState<TranscriptData>({
    segments: [],
    loading: false,
    hasTranscript: false
  });
  
  // Video upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  
  // Playback preferences
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(true);

  // Notes and annotations state
  const [notes, setNotes] = useState<Note[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [highlightedSegments, setHighlightedSegments] = useState<string[]>([]);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  
  const [chatMessages, setChatMessages] = useState<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    isLoading?: boolean;
  }[]>([]);

  // Initialize video and transcript data if available
  useEffect(() => {
    // This would be replaced with real data loaded from the project
    // Load data from Supabase when component mounts
    if (project.id) {
      loadProjectData();
    }
  }, [project.id]);
  
  // Load project data from Supabase
  const loadProjectData = async () => {
    try {
      console.log('Loading project data from Supabase...');
      
      // Load transcript data
      const { data: transcriptData, error: transcriptError } = await supabaseClient
        .from('transcripts')
        .select('*')
        .eq('project_id', project.id)
        .single();
        
      if (transcriptError && transcriptError.code !== 'PGRST116') {
        console.error('Error loading transcript:', transcriptError);
      } else if (transcriptData) {
        console.log('Loaded transcript data:', transcriptData);
        
        // Parse the segments from JSON if stored as a string, or use as is if already an object
        const segments = typeof transcriptData.segments === 'string' 
          ? JSON.parse(transcriptData.segments) 
          : transcriptData.segments;
          
        setTranscriptData({
          segments,
          loading: false,
          hasTranscript: true
        });
        
        if (transcriptData.video_duration) {
          setVideoDuration(transcriptData.video_duration);
        }
      }
      
      // Load annotations
      const { data: annotationsData, error: annotationsError } = await supabaseClient
        .from('annotations')
        .select('*')
        .eq('project_id', project.id);
        
      if (annotationsError) {
        console.error('Error loading annotations:', annotationsError);
      } else if (annotationsData?.length) {
        console.log('Loaded annotations:', annotationsData);
        setAnnotations(annotationsData);
        
        // Restore highlighted segments
        const highlights = annotationsData
          .filter((a: Annotation) => a.type === 'highlight')
          .map((a: Annotation) => {
            // Extract segment ID from annotation ID or use a default approach
            const match = a.id.match(/^highlight-(.+?)-/);
            return match ? match[1] : '';
          })
          .filter((id: string) => id); // Filter out empty IDs
          
        setHighlightedSegments(highlights);
      }
      
      // Load notes
      const { data: notesData, error: notesError } = await supabaseClient
        .from('notes')
        .select('*')
        .eq('project_id', project.id);
        
      if (notesError) {
        console.error('Error loading notes:', notesError);
      } else if (notesData?.length) {
        console.log('Loaded notes:', notesData);
        setNotes(notesData);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
    }
  };
  
  // Save transcript data whenever it changes
  useEffect(() => {
    if (project.id && transcriptData.hasTranscript && transcriptData.segments.length > 0) {
      saveTranscript();
    }
  }, [JSON.stringify(transcriptData.segments), project.id, transcriptData.hasTranscript]);
  
  // Save annotations whenever they change
  useEffect(() => {
    if (project.id && annotations.length > 0) {
      saveAnnotations();
    }
  }, [JSON.stringify(annotations), project.id]);
  
  // Save notes whenever they change
  useEffect(() => {
    if (project.id && notes.length > 0) {
      saveNotes();
    }
  }, [JSON.stringify(notes), project.id]);
  
  // Save transcript to Supabase
  const saveTranscript = async () => {
    try {
      console.log('Saving transcript to Supabase...');
      
      const { error } = await supabaseClient
        .from('transcripts')
        .upsert({
          project_id: project.id,
          segments: transcriptData.segments,
          video_duration: videoDuration,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'project_id'
        });
        
      if (error) {
        console.error('Error saving transcript:', error);
      } else {
        console.log('Transcript saved successfully');
      }
    } catch (error) {
      console.error('Error saving transcript:', error);
    }
  };
  
  // Save annotations to Supabase
  const saveAnnotations = async () => {
    try {
      console.log('Saving annotations to Supabase...');
      
      // Delete existing annotations for this project
      const { error: deleteError } = await supabaseClient
        .from('annotations')
        .delete()
        .eq('project_id', project.id);
        
      if (deleteError) {
        console.error('Error deleting existing annotations:', deleteError);
        return;
      }
      
      // Add project_id to each annotation
      const annotationsWithProjectId = annotations.map(annotation => ({
        ...annotation,
        project_id: project.id
      }));
      
      // Insert new annotations
      const { error } = await supabaseClient
        .from('annotations')
        .insert(annotationsWithProjectId);
        
      if (error) {
        console.error('Error saving annotations:', error);
      } else {
        console.log('Annotations saved successfully');
      }
    } catch (error) {
      console.error('Error saving annotations:', error);
    }
  };
  
  // Save notes to Supabase
  const saveNotes = async () => {
    try {
      console.log('Saving notes to Supabase...');
      
      // Delete existing notes for this project
      const { error: deleteError } = await supabaseClient
        .from('notes')
        .delete()
        .eq('project_id', project.id);
        
      if (deleteError) {
        console.error('Error deleting existing notes:', deleteError);
        return;
      }
      
      // Add project_id to each note
      const notesWithProjectId = notes.map(note => ({
        ...note,
        project_id: project.id
      }));
      
      // Insert new notes
      const { error } = await supabaseClient
        .from('notes')
        .insert(notesWithProjectId);
        
      if (error) {
        console.error('Error saving notes:', error);
      } else {
        console.log('Notes saved successfully');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handleTabChange = (tab: 'transcript' | 'notes' | 'ai-chat') => {
    setActiveTab(tab);
  };

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSegmentClick = (timestamp: number) => {
    setCurrentTime(timestamp);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const handleFilesChange = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      const file = files[0].file;
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  // Helper function to get video metadata
  const getVideoDuration = async (): Promise<number> => {
    return new Promise((resolve) => {
      if (videoRef.current) {
        // If we already have a reference to the video element
        resolve(videoRef.current.duration);
      } else {
        // Create a temporary video element to get duration
        const tempVideo = document.createElement('video');
        tempVideo.src = videoUrl;
        tempVideo.onloadedmetadata = () => {
          const duration = tempVideo.duration;
          resolve(duration);
          tempVideo.remove(); // Clean up
        };
        tempVideo.onerror = () => {
          console.error('Failed to load video for duration check');
          resolve(300); // Fallback to 5 minutes if we can't get the duration
        };
      }
    });
  };

  const handleGenerateTranscript = async () => {
    if (uploadedFiles.length === 0) return;
    
    setTranscriptData({
      ...transcriptData,
      loading: true
    });
    
    try {
      // Extract the video file
      const videoFile = uploadedFiles[0].file;
      console.log("Processing video file:", videoFile.name, "Size:", videoFile.size, "Type:", videoFile.type);
      
      if (!videoFile.type.startsWith('video/')) {
        throw new Error("The uploaded file is not a valid video format");
      }
      
      // Create a FormData object to send the file to our server API
      const formData = new FormData();
      formData.append('file', videoFile);
      
      // Use the server-side API route instead of calling OpenAI directly
      console.log("Sending file to server-side API for processing...");
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });
      
      // Check for response status
      console.log("API Response status:", response.status, response.statusText);
      
      // Handle API errors
      if (!response.ok) {
        let errorMessage = `Transcription API Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error("API Error details:", errorData);
          errorMessage = `Transcription API Error: ${errorData.error || errorMessage}`;
        } catch (e) {
          console.error("Could not parse error response:", e);
        }
        throw new Error(errorMessage);
      }
      
      // Parse the API response
      const responseData = await response.json();
      console.log("API Response:", responseData);
      
      if (!responseData.transcripts || !Array.isArray(responseData.transcripts)) {
        console.error("Unexpected API response format:", responseData);
        throw new Error("API response does not contain transcript data");
      }
      
      console.log("Found", responseData.transcripts.length, "segments in the transcript");
      
      // Transform API response to our transcript format
      const segments: TranscriptSegmentData[] = responseData.transcripts.map((segment: any) => ({
        id: uuidv4(),
        text: segment.text,
        start_time: segment.start,
        end_time: segment.end
      }));
      
      console.log("Transcript segments processed:", segments.length);
      
      // Update the state with the real transcript
      setTranscriptData({
        segments,
        loading: false,
        hasTranscript: true
      });
      
      // Store the video duration if not already set
      if (!videoDuration && videoRef.current) {
        setVideoDuration(videoRef.current.duration);
      }
      
      console.log("Transcript generation completed successfully");
    } catch (error) {
      console.error("Error generating transcript:", error);
      alert(`Failed to generate transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback to generating mock transcript data if API fails
      try {
        console.log("Falling back to mock transcript generation...");
        // Get the actual video duration
        const duration = await getVideoDuration();
        setVideoDuration(duration);
        console.log("Video duration:", duration);
        
        // Generate segments based on video duration
        const mockSegments: TranscriptSegmentData[] = [];
        
        // Sample content for dynamic transcript generation
        const sampleContent = [
          "Welcome to our project demo video.",
          "In this video, we'll showcase the main features of our application.",
          "Let's get started with a quick overview of the interface.",
          "The dashboard provides a comprehensive view of all your projects.",
          "You can easily search and filter your projects using the search bar at the top.",
          "To create a new project, simply click on the 'New Project' button in the top-right corner.",
          "Now, let's look at the project details page.",
          "Each project has tabs for transcripts, notes, and AI chat functionality.",
          "The transcript tab allows you to view the automatically generated transcript of your video.",
          "You can click on any part of the transcript to jump to that point in the video.",
          "The notes tab lets you add and organize your thoughts about the video content.",
          "Notes can be tagged, highlighted, and commented on for better organization.",
          "The AI chat tab allows you to ask questions about the video content.",
          "The AI assistant can provide insights and answer specific questions about the video.",
          "You can export your transcript, notes, and chat history for future reference.",
          "Our application uses advanced AI to help you extract insights from your videos.",
          "The interface is designed to be intuitive and user-friendly.",
          "All your data is securely stored and accessible only to authorized users.",
          "You can collaborate with team members by sharing your projects.",
          "Real-time updates ensure everyone has the latest information."
        ];
        
        // Calculate how many segments we need to cover the full duration
        const segmentCount = Math.max(10, Math.ceil(duration / 5)); // At least 10 segments, or one every 5 seconds
        const segmentDuration = duration / segmentCount;
        
        // Generate transcript segments
        for (let i = 0; i < segmentCount; i++) {
          const startTime = i * segmentDuration;
          const endTime = Math.min((i + 1) * segmentDuration, duration);
          
          // Get content for this segment (cycle through sample content if needed)
          const contentIndex = i % sampleContent.length;
          const text = sampleContent[contentIndex];
          
          mockSegments.push({
            id: uuidv4(),
            text,
            start_time: startTime,
            end_time: endTime
          });
        }
        
        setTranscriptData({
          segments: mockSegments,
          loading: false,
          hasTranscript: true
        });
      } catch (mockError) {
        console.error("Error generating mock transcript:", mockError);
        setTranscriptData({
          ...transcriptData,
          loading: false
        });
      }
    }
  };

  const handleImportTranscript = () => {
    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    // Handle file selection
    fileInput.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      
      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedData = JSON.parse(content);
          
          // Validate the imported JSON structure
          if (!importedData.transcripts || !Array.isArray(importedData.transcripts)) {
            setImportError('Invalid transcript format. The file must contain a "transcripts" array.');
            return;
          }
          
          // Convert imported data to our format if needed
          const segments = importedData.transcripts.map((segment: any) => ({
            id: segment.id || uuidv4(),
            text: segment.text,
            start_time: segment.start_time || segment.start,
            end_time: segment.end_time || segment.end
          }));
          
          // Update the transcript data
          setTranscriptData({
            segments,
            loading: false,
            hasTranscript: true
          });
          
          setImportError(null);
        } catch (error) {
          console.error('Error importing transcript:', error);
          setImportError('Failed to parse the transcript file. Please ensure it is a valid JSON file.');
        }
      };
      
      reader.readAsText(file);
    };
    
    // Trigger the file selection dialog
    fileInput.click();
  };

  const handleExportTranscript = () => {
    if (!transcriptData.hasTranscript) return;
    
    const exportData = {
      projectName: project.name,
      transcripts: transcriptData.segments
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}_transcript.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleTimestamps = () => {
    setShowTimestamps(!showTimestamps);
  };

  const handleChangePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const handleToggleExpand = () => {
    setIsTranscriptExpanded(!isTranscriptExpanded);
  };

  const handleSegmentHighlight = (segmentId: string) => {
    if (highlightedSegments.includes(segmentId)) {
      // Remove highlight
      setHighlightedSegments(highlightedSegments.filter(id => id !== segmentId));
      
      // Remove annotation if exists
      setAnnotations(prev => prev.filter(a => !(a.type === 'highlight' && a.id.includes(segmentId))));
    } else {
      // Add highlight
      setHighlightedSegments([...highlightedSegments, segmentId]);
      
      // Find segment data
      const segment = transcriptData.segments.find(s => s.id === segmentId);
      if (segment) {
        // Create an annotation
        const annotation: Annotation = {
          id: `highlight-${segmentId}-${Date.now()}`,
          type: 'highlight',
          timestamp: segment.start_time,
          text: '',
          segmentText: segment.text
        };
        
        setAnnotations(prev => [...prev, annotation]);
      }
    }
  };
  
  const handleAddTagToSegment = (segmentId: string) => {
    setActiveSegmentId(segmentId);
    setTagInput('');
    setShowTagDialog(true);
  };
  
  const handleAddCommentToSegment = (segmentId: string) => {
    setActiveSegmentId(segmentId);
    setCommentInput('');
    setShowCommentDialog(true);
  };
  
  const handleSaveTag = () => {
    if (!activeSegmentId || !tagInput.trim()) return;
    
    // Find segment data
    const segment = transcriptData.segments.find(s => s.id === activeSegmentId);
    if (segment) {
      // Create an annotation
      const annotation: Annotation = {
        id: `tag-${activeSegmentId}-${Date.now()}`,
        type: 'tag',
        timestamp: segment.start_time,
        text: tagInput,
        segmentText: segment.text,
        tag: tagInput
      };
      
      setAnnotations(prev => [...prev, annotation]);
    }
    
    setShowTagDialog(false);
    setActiveSegmentId(null);
  };
  
  const handleSaveComment = () => {
    if (!activeSegmentId || !commentInput.trim()) return;
    
    // Find segment data
    const segment = transcriptData.segments.find(s => s.id === activeSegmentId);
    if (segment) {
      // Create an annotation
      const annotation: Annotation = {
        id: `comment-${activeSegmentId}-${Date.now()}`,
        type: 'comment',
        timestamp: segment.start_time,
        text: commentInput,
        segmentText: segment.text,
        comment: commentInput
      };
      
      setAnnotations(prev => [...prev, annotation]);
    }
    
    setShowCommentDialog(false);
    setActiveSegmentId(null);
  };
  
  const handleAddToNotes = (segment: TranscriptSegmentData) => {
    const newNote: Note = {
      text: segment.text,
      timestamp: segment.start_time
    };
    
    setNotes(prev => [...prev, newNote]);
  };
  
  const handleAnnotationClick = (timestamp: number) => {
    setCurrentTime(timestamp);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };
  
  const handleAnnotationEdit = (id: string) => {
    const annotation = annotations.find(a => a.id === id);
    if (!annotation) return;
    
    if (annotation.type === 'tag') {
      setTagInput(annotation.tag || '');
      setActiveSegmentId(id);
      setShowTagDialog(true);
    } else if (annotation.type === 'comment') {
      setCommentInput(annotation.comment || '');
      setActiveSegmentId(id);
      setShowCommentDialog(true);
    }
  };
  
  const handleAnnotationDelete = (id: string) => {
    // Remove the annotation
    setAnnotations(prev => prev.filter(a => a.id !== id));
    
    // If it's a highlight, also update highlightedSegments
    const segmentMatch = id.match(/^highlight-(.+?)-/);
    if (segmentMatch && segmentMatch[1]) {
      setHighlightedSegments(prev => prev.filter(segId => segId !== segmentMatch[1]));
    }
  };
  
  const handleSendMessage = async (message: string) => {
    // Format current timestamp for display in the chat
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message with timestamp
    const updatedChatMessages = [
      ...chatMessages, 
      { 
        role: 'user' as const, 
        content: message,
        timestamp
      }
    ];
    
    setChatMessages(updatedChatMessages);
    
    try {
      // Check if transcript exists, if not generate one
      if (!transcriptData.hasTranscript && videoUrl) {
        // Inform user that we're generating transcript first
        setChatMessages([
          ...updatedChatMessages,
          {
            role: 'assistant' as const,
            content: "I need to understand the video content first. Generating transcript...",
            timestamp
          }
        ]);
        
        // Generate transcript
        await handleGenerateTranscript();
        
        // Wait for transcript to be available
        setChatMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant' as const,
            content: "Transcript generated. Now I can answer your question.",
            timestamp
          }
        ]);
      }
      
      // If we have transcript data, send message to OpenAI
      if (transcriptData.hasTranscript || videoUrl) {
        // Show loading indicator
        setChatMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant' as const,
            content: "Thinking...",
            timestamp,
            isLoading: true
          }
        ]);
        
        // Prepare the history (without timestamps for API)
        const chatHistoryForAPI = updatedChatMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        // Call API with message, transcript, and current timestamp
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            transcript: transcriptData.segments,
            currentTime,
            chatHistory: chatHistoryForAPI
          }),
        });
        
        // Process response
        const data = await response.json();
        
        // Check if there's an error in the response
        if (!response.ok || data.error) {
          console.error('API response error:', data.error || response.statusText);
          
          // Handle specific error cases
          let errorMessage = 'I encountered an error processing your request.';
          
          if (response.status === 401) {
            errorMessage = 'API configuration error. Please check the OpenAI API key.';
          } else if (response.status === 429) {
            errorMessage = 'API rate limit exceeded. Please try again later.';
          } else if (data.error) {
            errorMessage = `Error: ${data.error}`;
          }
          
          // Replace loading message with error message
          setChatMessages(prevMessages => {
            const filteredMessages = prevMessages.filter(msg => !msg.isLoading);
            return [
              ...filteredMessages,
              {
                role: 'assistant' as const,
                content: errorMessage,
                timestamp
              }
            ];
          });
          return;
        }
        
        // Replace loading message with actual response
        setChatMessages(prevMessages => {
          // Remove the last message if it's a loading message
          const filteredMessages = prevMessages.filter(msg => !msg.isLoading);
          
          return [
            ...filteredMessages,
            {
              role: 'assistant' as const,
              content: data.response || "I'm sorry, I couldn't generate a response.",
              timestamp
            }
          ];
        });
      } else {
        // If no video is uploaded, let the user know
        setChatMessages(prevMessages => [
          ...prevMessages,
          {
            role: 'assistant' as const,
            content: "Please upload a video first so I can analyze the content.",
            timestamp
          }
        ]);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      setChatMessages(prevMessages => {
        // Remove the loading message if it exists
        const filteredMessages = prevMessages.filter(msg => !msg.isLoading);
        
        return [
          ...filteredMessages,
          {
            role: 'assistant' as const,
            content: 'I encountered an error processing your request. Please try again.',
            timestamp
          }
        ];
      });
    }
  };
  
  // Helper functions for AI response generation
  const generateSummaryResponse = (timestamp: number) => {
    const segmentText = getSegmentTextAtTime(timestamp);
    return `Based on the transcript, here's a summary of the key points:
    
1. ${getRandomTopic()} is discussed in detail
2. The speaker explains ${getRandomTopic()} as a core concept
3. Several examples of ${getRandomTopic()} are provided
4. The relationship between ${getRandomTopic()} and ${getRandomTopic()} is analyzed

Would you like me to extract specific points or create notes from this section?`;
  };
  
  const generateHighlightResponse = (timestamp: number) => {
    return `I've identified the following key elements to highlight:
    
• "${getSegmentTextAtTime(timestamp)}"

I've saved this highlight to your notes. Would you like me to tag it with a specific category?`;
  };
  
  const generateGenericResponse = () => {
    const responses = [
      "I can help answer questions about the video content. What specific part are you interested in understanding better?",
      "I've analyzed the transcript. Would you like me to summarize a specific section or generate insights about the overall content?",
      "Based on the content, I can extract key points, generate tags, or summarize sections. What would be most helpful?",
      "I can help identify important moments in this video. Would you like me to highlight significant sections or create notes?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  const getRandomTopic = () => {
    const topics = [
      "user experience design",
      "system architecture",
      "data analysis methodology",
      "performance optimization",
      "feature implementation",
      "collaborative workflows",
      "interface patterns",
      "design principles",
      "content strategy"
    ];
    return topics[Math.floor(Math.random() * topics.length)];
  };
  
  const getSegmentTextAtTime = (timestamp: number) => {
    if (transcriptData.segments.length === 0) {
      return "this section of the video";
    }
    
    const segment = transcriptData.segments.find(s => 
      timestamp >= s.start_time && timestamp < s.end_time
    );
    
    return segment ? segment.text : "this section of the video";
  };

  const renderVideoSection = () => (
    <div className="video-section w-full">
      {videoUrl ? (
        <VideoPlayer
          videoUrl={videoUrl}
          currentTime={currentTime}
          onTimeUpdate={handleTimeUpdate}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          ref={videoRef}
        />
      ) : (
        <div className="border rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 text-center">
          <p className="text-gray-600 mb-4">No video uploaded yet</p>
          <button
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-all"
            onClick={() => setShowUploadModal(true)}
          >
            Upload Video
          </button>
        </div>
      )}
    </div>
  );

  const renderTranscriptTab = () => (
    <div className="transcript-tab h-full w-full flex flex-col md:flex-row">
      <div className="video-section w-full md:w-1/2">
        {renderVideoSection()}
      </div>
      <div className="transcript-section h-full w-full md:w-1/2 overflow-auto">
        {transcriptData.hasTranscript ? (
          <TranscriptPlayer
            segments={transcriptData.segments}
            currentTime={currentTime}
            onSegmentClick={handleSegmentClick}
            loading={transcriptData.loading}
            hasTranscript={transcriptData.hasTranscript}
            showTimestamps={showTimestamps}
            playbackSpeed={playbackSpeed}
            isExpanded={isTranscriptExpanded}
            highlightedSegments={highlightedSegments}
            onHighlightSegment={handleSegmentHighlight}
            onAddTagToSegment={handleAddTagToSegment}
            onAddCommentToSegment={handleAddCommentToSegment}
            onAddToNotes={handleAddToNotes}
            onToggleTimestamps={handleToggleTimestamps}
            onChangePlaybackSpeed={handleChangePlaybackSpeed}
            onToggleExpand={handleToggleExpand}
          />
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-6 bg-gray-50 dark:bg-gray-800 border rounded-lg shadow-sm mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Transcript Options</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Generate a transcript of your video using AI or import an existing transcript file.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleGenerateTranscript}
                  disabled={!videoUrl || transcriptData.loading}
                  className={`flex items-center justify-center w-full px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    !videoUrl || transcriptData.loading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'
                  }`}
                >
                  {transcriptData.loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Transcript...
                    </>
                  ) : (
                    'Generate Transcript with AI'
                  )}
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-gray-50 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">or</span>
                  </div>
                </div>
                
                <button
                  onClick={handleImportTranscript}
                  className="w-full px-4 py-2.5 rounded-md text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Import Transcript (JSON)
                </button>
              </div>
              
              {importError && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-md">
                  {importError}
                </div>
              )}
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">No transcript available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotesTab = () => (
    <div className="notes-tab h-full">
      <div className="flex flex-col md:flex-row h-full">
        <div className="md:w-2/3 flex flex-col h-full">
          <div className="video-section mb-4">
            {renderVideoSection()}
          </div>
          
          <div className="transcript-section flex-1 min-h-[300px] overflow-auto border rounded-lg md:block">
            <TranscriptPlayer
              segments={transcriptData.segments}
              currentTime={currentTime}
              onSegmentClick={handleSegmentClick}
              loading={transcriptData.loading}
              hasTranscript={transcriptData.hasTranscript}
              showTimestamps={showTimestamps}
              playbackSpeed={playbackSpeed}
              isExpanded={isTranscriptExpanded}
              highlightedSegments={highlightedSegments}
              onHighlightSegment={handleSegmentHighlight}
              onAddTagToSegment={handleAddTagToSegment}
              onAddCommentToSegment={handleAddCommentToSegment}
              onAddToNotes={handleAddToNotes}
              onToggleTimestamps={handleToggleTimestamps}
              onChangePlaybackSpeed={handleChangePlaybackSpeed}
              onToggleExpand={handleToggleExpand}
            />
          </div>
        </div>
        
        <div className="md:w-1/3 flex flex-col h-full mt-4 md:mt-0 md:ml-4">
          <MyNotesPanel 
            annotations={annotations}
            onAnnotationClick={handleAnnotationClick}
            onAnnotationEdit={handleAnnotationEdit}
            onAnnotationDelete={handleAnnotationDelete}
          />
        </div>
      </div>
      
      {/* Tag Dialog */}
      {showTagDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-medium mb-4">Add Tag</h3>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Enter tag..."
              className="w-full p-2 border rounded-md mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                onClick={() => {
                  setShowTagDialog(false);
                  setActiveSegmentId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleSaveTag}
                disabled={!tagInput.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Comment Dialog */}
      {showCommentDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-medium mb-4">Add Comment</h3>
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Enter comment..."
              className="w-full p-2 border rounded-md mb-4 min-h-[100px]"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                onClick={() => {
                  setShowCommentDialog(false);
                  setActiveSegmentId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleSaveComment}
                disabled={!commentInput.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAIChatTab = () => (
    <div className="ai-chat-tab h-full">
      <div className="flex flex-col md:flex-row h-full gap-4">
        <div className="md:w-[65%] h-full">
          {renderVideoSection()}
        </div>
        
        <div className="md:w-[35%] h-full">
          <ChatPanel
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            transcriptAvailable={transcriptData.hasTranscript}
            currentTimestamp={currentTime}
          />
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'transcript':
        return renderTranscriptTab();
      case 'notes':
        return renderNotesTab();
      case 'ai-chat':
        return renderAIChatTab();
      default:
        return renderTranscriptTab();
    }
  };

  return (
    <div className={`project-file-view h-full flex flex-col px-10 py-8 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <div className="mb-6 flex items-center">
        <button
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 mr-3"
          onClick={onBackToProjects}
          aria-label="Back to projects"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{project.description}</p>
          )}
        </div>
      </div>
      
      {/* Tabs menu */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <TabMenu
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />
      </div>
      
      {/* Content area */}
      <div className="flex-1 overflow-auto">
        {renderActiveTab()}
      </div>
      
      {/* Upload modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
            {/* Modal header */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Upload Video</h2>
              <button
                className="p-1.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowUploadModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Modal body */}
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Upload an MP4 video file to transcribe and analyze. You can either drag and drop your file or browse to select.
              </p>
              
              <FileUploadStep onFilesChange={handleFilesChange} initialFiles={uploadedFiles} />
            </div>
            
            {/* Modal footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
              <button
                className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
                  uploadedFiles.length > 0 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-blue-400/70 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (uploadedFiles.length > 0) {
                    setShowUploadModal(false);
                  }
                }}
                disabled={uploadedFiles.length === 0}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFileView; 
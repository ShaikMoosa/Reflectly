import { useState, useEffect } from 'react';
import { transcriptionApi } from '../services/transcriptionApi';

export function useTranscript(projectId: string) {
  const [transcript, setTranscript] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) return;

    async function fetchTranscript() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await transcriptionApi.getTranscript(projectId);
        setTranscript(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch transcript'));
      } finally {
        setLoading(false);
      }
    }

    fetchTranscript();
  }, [projectId]);

  return { transcript, loading, error };
}

export function useTranscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadVideo = async (file: File, userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await transcriptionApi.uploadVideo(file, userId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to upload video'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadVideo, loading, error };
}

import { useState, useEffect } from 'react';
import { notesApi } from '../services/notesApi';

export function useNotes(projectId: string) {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) return;

    async function fetchNotes() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await notesApi.getNotes(projectId);
        setNotes(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch notes'));
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, [projectId]);

  const createNote = async (params: any) => {
    const note = await notesApi.createNote(params);
    setNotes(prev => [...prev, note]);
    return note;
  };

  const updateNote = async (id: string, params: any) => {
    const note = await notesApi.updateNote(id, params);
    setNotes(prev => prev.map(n => n.id === id ? note : n));
    return note;
  };

  const deleteNote = async (id: string) => {
    await notesApi.deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return { notes, loading, error, createNote, updateNote, deleteNote };
}

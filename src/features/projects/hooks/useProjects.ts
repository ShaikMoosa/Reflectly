import { useState, useEffect } from 'react';
import { Project } from '../types/project.types';
import { projectApi } from '../services/projectApi';

interface UseProjectsOptions {
  userId?: string;
  status?: string;
  query?: string;
  enabled?: boolean;
}

export function useProjects(options: UseProjectsOptions = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { userId, status, query, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    async function fetchProjects() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await projectApi.getProjects({ userId, status, query });
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [userId, status, query, enabled]);

  return { projects, loading, error, refetch: () => {} };
}

export function useProject(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchProject() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await projectApi.getProject(id);
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch project'));
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id]);

  return { project, loading, error };
}

export function useCreateProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createProject = async (params: { userId: string, name: string, description?: string, status?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const project = await projectApi.createProject(params);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create project'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createProject, loading, error };
}

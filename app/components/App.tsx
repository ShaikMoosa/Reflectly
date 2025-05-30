'use client';

import React, { useState, useEffect } from 'react';
import ProjectPage, { Project } from './ProjectPage';
import ProjectFileView from './ProjectFileView';
import SideNavigation, { PageType } from './SideNavigation';
import { useMediaQuery } from 'react-responsive';
import FixedKanbanBoard from './FixedKanbanBoard';
import { useUser } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import { supabase, initializeSupabaseTables } from '../../utils/supabase';
import { WhiteboardCanvas } from '@/app/whiteboard/components/WhiteboardCanvas';
import { getUserSubscriptionStatus, SubscriptionStatus as SubscriptionStatusType } from '../utils/subscriptions';
import SubscriptionStatus from './SubscriptionStatus';

const App: React.FC = () => {
  // Project state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI state
  const [activePage, setActivePage] = useState<PageType>('projects');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // User authentication
  const { user, isSignedIn } = useUser();
  
  // Check system preference for dark mode
  const prefersDarkMode = useMediaQuery({ query: '(prefers-color-scheme: dark)' });

  // Track if Supabase tables exist
  const [tablesExist, setTablesExist] = useState<boolean | null>(null);

  // Subscription state
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionStatusType | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  // Initialize dark mode based on system preference
  useEffect(() => {
    setIsDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  // Update body class for dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load projects from Supabase on component mount
  useEffect(() => {
    const loadProjects = async () => {
      if (!isSignedIn || !user?.id) {
        setProjects([]);
        setIsLoading(false);
        return;
      }

      // Check if projects table exists
      const exist = await initializeSupabaseTables();
      setTablesExist(exist);
      if (!exist) {
        // Fallback to localStorage if table missing
        const saved = localStorage.getItem('projects');
        setProjects(saved ? JSON.parse(saved) : []);
        setIsLoading(false);
        return;
      }

      // Supabase is ready: fetch projects
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error loading projects from Supabase:', error);
        const saved = localStorage.getItem('projects');
        setProjects(saved ? JSON.parse(saved) : []);
      } else {
        setProjects(
          data.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            videoUrl: p.video_url,
            transcriptData: p.transcript_data,
            createdAt: p.created_at
          }))
        );
      }
      setIsLoading(false);
    };
    loadProjects();
  }, [isSignedIn, user?.id]);

  // Save projects to Supabase whenever they change
  useEffect(() => {
    const saveProjects = async () => {
      if (!tablesExist || !isSignedIn || !user?.id || projects.length === 0) return;
      // Backup to localStorage
      localStorage.setItem('projects', JSON.stringify(projects));
      if (isLoading) return;
      try {
        const supabaseProjects = projects.map(p => ({
          id: p.id,
          user_id: user.id,
          name: p.name,
          description: p.description,
          video_url: p.videoUrl,
          transcript_data: p.transcriptData,
          created_at: p.createdAt,
          updated_at: new Date().toISOString()
        }));
        for (const proj of supabaseProjects) {
          await supabase.from('projects').upsert(proj, { onConflict: 'id' });
        }
      } catch (error) {
        console.error('Error saving projects to Supabase:', error);
      }
    };
    saveProjects();
  }, [projects, isSignedIn, user?.id, isLoading, tablesExist]);

  // Load subscription data
  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!isSignedIn || !user?.id) {
        setSubscriptionData(null);
        setIsLoadingSubscription(false);
        return;
      }

      try {
        const data = await getUserSubscriptionStatus(user.id);
        setSubscriptionData(data);
      } catch (error) {
        console.error('Error loading subscription data:', error);
        setSubscriptionData(null);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    loadSubscriptionData();
  }, [isSignedIn, user?.id]);

  const handleCreateProject = async (project: Project) => {
    const newProject = {
      ...project,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    
    // Save the new project to Supabase
    if (isSignedIn && user?.id) {
      try {
        await supabase.from('projects').insert({
          id: newProject.id,
          user_id: user.id,
          name: newProject.name,
          description: newProject.description,
          video_url: newProject.videoUrl,
          transcript_data: newProject.transcriptData,
          created_at: newProject.createdAt,
          updated_at: newProject.createdAt
        });
      } catch (error) {
        console.error('Error saving new project to Supabase:', error);
      }
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    
    // Remove from Supabase
    if (isSignedIn && user?.id) {
      try {
        await supabase
          .from('projects')
          .delete()
          .eq('id', projectId)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error deleting project from Supabase:', error);
      }
    }
    
    // If we're deleting the currently selected project, clear the selection
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    }
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
  };

  const handleSaveProject = async (updatedProject: Project) => {
    const updatedProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    setProjects(updatedProjects);
    
    // Update in Supabase
    if (isSignedIn && user?.id) {
      try {
        await supabase
          .from('projects')
          .update({
            name: updatedProject.name,
            description: updatedProject.description,
            video_url: updatedProject.videoUrl,
            transcript_data: updatedProject.transcriptData,
            updated_at: new Date().toISOString()
          })
          .eq('id', updatedProject.id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating project in Supabase:', error);
      }
    }
  };

  const handleCreateNewProject = () => {
    setActivePage('projects');
  };

  const handlePageChange = (page: PageType) => {
    setActivePage(page);
    
    // Reset project selection when switching to other pages
    if (page !== 'projects' && selectedProjectId) {
      setSelectedProjectId(null);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Get the selected project if there is one
  const selectedProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId) 
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Map projects to the format expected by SideNavigation
  const projectsForNav = projects.map(p => ({ id: p.id, name: p.name }));

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
        {/* Sidebar for navigation */}
        <SideNavigation 
          activePage={activePage}
          onNavigate={handlePageChange}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleDarkMode}
          projects={projectsForNav}
          onSelectProject={handleSelectProject}
          onCreateNewProject={handleCreateNewProject}
          userName={user?.firstName || 'User'}
        />
        
        {/* Main content area */}
        <main className="ml-64 min-h-screen bg-white dark:bg-gray-900">
          {/* Subscription status widget for the top of the page */}
          <div className="p-6">
            <SubscriptionStatus 
              subscriptionData={subscriptionData}
              isLoading={isLoadingSubscription}
            />
          </div>

          {/* Page content */}
          <div className="p-6">
            {activePage === 'projects' && !selectedProjectId && (
              <ProjectPage 
                projects={projects}
                onCreateProject={handleCreateProject}
                onSelectProject={handleSelectProject}
                onDeleteProject={handleDeleteProject}
              />
            )}
            
            {activePage === 'projects' && selectedProjectId && selectedProject && (
              <ProjectFileView 
                project={selectedProject}
                onBackToProjects={handleBackToProjects}
                onSaveProject={handleSaveProject}
                userId={user?.id}
              />
            )}
            
            {activePage === 'planner' && (
              <FixedKanbanBoard 
                userId={user?.id}
              />
            )}
            
            {activePage === 'whiteboard' && (
              <WhiteboardCanvas />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App; 
'use client';

import React, { useState, useEffect } from 'react';
import ProjectPage, { Project } from './ProjectPage';
import ProjectFileView from './ProjectFileView';
import SideNavigation, { PageType } from './SideNavigation';
import { useMediaQuery } from 'react-responsive';
import FixedKanbanBoard from './FixedKanbanBoard';
import { useUser } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../utils/supabase';
import ExcalidrawWhiteboard from './ExcalidrawWhiteboard';
import FallbackWhiteboard from './FallbackWhiteboard';

const App: React.FC = () => {
  // Project state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI state
  const [activePage, setActivePage] = useState<PageType>('projects');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [useExcalidraw, setUseExcalidraw] = useState(true);
  const [whiteboardError, setWhiteboardError] = useState<string | null>(null);
  
  // User authentication
  const { user, isSignedIn } = useUser();
  
  // Check system preference for dark mode
  const prefersDarkMode = useMediaQuery({ query: '(prefers-color-scheme: dark)' });

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
      try {
        if (!isSignedIn || !user?.id) {
          setProjects([]);
          setIsLoading(false);
          return;
        }
        
        // Try to load from Supabase first
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error loading projects from Supabase:', error);
          
          // Fallback to localStorage if Supabase fails
          const savedProjects = localStorage.getItem('projects');
          if (savedProjects) {
            const parsedProjects = JSON.parse(savedProjects);
            setProjects(parsedProjects);
          }
        } else {
          // Convert Supabase data format to our Project format
          const formattedProjects = data.map(project => ({
            id: project.id,
            name: project.name,
            description: project.description,
            videoUrl: project.video_url,
            transcriptData: project.transcript_data,
            createdAt: project.created_at
          }));
          
          setProjects(formattedProjects);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
        
        // Fallback to localStorage
        const savedProjects = localStorage.getItem('projects');
        if (savedProjects) {
          const parsedProjects = JSON.parse(savedProjects);
          setProjects(parsedProjects);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [isSignedIn, user?.id]);

  // Save projects to Supabase whenever they change
  useEffect(() => {
    const saveProjects = async () => {
      if (!isSignedIn || !user?.id || projects.length === 0) return;
      
      // Also save to localStorage as backup
      localStorage.setItem('projects', JSON.stringify(projects));
      
      // Skip saving to Supabase if we're still loading (initial state)
      if (isLoading) return;
      
      try {
        // Convert projects to Supabase format and save
        const supabaseProjects = projects.map(project => ({
          id: project.id,
          user_id: user.id,
          name: project.name,
          description: project.description,
          video_url: project.videoUrl,
          transcript_data: project.transcriptData,
          created_at: project.createdAt,
          updated_at: new Date().toISOString()
        }));
        
        for (const project of supabaseProjects) {
          await supabase
            .from('projects')
            .upsert(project, { onConflict: 'id' });
        }
      } catch (error) {
        console.error('Error saving projects to Supabase:', error);
      }
    };
    
    saveProjects();
  }, [projects, isSignedIn, user?.id, isLoading]);

  // Function to handle whiteboard errors
  const handleWhiteboardError = (error: Error) => {
    console.error('Whiteboard error:', error);
    setWhiteboardError(error.message);
    setUseExcalidraw(false);
  };

  // Function to toggle between Excalidraw and Fallback whiteboard
  const toggleWhiteboardType = () => {
    setUseExcalidraw(!useExcalidraw);
    setWhiteboardError(null);
  };

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
      <div className={`flex items-center justify-center h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Map projects to the format expected by SideNavigation
  const projectsForNav = projects.map(p => ({ id: p.id, name: p.name }));

  return (
    <div className={`${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
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
      <main className="pl-64 min-h-screen transition-all">
        <div className="p-6">
          {selectedProject ? (
            <ProjectFileView 
              project={selectedProject}
              onBackToProjects={handleBackToProjects}
              onSaveProject={handleSaveProject}
              userId={user?.id}
            />
          ) : (
            <>
              {activePage === 'projects' && (
                <ProjectPage 
                  projects={projects}
                  onCreateProject={handleCreateProject}
                  onDeleteProject={handleDeleteProject}
                  onSelectProject={handleSelectProject}
                />
              )}
              {activePage === 'whiteboard' && (
                <div className="w-full h-[calc(100vh-64px)]">
                  <div className="h-full w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    {whiteboardError && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-t-xl">
                        <div className="flex items-center justify-between">
                          <p className="text-red-600 dark:text-red-300 text-sm">
                            Error: {whiteboardError}
                          </p>
                          <button 
                            onClick={() => setWhiteboardError(null)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end items-center p-2 bg-gray-50 dark:bg-gray-700">
                      <button
                        onClick={toggleWhiteboardType}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        {useExcalidraw ? 'Use Simple Whiteboard' : 'Try Excalidraw'}
                      </button>
                    </div>
                    
                    <div className="h-[calc(100%-48px)]">
                      {useExcalidraw ? (
                        <ExcalidrawWhiteboard userId={user?.id} />
                      ) : (
                        <FallbackWhiteboard userId={user?.id} />
                      )}
                    </div>
                  </div>
                </div>
              )}
              {activePage === 'planner' && (
                <div className="w-full">
                  <div className="overflow-hidden p-6">
                    <h1 className="text-3xl font-bold mb-2">Project Planner</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Organize your ideas and tasks with this Kanban board. Drag and drop cards to update status.
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 h-[calc(100vh-220px)]">
                      <FixedKanbanBoard userId={user?.id} />
                    </div>
                  </div>
                </div>
              )}
              {activePage === 'home' && (
                <div className="text-center py-20">
                  <h1 className="text-2xl font-bold mb-4">Welcome to Reflectly{user?.firstName ? `, ${user.firstName}` : ''}</h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">Your all-in-one workspace for managing projects, notes, and transcripts</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-all">
                      <h2 className="text-xl font-semibold mb-2">Projects</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">Manage your video projects and transcripts</p>
                      <button 
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all"
                        onClick={() => setActivePage('projects')}
                      >
                        View Projects
                      </button>
                    </div>
                    
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-all">
                      <h2 className="text-xl font-semibold mb-2">Whiteboard</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">Sketch your ideas on a digital whiteboard</p>
                      <button 
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all"
                        onClick={() => setActivePage('whiteboard')}
                      >
                        Open Whiteboard
                      </button>
                    </div>
                    
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-all">
                      <h2 className="text-xl font-semibold mb-2">Planner</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">Organize your tasks and schedule your work</p>
                      <button 
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all"
                        onClick={() => setActivePage('planner')}
                      >
                        Go to Planner
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App; 
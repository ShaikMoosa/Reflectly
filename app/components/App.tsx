'use client';

import React, { useState, useEffect } from 'react';
import ProjectPage, { Project } from './ProjectPage';
import ProjectFileView from './ProjectFileView';
import SideNavigation, { PageType } from './SideNavigation';
import { useMediaQuery } from 'react-responsive';
import FixedKanbanBoard from './FixedKanbanBoard';
import dynamic from 'next/dynamic';
import { useUser } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../utils/supabase';

// Dynamically import the Excalidraw whiteboard component to avoid SSR issues
const ExcalidrawWhiteboard = dynamic(
  () => import('./ExcalidrawWhiteboard'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
          <p className="mt-4">Loading Whiteboard...</p>
        </div>
      </div>
    )
  }
);

const App: React.FC = () => {
  // Project state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI state
  const [activePage, setActivePage] = useState<PageType>('projects');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
            createdAt: project.created_at
          }));
          
          setProjects(formattedProjects);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [user, isSignedIn]);

  // Save projects to Supabase when they change
  useEffect(() => {
    const saveProjects = async () => {
      if (!isLoading && isSignedIn && user?.id) {
        try {
          // Still keep localStorage as a backup
          localStorage.setItem('projects', JSON.stringify(projects));
          
          // For each project that might have changed, upsert to Supabase
          for (const project of projects) {
            const { error } = await supabase
              .from('projects')
              .upsert({
                id: project.id,
                name: project.name,
                description: project.description,
                created_at: project.createdAt,
                user_id: user.id
              });
              
            if (error) {
              console.error('Error saving project to Supabase:', error);
            }
          }
        } catch (error) {
          console.error('Error saving projects:', error);
        }
      }
    };
    
    saveProjects();
  }, [projects, isLoading, user, isSignedIn]);

  // Project handlers
  const handleCreateProject = async (project: Project) => {
    if (!isSignedIn || !user?.id) return;
    
    const newProject = {
      ...project,
      id: uuidv4() // Generate a UUID for new projects
    };
    
    // Update local state
    setProjects([...projects, newProject]);
    
    // Save to Supabase
    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          id: newProject.id,
          name: newProject.name,
          description: newProject.description,
          created_at: newProject.createdAt,
          user_id: user.id
        });
        
      if (error) {
        console.error('Error creating project in Supabase:', error);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    // Update local state
    setProjects(projects.filter(p => p.id !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    }
    
    // Delete from Supabase
    if (isSignedIn && user?.id) {
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId)
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error deleting project from Supabase:', error);
        }
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActivePage('projects');
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
  };

  const handleSaveProject = async (updatedProject: Project) => {
    // Update local state
    setProjects(projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    ));
    
    // Update in Supabase
    if (isSignedIn && user?.id) {
      try {
        const { error } = await supabase
          .from('projects')
          .update({
            name: updatedProject.name,
            description: updatedProject.description
          })
          .eq('id', updatedProject.id)
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error updating project in Supabase:', error);
        }
      } catch (error) {
        console.error('Error updating project:', error);
      }
    }
  };

  const handleCreateNewProject = () => {
    setSelectedProjectId(null);
    setActivePage('projects');
  };

  const handlePageChange = (page: PageType) => {
    setActivePage(page);
    setSelectedProjectId(null);
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
                    <ExcalidrawWhiteboard userId={user?.id} />
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
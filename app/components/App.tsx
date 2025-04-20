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

// Simplified whiteboard implementation directly in App.tsx to avoid any import issues
const SimpleWhiteboard: React.FC<{ userId?: string }> = ({ userId }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [color, setColor] = React.useState('#000000');
  const [size, setSize] = React.useState(5);
  const [isClient, setIsClient] = React.useState(false);

  // Initialize on client-side only
  React.useEffect(() => {
    setIsClient(true);

    // Only run canvas setup on client side
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const container = canvas.parentElement;
      
      // Set canvas size
      if (context && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        // Fill with white background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Try to load saved canvas
        try {
          const savedCanvas = localStorage.getItem('simple-whiteboard');
          if (savedCanvas) {
            const img = new Image();
            img.onload = () => {
              context.drawImage(img, 0, 0);
            };
            img.src = savedCanvas;
          }
        } catch (e) {
          console.error('Error loading saved whiteboard:', e);
        }
      }
    }
  }, []);

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Start new path
    context.beginPath();
    context.moveTo(x, y);
    context.lineWidth = size;
    context.lineCap = 'round';
    context.strokeStyle = color;
    
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Continue path and stroke
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL();
      localStorage.setItem('simple-whiteboard', dataUrl);
      alert('Whiteboard saved!');
    } catch (e) {
      console.error('Error saving whiteboard:', e);
      alert('Failed to save whiteboard');
    }
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-2 bg-gray-100 dark:bg-gray-800 flex justify-between items-center">
        <h2 className="text-lg font-medium">Whiteboard</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <label className="text-sm">Color:</label>
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              className="w-6 h-6 border border-gray-300"
            />
          </div>
          <div className="flex items-center space-x-1">
            <label className="text-sm">Size:</label>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={size} 
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-20"
            />
          </div>
          <button 
            onClick={handleClear}
            className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            Clear
          </button>
          <button 
            onClick={handleSave}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Save
          </button>
        </div>
      </div>
      <div className="flex-grow relative overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="absolute top-0 left-0 w-full h-full cursor-crosshair bg-white"
        />
      </div>
    </div>
  );
};

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
                  <div className="h-full w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <div className="flex flex-col items-center justify-center h-full">
                      <h2 className="text-2xl font-bold mb-4">Whiteboard</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-2xl">
                        Due to technical issues with the Excalidraw integration, we've created a standalone whiteboard solution.
                        Please use the link below to access the whiteboard.
                      </p>
                      <a 
                        href="/whiteboard.html" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all"
                      >
                        Open Standalone Whiteboard
                      </a>
                      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        Your drawings will be saved locally in your browser.
                      </p>
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
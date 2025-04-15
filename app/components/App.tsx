'use client';

import React, { useState, useEffect } from 'react';
import ProjectPage, { Project } from './ProjectPage';
import ProjectFileView from './ProjectFileView';
import SideNavigation, { PageType } from './SideNavigation';
import { useMediaQuery } from 'react-responsive';

const App: React.FC = () => {
  // Project state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI state
  const [activePage, setActivePage] = useState<PageType>('projects');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

  // Load projects from localStorage on component mount
  useEffect(() => {
    const loadProjects = () => {
      try {
        const savedProjects = localStorage.getItem('projects');
        if (savedProjects) {
          setProjects(JSON.parse(savedProjects));
        }
      } catch (error) {
        console.error('Error loading projects from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Save projects to localStorage when they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }, [projects, isLoading]);

  // Project handlers
  const handleCreateProject = (project: Project) => {
    setProjects([...projects, project]);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    }
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActivePage('projects');
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
  };

  const handleSaveProject = (updatedProject: Project) => {
    setProjects(projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    ));
  };

  const handleCreateNewProject = () => {
    setSelectedProjectId(null);
    setActivePage('projects');
    // Trigger the create project modal in ProjectPage
    // We'll need to pass this through as a prop
  };

  const handleNavigate = (page: PageType) => {
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
        onNavigate={handleNavigate}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleDarkMode}
        projects={projectsForNav}
        onSelectProject={handleSelectProject}
        onCreateNewProject={handleCreateNewProject}
      />

      {/* Main content area */}
      <main className="pl-64 min-h-screen transition-all">
        <div className="p-6">
          {selectedProject ? (
            <ProjectFileView 
              project={selectedProject}
              onBackToProjects={handleBackToProjects}
              onSaveProject={handleSaveProject}
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
                <div className="text-center py-20">
                  <h1 className="text-2xl font-bold mb-4">Whiteboard</h1>
                  <p className="text-gray-600 dark:text-gray-400">Whiteboard functionality coming soon</p>
                </div>
              )}
              {activePage === 'planner' && (
                <div className="text-center py-20">
                  <h1 className="text-2xl font-bold mb-4">Planner</h1>
                  <p className="text-gray-600 dark:text-gray-400">Planner functionality coming soon</p>
                </div>
              )}
              {activePage === 'home' && (
                <div className="text-center py-20">
                  <h1 className="text-2xl font-bold mb-4">Welcome to Reflectly</h1>
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
                      <p className="text-gray-600 dark:text-gray-400 mb-4">Collaborate with your team on a digital whiteboard</p>
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
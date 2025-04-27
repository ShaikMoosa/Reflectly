'use client';

import React from 'react';
import { Home, FolderOpen, Kanban, Plus, ChevronDown, ChevronRight, Settings, Search, Moon, Sun } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

export type PageType = 'home' | 'projects' | 'planner';

export interface SideNavigationProps {
  activePage: PageType;
  onNavigate: (page: PageType) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  projects: Array<{ id: string; name: string }>;
  onSelectProject: (projectId: string) => void;
  onCreateNewProject: () => void;
  userName?: string;
}

const SideNavigation: React.FC<SideNavigationProps> = ({
  activePage,
  onNavigate,
  isDarkMode,
  onToggleTheme,
  projects,
  onSelectProject,
  onCreateNewProject,
  userName = 'User'
}) => {
  const [projectsExpanded, setProjectsExpanded] = React.useState(true);

  const toggleProjectsExpanded = () => {
    setProjectsExpanded(!projectsExpanded);
  };

  const handleProjectClick = (projectId: string) => {
    if (onSelectProject) {
      onSelectProject(projectId);
    }
  };

  const handleCreateProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCreateNewProject) {
      onCreateNewProject();
    }
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 overflow-y-auto border-r border-gray-200 bg-white ${isDarkMode ? 'dark bg-gray-900 border-gray-700 text-gray-200' : 'text-gray-800'} transition-all`}>
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-semibold">Reflectly</h1>
        <div className="flex items-center gap-2">
          <button 
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
            onClick={onToggleTheme}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
              {userName.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
            </div>
          </div>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="mb-2 px-2 py-1.5 flex items-center justify-between rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
            <div className="flex items-center gap-2">
              <Search size={18} />
              <span className="text-sm text-gray-500 dark:text-gray-400">Search</span>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">⌘K</div>
          </div>
        </div>

        <nav className="mt-2">
          <ul className="space-y-1 px-2">
            <li>
              <a 
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${activePage === 'home' ? 'bg-gray-100 dark:bg-gray-800 font-medium' : ''}`}
                onClick={() => onNavigate('home')}
              >
                <Home size={18} />
                <span>Home</span>
              </a>
            </li>
            
            <li>
              <div 
                className="flex items-center justify-between px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                onClick={toggleProjectsExpanded}
              >
                <div className="flex items-center gap-2">
                  {projectsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <FolderOpen size={18} />
                  <span>Projects</span>
                </div>
                <button 
                  className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={handleCreateProject}
                >
                  <Plus size={14} />
                </button>
              </div>
              
              {projectsExpanded && (
                <ul className="ml-5 mt-1 border-l border-gray-200 dark:border-gray-700 pl-3 space-y-1">
                  <li 
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${activePage === 'projects' && !onSelectProject ? 'bg-gray-100 dark:bg-gray-800 font-medium' : ''}`}
                    onClick={() => onNavigate('projects')}
                  >
                    <span>All Projects</span>
                  </li>
                  
                  {projects.map(project => (
                    <li 
                      key={project.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-600 dark:text-gray-400"
                      onClick={() => handleProjectClick(project.id)}
                    >
                      <span className="truncate">{project.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            
            <li>
              <a 
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${activePage === 'planner' ? 'bg-gray-100 dark:bg-gray-800 font-medium' : ''}`}
                onClick={() => onNavigate('planner')}
              >
                <Kanban size={18} />
                <span>Planner</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
          <Settings size={18} />
          <span>Settings</span>
        </div>
      </div>
    </aside>
  );
};

export default SideNavigation; 
'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Clock, Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import MultiStepFlow from './MultiStepFlow';
import ProjectInfoForm, { ProjectInfo } from './ProjectInfoForm';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  videoUrl?: string;
  transcriptData?: any;
}

interface ProjectPageProps {
  projects: Project[];
  onCreateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onSelectProject: (projectId: string) => void;
}

const ProjectPage: React.FC<ProjectPageProps> = ({
  projects,
  onCreateProject,
  onDeleteProject,
  onSelectProject
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({ name: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleCreateClick = () => {
    setProjectInfo({ name: '', description: '' });
    setShowCreateModal(true);
  };

  const handleCreateCancel = () => {
    setShowCreateModal(false);
  };

  const handleCreateComplete = () => {
    // Create a new project
    const newProject: Project = {
      id: uuidv4(),
      name: projectInfo.name,
      description: projectInfo.description,
      createdAt: new Date().toISOString()
    };
    
    onCreateProject(newProject);
    setShowCreateModal(false);
  };

  const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent project selection
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedProject) {
      onDeleteProject(selectedProject.id);
    }
    setShowDeleteModal(false);
    setSelectedProject(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedProject(null);
  };

  const handleProjectClick = (projectId: string) => {
    onSelectProject(projectId);
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Define steps for the multi-step flow (in this case, just one step)
  const createProjectSteps = [
    {
      id: 'project-info',
      title: 'Project Info',
      component: <ProjectInfoForm 
        value={projectInfo} 
        onChange={setProjectInfo} 
      />,
      validate: () => Boolean(projectInfo.name.trim())
    }
  ];

  // Format date in a human-readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderEmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/30">
      <div className="text-gray-400 dark:text-gray-500 mb-4">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto">
          <path d="M19 16V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2z"></path>
          <path d="M10 7v1"></path>
          <path d="M14 7v1"></path>
          <path d="M10 11h4"></path>
          <path d="M10 15h2"></path>
        </svg>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">No projects yet</p>
      <button 
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-all"
        onClick={handleCreateClick}
      >
        <Plus size={18} />
        Create your first project
      </button>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredProjects.map(project => (
        <div 
          key={project.id}
          className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-all bg-white dark:bg-gray-800 cursor-pointer"
          onClick={() => handleProjectClick(project.id)}
        >
          <div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center">
            <h3 className="text-xl font-medium text-center p-4">{project.name}</h3>
          </div>
          <div className="p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 h-10 mb-3">
              {project.description || 'No description'}
            </p>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                <Calendar size={14} className="mr-1" />
                {formatDate(project.createdAt)}
              </div>
              <button 
                className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleDeleteClick(project, e)}
                aria-label="Delete project"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.map((project, index) => (
            <tr 
              key={project.id} 
              className={`
                hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer
                ${index !== filteredProjects.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}
              `}
              onClick={() => handleProjectClick(project.id)}
            >
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900 dark:text-gray-100">{project.name}</div>
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs">
                <div className="truncate">{project.description || 'No description'}</div>
              </td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                <div className="flex items-center">
                  <Clock size={14} className="mr-2" />
                  {formatDate(project.createdAt)}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={(e) => handleDeleteClick(project, e)}
                  aria-label="Delete project"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Projects</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your video projects and transcripts</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3">
          <div className="flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              className={`px-3 py-1.5 text-sm ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
          
          <button 
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-all shadow-sm"
            onClick={handleCreateClick}
          >
            <Plus size={18} />
            New Project
          </button>
        </div>
      </div>

      {/* Projects Content */}
      <div className="mt-4">
        {filteredProjects.length === 0 ? (
          renderEmptyState()
        ) : (
          viewMode === 'grid' ? renderGridView() : renderListView()
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create New Project</h2>
              <MultiStepFlow
                steps={createProjectSteps}
                onComplete={handleCreateComplete}
                onCancel={handleCreateCancel}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Delete Project</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleDeleteCancel}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage; 
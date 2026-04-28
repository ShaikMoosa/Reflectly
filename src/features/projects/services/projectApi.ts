import { ProjectRepository } from './projectRepository';
import { CreateProjectParams, Project, ProjectSearchParams, UpdateProjectParams } from '../types/project.types';

export const projectApi = {
  async getProject(id: string): Promise<Project> {
    const project = await ProjectRepository.getById(id);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  },

  async getProjects(params?: ProjectSearchParams): Promise<Project[]> {
    return ProjectRepository.search(params || {});
  },

  async getProjectCount(userId: string): Promise<number> {
    return ProjectRepository.countByUserId(userId);
  },

  async createProject(params: CreateProjectParams): Promise<Project> {
    return ProjectRepository.create(params);
  },

  async updateProject(params: UpdateProjectParams): Promise<Project> {
    return ProjectRepository.update(params);
  },

  async deleteProject(id: string): Promise<void> {
    return ProjectRepository.delete(id);
  },

  async getProjectWithRelatedData(id: string): Promise<Project & { transcriptCount: number, noteCount: number }> {
    return ProjectRepository.getWithRelatedData(id);
  }
};

/**
 * Interface for a project
 */
export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for creating a new project
 */
export interface CreateProjectParams {
  userId: string;
  name: string;
  description?: string;
  status?: string;
}

/**
 * Interface for updating a project
 */
export interface UpdateProjectParams {
  id: string;
  name?: string;
  description?: string;
  status?: string;
}

/**
 * Interface for project search parameters
 */
export interface ProjectSearchParams {
  userId?: string;
  status?: string;
  query?: string;
  limit?: number;
  offset?: number;
} 
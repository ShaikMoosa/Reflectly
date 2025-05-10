/**
 * Interface for planner data
 */
export interface PlannerData {
  // This type is flexible as planner data structure may vary
  [key: string]: any;
}

/**
 * Interface for a planner
 */
export interface Planner {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  data: PlannerData;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for creating a new planner
 */
export interface CreatePlannerParams {
  projectId?: string;
  title: string;
  data?: PlannerData;
}

/**
 * Interface for updating a planner
 */
export interface UpdatePlannerParams {
  id: string;
  title?: string;
  data?: PlannerData;
}

/**
 * Interface for planner search parameters
 */
export interface PlannerSearchParams {
  projectId?: string;
  title?: string;
  limit?: number;
  offset?: number;
} 
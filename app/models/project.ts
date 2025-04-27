export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export type ProjectCreateInput = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type ProjectUpdateInput = Partial<Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>>; 
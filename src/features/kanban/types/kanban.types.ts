export type RequirementStatus = 'New' | 'Pending' | 'In Review' | 'Approved' | 'Revised';

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface Component {
  id: string;
  name: string;
  parentId?: string;
  children?: Component[];
}

export interface Link {
  id: string;
  requirementId: string;
  targetType: string;
  targetId: string;
  linkType?: string;
}

export interface Requirement {
  id: string;
  title: string;
  description?: string;
  status: RequirementStatus;
  componentId?: string;
  component?: Component;
  ownerId?: string;
  owner?: User;
  tags?: Tag[];
  links?: Link[];
  createdAt: string;
  updatedAt: string;
  code?: string; // Unique identifier like UN-1, SR-1 etc.
}

export interface KanbanColumn {
  id: string;
  title: string;
  items: Requirement[];
}

export interface KanbanBoard {
  columns: KanbanColumn[];
} 
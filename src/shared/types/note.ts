/**
 * Interface for a note
 */
export interface Note {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for creating a new note
 */
export interface CreateNoteParams {
  projectId: string;
  title: string;
  content: string;
  tags?: string[];
}

/**
 * Interface for updating a note
 */
export interface UpdateNoteParams {
  id: string;
  title?: string;
  content?: string;
  tags?: string[];
}

/**
 * Interface for note search parameters
 */
export interface NoteSearchParams {
  projectId?: string;
  userId?: string;
  query?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
} 
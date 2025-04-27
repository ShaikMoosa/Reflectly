export interface UserNote {
  id: string;
  user_id: string;
  project_id: string;
  title?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type UserNoteCreateInput = Omit<UserNote, 'id' | 'created_at' | 'updated_at'>;
export type UserNoteUpdateInput = Partial<Omit<UserNote, 'id' | 'user_id' | 'project_id' | 'created_at' | 'updated_at'>>; 
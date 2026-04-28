import { NoteRepository } from './noteRepository';

export const notesApi = {
  async getNotes(projectId: string) {
    return NoteRepository.getByProjectId(projectId);
  },

  async getNoteById(id: string) {
    return NoteRepository.getById(id);
  },

  async createNote(params: any) {
    return NoteRepository.create(params);
  },

  async updateNote(id: string, params: any) {
    return NoteRepository.update(id, params);
  },

  async deleteNote(id: string) {
    return NoteRepository.delete(id);
  }
};

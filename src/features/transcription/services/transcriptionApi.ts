import { TranscriptRepository } from './transcriptRepository';
import { VideoStorageRepository } from './videoStorageRepository';

export const transcriptionApi = {
  async getTranscript(projectId: string) {
    return TranscriptRepository.getByProjectId(projectId);
  },

  async getTranscriptById(id: string) {
    return TranscriptRepository.getById(id);
  },

  async createTranscript(params: any) {
    return TranscriptRepository.create(params);
  },

  async updateTranscript(id: string, params: any) {
    return TranscriptRepository.update(id, params);
  },

  async deleteTranscript(id: string) {
    return TranscriptRepository.delete(id);
  },

  async uploadVideo(file: File, userId: string) {
    return VideoStorageRepository.upload(file, userId);
  },

  async getVideoUrl(path: string) {
    return VideoStorageRepository.getSignedUrl(path);
  }
};

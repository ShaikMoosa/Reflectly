import { ChatRepository } from './chatRepository';

export const chatApi = {
  async sendMessage(params: any) {
    return ChatRepository.sendMessage(params);
  },

  async getChatHistory(projectId: string) {
    return ChatRepository.getByProjectId(projectId);
  },

  async saveChatHistory(params: any) {
    return ChatRepository.save(params);
  }
};

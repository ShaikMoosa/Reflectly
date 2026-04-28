export const whiteboardApi = {
  async saveWhiteboard(projectId: string, data: any) {
    // Implementation to save whiteboard data
    return { success: true };
  },

  async loadWhiteboard(projectId: string) {
    // Implementation to load whiteboard data
    return { shapes: [], settings: {} };
  }
};

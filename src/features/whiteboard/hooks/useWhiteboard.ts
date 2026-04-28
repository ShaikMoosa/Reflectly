import { whiteboardApi } from '../services/whiteboardApi';

export function useWhiteboard(projectId: string) {
  const saveWhiteboard = async (data: any) => {
    return whiteboardApi.saveWhiteboard(projectId, data);
  };

  const loadWhiteboard = async () => {
    return whiteboardApi.loadWhiteboard(projectId);
  };

  return { saveWhiteboard, loadWhiteboard };
}

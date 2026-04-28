/**
 * Interface for a transcript segment
 */
export interface TranscriptSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

/**
 * Interface for a transcript
 */
export interface Transcript {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  content: TranscriptSegment[];
  audioUrl?: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for creating a new transcript
 */
export interface CreateTranscriptParams {
  projectId: string;
  title: string;
  content?: TranscriptSegment[];
  audioUrl?: string;
  duration?: number;
}

/**
 * Interface for updating a transcript
 */
export interface UpdateTranscriptParams {
  id: string;
  title?: string;
  content?: TranscriptSegment[];
  audioUrl?: string;
  duration?: number;
}

/**
 * Interface for transcript search parameters
 */
export interface TranscriptSearchParams {
  projectId?: string;
  userId?: string;
  query?: string;
  limit?: number;
  offset?: number;
} 
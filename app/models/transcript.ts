export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

export interface VideoTranscript {
  id: string;
  project_id: string;
  filename: string;
  content: TranscriptSegment[];
  duration?: number;
  created_at: string;
  updated_at: string;
}

export type VideoTranscriptCreateInput = Omit<VideoTranscript, 'id' | 'created_at' | 'updated_at'>;
export type VideoTranscriptUpdateInput = Partial<Omit<VideoTranscript, 'id' | 'project_id' | 'created_at' | 'updated_at'>>; 
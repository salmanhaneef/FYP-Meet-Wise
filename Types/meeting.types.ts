/**
 * Meeting Data Type Definitions
 */

export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptSegment {
  speaker: string;
  offset: number;
  words: TranscriptWord[];
}

export interface ActionItem {
  id: number;
  text: string;
  assignedTo?: string;
  dueDate?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
}

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  username?: string;
  imageUrl?: string;
  clerkId?: string;
}

export interface Participant {
  id: string;
  participantId?: string;
  joinedAt: string;
  leftAt?: string;
  duration?: number;
  durationFormatted?: string;
  isMicMuted?: boolean;
  isCameraOff?: boolean;
  user: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Analytics {
  totalParticipants: number;
  participantsWhoLeft: number;
  participantsStillActive: number;
  averageDuration: number;
  participantsWithMicMuted: number;
  participantsWithCameraOff: number;
}

export interface Recording {
  url: string;
  type: 'audio' | 'video';
  duration?: number;
  filename?: string;
  size?: number;
}

export interface MeetingDetails {
  id?: string;
  streamCallId: string;
  title: string;
  description?: string;
  scheduledFor: string;
  duration: number;
  status: string;
  startedAt?: string;
  endedAt?: string;
  actualDuration?: number;
  actualDurationFormatted?: string;
  
  // Recordings
  recordingUrls?: string[];
  recordings?: Recording[];
  recordingDuration?: number;
  recordingDurationFormatted?: string;
  hasRecordings?: boolean;
  
  // Participants
  totalParticipants?: number;
  participants?: Participant[];
  
  // Host
  host?: User;
  hostId?: string;
  
  // Content
  transcript?: TranscriptSegment[];
  summary?: string;
  actionItems?: ActionItem[];
  
  // Analytics
  analytics?: Analytics;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface MeetingResponse {
  success: boolean;
  meeting: MeetingDetails;
  isHost: boolean;
  role: 'host' | 'participant';
}

export type TabType = 'overview' | 'transcript' | 'summary' | 'actions' | 'recordings';
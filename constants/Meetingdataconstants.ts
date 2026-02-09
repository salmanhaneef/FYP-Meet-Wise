/**
 * Meeting Data Constants
 * 
 * This file contains mock data for transcripts, summaries, and action items.
 * Replace these with actual API data when backend integration is ready.
 * 
 * To use real data:
 * 1. Update your API route to return transcript, summary, and actionItems
 * 2. Remove the imports from this file in your component
 * 3. Use the data directly from the API response
 */

/* -------------------------------------------------------------------------- */
/*                            TRANSCRIPT DATA                                 */
/* -------------------------------------------------------------------------- */

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

/**
 * Mock transcript data with speaker diarization
 * Generated from speech-to-text service (e.g., AssemblyAI, Deepgram)
 */
export const MOCK_TRANSCRIPT: TranscriptSegment[] = [
  {
    speaker: "Rachel",
    offset: 1.245,
    words: [
      { word: "Good", start: 1.305, end: 1.425 },
      { word: "morning", start: 1.445, end: 1.665 },
      { word: "Gowreesh,", start: 1.685, end: 2.105 },
      { word: "thanks", start: 2.225, end: 2.405 },
      { word: "for", start: 2.425, end: 2.525 },
      { word: "joining", start: 2.545, end: 2.705 },
      { word: "me", start: 2.725, end: 2.825 },
      { word: "today", start: 2.845, end: 3.005 },
      { word: "for", start: 3.025, end: 3.125 },
      { word: "your", start: 3.145, end: 3.245 },
      { word: "quarterly", start: 3.265, end: 3.545 },
      { word: "performance", start: 3.565, end: 3.865 },
      { word: "review.", start: 3.885, end: 4.125 },
      { word: "I", start: 4.325, end: 4.425 },
      { word: "hope", start: 4.445, end: 4.545 },
      { word: "you're", start: 4.565, end: 4.665 },
      { word: "feeling", start: 4.685, end: 4.825 },
      { word: "good", start: 4.845, end: 4.985 },
      { word: "about", start: 5.005, end: 5.165 },
      { word: "this", start: 5.185, end: 5.285 },
      { word: "quarter's", start: 5.305, end: 5.565 },
      { word: "achievements.", start: 5.585, end: 5.925 },
      { word: "How", start: 6.125, end: 6.225 },
      { word: "are", start: 6.245, end: 6.345 },
      { word: "you", start: 6.365, end: 6.465 },
      { word: "feeling", start: 6.485, end: 6.645 },
      { word: "about", start: 6.665, end: 6.805 },
      { word: "your", start: 6.825, end: 6.925 },
      { word: "progress", start: 6.945, end: 7.185 },
      { word: "this", start: 7.205, end: 7.345 },
      { word: "quarter?", start: 7.365, end: 7.585 }
    ]
  },
  {
    speaker: "Gowreesh Simhadri",
    offset: 8.145,
    words: [
      { word: "Good", start: 8.205, end: 8.345 },
      { word: "morning", start: 8.365, end: 8.565 },
      { word: "Rachel,", start: 8.585, end: 8.805 },
      { word: "thanks", start: 8.925, end: 9.065 },
      { word: "for", start: 9.085, end: 9.185 },
      { word: "setting", start: 9.205, end: 9.385 },
      { word: "this", start: 9.405, end: 9.505 },
      { word: "up.", start: 9.525, end: 9.625 },
      { word: "I", start: 9.825, end: 9.925 },
      { word: "feel", start: 9.945, end: 10.045 },
      { word: "really", start: 10.065, end: 10.245 },
      { word: "positive", start: 10.265, end: 10.445 },
      { word: "about", start: 10.465, end: 10.605 },
      { word: "this", start: 10.625, end: 10.725 },
      { word: "quarter.", start: 10.745, end: 10.945 },
      { word: "I", start: 11.145, end: 11.245 },
      { word: "think", start: 11.265, end: 11.385 },
      { word: "we", start: 11.405, end: 11.505 },
      { word: "achieved", start: 11.525, end: 11.685 },
      { word: "a", start: 11.705, end: 11.805 },
      { word: "lot", start: 11.825, end: 11.925 },
      { word: "with", start: 11.945, end: 12.045 },
      { word: "the", start: 12.065, end: 12.165 },
      { word: "product", start: 12.185, end: 12.365 },
      { word: "roadmap", start: 12.385, end: 12.585 },
      { word: "planning", start: 12.605, end: 12.745 },
      { word: "and", start: 12.765, end: 12.865 },
      { word: "the", start: 12.885, end: 12.985 },
      { word: "hiring", start: 13.005, end: 13.145 },
      { word: "initiatives", start: 13.165, end: 13.405 },
      { word: "we", start: 13.425, end: 13.525 },
      { word: "discussed", start: 13.545, end: 13.725 },
      { word: "with", start: 13.745, end: 13.845 },
      { word: "Lizzy.", start: 13.865, end: 14.025 },
      { word: "The", start: 14.225, end: 14.325 },
      { word: "team", start: 14.345, end: 14.465 },
      { word: "dynamics", start: 14.485, end: 14.625 },
      { word: "have", start: 14.645, end: 14.745 },
      { word: "been", start: 14.765, end: 14.865 },
      { word: "really", start: 14.885, end: 15.045 },
      { word: "strong", start: 15.065, end: 15.245 },
      { word: "and", start: 15.265, end: 15.365 },
      { word: "I'm", start: 15.385, end: 15.505 },
      { word: "excited", start: 15.525, end: 15.665 },
      { word: "about", start: 15.685, end: 15.805 },
      { word: "the", start: 15.825, end: 15.925 },
      { word: "direction", start: 15.945, end: 16.165 },
      { word: "we're", start: 16.185, end: 16.285 },
      { word: "heading.", start: 16.305, end: 16.485 }
    ]
  },
  {
    speaker: "Rachel",
    offset: 17.245,
    words: [
      { word: "That's", start: 17.305, end: 17.505 },
      { word: "wonderful", start: 17.525, end: 17.845 },
      { word: "to", start: 17.865, end: 17.945 },
      { word: "hear.", start: 17.965, end: 18.125 },
      { word: "Let's", start: 18.345, end: 18.565 },
      { word: "dive", start: 18.585, end: 18.765 },
      { word: "into", start: 18.785, end: 18.945 },
      { word: "the", start: 18.965, end: 19.045 },
      { word: "specific", start: 19.065, end: 19.385 },
      { word: "metrics", start: 19.405, end: 19.685 },
      { word: "and", start: 19.705, end: 19.805 },
      { word: "feedback", start: 19.825, end: 20.145 },
      { word: "from", start: 20.165, end: 20.305 },
      { word: "the", start: 20.325, end: 20.405 },
      { word: "team.", start: 20.425, end: 20.625 }
    ]
  }
];

/* -------------------------------------------------------------------------- */
/*                              SUMMARY DATA                                  */
/* -------------------------------------------------------------------------- */

/**
 * AI-generated meeting summary
 * Generated using GPT-4, Claude, or similar LLM
 */
export const MOCK_SUMMARY = "Rachel and Gowreesh discussed quarterly performance achievements, focusing on product roadmap planning and hiring initiatives discussed with Lizzy. The team dynamics have been strong, and both parties expressed excitement about the direction the team is heading. The conversation covered specific metrics and feedback from the team, highlighting successful collaboration and positive momentum for the upcoming quarter.";

/* -------------------------------------------------------------------------- */
/*                            ACTION ITEMS DATA                               */
/* -------------------------------------------------------------------------- */

export interface ActionItem {
  id: number;
  text: string;
  assignedTo?: string;
  dueDate?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Action items extracted from the meeting
 * Can be manually created or AI-extracted
 */
export const MOCK_ACTION_ITEMS: ActionItem[] = [
  {
    id: 1,
    text: "Gowreesh to finalize the Q2 product roadmap and share with the team by next Friday.",
    assignedTo: "Gowreesh Simhadri",
    dueDate: "2024-03-15",
    status: 'pending',
    priority: 'high'
  },
  {
    id: 2,
    text: "Schedule follow-up meeting with Lizzy to discuss hiring pipeline progress and timeline.",
    assignedTo: "Rachel",
    dueDate: "2024-03-12",
    status: 'pending',
    priority: 'medium'
  },
  {
    id: 3,
    text: "Prepare detailed performance metrics dashboard for the next review cycle.",
    assignedTo: "Gowreesh Simhadri",
    dueDate: "2024-03-20",
    status: 'in_progress',
    priority: 'medium'
  },
  {
    id: 4,
    text: "Document team achievements and share success stories with leadership team.",
    assignedTo: "Rachel",
    dueDate: "2024-03-18",
    status: 'pending',
    priority: 'low'
  },
  {
    id: 5,
    text: "Review and update team dynamics assessment based on quarterly feedback.",
    assignedTo: "Gowreesh Simhadri",
    status: 'completed',
    priority: 'low'
  }
];

/* -------------------------------------------------------------------------- */
/*                          ALTERNATIVE DATA SETS                             */
/* -------------------------------------------------------------------------- */

/**
 * Additional mock data for different meeting scenarios
 * Uncomment and use as needed for testing
 */

// Pricing Strategy Meeting
export const PRICING_MEETING_SUMMARY = "Arjun and Jake discussed the need to restructure the pricing strategy for DataFlow Pro, considering a tiered model with three plans and a potential fifteen percent price increase. They also addressed the free trial period, grandfathering existing customers, and offering annual discounts to improve cash flow, aiming for a target annual revenue of $2.3 million by Q2 2024.";

export const PRICING_ACTION_ITEMS: ActionItem[] = [
  {
    id: 1,
    text: "Jake to work on the detailed pricing model and customer communication strategy.",
    assignedTo: "Jake",
    dueDate: "2024-03-10",
    status: 'in_progress',
    priority: 'high'
  },
  {
    id: 2,
    text: "Schedule a follow-up meeting in two weeks to review detailed proposals and finalize implementation timeline.",
    assignedTo: "Arjun",
    dueDate: "2024-03-08",
    status: 'pending',
    priority: 'high'
  },
  {
    id: 3,
    text: "Prepare a summary report of the meeting outcomes and share it with all stakeholders.",
    assignedTo: "Jake",
    dueDate: "2024-03-05",
    status: 'pending',
    priority: 'medium'
  },
  {
    id: 4,
    text: "Research potential vendors for the new software solution and compile a comparison chart.",
    assignedTo: "Arjun",
    dueDate: "2024-03-15",
    status: 'pending',
    priority: 'low'
  }
];

/* -------------------------------------------------------------------------- */
/*                          HELPER FUNCTIONS                                  */
/* -------------------------------------------------------------------------- */

/**
 * Get the full text from a transcript segment
 */
export const getTranscriptText = (segment: TranscriptSegment): string => {
  return segment.words.map(w => w.word).join(' ');
};

/**
 * Format timestamp from seconds to MM:SS
 */
export const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get all unique speakers from transcript
 */
export const getUniqueSpeakers = (transcript: TranscriptSegment[]): string[] => {
  return Array.from(new Set(transcript.map(segment => segment.speaker)));
};

/**
 * Get total transcript duration
 */
export const getTotalDuration = (transcript: TranscriptSegment[]): number => {
  if (transcript.length === 0) return 0;
  const lastSegment = transcript[transcript.length - 1];
  const lastWord = lastSegment.words[lastSegment.words.length - 1];
  return lastWord?.end || 0;
};

/**
 * Search transcript for a keyword
 */
export const searchTranscript = (
  transcript: TranscriptSegment[],
  query: string
): TranscriptSegment[] => {
  if (!query) return transcript;
  
  const lowerQuery = query.toLowerCase();
  return transcript.filter(segment =>
    getTranscriptText(segment).toLowerCase().includes(lowerQuery) ||
    segment.speaker.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get action items by status
 */
export const getActionItemsByStatus = (
  items: ActionItem[],
  status: 'pending' | 'in_progress' | 'completed'
): ActionItem[] => {
  return items.filter(item => item.status === status);
};

/**
 * Get action items by priority
 */
export const getActionItemsByPriority = (
  items: ActionItem[],
  priority: 'low' | 'medium' | 'high'
): ActionItem[] => {
  return items.filter(item => item.priority === priority);
};

/**
 * Get overdue action items
 */
export const getOverdueActionItems = (items: ActionItem[]): ActionItem[] => {
  const today = new Date();
  return items.filter(item => {
    if (!item.dueDate || item.status === 'completed') return false;
    return new Date(item.dueDate) < today;
  });
};
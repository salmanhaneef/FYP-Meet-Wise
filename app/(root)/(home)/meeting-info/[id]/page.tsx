'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Video, 
  ArrowLeft, 
  Loader2, 
  Edit, 
  Trash2,
  Download,
  UserCheck,
  X,
  Save,
  FileText,
  CheckCircle2,
  
  User,
  MessageSquare,
  ListTodo,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';

/* -------------------------------------------------------------------------- */
/*                                INTERFACES                                  */
/* -------------------------------------------------------------------------- */

interface TranscriptWord {
  word: string;
  start: number;
  end: number;
}

interface TranscriptSegment {
  speaker: string;
  offset: number;
  words: TranscriptWord[];
}

interface ActionItem {
  id: number;
  text: string;
  assignedTo?: string;
  dueDate?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
}

interface Participant {
  id: string;
  joinedAt: string;
  leftAt?: string;
  duration?: number;
  isMicMuted?: boolean;
  isCameraOff?: boolean;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    username?: string;
    imageUrl?: string;
  };
}

interface MeetingDetails {
  streamCallId: string;
  title: string;
  description?: string;
  scheduledFor: string;
  duration: number;
  status: string;
  startedAt?: string;
  endedAt?: string;
  actualDuration?: number;
  recordingUrls?: string[];
  recordingDuration?: number;
  totalParticipants?: number;
  host?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    username?: string;
    imageUrl?: string;
  };
  participants?: Participant[];
  
  // New fields
  transcript?: TranscriptSegment[];
  summary?: string;
  actionItems?: ActionItem[];
  
  analytics?: {
    totalParticipants: number;
    participantsWhoLeft: number;
    participantsStillActive: number;
    averageDuration: number;
    participantsWithMicMuted: number;
    participantsWithCameraOff: number;
  };
}

/* -------------------------------------------------------------------------- */
/*                         MOCK DATA (TEMPORARY)                              */
/* -------------------------------------------------------------------------- */

const MOCK_TRANSCRIPT: TranscriptSegment[] = [
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
    ]
  }
];

const MOCK_SUMMARY = "Rachel and Gowreesh discussed quarterly performance achievements, focusing on product roadmap planning and hiring initiatives. The team dynamics have been strong, and both parties expressed excitement about the direction the team is heading.";

const MOCK_ACTION_ITEMS: ActionItem[] = [
  {
    id: 1,
    text: "Gowreesh to finalize the Q2 product roadmap and share with the team by next Friday.",
    status: 'pending',
    priority: 'high'
  },
  {
    id: 2,
    text: "Schedule follow-up meeting with Lizzy to discuss hiring pipeline progress.",
    status: 'pending',
    priority: 'medium'
  },
  {
    id: 3,
    text: "Prepare detailed performance metrics dashboard for the next review cycle.",
    status: 'in_progress',
    priority: 'medium'
  },
  {
    id: 4,
    text: "Document team achievements and share success stories with leadership.",
    status: 'pending',
    priority: 'low'
  }
];

/* -------------------------------------------------------------------------- */
/*                            MAIN COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export default function MeetingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { user } = useUser();
  const router = useRouter();
  
  const [meeting, setMeeting] = useState<MeetingDetails | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Transcript state
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'summary' | 'actions'>('overview');
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [expandedSpeakers, setExpandedSpeakers] = useState<Set<number>>(new Set());
  const [copiedActionId, setCopiedActionId] = useState<number | null>(null);
  
  // Edit form state
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    status: '',
  });

  /* ------------------------------------------------------------------------ */
  /*                          FETCH MEETING DETAILS                           */
  /* ------------------------------------------------------------------------ */

  const fetchMeetingDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/meeting/${id}`);
      const data = await response.json();
      
      if (data.success) {
        // Merge API data with mock data (temporary until backend is ready)
        const enrichedMeeting = {
          ...data.meeting,
          transcript: MOCK_TRANSCRIPT,
          summary: MOCK_SUMMARY,
          actionItems: MOCK_ACTION_ITEMS,
        };
        
        setMeeting(enrichedMeeting);
        setIsHost(data.isHost);
        
        setEditData({
          title: data.meeting.title || '',
          description: data.meeting.description || '',
          status: data.meeting.status || '',
        });
      } else {
        console.error('Failed to fetch meeting:', data.error);
      }
    } catch (error) {
      console.error('Error fetching meeting details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMeetingDetails();
    }
  }, [user, id]);

  /* ------------------------------------------------------------------------ */
  /*                          UPDATE & DELETE HANDLERS                        */
  /* ------------------------------------------------------------------------ */

  const handleUpdateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/meeting/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (data.success) {
        setIsEditModalOpen(false);
        fetchMeetingDetails();
        alert('Meeting updated successfully!');
      } else {
        alert(data.error || 'Failed to update meeting');
      }
    } catch (error) {
      console.error('Error updating meeting:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteMeeting = async () => {
    if (!confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/meeting/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Meeting deleted successfully!');
        router.push('/meetings');
      } else {
        alert(data.error || 'Failed to delete meeting');
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                          HELPER FUNCTIONS                                */
  /* ------------------------------------------------------------------------ */

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ONGOING':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'COMPLETED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <ListTodo className="h-4 w-4 text-gray-400" />;
    }
  };

  const toggleSpeaker = (index: number) => {
    const newExpanded = new Set(expandedSpeakers);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSpeakers(newExpanded);
  };

  const copyActionItem = (item: ActionItem) => {
    navigator.clipboard.writeText(item.text);
    setCopiedActionId(item.id);
    setTimeout(() => setCopiedActionId(null), 2000);
  };

  const getTranscriptText = (segment: TranscriptSegment) => {
    return segment.words.map(w => w.word).join(' ');
  };

  const highlightSearchTerm = (text: string, search: string) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) ? 
        <mark key={i} className="bg-yellow-500/30 text-yellow-200 px-1 rounded">{part}</mark> : 
        part
    );
  };

  /* ------------------------------------------------------------------------ */
  /*                          LOADING & ERROR STATES                          */
  /* ------------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Meeting not found</h2>
          <Link
            href="/meetings"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Back to Meetings
          </Link>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                          FILTERED TRANSCRIPT                             */
  /* ------------------------------------------------------------------------ */

  const filteredTranscript = meeting.transcript?.filter(segment =>
    transcriptSearch === '' || 
    getTranscriptText(segment).toLowerCase().includes(transcriptSearch.toLowerCase()) ||
    segment.speaker.toLowerCase().includes(transcriptSearch.toLowerCase())
  );

  /* ------------------------------------------------------------------------ */
  /*                              RENDER                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/meetings"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Meetings</span>
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">{meeting.title}</h1>
                {isHost && (
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm font-medium rounded-full border border-blue-500/20">
                    Host
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(meeting.status)}`}>
                  {meeting.status}
                </span>
                {meeting.recordingUrls && meeting.recordingUrls.length > 0 && (
                  <span className="px-3 py-1 bg-red-500/10 text-red-400 text-sm font-medium rounded-full border border-red-500/20">
                    📹 Recorded
                  </span>
                )}
                {meeting.transcript && (
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-sm font-medium rounded-full border border-purple-500/20">
                    📝 Transcribed
                  </span>
                )}
              </div>
            </div>

            {isHost && (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={handleDeleteMeeting}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-700">
            <nav className="flex gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Overview
                </span>
              </button>
              
              {meeting.transcript && (
                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === 'transcript'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Transcript
                  </span>
                </button>
              )}
              
              {meeting.summary && (
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === 'summary'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Summary
                  </span>
                </button>
              )}
              
              {meeting.actionItems && meeting.actionItems.length > 0 && (
                <button
                  onClick={() => setActiveTab('actions')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === 'actions'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ListTodo className="h-4 w-4" />
                    Actions ({meeting.actionItems.length})
                  </span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Meeting Info */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Meeting Information</h2>
                
                {meeting.description && (
                  <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <p className="text-sm font-medium text-gray-400 mb-1">Description</p>
                    <p className="text-gray-200">{meeting.description}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 mt-0.5 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-400">Date</p>
                      <p className="text-gray-200">{formatDate(meeting.scheduledFor)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 mt-0.5 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-400">Time & Duration</p>
                      <p className="text-gray-200">
                        {formatTime(meeting.scheduledFor)} ({meeting.duration} minutes)
                      </p>
                      {meeting.actualDuration && (
                        <p className="text-sm text-gray-500">
                          Actual: {meeting.actualDuration} minutes
                        </p>
                      )}
                    </div>
                  </div>

                  {meeting.host && (
                    <div className="flex items-start gap-3">
                      <UserCheck className="h-5 w-5 mt-0.5 text-blue-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-400">Host</p>
                        <div className="flex items-center gap-2 mt-1">
                          {meeting.host.imageUrl && (
                            <img 
                              src={meeting.host.imageUrl} 
                              alt={meeting.host.firstName || 'Host'} 
                              className="h-6 w-6 rounded-full"
                            />
                          )}
                          <p className="text-gray-200">
                            {meeting.host.firstName && meeting.host.lastName
                              ? `${meeting.host.firstName} ${meeting.host.lastName}`
                              : meeting.host.username || meeting.host.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Analytics (Host Only) */}
              {isHost && meeting.analytics && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-4">Analytics</h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Total Participants</p>
                      <p className="text-2xl font-bold text-white">{meeting.analytics.totalParticipants}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Still Active</p>
                      <p className="text-2xl font-bold text-green-400">{meeting.analytics.participantsStillActive}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Avg Duration</p>
                      <p className="text-2xl font-bold text-blue-400">{meeting.analytics.averageDuration}s</p>
                    </div>
                    
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Mic Muted</p>
                      <p className="text-2xl font-bold text-yellow-400">{meeting.analytics.participantsWithMicMuted}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Camera Off</p>
                      <p className="text-2xl font-bold text-purple-400">{meeting.analytics.participantsWithCameraOff}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Who Left</p>
                      <p className="text-2xl font-bold text-red-400">{meeting.analytics.participantsWhoLeft}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Participants (Host Only) */}
              {isHost && meeting.participants && meeting.participants.length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Participants ({meeting.participants.length})
                  </h2>
                  
                  <div className="space-y-3">
                    {meeting.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {participant.user.imageUrl ? (
                            <img 
                              src={participant.user.imageUrl} 
                              alt={participant.user.firstName || 'User'} 
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                              <span className="text-blue-400 font-medium">
                                {participant.user.firstName?.charAt(0).toUpperCase() || 
                                 participant.user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate">
                              {participant.user.firstName && participant.user.lastName
                                ? `${participant.user.firstName} ${participant.user.lastName}`
                                : participant.user.username || participant.user.email}
                            </p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <p className="text-xs text-gray-500">
                                Joined: {formatTime(participant.joinedAt)}
                              </p>
                              {participant.duration && (
                                <span className="text-xs text-gray-400">
                                  Duration: {formatDuration(participant.duration)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-2">
                          {participant.isMicMuted && (
                            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded border border-yellow-500/20">
                              🎤 Muted
                            </span>
                          )}
                          {participant.isCameraOff && (
                            <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded border border-purple-500/20">
                              📷 Off
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recording (Host Only) */}
              {isHost && meeting.recordingUrls && meeting.recordingUrls.length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Recordings ({meeting.recordingUrls.length})
                  </h2>
                  
                  <div className="space-y-3">
                    {meeting.recordingUrls.map((url, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <Video className="h-8 w-8 text-red-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-200">
                              Recording {index + 1}
                            </p>
                            {meeting.recordingDuration && (
                              <p className="text-xs text-gray-500">
                                Duration: {formatDuration(meeting.recordingDuration)}
                              </p>
                            )}
                          </div>
                        </div>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Participants</span>
                    <span className="text-white font-medium">
                      {meeting.totalParticipants || meeting.participants?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Recording</span>
                    <span className="text-white font-medium">
                      {meeting.recordingUrls && meeting.recordingUrls.length > 0 ? 'Available' : 'No'}
                    </span>
                  </div>
                  {meeting.transcript && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Transcript</span>
                      <span className="text-white font-medium">Available</span>
                    </div>
                  )}
                  {meeting.actionItems && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Action Items</span>
                      <span className="text-white font-medium">{meeting.actionItems.length}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {meeting.status === 'SCHEDULED' && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                  <button
                    onClick={() => router.push(`/meeting/${meeting.streamCallId}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Video className="h-5 w-5" />
                    Join Meeting
                  </button>
                </div>
              )}

              {/* Quick Summary */}
              {meeting.summary && (
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">AI Summary</h3>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">
                    {meeting.summary}
                  </p>
                  <button
                    onClick={() => setActiveTab('summary')}
                    className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition"
                  >
                    Read full summary →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TRANSCRIPT TAB */}
        {activeTab === 'transcript' && meeting.transcript && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700">
              {/* Search Bar */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="h-6 w-6 text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">Meeting Transcript</h2>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transcript..."
                    value={transcriptSearch}
                    onChange={(e) => setTranscriptSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Transcript Content */}
              <div className="p-6 max-h-[600px] overflow-y-auto">
                {filteredTranscript && filteredTranscript.length > 0 ? (
                  <div className="space-y-4">
                    {filteredTranscript.map((segment, index) => {
                      const text = getTranscriptText(segment);
                      const isExpanded = expandedSpeakers.has(index);
                      const shouldTruncate = text.length > 200;
                      
                      return (
                        <div 
                          key={index}
                          className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <User className="h-5 w-5 text-blue-400" />
                              <div>
                                <p className="font-semibold text-white">{segment.speaker}</p>
                                <p className="text-xs text-gray-500">
                                  {formatTimestamp(segment.offset)}
                                </p>
                              </div>
                            </div>
                            
                            {shouldTruncate && (
                              <button
                                onClick={() => toggleSpeaker(index)}
                                className="text-blue-400 hover:text-blue-300 transition"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5" />
                                ) : (
                                  <ChevronDown className="h-5 w-5" />
                                )}
                              </button>
                            )}
                          </div>
                          
                          <p className="text-gray-300 leading-relaxed">
                            {shouldTruncate && !isExpanded
                              ? highlightSearchTerm(text.substring(0, 200) + '...', transcriptSearch)
                              : highlightSearchTerm(text, transcriptSearch)
                            }
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No results found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUMMARY TAB */}
        {activeTab === 'summary' && meeting.summary && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-lg shadow-lg border border-blue-500/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="h-8 w-8 text-blue-400" />
                <h2 className="text-3xl font-bold text-white">AI-Generated Summary</h2>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-gray-200 leading-relaxed">
                  {meeting.summary}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-sm text-gray-500">
                  This summary was automatically generated using AI. It highlights the key points and decisions made during the meeting.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ACTION ITEMS TAB */}
        {activeTab === 'actions' && meeting.actionItems && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <ListTodo className="h-6 w-6 text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">
                    Action Items ({meeting.actionItems.length})
                  </h2>
                </div>
              </div>

              <div className="p-6">
                {meeting.actionItems.length > 0 ? (
                  <div className="space-y-3">
                    {meeting.actionItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getStatusIcon(item.status)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-200 leading-relaxed">{item.text}</p>
                            
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                              {item.status && (
                                <span className={`px-2 py-1 text-xs rounded border capitalize ${
                                  item.status === 'completed'
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                    : item.status === 'in_progress'
                                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                    : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                }`}>
                                  {item.status.replace('_', ' ')}
                                </span>
                              )}
                              
                              {item.priority && (
                                <span className={`px-2 py-1 text-xs rounded border capitalize ${getPriorityColor(item.priority)}`}>
                                  {item.priority} priority
                                </span>
                              )}
                              
                              {item.assignedTo && (
                                <span className="px-2 py-1 text-xs rounded border bg-blue-500/10 text-blue-400 border-blue-500/20">
                                  👤 {item.assignedTo}
                                </span>
                              )}
                              
                              {item.dueDate && (
                                <span className="px-2 py-1 text-xs rounded border bg-purple-500/10 text-purple-400 border-purple-500/20">
                                  📅 {new Date(item.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => copyActionItem(item)}
                            className="opacity-0 group-hover:opacity-100 transition p-2 hover:bg-gray-800 rounded"
                            title="Copy to clipboard"
                          >
                            {copiedActionId === item.id ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ListTodo className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No action items found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal (Host Only) */}
      {isHost && isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Edit Meeting</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white transition"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateMeeting} className="p-6 space-y-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  id="edit-title"
                  type="text"
                  required
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>

              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="edit-status" className="block text-sm font-medium text-gray-300 mb-1">
                  Status
                </label>
                <select
                  id="edit-status"
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
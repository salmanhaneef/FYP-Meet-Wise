// app/previous-meetings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Calendar, Clock, Users, Video, Archive, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Meeting {
  id: string;
  streamCallId: string;
  title: string;
  description?: string;
  scheduledFor: string;
  duration: number;
  status: string;
  hostId: string;
  recordingUrl?: string;
  host: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  participants: Array<{
    id: string;
    user: {
      id: string;
      firstName?: string;
      email: string;
    };
  }>;
  totalParticipants: number;
}

export default function PreviousMeetingsPage() {
  const { user } = useUser();
  const router = useRouter();
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch previous meetings
  const fetchPreviousMeetings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/meeting/previous');
      const data = await response.json();
      
      if (data.success) {
        setMeetings(data.meetings);
      } else {
        console.error('Failed to fetch meetings:', data.error);
      }
    } catch (error) {
      console.error('Error fetching previous meetings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPreviousMeetings();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

  const handleViewDetails = (callId: string) => {
    router.push(`/meeting-details/${callId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/meetings"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to All Meetings</span>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Archive className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Previous Meetings</h1>
                  <p className="mt-1 text-sm text-gray-400">
                    View your completed and cancelled meetings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Archive className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Previous</p>
                <p className="text-2xl font-bold text-white">{meetings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Video className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-white">
                  {meetings.filter(m => m.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <Calendar className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Cancelled</p>
                <p className="text-2xl font-bold text-white">
                  {meetings.filter(m => m.status === 'CANCELLED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Meetings List */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Meeting History</h2>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="mx-auto h-12 w-12 text-gray-600" />
                <h3 className="mt-2 text-sm font-medium text-gray-300">No previous meetings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your completed meetings will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="bg-gray-900/50 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {meeting.title}
                          </h3>
                          {meeting.hostId === user?.id && (
                            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded border border-blue-500/20">
                              Host
                            </span>
                          )}
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(meeting.status)}`}
                          >
                            {meeting.status}
                          </span>
                          {meeting.recordingUrl && (
                            <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs font-medium rounded border border-red-500/20">
                              📹 Recorded
                            </span>
                          )}
                        </div>

                        {meeting.description && (
                          <p className="text-sm text-gray-400 mb-3">
                            {meeting.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(meeting.scheduledFor)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(meeting.scheduledFor)} • {meeting.duration} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {meeting.totalParticipants} participant{meeting.totalParticipants !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        <button
                          onClick={() => handleViewDetails(meeting.streamCallId)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition text-sm font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
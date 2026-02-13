'use client';

import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Loader2 } from 'lucide-react';
import { MeetingDetails } from '@/Types/meeting.types';
import { getStatusColor } from '@/Utils/formatters';

interface MeetingHeaderProps {
  meeting: MeetingDetails;
  isHost: boolean;
  isDeleting: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export default function MeetingHeader({
  meeting,
  isHost,
  isDeleting,
  onEditClick,
  onDeleteClick
}: MeetingHeaderProps) {
  return (
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
                onClick={onEditClick}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={onDeleteClick}
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
      </div>
    </div>
  );
}
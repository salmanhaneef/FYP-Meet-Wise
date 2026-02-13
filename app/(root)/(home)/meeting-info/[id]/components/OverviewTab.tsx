'use client';

import { useRouter } from 'next/navigation';
import { Calendar, Clock, UserCheck, Video, Download, Sparkles } from 'lucide-react';
import { MeetingDetails, TabType } from '@/Types/meeting.types';
import { formatDate, formatTime, formatDuration, getStatusColor } from '@/Utils/formatters';

interface OverviewTabProps {
  meeting: MeetingDetails;
  isHost: boolean;
  onTabChange: (tab: TabType) => void;
}

export default function OverviewTab({ meeting, isHost, onTabChange }: OverviewTabProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
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
              {[
                { label: 'Total Participants', value: meeting.analytics.totalParticipants, color: 'text-white' },
                { label: 'Still Active', value: meeting.analytics.participantsStillActive, color: 'text-green-400' },
                { label: 'Avg Duration', value: `${meeting.analytics.averageDuration}s`, color: 'text-blue-400' },
                { label: 'Mic Muted', value: meeting.analytics.participantsWithMicMuted, color: 'text-yellow-400' },
                { label: 'Camera Off', value: meeting.analytics.participantsWithCameraOff, color: 'text-purple-400' },
                { label: 'Who Left', value: meeting.analytics.participantsWhoLeft, color: 'text-red-400' },
              ].map((stat, index) => (
                <div key={index} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
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

        {/* Recordings Preview (Host Only) */}
        {isHost && meeting.recordingUrls && meeting.recordingUrls.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Recordings ({meeting.recordingUrls.length})
            </h2>
            
            <div className="space-y-3">
              {meeting.recordingUrls.slice(0, 2).map((url, index) => (
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
              {meeting.recordingUrls.length > 2 && (
                <button
                  onClick={() => onTabChange('recordings')}
                  className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 transition"
                >
                  View all {meeting.recordingUrls.length} recordings →
                </button>
              )}
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
              onClick={() => onTabChange('summary')}
              className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition"
            >
              Read full summary →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
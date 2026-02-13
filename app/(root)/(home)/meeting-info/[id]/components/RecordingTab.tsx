'use client';

import { useState } from 'react';
import { Download, Music, Video as VideoIcon } from 'lucide-react';
import { Recording } from '@/Types/meeting.types';
import { formatDuration, formatFileSize } from '@/constants/MeetingData';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';

interface RecordingsTabProps {
  recordings: Recording[];
}

export default function RecordingsTab({ recordings }: RecordingsTabProps) {
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [playerType, setPlayerType] = useState<'video' | 'audio' | null>(null);

  const handlePlayRecording = (recording: Recording) => {
    setSelectedRecording(recording);
    setPlayerType(recording.type);
  };

  const handleClosePlayer = () => {
    setSelectedRecording(null);
    setPlayerType(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Active Player */}
      {selectedRecording && playerType && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Now Playing</h2>
            <button
              onClick={handleClosePlayer}
              className="text-gray-400 hover:text-white transition"
            >
              Close Player
            </button>
          </div>
          
          {playerType === 'video' && <VideoPlayer recording={selectedRecording} />}
          {playerType === 'audio' && <AudioPlayer recording={selectedRecording} />}
        </div>
      )}

      {/* Recordings List */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            Meeting Recordings ({recordings.length})
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Available recordings from this meeting
          </p>
        </div>

        <div className="p-6 space-y-4">
          {recordings.map((recording, index) => (
            <div
              key={index}
              className={`group bg-gray-900/50 rounded-lg border transition-all ${
                selectedRecording?.url === recording.url
                  ? 'border-blue-500 bg-blue-500/5'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`rounded-lg p-3 ${
                    recording.type === 'video'
                      ? 'bg-red-500/10 border border-red-500/20'
                      : 'bg-blue-500/10 border border-blue-500/20'
                  }`}>
                    {recording.type === 'video' ? (
                      <VideoIcon className="h-6 w-6 text-red-400" />
                    ) : (
                      <Music className="h-6 w-6 text-blue-400" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {recording.filename || `Recording ${index + 1}`}
                        </h3>
                        <p className="text-sm text-gray-400 capitalize">
                          {recording.type} Recording
                        </p>
                      </div>
                      
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                        recording.type === 'video'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {recording.type.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      {recording.duration && (
                        <span>⏱️ {formatDuration(recording.duration)}</span>
                      )}
                      {recording.size && (
                        <span>💾 {formatFileSize(recording.size)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handlePlayRecording(recording)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                      recording.type === 'video'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {recording.type === 'video' ? (
                      <VideoIcon className="h-4 w-4" />
                    ) : (
                      <Music className="h-4 w-4" />
                    )}
                    Play {recording.type}
                  </button>

                  <a
                    href={recording.url}
                    download={recording.filename}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h3 className="text-blue-400 font-semibold mb-2">📌 Instructions</h3>
        <p className="text-sm text-gray-300 mb-2">
          This page currently uses <strong>hardcoded sample recordings</strong> for testing.
        </p>
        <p className="text-sm text-gray-400">
          To use real recordings from your API, the recordings will be automatically fetched
          from the <code className="bg-gray-900 px-2 py-1 rounded">recordingUrls</code> field
          in your meeting response.
        </p>
      </div>
    </div>
  );
}
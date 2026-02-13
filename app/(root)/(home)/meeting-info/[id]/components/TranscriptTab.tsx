'use client';

import { useState } from 'react';
import { Search, User, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { TranscriptSegment } from '@/Types/meeting.types';
import { getTranscriptText } from '@/constants/MeetingData';
import { formatTimestamp, highlightSearchTerm } from '@/Utils/formatters';

interface TranscriptTabProps {
  transcript: TranscriptSegment[];
}

export default function TranscriptTab({ transcript }: TranscriptTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSegments, setExpandedSegments] = useState<Set<number>>(new Set());

  const toggleSegment = (index: number) => {
    const newExpanded = new Set(expandedSegments);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSegments(newExpanded);
  };

  const filteredTranscript = transcript.filter(segment =>
    searchQuery === '' || 
    getTranscriptText(segment).toLowerCase().includes(searchQuery.toLowerCase()) ||
    segment.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Meeting Transcript</h2>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[600px] overflow-y-auto">
          {filteredTranscript && filteredTranscript.length > 0 ? (
            <div className="space-y-4">
              {filteredTranscript.map((segment, index) => {
                const text = getTranscriptText(segment);
                const isExpanded = expandedSegments.has(index);
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
                          onClick={() => toggleSegment(index)}
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
                        ? highlightSearchTerm(text.substring(0, 200) + '...', searchQuery)
                        : highlightSearchTerm(text, searchQuery)
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
  );
}
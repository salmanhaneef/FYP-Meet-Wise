/**
 * Utility Functions for Meeting Details
 */

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getStatusColor = (status: string): string => {
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

export const getPriorityColor = (priority?: string): string => {
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

// Import ReactElement or use React.ReactNode for the return type
import { ReactElement } from 'react';

export const highlightSearchTerm = (text: string, search: string): (string | ReactElement)[] => {
  if (!search) return [text];
  
  // Escape special regex characters to prevent regex errors
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearch})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-500/30 text-yellow-200 px-1 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
};
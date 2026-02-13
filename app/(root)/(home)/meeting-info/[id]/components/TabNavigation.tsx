'use client';

import { FileText, MessageSquare, Sparkles, ListTodo, Video } from 'lucide-react';
import { TabType, MeetingDetails } from '@/Types/meeting.types';

interface TabNavigationProps {
  activeTab: TabType;
  meeting: MeetingDetails;
  onTabChange: (tab: TabType) => void;
}

export default function TabNavigation({ activeTab, meeting, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: FileText, show: true },
    { id: 'transcript' as TabType, label: 'Transcript', icon: MessageSquare, show: !!meeting.transcript },
    { id: 'summary' as TabType, label: 'Summary', icon: Sparkles, show: !!meeting.summary },
    { id: 'actions' as TabType, label: 'Actions', icon: ListTodo, show: meeting.actionItems && meeting.actionItems.length > 0, count: meeting.actionItems?.length },
    { id: 'recordings' as TabType, label: 'Recordings', icon: Video, show: meeting.recordings && meeting.recordings.length > 0, count: meeting.recordings?.length },
  ];

  return (
    <div className="mt-6 border-b border-gray-700">
      <nav className="flex gap-1 overflow-x-auto">
        {tabs.filter(tab => tab.show).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== undefined && ` (${tab.count})`}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
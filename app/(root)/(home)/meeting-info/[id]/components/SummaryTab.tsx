'use client';

import { Sparkles } from 'lucide-react';

interface SummaryTabProps {
  summary: string;
}

export default function SummaryTab({ summary }: SummaryTabProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-lg shadow-lg border border-blue-500/20 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-8 w-8 text-blue-400" />
          <h2 className="text-3xl font-bold text-white">AI-Generated Summary</h2>
        </div>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-200 leading-relaxed">
            {summary}
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-sm text-gray-500">
            This summary was automatically generated using AI. It highlights the key points and decisions made during the meeting.
          </p>
        </div>
      </div>
    </div>
  );
}
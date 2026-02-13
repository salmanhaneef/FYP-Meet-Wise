'use client';

import { useState } from 'react';
import { ListTodo, CheckCircle2, Clock, Copy, Check } from 'lucide-react';
import { ActionItem } from '@/Types/meeting.types';
import { getPriorityColor } from '@/Utils/formatters';

interface ActionItemsTabProps {
  actionItems: ActionItem[];
}

export default function ActionItemsTab({ actionItems }: ActionItemsTabProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = (item: ActionItem) => {
    navigator.clipboard.writeText(item.text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />;
      default:
        return <ListTodo className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <ListTodo className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">
              Action Items ({actionItems.length})
            </h2>
          </div>
        </div>

        <div className="p-6">
          {actionItems.length > 0 ? (
            <div className="space-y-3">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition group"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getStatusIcon(item.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 leading-relaxed mb-3">{item.text}</p>
                      
                      <div className="flex items-center gap-2 flex-wrap">
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
                      onClick={() => copyToClipboard(item)}
                      className="opacity-0 group-hover:opacity-100 transition p-2 hover:bg-gray-800 rounded"
                      title="Copy to clipboard"
                    >
                      {copiedId === item.id ? (
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
  );
}
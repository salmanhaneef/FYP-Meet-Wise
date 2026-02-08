'use client';

import { useState, useEffect } from 'react';
import { UserButton } from '@clerk/nextjs';
import { Menu, Plus, UserPlus, Clock } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  onCreateMeeting: () => void;
  onInviteParticipant: () => void;
}

export default function Navbar({ 
  onMenuClick, 
  onCreateMeeting, 
  onInviteParticipant 
}: NavbarProps) {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const dateString = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      setCurrentTime(`${dateString} • ${timeString}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        {/* Left Section - Menu & Time */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          {/* Current Time */}
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{currentTime}</span>
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Create Meeting Button */}
          <button
            onClick={onCreateMeeting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 lg:px-4 rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Meeting</span>
            <span className="sm:hidden">Create</span>
          </button>

          {/* Invite Participant Button */}
          <button
            onClick={onInviteParticipant}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 lg:px-4 rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Invite</span>
          </button>

          {/* User Profile Button */}
          <div className="ml-2">
            <UserButton 
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 lg:w-10 lg:h-10"
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Time Display */}
      <div className="md:hidden mt-2 flex items-center gap-2 text-xs text-gray-600">
        <Clock className="w-3 h-3" />
        <span>{currentTime}</span>
      </div>
    </nav>
  );
}
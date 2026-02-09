// app/dashboard/components/DashboardClient.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import CreateMeetingModal from './CreateMeetingModal';
import InviteParticipantModal from './InviteParticipantModal';
import UpcomingMeetings from './UpcomingMeetings';
import PreviousMeetings from './PreviousMeetings';

export default function DashboardClient() {
  const { user, isLoaded } = useUser();
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal states
  const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Selected meeting state for invite functionality
  const [selectedMeeting, setSelectedMeeting] = useState<{
    id: string;
    streamCallId: string;
    title: string;
  } | null>(null);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in</div>;
  }

  // Handle meeting selection from UpcomingMeetings component
  const handleSelectMeeting = (meeting: {
    id: string;
    streamCallId: string;
    title: string;
  }) => {
    setSelectedMeeting(meeting);
    console.log("✅ Meeting selected:", meeting);
  };

  // Handle invite button click from navbar
  const handleInviteClick = () => {
    if (selectedMeeting) {
      setIsInviteModalOpen(true);
    } else {
      console.log("⚠️ No meeting selected - Please select a meeting first");
    }
  };

  // Handle opening invite modal with specific meeting (from meeting card)
  const handleOpenInviteModal = (meetingId: string, streamCallId: string, title: string) => {
    setSelectedMeeting({ id: meetingId, streamCallId, title });
    setIsInviteModalOpen(true);
  };

  // Handle closing invite modal
  const handleInviteModalClose = () => {
    setIsInviteModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onCreateMeeting={() => setIsCreateMeetingOpen(true)}
          onInviteParticipant={handleInviteClick}
          hasSelectedMeeting={!!selectedMeeting}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Dashboard Header */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user.firstName || 'User'}!
            </p>
          </div>

          {/* Selected Meeting Indicator */}
          {selectedMeeting && (
            <div className="mx-6 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  📌 Selected Meeting: {selectedMeeting.title}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  Click invite button in navbar to add participants
                </p>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 hover:bg-blue-100 rounded transition-colors"
              >
                Clear Selection
              </button>
            </div>
          )}

          {/* Meetings Grid */}
          <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
            {/* Left Side - Upcoming Meetings */}
            <div className="w-full lg:w-1/2 order-2 lg:order-1">
              <UpcomingMeetings 
                userId={user.id}
                onSelectMeeting={handleSelectMeeting}
                selectedMeetingId={selectedMeeting?.id}
                onOpenInviteModal={handleOpenInviteModal}
              />
            </div>

            {/* Right Side - Previous Meetings */}
            <div className="w-full lg:w-1/2 order-1 lg:order-2">
              <PreviousMeetings />
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <CreateMeetingModal
        isOpen={isCreateMeetingOpen}
        onClose={() => setIsCreateMeetingOpen(false)}
      />

      <InviteParticipantModal
        isOpen={isInviteModalOpen}
        onClose={handleInviteModalClose}
        meetingId={selectedMeeting?.streamCallId || null}
      />
    </div>
  );
}
'use client';

import { useState, createContext, useContext } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import CreateMeetingModal from './CreateMeetingModal';
import InviteParticipantModal from './InviteParticipantModal';

interface DashboardContextType {
  handleOpenInviteModal: (meetingId: string) => void;
  userId: string;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardLayout');
  }
  return context;
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  userId: string;
}

export default function DashboardLayout({ children, userId }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  const handleOpenInviteModal = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setIsInviteModalOpen(true);
  };

  return (
    <DashboardContext.Provider value={{ handleOpenInviteModal, userId }}>
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
            onInviteParticipant={() => {
              if (selectedMeetingId) {
                setIsInviteModalOpen(true);
              }
            }}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Modals */}
        <CreateMeetingModal
          isOpen={isCreateMeetingOpen}
          onClose={() => setIsCreateMeetingOpen(false)}
        />

        <InviteParticipantModal
          isOpen={isInviteModalOpen}
          onClose={() => {
            setIsInviteModalOpen(false);
            setSelectedMeetingId(null);
          }}
          meetingId={selectedMeetingId}
        />
      </div>
    </DashboardContext.Provider>
  );
}
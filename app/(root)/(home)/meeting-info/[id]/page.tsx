"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2, X, Save } from "lucide-react";
import Link from "next/link";

// Types
import { MeetingDetails, TabType } from "@/Types/meeting.types";

// Components
import MeetingHeader from "./components/MeetingHeader";
import TabNavigation from "./components/TabNavigation";
import OverviewTab from "./components/OverviewTab";
import TranscriptTab from "./components/TranscriptTab";
import SummaryTab from "./components/SummaryTab";
import ActionItemsTab from "./components/ActionItemsTab";
import RecordingsTab from "./components/RecordingTab";
// Mock Data
import {
  MOCK_TRANSCRIPT,
  MOCK_SUMMARY,
  MOCK_ACTION_ITEMS,
  MOCK_RECORDINGS_EXTERNAL,
} from "@/constants/MeetingData";

/* -------------------------------------------------------------------------- */
/*                         HARDCODED VERSION                                  */
/*            For testing with sample data before API integration             */
/* -------------------------------------------------------------------------- */

export default function MeetingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { user } = useUser();

  const [meeting, setMeeting] = useState<MeetingDetails | null>(null);
  const [isHost, setIsHost] = useState(true); // Hardcoded as host for testing
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [editData, setEditData] = useState({
    title: "",
    description: "",
    status: "",
  });

  /* ------------------------------------------------------------------------ */
  /*                      LOAD MOCK DATA (HARDCODED)                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (user) {
      // Simulate API loading delay
      setTimeout(() => {
        const mockMeeting: MeetingDetails = {
          streamCallId: id,
          title: "Quarterly Performance Review - Q1 2024",
          description:
            "Comprehensive review of performance metrics, team achievements, and planning for Q2 initiatives.",
          scheduledFor: "2024-03-11T10:00:00Z",
          duration: 60,
          status: "COMPLETED",
          startedAt: "2024-03-11T10:02:00Z",
          endedAt: "2024-03-11T10:58:00Z",
          actualDuration: 56,

          // Hardcoded recordings with external URLs for testing
          recordings: MOCK_RECORDINGS_EXTERNAL,
          recordingUrls: MOCK_RECORDINGS_EXTERNAL.map((r) => r.url),
          recordingDuration: 3360,
          hasRecordings: true,

          // Hardcoded content
          transcript: MOCK_TRANSCRIPT,
          summary: MOCK_SUMMARY,
          actionItems: MOCK_ACTION_ITEMS,

          // Participants
          totalParticipants: 2,
          participants: [
            {
              id: "1",
              joinedAt: "2024-03-11T10:02:00Z",
              leftAt: "2024-03-11T10:58:00Z",
              duration: 3360,
              isMicMuted: false,
              isCameraOff: false,
              user: {
                id: "user1",
                firstName: "Rachel",
                lastName: "Anderson",
                email: "rachel@company.com",
                username: "rachel",
                imageUrl: "https://i.pravatar.cc/150?img=1",
              },
            },
            {
              id: "2",
              joinedAt: "2024-03-11T10:05:00Z",
              leftAt: "2024-03-11T10:58:00Z",
              duration: 3180,
              isMicMuted: false,
              isCameraOff: false,
              user: {
                id: "user2",
                firstName: "Gowreesh",
                lastName: "Simhadri",
                email: "gowreesh@company.com",
                username: "gowreesh",
                imageUrl: "https://i.pravatar.cc/150?img=12",
              },
            },
          ],

          // Host
          host: {
            id: "user1",
            firstName: "Rachel",
            lastName: "Anderson",
            email: "rachel@company.com",
            username: "rachel",
            imageUrl: "https://i.pravatar.cc/150?img=1",
          },

          // Analytics
          analytics: {
            totalParticipants: 2,
            participantsWhoLeft: 2,
            participantsStillActive: 0,
            averageDuration: 3270,
            participantsWithMicMuted: 0,
            participantsWithCameraOff: 0,
          },
        };

        setMeeting(mockMeeting);
        setEditData({
          title: mockMeeting.title,
          description: mockMeeting.description || "",
          status: mockMeeting.status,
        });
        setIsLoading(false);
      }, 800);
    }
  }, [user, id]);

  /* ------------------------------------------------------------------------ */
  /*                          MOCK HANDLERS                                   */
  /* ------------------------------------------------------------------------ */

  const handleUpdateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    // Simulate API call
    setTimeout(() => {
      if (meeting) {
        setMeeting({
          ...meeting,
          ...editData,
        });
        setIsEditModalOpen(false);
        alert("Meeting updated successfully! (Mock)");
      }
      setIsUpdating(false);
    }, 1000);
  };

  const handleDeleteMeeting = async () => {
    if (!confirm("Are you sure you want to delete this meeting?")) {
      return;
    }

    setIsDeleting(true);

    // Simulate API call
    setTimeout(() => {
      alert("Meeting deleted successfully! (Mock)");
      window.location.href = "/meetings";
    }, 1000);
  };

  /* ------------------------------------------------------------------------ */
  /*                          LOADING & ERROR STATES                          */
  /* ------------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Meeting not found
          </h2>
          <Link
            href="/meetings"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Back to Meetings
          </Link>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                              RENDER                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <MeetingHeader
        meeting={meeting}
        isHost={isHost}
        isDeleting={isDeleting}
        onEditClick={() => setIsEditModalOpen(true)}
        onDeleteClick={handleDeleteMeeting}
      />

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TabNavigation
          activeTab={activeTab}
          meeting={meeting}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <OverviewTab
            meeting={meeting}
            isHost={isHost}
            onTabChange={setActiveTab}
          />
        )}

        {activeTab === "transcript" && meeting.transcript && (
          <TranscriptTab transcript={meeting.transcript} />
        )}

        {activeTab === "summary" && meeting.summary && (
          <SummaryTab summary={meeting.summary} />
        )}

        {activeTab === "actions" && meeting.actionItems && (
          <ActionItemsTab actionItems={meeting.actionItems} />
        )}

        {activeTab === "recordings" && meeting.recordings && (
          <RecordingsTab recordings={meeting.recordings} />
        )}
      </div>

      {/* Edit Modal */}
      {isHost && isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Edit Meeting</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white transition"
                aria-label="Close edit modal"
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateMeeting} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={editData.status}
                  onChange={(e) =>
                    setEditData({ ...editData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testing Notice */}
      <div className="fixed bottom-4 right-4 max-w-sm">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 shadow-lg backdrop-blur">
          <p className="text-xs text-yellow-400 font-semibold mb-1">
            🧪 HARDCODED VERSION
          </p>
          <p className="text-xs text-gray-300">
            This page uses sample data for testing. See the API version for real
            data integration.
          </p>
        </div>
      </div>
    </div>
  );
}

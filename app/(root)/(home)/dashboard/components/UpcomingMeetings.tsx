"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Calendar,
  Clock,
  Users,
  Copy,
  Edit,
  Trash2,
  Video,
  UserPlus,
  X,
  Save,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface Meeting {
  id: string;
  streamCallId: string;
  title: string;
  description: string | null;
  scheduledFor: string;
  duration: number;
  status: string;
  totalParticipants: number;
  hostId: string;
  host: {
    id: string;
    clerkId?: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

interface UpcomingMeetingsProps {
  userId: string;
  onSelectMeeting?: (meeting: { id: string; streamCallId: string; title: string }) => void;
  selectedMeetingId?: string;
  onOpenInviteModal?: (meetingId: string, streamCallId: string, title: string) => void;
}

export default function UpcomingMeetings({ 
  userId, 
  onSelectMeeting,
  selectedMeetingId,
  onOpenInviteModal 
}: UpcomingMeetingsProps) {
  const { user } = useUser();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  // Update Modal State
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [meetingToUpdate, setMeetingToUpdate] = useState<Meeting | null>(null);
  const [updateForm, setUpdateForm] = useState({
    title: "",
    description: "",
    scheduledFor: "",
    duration: 30,
  });
  const [updatingMeeting, setUpdatingMeeting] = useState(false);

  useEffect(() => {
    fetchUpcomingMeetings();
  }, [userId]);

  const fetchUpcomingMeetings = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/meeting/upcoming?testUserId=${userId}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setMeetings(data.meetings);
        console.log("✅ Meetings loaded:", data.meetings);
      } else {
        console.error("❌ API returned error:", data.error);
        toast.error(data.error || "Failed to load meetings");
      }
    } catch (error) {
      console.error("❌ Failed to fetch upcoming meetings:", error);
      toast.error("Failed to load upcoming meetings");
    } finally {
      setLoading(false);
    }
  };

  // ==================== UPDATE MODAL FUNCTIONS ====================

  const openUpdateModal = (meeting: Meeting) => {
    setMeetingToUpdate(meeting);
    
    const scheduledDate = new Date(meeting.scheduledFor);
    const formattedDate = format(scheduledDate, "yyyy-MM-dd'T'HH:mm");
    
    setUpdateForm({
      title: meeting.title,
      description: meeting.description || "",
      scheduledFor: formattedDate,
      duration: meeting.duration,
    });
    
    setUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setMeetingToUpdate(null);
    setUpdateForm({
      title: "",
      description: "",
      scheduledFor: "",
      duration: 30,
    });
  };

  const handleUpdateMeeting = async () => {
    if (!meetingToUpdate) return;

    if (!updateForm.title.trim()) {
      toast.error("Meeting title is required");
      return;
    }

    if (!updateForm.scheduledFor) {
      toast.error("Scheduled time is required");
      return;
    }

    if (updateForm.duration <= 0) {
      toast.error("Duration must be greater than 0");
      return;
    }

    setUpdatingMeeting(true);

    try {
      console.log("🔄 Updating meeting:", meetingToUpdate.id);

      const response = await fetch(`/api/meeting?testUserId=${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingId: meetingToUpdate.id,
          title: updateForm.title,
          description: updateForm.description,
          scheduledFor: new Date(updateForm.scheduledFor).toISOString(),
          duration: updateForm.duration,
        }),
      });

      const data = await response.json();
      console.log("📝 Update response:", data);

      if (response.ok && data.success) {
        toast.success("Meeting updated successfully!");
        closeUpdateModal();
        fetchUpcomingMeetings();
      } else {
        toast.error(data.error || "Failed to update meeting");
      }
    } catch (error) {
      console.error("❌ Error updating meeting:", error);
      toast.error("Failed to update meeting");
    } finally {
      setUpdatingMeeting(false);
    }
  };

  // ==================== OTHER FUNCTIONS ====================

  const handleSelectMeeting = (meeting: Meeting) => {
    if (onSelectMeeting) {
      onSelectMeeting({
        id: meeting.id,
        streamCallId: meeting.streamCallId,
        title: meeting.title,
      });
    }
  };

  const copyMeetingLink = (streamCallId: string) => {
    const link = `${window.location.origin}/meeting/${streamCallId}`;
    navigator.clipboard.writeText(link);
    toast.success("Meeting link copied to clipboard!");
  };

  const handleDelete = async (meeting: Meeting) => {
    if (!confirm(`Are you sure you want to delete "${meeting.title}"?`)) return;

    try {
      console.log("🗑️ Deleting meeting:", meeting.id);

      const response = await fetch(
        `/api/meeting?meetingId=${meeting.id}&testUserId=${userId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();
      console.log("🗑️ Delete response:", data);

      if (response.ok && data.success) {
        toast.success("Meeting cancelled successfully!");
        fetchUpcomingMeetings();
      } else {
        toast.error(data.error || "Failed to delete meeting");
      }
    } catch (error) {
      console.error("❌ Error deleting meeting:", error);
      toast.error("Failed to delete meeting");
    }
  };

  const joinMeeting = (streamCallId: string) => {
    window.open(`/meeting/${streamCallId}`, "_blank");
  };

  const isHost = (meeting: Meeting) => {
    console.log("🔍 [isHost] Checking host status:");
    console.log("   - user?.id (Clerk ID from hook):", user?.id);
    console.log("   - userId (prop - testUserId):", userId);
    console.log("   - meeting.hostId (DB UUID):", meeting.hostId);
    console.log("   - meeting.host:", meeting.host);
    
    let result = false;
    
    if (meeting.host?.clerkId) {
      result = meeting.host.clerkId === user?.id || meeting.host.clerkId === userId;
      console.log("   - Comparing clerkId:", result);
    } else if (user?.id) {
      result = meeting.host?.id === user.id;
      console.log("   - Comparing host.id with user.id:", result);
    } else {
      result = meeting.host?.id === userId;
      console.log("   - Test mode comparison:", result);
    }
    
    console.log("   - Final Result:", result);
    
    return result;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Upcoming Meetings</h2>
        <p className="text-sm text-gray-500 mt-1">
          {meetings.length} {meetings.length === 1 ? "meeting" : "meetings"}{" "}
          scheduled
        </p>
      </div>

      {/* Meetings List */}
      <div className="p-6 space-y-4">
        {meetings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No upcoming meetings
            </h3>
            <p className="text-gray-500 text-sm">
              Create a new meeting to get started
            </p>
          </div>
        ) : (
          meetings.map((meeting) => {
            const isSelected = selectedMeetingId === meeting.id;
            
            return (
              <div
                key={meeting.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200'
                }`}
              >
                {/* Selection Banner */}
                {isSelected && (
                  <div className="mb-3 px-3 py-2 bg-blue-600 text-white text-sm rounded-md flex items-center justify-between">
                    <span className="font-medium">✓ Selected for Invite</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectMeeting) onSelectMeeting({ id: '', streamCallId: '', title: '' });
                      }}
                      className="text-xs underline hover:no-underline"
                    >
                      Deselect
                    </button>
                  </div>
                )}

                {/* Meeting Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {meeting.title}
                    </h3>
                    {meeting.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {meeting.description}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`
                    px-3 py-1 rounded-full text-xs font-medium ml-2
                    ${
                      meeting.status === "ONGOING"
                        ? "bg-green-100 text-green-700"
                        : meeting.status === "COMPLETED"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-blue-100 text-blue-700"
                    }
                  `}
                  >
                    {meeting.status}
                  </span>
                </div>

                {/* Meeting Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(meeting.scheduledFor), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {format(new Date(meeting.scheduledFor), "hh:mm a")} •{" "}
                      {meeting.duration} min
                    </span>
                  </div>
                  {!isHost(meeting) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>
                        Host:{" "}
                        {meeting.host?.firstName ||
                          meeting.host?.email ||
                          "Unknown"}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{meeting.totalParticipants} participants</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {/* Join Meeting Button */}
                  <button
                    onClick={() => joinMeeting(meeting.streamCallId)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Join Meeting
                  </button>

                  {/* Host-Only Actions */}
                  {isHost(meeting) && (
                    <>
                      {/* Select for Invite Button */}
                      {!isSelected && (
                        <button
                          onClick={() => handleSelectMeeting(meeting)}
                          className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          title="Select this meeting to invite participants"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span className="hidden sm:inline">Select to Invite</span>
                        </button>
                      )}

                      {/* Invite Button - Direct */}
                      <button
                        onClick={() => {
                          if (onOpenInviteModal) {
                            onOpenInviteModal(meeting.id, meeting.streamCallId, meeting.title);
                          }
                        }}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        title="Invite participants"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Invite</span>
                      </button>

                      {/* Copy Link Button */}
                      <button
                        onClick={() => copyMeetingLink(meeting.streamCallId)}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        title="Copy meeting link"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="hidden sm:inline">Copy Link</span>
                      </button>

                      {/* Update Button */}
                      <button
                        onClick={() => openUpdateModal(meeting)}
                        className="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        title="Update meeting"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Update</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(meeting)}
                        className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        title="Delete meeting"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ==================== UPDATE MODAL ==================== */}
      {updateModalOpen && meetingToUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Update Meeting
                </h3>
                <p className="text-sm text-gray-500">
                  Edit meeting details
                </p>
              </div>
              <button
                onClick={closeUpdateModal}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close update modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={updateForm.title}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, title: e.target.value })
                  }
                  placeholder="e.g., Team Standup"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={updateForm.description}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Meeting agenda and details"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Scheduled For Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled For *
                </label>
                <input
                  type="datetime-local"
                  value={updateForm.scheduledFor}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      scheduledFor: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Duration Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={updateForm.duration}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      duration: parseInt(e.target.value) || 30,
                    })
                  }
                  min="15"
                  step="15"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={closeUpdateModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateMeeting}
                disabled={updatingMeeting}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updatingMeeting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
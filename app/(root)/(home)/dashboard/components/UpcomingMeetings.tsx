"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  Copy,
  Edit,
  Trash2,
  Video,
  UserPlus, // 🛠️ ADDED: Invite icon
  X, // 🛠️ ADDED: Close modal icon
  Send, // 🛠️ ADDED: Send icon
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
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

// 🛠️ ADDED: Interface for invite form
interface Participant {
  email: string;
  name: string;
}

interface UpcomingMeetingsProps {
  userId: string;
}

export default function UpcomingMeetings({ userId }: UpcomingMeetingsProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  // 🛠️ ADDED: Modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([
    { email: "", name: "" },
  ]);
  const [sendingInvite, setSendingInvite] = useState(false);

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

  // 🛠️ ADDED: Open invite modal
  const openInviteModal = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setParticipants([{ email: "", name: "" }]);
    setInviteModalOpen(true);
  };

  // 🛠️ ADDED: Close invite modal
  const closeInviteModal = () => {
    setInviteModalOpen(false);
    setSelectedMeeting(null);
    setParticipants([{ email: "", name: "" }]);
  };

  // 🛠️ ADDED: Add participant field
  const addParticipant = () => {
    setParticipants([...participants, { email: "", name: "" }]);
  };

  // 🛠️ ADDED: Remove participant field
  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  // 🛠️ ADDED: Update participant
  const updateParticipant = (
    index: number,
    field: keyof Participant,
    value: string,
  ) => {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  };

  // 🛠️ ADDED: Send invitations
  const sendInvitations = async () => {
    if (!selectedMeeting) return;

    // Validate participants
    const validParticipants = participants.filter((p) => p.email.trim() !== "");
    if (validParticipants.length === 0) {
      toast.error("Please enter at least one email address");
      return;
    }

    setSendingInvite(true);

    try {
      console.log(
        "🚀 Sending invite to:",
        `/api/meeting/${selectedMeeting.streamCallId}/invite`,
      );

      const response = await fetch(
        `/api/meeting/${selectedMeeting.streamCallId}/invite?testUserId=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ participants: validParticipants }),
        },
      );

      const data = await response.json();
      console.log("📧 Invite response:", data);

      if (response.ok && data.success) {
        toast.success(
          `Invitations sent to ${data.invitationsCreated} participant(s)!`,
        );
        closeInviteModal();
        fetchUpcomingMeetings(); // Refresh to show updated participant count
      } else {
        toast.error(data.error || "Failed to send invitations");
      }
    } catch (error) {
      console.error("❌ Error sending invitations:", error);
      toast.error("Failed to send invitations");
    } finally {
      setSendingInvite(false);
    }
  };

  const copyMeetingLink = (streamCallId: string) => {
    const link = `${window.location.origin}/meeting/${streamCallId}`;
    navigator.clipboard.writeText(link);
    toast.success("Meeting link copied to clipboard!");
  };

  const handleEdit = (meetingId: string) => {
    toast.success("Edit meeting (to be implemented)");
  };

  const handleDelete = async (meetingId: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;

    try {
      const response = await fetch(
        `/api/meeting/${meetingId}?testUserId=${userId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        toast.success("Meeting deleted successfully");
        fetchUpcomingMeetings();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete meeting");
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
    return meeting.hostId === userId || meeting.host?.id === userId;
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
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
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
                    {/* 🛠️ ADDED: Invite Button */}
                    <button
                      onClick={() => openInviteModal(meeting)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      title="Invite participants"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="hidden sm:inline">Invite</span>
                    </button>

                    <button
                      onClick={() => copyMeetingLink(meeting.streamCallId)}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      title="Copy meeting link"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">Copy Link</span>
                    </button>

                    <button
                      onClick={() => handleEdit(meeting.id)}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      title="Edit meeting"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(meeting.id)}
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
          ))
        )}
      </div>

      {/* 🛠️ ADDED: Invite Modal */}
      {inviteModalOpen && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Invite Participants
                </h3>
                <p className="text-sm text-gray-500">{selectedMeeting.title}</p>
              </div>
              <button
                onClick={closeInviteModal}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close invite modal" // ✅ Provides accessible name
              >
                <span aria-hidden="true">&times;</span>{" "}
                {/* Visual "X" icon (hidden from screen readers) */}
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {participants.map((participant, index) => (
                <div
                  key={index}
                  className="space-y-2 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Participant {index + 1}
                    </span>
                    {participants.length > 1 && (
                      <button
                        onClick={() => removeParticipant(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    type="email"
                    placeholder="Email address"
                    value={participant.email}
                    onChange={(e) =>
                      updateParticipant(index, "email", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <input
                    type="text"
                    placeholder="Name (optional)"
                    value={participant.name}
                    onChange={(e) =>
                      updateParticipant(index, "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}

              <button
                onClick={addParticipant}
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                + Add Another Participant
              </button>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={closeInviteModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendInvitations}
                disabled={sendingInvite}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingInvite ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Invites
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Video,
  Download,
  Mail,
  CheckCircle2,
  XCircle,
  Mic,
  MicOff,
  VideoIcon,
  VideoOff,
  User,
  FileText,
  ClipboardList,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Search,
  Play,
  Pause,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

// Type definitions
interface Word {
  word: string;
  start: number;
  end: number;
}

interface TranscriptSegment {
  speaker: string;
  offset: number;
  words: Word[];
}

interface ActionItem {
  id: number;
  text: string;
  completed?: boolean;
}

interface Host {
  id: string;
  clerkId: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  imageUrl: string | null;
}

interface ParticipantUser {
  id: string;
  clerkId: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  imageUrl: string | null;
}

interface Participant {
  participantId: string;
  joinedAt: string;
  leftAt: string | null;
  duration: number | null;
  durationFormatted: string;
  isMicMuted: boolean;
  isCameraOff: boolean;
  user: ParticipantUser;
}

interface Analytics {
  totalParticipants: number;
  participantsWhoLeft: number;
  participantsStillActive: number;
  averageDuration: number;
  participantsWithMicMuted: number;
  participantsWithCameraOff: number;
}

interface Meeting {
  id: string;
  streamCallId: string;
  title: string;
  description: string | null;
  scheduledFor: string;
  duration: number;
  status: string;
  startedAt: string | null;
  endedAt: string | null;
  actualDuration: number | null;
  totalParticipants: number;
  recordingUrls: string[] | null;
  recordingDuration: number | null;
  hasRecordings: boolean;
  host: Host;
  participants: Participant[];
  analytics: Analytics;
  summary?: string;
  actionItems?: ActionItem[];
  transcript?: TranscriptSegment[];
}

interface MeetingDetailsContentProps {
  meeting: Meeting;
}

export default function MeetingDetailsEnhanced({
  meeting,
}: MeetingDetailsContentProps) {
  const router = useRouter();
  const [downloadingRecording, setDownloadingRecording] = useState<
    number | null
  >(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "transcript" | "summary"
  >("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedParticipants, setExpandedParticipants] = useState(true);
  const [playingSegment, setPlayingSegment] = useState<number | null>(null);

  const downloadRecording = async (url: string, index: number) => {
    setDownloadingRecording(index);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `meeting-recording-${index + 1}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Recording downloaded successfully");
    } catch (error) {
      console.error("Error downloading recording:", error);
      toast.error("Failed to download recording");
    } finally {
      setDownloadingRecording(null);
    }
  };

  const sendInviteReminder = async (participantEmail: string) => {
    try {
      const response = await fetch(
        `/api/meeting/${meeting.streamCallId}/invite`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participants: [{ email: participantEmail }],
          }),
        },
      );

      if (response.ok) {
        toast.success("Reminder sent successfully");
      } else {
        toast.error("Failed to send reminder");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder");
    }
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTranscriptText = (segment: TranscriptSegment): string => {
    return segment.words.map((w) => w.word).join(" ");
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const filteredTranscript = meeting.transcript?.filter((segment) =>
    searchTerm
      ? getTranscriptText(segment)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : true,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {meeting.title}
              </h1>
              {meeting.description && (
                <p className="text-gray-600 text-sm sm:text-base">
                  {meeting.description}
                </p>
              )}
            </div>

            <span
              className={`
              px-4 py-2 rounded-full text-sm font-semibold shadow-sm whitespace-nowrap
              ${
                meeting.status === "COMPLETED"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                  : meeting.status === "ONGOING"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white animate-pulse"
                    : "bg-gray-100 text-gray-700"
              }
            `}
            >
              {meeting.status}
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-6 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 font-medium transition-all whitespace-nowrap ${
                activeTab === "overview"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Overview
              </div>
            </button>
            {meeting.summary && (
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-4 py-2 font-medium transition-all whitespace-nowrap ${
                  activeTab === "summary"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Summary & Actions
                </div>
              </button>
            )}
            {meeting.transcript && (
              <button
                onClick={() => setActiveTab("transcript")}
                className={`px-4 py-2 font-medium transition-all whitespace-nowrap ${
                  activeTab === "transcript"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Transcript
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Meeting Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Meeting Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Scheduled Date
                      </p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {format(
                          new Date(meeting.scheduledFor),
                          "MMMM dd, yyyy",
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Time
                      </p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {format(new Date(meeting.scheduledFor), "hh:mm a")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                        Scheduled Duration
                      </p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {meeting.duration} minutes
                      </p>
                    </div>
                  </div>

                  {meeting.actualDuration && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-green-700 uppercase tracking-wide">
                          Actual Duration
                        </p>
                        <p className="font-semibold text-gray-900 mt-1">
                          {meeting.actualDuration} minutes
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                        Total Participants
                      </p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {meeting.totalParticipants}
                      </p>
                    </div>
                  </div>

                  {meeting.startedAt && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-green-700 uppercase tracking-wide">
                          Started At
                        </p>
                        <p className="font-semibold text-gray-900 mt-1">
                          {format(new Date(meeting.startedAt), "hh:mm a")}
                        </p>
                      </div>
                    </div>
                  )}

                  {meeting.endedAt && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-red-700 uppercase tracking-wide">
                          Ended At
                        </p>
                        <p className="font-semibold text-gray-900 mt-1">
                          {format(new Date(meeting.endedAt), "hh:mm a")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recordings */}
              {meeting.hasRecordings && meeting.recordingUrls && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    Recordings ({meeting.recordingUrls.length})
                  </h2>

                  <div className="space-y-3">
                    {meeting.recordingUrls.map((url, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Recording {index + 1}
                            </p>
                            <p className="text-sm text-gray-500">
                              {meeting.recordingDuration &&
                                `Duration: ${meeting.recordingDuration} seconds`}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => downloadRecording(url, index)}
                          disabled={downloadingRecording === index}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          <Download className="w-4 h-4" />
                          {downloadingRecording === index
                            ? "Downloading..."
                            : "Download"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Participants List */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Participants ({meeting.participants.length})
                  </h2>
                  <button
                    onClick={() =>
                      setExpandedParticipants(!expandedParticipants)
                    }
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={expandedParticipants ? "Collapse participants" : "Expand participants"}
                  >
                    {expandedParticipants ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {expandedParticipants && (
                  <div className="space-y-3">
                    {meeting.participants.map((participant) => (
                      <div
                        key={participant.participantId}
                        className="flex flex-col sm:flex-row items-start justify-between gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-start gap-3 flex-1 w-full">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
                            {participant.user.imageUrl ? (
                              <Image
                                src={participant.user.imageUrl}
                                alt={participant.user.fullName}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-white" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {participant.user.fullName}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {participant.user.email}
                            </p>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-gray-50 p-2 rounded-lg">
                                <span className="text-gray-500 font-medium">
                                  Joined:{" "}
                                </span>
                                <span className="text-gray-900 font-semibold">
                                  {format(
                                    new Date(participant.joinedAt),
                                    "hh:mm a",
                                  )}
                                </span>
                              </div>
                              {participant.leftAt && (
                                <div className="bg-gray-50 p-2 rounded-lg">
                                  <span className="text-gray-500 font-medium">
                                    Left:{" "}
                                  </span>
                                  <span className="text-gray-900 font-semibold">
                                    {format(
                                      new Date(participant.leftAt),
                                      "hh:mm a",
                                    )}
                                  </span>
                                </div>
                              )}
                              <div className="col-span-2 bg-blue-50 p-2 rounded-lg">
                                <span className="text-blue-700 font-medium">
                                  Duration:{" "}
                                </span>
                                <span className="text-gray-900 font-semibold">
                                  {participant.durationFormatted}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              {participant.isMicMuted ? (
                                <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2.5 py-1.5 rounded-full font-medium">
                                  <MicOff className="w-3 h-3" />
                                  Mic Off
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1.5 rounded-full font-medium">
                                  <Mic className="w-3 h-3" />
                                  Mic On
                                </span>
                              )}

                              {participant.isCameraOff ? (
                                <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2.5 py-1.5 rounded-full font-medium">
                                  <VideoOff className="w-3 h-3" />
                                  Camera Off
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1.5 rounded-full font-medium">
                                  <VideoIcon className="w-3 h-3" />
                                  Camera On
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            sendInviteReminder(participant.user.email)
                          }
                          className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                          aria-label="Send reminder"
                        >
                          <Mail className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Right Side */}
            <div className="space-y-6">
              {/* Analytics Card */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  Analytics
                </h2>

                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-medium">
                        Total Participants
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {meeting.analytics.totalParticipants}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-medium">
                        Participants Left
                      </span>
                      <span className="text-2xl font-bold text-red-600">
                        {meeting.analytics.participantsWhoLeft}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-medium">
                        Still Active
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {meeting.analytics.participantsStillActive}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-medium">
                        Avg Duration
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {Math.floor(meeting.analytics.averageDuration / 60)}m{" "}
                        {meeting.analytics.averageDuration % 60}s
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-medium flex items-center gap-1">
                        <MicOff className="w-4 h-4" />
                        Mic Muted
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {meeting.analytics.participantsWithMicMuted}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-medium flex items-center gap-1">
                        <VideoOff className="w-4 h-4" />
                        Camera Off
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {meeting.analytics.participantsWithCameraOff}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Host Info */}
              <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Host Information
                </h2>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                    {meeting.host.imageUrl ? (
                      <Image
                        src={meeting.host.imageUrl}
                        alt={meeting.host.fullName}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-lg truncate">
                      {meeting.host.fullName}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {meeting.host.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      @{meeting.host.username}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary & Action Items Tab */}
        {activeTab === "summary" && meeting.summary && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* AI Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    AI Summary
                  </h2>
                  <p className="text-sm text-gray-500">
                    Auto-generated meeting overview
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-l-4 border-blue-500">
                <p className="text-gray-800 leading-relaxed text-base">
                  {meeting.summary}
                </p>
              </div>
            </div>

            {/* Action Items */}
            {meeting.actionItems && meeting.actionItems.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Action Items
                    </h2>
                    <p className="text-sm text-gray-500">
                      {meeting.actionItems.length} tasks identified
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {meeting.actionItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors group"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {item.id}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white rounded-lg"
                        aria-label="Confirm selection"
                      >
                        <CheckCircle2 className="w-5 h-5 text-gray-400 hover:text-green-600 transition-colors" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transcript Tab */}
        {activeTab === "transcript" && meeting.transcript && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search in transcript..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Transcript Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Full Transcript
                  </h2>
                  <p className="text-sm text-gray-500">
                    {filteredTranscript?.length} segments • Word-level
                    timestamps
                  </p>
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredTranscript && filteredTranscript.length > 0 ? (
                  filteredTranscript.map((segment, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {segment.speaker
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">
                            {segment.speaker}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full font-mono">
                            {formatTimestamp(segment.offset)}
                          </span>
                        </div>
                        <p className="text-gray-800 leading-relaxed">
                          {highlightSearchTerm(
                            getTranscriptText(segment),
                            searchTerm,
                          )}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setPlayingSegment(
                            playingSegment === index ? null : index,
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white rounded-lg flex-shrink-0"
                        aria-label={playingSegment === index ? "Pause playback" : "Play segment"}
                      >
                        {playingSegment === index ? (
                          <Pause className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Play className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No transcript segments found
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// app/api/meetings/previous/route.ts
import { NextRequest, NextResponse } from "next/server";
import { currentUser, User } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";
import prisma from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                               LOCAL TYPES                                  */
/* -------------------------------------------------------------------------- */

type MeetingStatus = "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";

interface Meeting {
  id: string;
  hostId: string;
  scheduledFor: Date;
  duration: number;
  status: MeetingStatus;
  streamCallId: string | null;
  endedAt: Date | null;
  actualDuration: number | null;
  recordingUrls: string[] | null;
}

/* -------------------------------------------------------------------------- */
/*                               ENV (SERVER)                                  */
/* -------------------------------------------------------------------------- */

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY;

/* -------------------------------------------------------------------------- */
/*                     AUTH HELPER (Matches /api/meeting pattern)             */
/* -------------------------------------------------------------------------- */

async function getUserFromRequest(
  req: NextRequest
): Promise<User | null> {
  // Test auth for development
  if (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_TEST_AUTH === "true"
  ) {
    const testUserId = req.nextUrl.searchParams.get("testUserId");

    if (testUserId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: testUserId },
      });

      if (user) {
        console.log("🧪 Using validated test user:", testUserId);
        return {
          id: testUserId,
          username: user.username || null,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          imageUrl: user.imageUrl || null,
          emailAddresses: user.email
            ? [{ emailAddress: user.email }]
            : [],
        } as User;
      }
    }
  }

  // Production: Use Clerk authentication
  return currentUser();
}

/* -------------------------------------------------------------------------- */
/*                     STREAM SYNC (SAFE + TYPED)                              */
/* -------------------------------------------------------------------------- */

async function syncPreviousMeetingWithStream(
  meeting: Meeting
): Promise<Meeting> {
  if (!STREAM_API_KEY || !STREAM_API_SECRET || !meeting.streamCallId) {
    return meeting;
  }

  try {
    const client = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

    const call = client.video.call("default", meeting.streamCallId);

    const callData = await call.get();

    const updateData: {
      status?: "COMPLETED";
      endedAt?: Date;
      actualDuration?: number;
      recordingUrls?: string[];
    } = {};
    let needsUpdate = false;

    /* ----------------------------- Completion ------------------------------ */
    if (callData.call?.ended_at && meeting.status !== "COMPLETED") {
      updateData.status = "COMPLETED";
      updateData.endedAt = new Date(callData.call.ended_at);
      needsUpdate = true;
    }

    /* --------------------------- Actual Duration --------------------------- */
    if (callData.call?.session?.started_at && callData.call?.ended_at) {
      const start = new Date(callData.call.session.started_at);
      const end = new Date(callData.call.ended_at);

      updateData.actualDuration = Math.round(
        (end.getTime() - start.getTime()) / 60000
      );
      needsUpdate = true;
    }

    /* ----------------------------- Recordings ------------------------------ */
    try {
      const recordings = await call.listRecordings();

      if (recordings.recordings?.length) {
        updateData.recordingUrls = recordings.recordings.map(
          (r: { url: string }) => r.url
        );
        needsUpdate = true;
      }
    } catch {
      // recordings optional
    }

    if (!needsUpdate) return meeting;

    return (await prisma.meeting.update({
      where: { id: meeting.id },
      data: updateData,
    })) as Meeting;
  } catch (error) {
    console.error("Stream sync failed:", error);
    return meeting;
  }
}

/* -------------------------------------------------------------------------- */
/*                     AUTO COMPLETE PAST MEETINGS                             */
/* -------------------------------------------------------------------------- */

async function autoCompletePastMeetings(userId: string): Promise<number> {
  const now = new Date();

  const meetings = (await prisma.meeting.findMany({
    where: {
      OR: [{ hostId: userId }, { participants: { some: { userId } } }],
      status: { in: ["SCHEDULED", "ONGOING"] },
    },
  })) as Meeting[];

  const expired = meetings.filter((m) => {
    const endTime = new Date(m.scheduledFor).getTime() + m.duration * 60000;
    return endTime < now.getTime();
  });

  if (!expired.length) return 0;

  await prisma.meeting.updateMany({
    where: { id: { in: expired.map((m) => m.id) } },
    data: {
      status: "COMPLETED",
      endedAt: now,
    },
  });

  return expired.length;
}

/* -------------------------------------------------------------------------- */
/*                                   GET                                      */
/* -------------------------------------------------------------------------- */

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await autoCompletePastMeetings(dbUser.id);

    const meetings = (await prisma.meeting.findMany({
      where: {
        OR: [
          { hostId: dbUser.id },
          { participants: { some: { userId: dbUser.id } } },
        ],
        status: { in: ["COMPLETED", "CANCELLED"] },
      },
      orderBy: { scheduledFor: "desc" },
    })) as Meeting[];

    const synced = await Promise.all(
      meetings.map((m) => syncPreviousMeetingWithStream(m))
    );

    return NextResponse.json({
      success: true,
      meetings: synced.map((m) => ({
        ...m,
        computed: {
          hasRecording: (m.recordingUrls?.length ?? 0) > 0,
          actualDuration: m.actualDuration ?? m.duration,
        },
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load meetings" },
      { status: 500 }
    );
  }
}
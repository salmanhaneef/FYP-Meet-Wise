import  prisma  from "@/lib/prisma";
// import  Prisma  from '@prisma/client'; // ✅ ONLY import needed from Prisma
import { Meeting } from '@/app/generated/prisma';
import { StreamClient } from "@stream-io/node-sdk";

/* ------------------------------------------------------------------ */
/* ENV VALIDATION                                                      */
/* ------------------------------------------------------------------ */

const STREAM_API_KEY = process.env.STREAM_API_KEY!;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET!;

/* ------------------------------------------------------------------ */
/* SYNC SINGLE MEETING WITH STREAM                                     */
/* ------------------------------------------------------------------ */

export async function syncPreviousMeetingWithStream(
  meeting: Meeting
): Promise<Meeting> {
  if (
    !STREAM_API_KEY ||
    !STREAM_API_SECRET ||
    !meeting.streamCallId
  ) {
    return meeting;
  }

  try {
    const client = new StreamClient(
      STREAM_API_KEY,
      STREAM_API_SECRET
    );

    const call = client.video.call(
      "default",
      meeting.streamCallId
    );

    const callData = await call.get();

    let needsUpdate = false;

    const updateData: {
      status?: "COMPLETED";
      endedAt?: Date;
      actualDuration?: number;
      recordingUrls?: string[];
    } = {};

    /* -------------------------- STATUS -------------------------- */
    if (
      callData.call?.ended_at &&
      meeting.status !== "COMPLETED"
    ) {
      updateData.status = "COMPLETED";
      updateData.endedAt = new Date(callData.call.ended_at);
      needsUpdate = true;
    }

    /* ----------------------- DURATION --------------------------- */
    if (
      callData.call?.session?.started_at &&
      callData.call?.ended_at
    ) {
      const start = new Date(
        callData.call.session.started_at
      );
      const end = new Date(callData.call.ended_at);

      updateData.actualDuration = Math.round(
        (end.getTime() - start.getTime()) / 60000
      );
      needsUpdate = true;
    }

    /* ----------------------- RECORDINGS ------------------------- */
    try {
      const recordings = await call.listRecordings();

      if (recordings.recordings?.length) {
        updateData.recordingUrls =
          recordings.recordings.map(
            (r: { url: string }) => r.url
          );
        needsUpdate = true;
      }
    } catch {
      // recordings optional
    }

    if (!needsUpdate) return meeting;

    return await prisma.meeting.update({
      where: { id: meeting.id },
      data: updateData,
    });
  } catch (error) {
    console.error("Stream sync error:", error);
    return meeting;
  }
}

/* ------------------------------------------------------------------ */
/* SYNC ALL PREVIOUS MEETINGS                                          */
/* ------------------------------------------------------------------ */

export async function syncAllPreviousMeetings() {
  const meetings = await prisma.meeting.findMany({
    where: {
      status: {
        not: "COMPLETED",
      },
    },
  });

  return Promise.all(
    meetings.map((m: Meeting) =>
      syncPreviousMeetingWithStream(m)
    )
  );
}

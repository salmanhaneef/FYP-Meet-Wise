// app/api/meeting/route.ts
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";
import prisma, { MeetingStatus } from "@/lib/prisma"; // ✅ Import from lib/prisma

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

async function getUserFromRequest(req: NextRequest) {
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
        return { id: testUserId };
      }
    }
  }
  return await currentUser();
}

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
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const allMeetings = await prisma.meeting.findMany({
      where: {
        OR: [
          { hostId: dbUser.id },
          { participants: { some: { userId: dbUser.id } } },
        ],
      },
      include: {
        host: true,
        participants: { include: { user: true } },
      },
      orderBy: { scheduledFor: "desc" },
    });

    return NextResponse.json({
      success: true,
      meetings: allMeetings,
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Stream credentials missing" },
        { status: 500 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { title, description, scheduledFor, duration } = body;

    if (!title || !scheduledFor || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(scheduledFor);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    const client = new StreamClient(apiKey, apiSecret);
    const callId = `meeting-${Date.now()}`;
    const call = client.video.call("default", callId);

    await call.getOrCreate({
      data: {
        created_by_id: user.id,
        starts_at: scheduledDate,
        custom: {
          title,
          description,
          duration,
          hostId: user.id,
          hostName:
            ("username" in user && user.username) ||
            ("firstName" in user && user.firstName) ||
            "User",
        },
      },
    });

    const meeting = await prisma.meeting.create({
      data: {
        streamCallId: callId,
        title,
        description,
        scheduledFor: scheduledDate,
        duration,
        hostId: dbUser.id,
        status: MeetingStatus.SCHEDULED, // ✅ Using enum from lib/prisma
      },
      include: {
        host: true,
        participants: { include: { user: true } },
      },
    });

    return NextResponse.json({
      success: true,
      meeting,
      callId,
      message: "Meeting created successfully",
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}
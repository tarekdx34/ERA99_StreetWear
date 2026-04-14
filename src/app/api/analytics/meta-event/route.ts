import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendMetaEvents, type MetaEventName } from "@/lib/meta-capi";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  events: z.array(
    z.object({
      eventName: z.string(),
      eventTime: z.number().optional(),
      url: z.string().optional(),
      userData: z
        .object({
          email: z.string().optional(),
          phone: z.string().optional(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          clientIP: z.string().optional(),
          clientUserAgent: z.string().optional(),
          fbp: z.string().optional(),
          fbc: z.string().optional(),
        })
        .optional(),
      customData: z.record(z.string(), z.any()).optional(),
    }),
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);

    const result = await sendMetaEvents(parsed.events.map((e) => ({
      ...e,
      eventName: e.eventName as MetaEventName,
    })));

    // Log events to database for admin dashboard
    for (const event of parsed.events) {
      await prisma.marketingEvent.create({
        data: {
          eventName: event.eventName,
          eventId: event.eventName + "-" + Date.now(),
          eventData: {
            ...event.customData,
            url: event.url,
            source: "server_capi",
          },
          sentAt: new Date(),
          success: result.success,
          statusCode: result.status,
        },
      });
    }

    return NextResponse.json({ success: result.success, status: result.status, body: result.body });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid payload", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/utils/prisma"
import { authenticate } from "@/middleware/auth"
import { google } from "googleapis"

type AuthenticatedRequest = NextRequest & {
  user: {
    id: string
  }
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
)

async function getTokens() {
  const accessToken = await prisma.systemConfig.findUnique({ where: { key: 'GOOGLE_ACCESS_TOKEN' } })
  const refreshToken = await prisma.systemConfig.findUnique({ where: { key: 'GOOGLE_REFRESH_TOKEN' } })

  if (!accessToken || !refreshToken) {
    throw new Error('Google Calendar not authenticated')
  }

  return {
    access_token: accessToken.value,
    refresh_token: refreshToken.value,
  }
}

async function handler(req: AuthenticatedRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
  }

  const user = req.user

  try {
    const { consultationId } = await req.json()

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { instructor: { include: { user: true } }, user: true },
    })

    if (!consultation) {
      return NextResponse.json(
        { error: "Consultation not found" },
        { status: 404 }
      )
    }

    if (consultation.instructor.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const tokens = await getTokens()
    oauth2Client.setCredentials(tokens)

    const calendar = google.calendar({ version: "v3", auth: oauth2Client })

    const event = {
      summary: `Consultation with ${consultation.user.name}`,
      description: consultation.notes,
      start: {
        dateTime: consultation.scheduledAt.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(
          consultation.scheduledAt.getTime() + consultation.duration * 60000
        ).toISOString(),
        timeZone: "UTC",
      },
      attendees: [
        { email: consultation.user.email },
        { email: consultation.instructor.user.email },
      ],
      conferenceData: {
        createRequest: {
          requestId: consultation.id,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    }

    const { data } = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: event,
    })

    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: "APPROVED",
        meetLink: data.hangoutLink,
      },
    })

    return NextResponse.json(updatedConsultation)
  } catch (error) {
    console.error("Consultation approval error:", error)
    return NextResponse.json(
      { error: "Failed to approve consultation" },
      { status: 500 }
    )
  }
}

export const POST = authenticate(handler)
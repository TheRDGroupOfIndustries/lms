import { NextRequest, NextResponse } from "next/server"
import prisma from "@/utils/prisma"
import { authenticate } from "@/middleware/auth"
import { google } from "googleapis"

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
]
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000 // 5 minutes in milliseconds

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
)

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

async function saveTokens(tokens: TokenResponse) {
  await prisma.systemConfig.upsert({
    where: { key: 'GOOGLE_ACCESS_TOKEN' },
    update: { value: tokens.access_token },
    create: { key: 'GOOGLE_ACCESS_TOKEN', value: tokens.access_token }
  })

  if (tokens.refresh_token) {
    await prisma.systemConfig.upsert({
      where: { key: 'GOOGLE_REFRESH_TOKEN' },
      update: { value: tokens.refresh_token },
      create: { key: 'GOOGLE_REFRESH_TOKEN', value: tokens.refresh_token }
    })
  }

  if (tokens.expiry_date) {
    await prisma.systemConfig.upsert({
      where: { key: 'GOOGLE_TOKEN_EXPIRY' },
      update: { value: tokens.expiry_date.toString() },
      create: { key: 'GOOGLE_TOKEN_EXPIRY', value: tokens.expiry_date.toString() }
    })
  }
}

async function getTokens(): Promise<TokenResponse> {
  const accessToken = await prisma.systemConfig.findUnique({ where: { key: 'GOOGLE_ACCESS_TOKEN' } })
  const refreshToken = await prisma.systemConfig.findUnique({ where: { key: 'GOOGLE_REFRESH_TOKEN' } })
  const tokenExpiry = await prisma.systemConfig.findUnique({ where: { key: 'GOOGLE_TOKEN_EXPIRY' } })

  if (!accessToken || !refreshToken) {
    throw new Error('REAUTH_REQUIRED')
  }

  const expiryDate = tokenExpiry ? parseInt(tokenExpiry.value) : 0
  if (Date.now() + TOKEN_EXPIRY_BUFFER >= expiryDate) {
    try {
      oauth2Client.setCredentials({
        refresh_token: refreshToken.value
      })
      const { credentials } = await oauth2Client.refreshAccessToken()
      await saveTokens({
        access_token: credentials.access_token as string,
        refresh_token: credentials.refresh_token ?? undefined,
        expiry_date: credentials.expiry_date ?? 0
      })
      return {
        access_token: credentials.access_token as string,
        refresh_token: credentials.refresh_token ?? undefined,
        expiry_date: credentials.expiry_date ?? 0
      }
    } catch (error) {
      console.error('Error refreshing token:', error)
      throw new Error('REAUTH_REQUIRED')
    }
  }

  return {
    access_token: accessToken.value,
    refresh_token: refreshToken.value,
    expiry_date: expiryDate
  }
}

async function handler(req: NextRequest & { user: { id: string } }) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
  }

  try {
    const { consultationId } = await req.json()

    if (!consultationId) {
      return NextResponse.json({ error: "Consultation ID is required" }, { status: 400 })
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { 
        instructor: { 
          include: { user: true } 
        }, 
        user: true 
      },
    })

    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 })
    }

    if (consultation.instructor.userId !== req.user.id) {
      return NextResponse.json({ error: "Unauthorized to approve this consultation" }, { status: 403 })
    }

    if (consultation.status !== 'PENDING') {
      return NextResponse.json({ error: "Consultation is not in a pending state" }, { status: 400 })
    }

    let tokens: TokenResponse
    try {
      tokens = await getTokens()
    } catch (error) {
      if (error instanceof Error && error.message === 'REAUTH_REQUIRED') {
        const authUrl = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES,
          prompt: 'consent'
        })
        return NextResponse.json({ error: "Reauthorization required", authUrl }, { status: 401 })
      }
      throw error
    }

    oauth2Client.setCredentials(tokens)

    const calendar = google.calendar({ version: "v3", auth: oauth2Client })

    const event = {
      summary: `Consultation with ${consultation.user.name}`,
      description: consultation.notes || 'No additional notes',
      start: {
        dateTime: consultation.scheduledAt.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(
          consultation.scheduledAt.getTime() + consultation.duration * 60 * 60000
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

    if (!data.hangoutLink) {
      throw new Error("Failed to create Google Meet link")
    }

    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: "APPROVED",
        meetLink: data.hangoutLink,
      },
    })

    return NextResponse.json({
      message: "Consultation approved successfully",
      consultation: updatedConsultation
    })
  } catch (error) {
    console.error("Consultation approval error:", error)
    return NextResponse.json({ error: "Failed to approve consultation: " + (error instanceof Error ? error.message : "Unknown error") }, { status: 500 })
  }
}

export const POST = authenticate(handler)
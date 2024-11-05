import { NextRequest, NextResponse } from "next/server"
import prisma from "@/utils/prisma"
import { google } from "googleapis"

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
)

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 })
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Store tokens in the database
    await prisma.systemConfig.upsert({
      where: { key: 'GOOGLE_ACCESS_TOKEN' },
      update: { value: tokens.access_token! },
      create: { key: 'GOOGLE_ACCESS_TOKEN', value: tokens.access_token! },
    })

    if (tokens.refresh_token) {
      await prisma.systemConfig.upsert({
        where: { key: 'GOOGLE_REFRESH_TOKEN' },
        update: { value: tokens.refresh_token },
        create: { key: 'GOOGLE_REFRESH_TOKEN', value: tokens.refresh_token },
      })
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`)
  } catch (error) {
    console.error('Error getting tokens:', error)
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 })
  }
}
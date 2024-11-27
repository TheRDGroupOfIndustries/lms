// src/app/api/auth/google/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { google } from "googleapis";

// Mark the route as dynamic
export const dynamic = 'force-dynamic';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        new URL('/error?message=Authentication failed', process.env.NEXT_PUBLIC_BASE_URL!)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/error?message=No authorization code received', process.env.NEXT_PUBLIC_BASE_URL!)
      );
    }

    // Exchange the code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    const tokenPromises = [
      prisma.systemConfig.upsert({
        where: { key: 'GOOGLE_ACCESS_TOKEN' },
        update: { value: tokens.access_token },
        create: { key: 'GOOGLE_ACCESS_TOKEN', value: tokens.access_token },
      }),
    ];

    if (tokens.refresh_token) {
      tokenPromises.push(
        prisma.systemConfig.upsert({
          where: { key: 'GOOGLE_REFRESH_TOKEN' },
          update: { value: tokens.refresh_token },
          create: { key: 'GOOGLE_REFRESH_TOKEN', value: tokens.refresh_token },
        })
      );
    }

    if (tokens.expiry_date) {
      tokenPromises.push(
        prisma.systemConfig.upsert({
          where: { key: 'GOOGLE_TOKEN_EXPIRY' },
          update: { value: tokens.expiry_date.toString() },
          create: { key: 'GOOGLE_TOKEN_EXPIRY', value: tokens.expiry_date.toString() },
        })
      );
    }

    await Promise.all(tokenPromises);

    const state = url.searchParams.get('state');
    const successPath = state ? decodeURIComponent(state) : '/dashboard';
    const successUrl = new URL(successPath, process.env.NEXT_PUBLIC_BASE_URL!);

    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    const errorUrl = new URL('/error', process.env.NEXT_PUBLIC_BASE_URL!);
    errorUrl.searchParams.set('message', 'Failed to authenticate with Google Calendar');
    return NextResponse.redirect(errorUrl);
  }
}

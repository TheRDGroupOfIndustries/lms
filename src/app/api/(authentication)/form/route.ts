import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/(authentication)/auth/[...nextauth]/auth.config'
import prisma from '@/utils/prisma'
import { z } from 'zod'

const formSchema = z.object({
  role: z.enum(['USER', 'INSTRUCTOR', 'ADMIN']),
  name: z.string().min(2),
  preferredLanguage: z.enum(['ENGLISH', 'HINDI']),
  bio: z.string().optional(),
  expertise: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validatedData = formSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors }, { status: 400 })
    }

    const { role, name, preferredLanguage, bio, expertise } = validatedData.data

    let user = await prisma.user.findUnique({
      where: { email: session.user.email ?? undefined },
    })

    if (!user) {
      // Create a new user if they don't exist (Google sign-up)
      user = await prisma.user.create({
        data: {
          email: session.user.email!,
          name,
          role,
          preferredLanguage,
          googleId: session.user.id, // Assuming Google ID is stored in session user id
        },
      })
    } else {
      // Update existing user (Credential sign-up or subsequent role updates)
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role,
          name,
          preferredLanguage,
        },
      })
    }

    if (role === 'INSTRUCTOR') {
      // Create or update instructor profile
      await prisma.instructorProfile.upsert({
        where: { userId: user.id },
        update: {
          bio,
          expertise: expertise ? expertise.split(',').map((item: string) => item.trim()) : [],
          hourlyRate: 0,
        },
        create: {
          userId: user.id,
          bio: bio || '',
          expertise: expertise ? expertise.split(',').map((item: string) => item.trim()) : [],
          hourlyRate: 0,
        },
      })
    }

    return NextResponse.json({ message: 'User profile updated successfully', userId: user.id }, { status: 200 })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 })
  }
}
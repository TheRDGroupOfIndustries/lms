import NextAuth from 'next-auth';
import { authOptions } from '@/app/api/(authentication)/auth/[...nextauth]/auth.config';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
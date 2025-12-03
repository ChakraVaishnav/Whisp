import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../node_modules/bro-auth/dist/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Verify access token server-side using bro-auth
export async function POST(req) {
  try {
    // normalize secret (strip quotes)
    const normalize = (s) => (typeof s === 'string' ? s.trim().replace(/^['"]|['"]$/g, '') : s);
    const accessSecret = normalize(process.env.ACCESS_SECRET);
    if (!accessSecret) {
      console.error('[VERIFY] Missing ACCESS_SECRET');
      return NextResponse.json({ valid: false, error: 'Server misconfigured' }, { status: 500 });
    }

    const body = await req.json();
    const token = body.token || req.headers.get('authorization')?.replace('Bearer ', '');
    const fingerprint = body.fingerprint || req.headers.get('x-fingerprint');

    if (!token || !fingerprint) {
      return NextResponse.json({ valid: false, error: 'token and fingerprint required' }, { status: 400 });
    }

    const result = verifyAccessToken(token, fingerprint, accessSecret);
    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error }, { status: 401 });
    }

    // Fetch user data from database
    const userId = result.payload?.sub;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
        },
      });

      if (user) {
        return NextResponse.json({ valid: true, payload: { ...result.payload, ...user } }, { status: 200 });
      }
    }

    return NextResponse.json({ valid: true, payload: result.payload }, { status: 200 });
  } catch (err) {
    console.error('Verify error', err);
    return NextResponse.json({ valid: false, error: 'Internal error' }, { status: 500 });
  }
}

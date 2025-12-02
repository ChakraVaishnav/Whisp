import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateTokens, buildRefreshCookie } from '../../../../../node_modules/bro-auth/dist/index';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    // Normalize and validate secrets (strip surrounding quotes)
    const normalize = (s) => (typeof s === 'string' ? s.trim().replace(/^['"]|['"]$/g, '') : s);
    const accessSecret = normalize(process.env.ACCESS_SECRET);
    const refreshSecret = normalize(process.env.REFRESH_SECRET);
    
    // DEBUG: Log secret lengths (not the secrets themselves)
    console.log('[LOGIN] Secret lengths:', { access: accessSecret?.length, refresh: refreshSecret?.length });
    
    if (!accessSecret || !refreshSecret) {
      console.error('[LOGIN] Missing secrets after normalization');
      return NextResponse.json({ error: 'Server misconfiguration: secrets missing' }, { status: 500 });
    }
    const { email, password, fingerprint } = await req.json();
    if (!email || !password || !fingerprint) {
      return NextResponse.json({ error: 'Email, password and fingerprint are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate access + refresh tokens bound to fingerprint (positional args)
    const tokens = generateTokens(user.id, fingerprint, accessSecret, refreshSecret);

    const cookieObj = buildRefreshCookie(tokens.refreshToken);
    const serializeCookie = (c) => {
      const opts = c.options || {};
      const parts = [`${c.name}=${encodeURIComponent(c.value)}`];
      if (opts.httpOnly) parts.push('HttpOnly');
      if (opts.secure) parts.push('Secure');
      if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
      if (opts.path) parts.push(`Path=${opts.path}`);
      if (typeof opts.maxAge !== 'undefined') parts.push(`Max-Age=${opts.maxAge}`);
      return parts.join('; ');
    };

    const cookieHeader = serializeCookie(cookieObj);
    const { password: _p, ...safe } = user;
    return NextResponse.json(
      { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: safe },
      { status: 200, headers: { 'Set-Cookie': cookieHeader } }
    );
  } catch (err) {
    console.error('Login error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

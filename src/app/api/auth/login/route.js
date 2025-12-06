import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateTokens, buildRefreshCookie } from 'bro-auth/core';
import logger from '../../../../utils/logger';
import { getPrismaClient } from '../../../../lib/prisma';


export async function POST(req) {
  try {
    // Normalize and validate secrets (strip surrounding quotes)
    const normalize = (s) => (typeof s === 'string' ? s.trim().replace(/^['"]|['"]$/g, '') : s);
    const accessSecret = normalize(process.env.ACCESS_SECRET);
    const refreshSecret = normalize(process.env.REFRESH_SECRET);
    
    // DEBUG: Log secret lengths (not the secrets themselves)
    logger.log('[LOGIN] Secret lengths:', { access: accessSecret?.length, refresh: refreshSecret?.length });
    
    if (!accessSecret || !refreshSecret) {
      logger.error('[LOGIN] Missing secrets after normalization');
      return NextResponse.json({ error: 'Server misconfiguration: secrets missing' }, { status: 500 });
    }
    const prisma = getPrismaClient();
    if (!prisma) {
      logger.error('[LOGIN] Prisma client unavailable');
      return NextResponse.json(
        { error: 'Database connection is not configured' },
        { status: 500 }
      );
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
      const secure = process.env.COOKIE_SECURE === 'true';
      const sameSite = process.env.COOKIE_SAMESITE || 'strict';
      const parts = [`${c.name}=${encodeURIComponent(c.value)}`];
      if (opts.httpOnly) parts.push('HttpOnly');
      if (secure) parts.push('Secure');
      parts.push(`SameSite=${sameSite}`);
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
    logger.error('Login error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

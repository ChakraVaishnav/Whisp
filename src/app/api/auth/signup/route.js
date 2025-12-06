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
    
    if (!accessSecret || !refreshSecret) {
      logger.error('Missing ACCESS_SECRET or REFRESH_SECRET in environment');
      return NextResponse.json({ error: 'Server misconfiguration: secrets missing' }, { status: 500 });
    }
    const body = await req.json();
    const prisma = getPrismaClient();
    if (!prisma) {
      logger.error('[SIGNUP] Prisma client unavailable');
      return NextResponse.json({ error: 'Database connection is not configured' }, { status: 500 });
    }

    const { name, email, password, fingerprint } = body;

    if (!email || !password || !fingerprint) {
      return NextResponse.json({ error: 'Email, password and fingerprint are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: name || null,
        email,
        password: hashed,
      },
    });

    // Generate tokens bound to fingerprint
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

    // Don't return password
    const { password: _p, ...safe } = user;

    return NextResponse.json(
      { user: safe, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
      { status: 201, headers: { 'Set-Cookie': cookieHeader } }
    );
  } catch (err) {
    logger.error('Signup error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    // prisma.$disconnect(); // keep client for reuse in dev
  }
}

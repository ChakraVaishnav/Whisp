import { NextResponse } from 'next/server';
import { verifyRefreshToken, generateTokens, buildRefreshCookie } from '../../../../../node_modules/bro-auth/dist/index';

export async function POST(req) {
  try {
    // Normalize and validate secrets (strip surrounding quotes)
    const normalize = (s) => (typeof s === 'string' ? s.trim().replace(/^['"]|['"]$/g, '') : s);
    const accessSecret = normalize(process.env.ACCESS_SECRET);
    const refreshSecret = normalize(process.env.REFRESH_SECRET);
    
    if (!accessSecret || !refreshSecret) {
      console.error('Missing ACCESS_SECRET or REFRESH_SECRET in environment');
      return NextResponse.json({ error: 'Server misconfiguration: secrets missing' }, { status: 500 });
    }
    const body = await req.json().catch(() => ({}));
    let { refreshToken, fingerprint } = body;

    // If client didn't send refreshToken, try to read cookie 'bro_refresh'
    if (!refreshToken) {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/(?:^|; )bro_refresh=([^;]+)/);
      if (match) {
        refreshToken = decodeURIComponent(match[1]);
      }
    }

    if (!refreshToken || !fingerprint) {
      return NextResponse.json({ error: 'Refresh token and fingerprint are required' }, { status: 400 });
    }

    const result = verifyRefreshToken(refreshToken, fingerprint, refreshSecret);
    if (!result.valid) {
      return NextResponse.json({ error: result.error || 'Invalid refresh token' }, { status: 401 });
    }

    // Issue new token pair (positional args per bro-auth)
    const userId = result.payload?.sub || result.payload?.userId || null;
    const tokens = generateTokens(userId, fingerprint, accessSecret, refreshSecret);

    // Rotate refresh token via cookie (serialize)
    const cookieObj = buildRefreshCookie(tokens.refreshToken);
    const opts = cookieObj.options || {};
    const parts = [`${cookieObj.name}=${encodeURIComponent(cookieObj.value)}`];
    if (opts.httpOnly) parts.push('HttpOnly');
    if (opts.secure) parts.push('Secure');
    if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
    if (opts.path) parts.push(`Path=${opts.path}`);
    if (typeof opts.maxAge !== 'undefined') parts.push(`Max-Age=${opts.maxAge}`);
    const cookieHeader = parts.join('; ');

    return NextResponse.json({ accessToken: tokens.accessToken }, { status: 200, headers: { 'Set-Cookie': cookieHeader } });
  } catch (err) {
    console.error('Refresh error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

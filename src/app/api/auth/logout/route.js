import { NextResponse } from 'next/server';

// POST - clear refresh cookie
export async function POST() {
  try {
    const secure = process.env.COOKIE_SECURE === 'true';
    const sameSite = process.env.COOKIE_SAMESITE || 'Strict';
    const path = '/';

    // Build a cookie that expires immediately
    const parts = [`bro_refresh=`];
    parts.push('HttpOnly');
    if (secure) parts.push('Secure');
    parts.push(`SameSite=${sameSite}`);
    parts.push(`Path=${path}`);
    parts.push('Max-Age=0');

    const header = parts.join('; ');

    return NextResponse.json({ ok: true }, { status: 200, headers: { 'Set-Cookie': header } });
  } catch (err) {
    console.error('Logout error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

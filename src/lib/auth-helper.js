
import { verifyAccessToken } from 'bro-auth/core';
import logger from '../utils/logger';
import { NextResponse } from 'next/server';

/**
 * Verifies the access token from the request.
 * Expected headers:
 * - Authorization: Bearer <token>
 * - x-fingerprint: <fingerprint> (optional if passed in body for POST/PUT/PATCH, but header is preferred)
 * 
 * @param {Request} req 
 * @returns {Promise<{valid: boolean, payload?: any, response?: NextResponse}>}
 */
export async function verifyAuth(req) {
    try {
        const normalize = (s) => (typeof s === 'string' ? s.trim().replace(/^['"]|['"]$/g, '') : s);
        const accessSecret = normalize(process.env.ACCESS_SECRET);
        if (!accessSecret) {
            logger.error('[VERIFY] Missing ACCESS_SECRET');
            return { valid: false, response: NextResponse.json({ error: 'Server misconfigured' }, { status: 500 }) };
        }

        const authHeader = req.headers.get('authorization') || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

        // Try to get fingerprint from header first
        let fingerprint = req.headers.get('x-fingerprint');

        // If not in header and request has body, we might peek (careful with stream consumption)
        // For now, we strongly encourage header usage for API calls. 
        // If it's a GET request, we can't read body.
        // If the caller didn't provide x-fingerprint in header, valid will likely be false if token requires it.

        if (!token) {
            return { valid: false, response: NextResponse.json({ error: 'Authorization required' }, { status: 401 }) };
        }

        if (!fingerprint) {
            // fallback for older implementation where fingerprint might be in body?
            // But we can't easily read JSON body and then let the route read it again without cloning.
            // So we return error if missing in header, OR we rely on the caller to catch this.
            // However, to keep it simple and robust:
            return { valid: false, response: NextResponse.json({ error: 'Fingerprint required in x-fingerprint header' }, { status: 400 }) };
        }

        const result = verifyAccessToken(token, fingerprint, accessSecret);

        if (!result.valid) {
            return { valid: false, response: NextResponse.json({ error: result.error || 'Invalid token' }, { status: 401 }) };
        }

        return { valid: true, payload: result.payload };

    } catch (err) {
        logger.error('Auth verification error', err);
        return { valid: false, response: NextResponse.json({ error: 'Internal server error' }, { status: 500 }) };
    }
}

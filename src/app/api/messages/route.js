import { NextResponse } from 'next/server';
import { verifyAccessToken } from 'bro-auth/core';
import logger from '../../../utils/logger';
import prisma from '@/lib/prisma';


// GET - Fetch messages for a whisper (conversation)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const whisperId = searchParams.get('whisperId');
    const senderId = searchParams.get('senderId');
    const receiverId = searchParams.get('receiverId');

    let where = {};

    if (whisperId) {
      // Fetch based on whisper connection
      const whisper = await prisma.whisper.findUnique({
        where: { id: whisperId },
        select: { userAId: true, userBId: true },
      });

      if (!whisper) {
        return NextResponse.json({ error: 'Whisper not found' }, { status: 404 });
      }

      where = {
        OR: [
          { senderId: whisper.userAId, receiverId: whisper.userBId },
          { senderId: whisper.userBId, receiverId: whisper.userAId },
        ],
      };
    } else if (senderId && receiverId) {
      where = {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      };
    } else {
      return NextResponse.json({ error: 'whisperId or senderId+receiverId required' }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: 100, // limit to last 100 messages
    });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (err) {
    logger.error('Fetch messages error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send a new message
export async function POST(req) {
  try {
    const body = await req.json();
    const { senderId, receiverId, message, fingerprint } = body;

    // Verify access token from Authorization header
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    const accessSecret = process.env.ACCESS_SECRET;
    if (!token || !fingerprint || !accessSecret) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }
    const verifyResult = verifyAccessToken(token, fingerprint, accessSecret);
    if (!verifyResult.valid) {
      return NextResponse.json({ error: 'Invalid access token' }, { status: 401 });
    }
    if (!senderId || !receiverId || !message) {
      return NextResponse.json({ error: 'senderId, receiverId, and message required' }, { status: 400 });
    }

    // For MVP, store message as plain text in cipherText field
    // In production, encrypt with AES-GCM before storing
    // For self-chat (sender === receiver) we store plaintext in cipherText without encryption
    const ivVal = senderId === receiverId ? '' : 'placeholder-iv';
    const tagVal = senderId === receiverId ? '' : 'placeholder-tag';
    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        cipherText: message,
        iv: ivVal,
        tag: tagVal,
        type: 'TEXT',
      },
    });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (err) {
    logger.error('Send message error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

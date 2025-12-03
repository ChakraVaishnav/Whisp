import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    console.error('Fetch messages error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send a new message
export async function POST(req) {
  try {
    const { senderId, receiverId, message } = await req.json();

    if (!senderId || !receiverId || !message) {
      return NextResponse.json({ error: 'senderId, receiverId, and message required' }, { status: 400 });
    }

    // For MVP, store message as plain text in cipherText field
    // In production, encrypt with AES-GCM before storing
    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        cipherText: message, // TODO: encrypt this
        iv: 'placeholder-iv', // TODO: generate real IV
        tag: 'placeholder-tag', // TODO: generate real tag
        type: 'TEXT',
      },
    });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (err) {
    console.error('Send message error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch accepted whispers for a user
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const whispers = await prisma.whisper.findMany({
      where: {
        OR: [
          { userAId: userId, status: 'ACCEPTED' },
          { userBId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        userA: {
          select: { id: true, username: true, email: true },
        },
        userB: {
          select: { id: true, username: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ whispers }, { status: 200 });
  } catch (err) {
    console.error('Fetch whispers error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new whisper request
export async function POST(req) {
  try {
    const { userAId, userBId } = await req.json();

    if (!userAId || !userBId) {
      return NextResponse.json({ error: 'userAId and userBId required' }, { status: 400 });
    }

    if (userAId === userBId) {
      return NextResponse.json({ error: 'Cannot connect with yourself' }, { status: 400 });
    }

    // Check if whisper already exists
    const existing = await prisma.whisper.findFirst({
      where: {
        OR: [
          { userAId, userBId },
          { userAId: userBId, userBId: userAId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Connection already exists' }, { status: 409 });
    }

    const whisper = await prisma.whisper.create({
      data: {
        userAId,
        userBId,
        status: 'PENDING',
      },
      include: {
        userA: {
          select: { id: true, username: true, email: true },
        },
        userB: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    return NextResponse.json({ whisper }, { status: 201 });
  } catch (err) {
    console.error('Create whisper error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

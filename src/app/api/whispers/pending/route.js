import { NextResponse } from 'next/server';
import logger from '../../../../utils/logger';
import { getPrismaClient } from '../../../../lib/prismaClient';


// GET - Fetch pending whisper requests for a user
export async function GET(req) {
  const prisma = getPrismaClient();
  if (!prisma) {
    logger.error('[WHISPERS/PENDING] Prisma client unavailable');
    return NextResponse.json({ error: 'Database connection is not configured' }, { status: 500 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const pending = await prisma.whisper.findMany({
      where: {
        userBId: userId,
        status: 'PENDING',
      },
      include: {
        userA: {
          select: { id: true, username: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ pending }, { status: 200 });
  } catch (err) {
    logger.error('Fetch pending whispers error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

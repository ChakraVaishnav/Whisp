import { NextResponse } from 'next/server';
import logger from '../../../../utils/logger';
import { getPrismaClient } from '../../../../lib/prisma';


// PATCH - Accept a whisper request
export async function PATCH(req, { params }) {
  const prisma = getPrismaClient();
  if (!prisma) {
    logger.error('[WHISPERS/ID] Prisma client unavailable');
    return NextResponse.json({ error: 'Database connection is not configured' }, { status: 500 });
  }
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!['ACCEPTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const whisper = await prisma.whisper.update({
      where: { id },
      data: { status },
      include: {
        userA: {
          select: { id: true, username: true, email: true },
        },
        userB: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    return NextResponse.json({ whisper }, { status: 200 });
  } catch (err) {
    logger.error('Update whisper error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Reject/delete a whisper request
export async function DELETE(req, { params }) {
  const prisma = getPrismaClient();
  if (!prisma) {
    logger.error('[WHISPERS/ID] Prisma client unavailable');
    return NextResponse.json({ error: 'Database connection is not configured' }, { status: 500 });
  }
  try {
    const { id } = await params;

    await prisma.whisper.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    logger.error('Delete whisper error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

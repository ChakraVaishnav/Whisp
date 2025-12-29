import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-helper';
import logger from '../../../../utils/logger';
import prisma from '@/lib/prisma';


// PATCH - Accept a whisper request
export async function PATCH(req, { params }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.valid) return auth.response;

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
  try {
    const auth = await verifyAuth(req);
    if (!auth.valid) return auth.response;

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

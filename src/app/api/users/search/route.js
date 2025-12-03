import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Search users by username or email
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
      take: 10,
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (err) {
    console.error('Search users error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

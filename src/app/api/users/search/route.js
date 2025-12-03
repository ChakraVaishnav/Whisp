import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Search users by username or email
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const usernameOnly = searchParams.get('usernameOnly');

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    // If usernameOnly flag is set (e.g. ?usernameOnly=1), only search username
    const where = usernameOnly
      ? { username: { contains: query, mode: 'insensitive' } }
      : {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
      },
      take: 10,
    });

    // If caller provided `me` param, augment users with connection status
    const me = searchParams.get('me');
    if (me) {
      const augmented = await Promise.all(
        users.map(async (u) => {
          if (!u.id || u.id === me) return { ...u, connectionStatus: 'NONE', sentByMe: false };
          // find whisper between me and this user
          const whisper = await prisma.whisper.findFirst({
            where: {
              OR: [
                { userAId: me, userBId: u.id },
                { userAId: u.id, userBId: me },
              ],
            },
          });

          if (!whisper) return { ...u, connectionStatus: 'NONE', sentByMe: false };

          return {
            ...u,
            connectionStatus: whisper.status || 'PENDING',
            sentByMe: whisper.userAId === me,
          };
        })
      );

      return NextResponse.json({ users: augmented }, { status: 200 });
    }

    return NextResponse.json({ users }, { status: 200 });
  } catch (err) {
    console.error('Search users error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const clubs = await prisma.club.findMany({
      where: { status: 'active' },
      include: {
        members: {
          include: {
            user: {
              include: {
                companions: {
                  where: { status: 'active' },
                  select: {
                    id: true,
                    name: true,
                    game: true,
                    rank: true,
                    price: true,
                    description: true,
                    avatar: true,
                    rating: true,
                    ratingCount: true,
                    totalOrders: true,
                    userId: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { memberCount: 'desc' }
    });

    const clubCompanions = clubs.flatMap(club =>
      club.members
        .flatMap(member => member.user.companions)
        .map(companion => ({
          ...companion,
          price: Number(companion.price),
          rating: Number(companion.rating) || 0,
          clubId: club.id,
          clubName: club.name,
          type: 'club' as const
        }))
    );

    return NextResponse.json({ companions: clubCompanions });
  } catch {
    return NextResponse.json({ companions: [] });
  }
}
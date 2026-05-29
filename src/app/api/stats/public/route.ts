import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [users, companions, orders, avgResult] = await Promise.all([
      prisma.user.count(),
      prisma.companion.count({ where: { status: 'active' } }),
      prisma.order.count({ where: { status: 'completed' } }),
      prisma.companion.aggregate({
        _avg: { rating: true },
        where: { status: 'active', ratingCount: { gt: 0 } },
      }),
    ]);

    return NextResponse.json(
      {
        users,
        companions,
        orders,
        avgRating: Math.round((avgResult._avg.rating || 0) * 10) / 10,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    );
  } catch {
    return NextResponse.json(
      { users: 0, companions: 0, orders: 0, avgRating: 0 },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    );
  }
}

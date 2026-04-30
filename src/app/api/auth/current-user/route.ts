import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/actions/auth.actions';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('获取当前用户失败:', error);
    return NextResponse.json(null, { status: 200 });
  }
}

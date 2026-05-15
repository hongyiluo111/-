import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { rateLimit } from '@/lib/rate-limit';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const AUDIO_TYPES = ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_AUDIO_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.webm', '.mp3', '.wav', '.ogg', '.mpeg'];

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 });
    }

    const { allowed, retryAfter } = rateLimit(`chat-upload:${decoded.userId}`, 10, 60000);
    if (!allowed) {
      return NextResponse.json({ error: `上传太频繁，请在 ${retryAfter} 秒后重试` }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 });
    }

    const isImage = IMAGE_TYPES.includes(file.type);
    const isAudio = AUDIO_TYPES.includes(file.type);

    if (!isImage && !isAudio) {
      return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 });
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: '图片大小不能超过5MB' }, { status: 400 });
    }

    if (isAudio && file.size > MAX_AUDIO_SIZE) {
      return NextResponse.json({ error: '音频大小不能超过10MB' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase() || (isImage ? '.png' : '.webm');
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: '不支持的文件扩展名' }, { status: 400 });
    }
    const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'chat');

    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json({
      url: `/uploads/chat/${fileName}`,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}

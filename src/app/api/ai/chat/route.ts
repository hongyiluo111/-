export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { rateLimit } from '@/lib/rate-limit';

const API_KEY = process.env.QWEN_API_KEY;
const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

// 允许的模型白名单（防止客户端指定昂贵模型）
const ALLOWED_MODELS = ['qwen-turbo', 'qwen-plus', 'qwen-max'] as const;
type AllowedModel = (typeof ALLOWED_MODELS)[number];

// AI 接口限流：每用户每分钟 10 次（比通用接口更严格）
const AI_RATE_LIMIT_MAX = 10;
const AI_RATE_LIMIT_WINDOW = 60 * 1000;

// 单次请求 messages 数量上限，防止 token 滥用
const MAX_MESSAGES = 50;

export async function POST(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'AI 服务未配置' },
        { status: 503 }
      );
    }

    // 鉴权：必须登录
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 });
    }

    // 限流：按用户ID限流
    const rl = rateLimit(`ai-chat:${decoded.userId}`, AI_RATE_LIMIT_MAX, AI_RATE_LIMIT_WINDOW);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试', retryAfter: rl.retryAfter },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter || 1) } }
      );
    }

    const body = await request.json();
    const { messages, model = 'qwen-turbo', temperature = 0.7 } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // 限制 messages 数量
    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json(
        { error: `消息数量超出上限（${MAX_MESSAGES}条）` },
        { status: 400 }
      );
    }

    // 模型白名单校验
    if (!ALLOWED_MODELS.includes(model as AllowedModel)) {
      return NextResponse.json(
        { error: `不支持的模型，允许：${ALLOWED_MODELS.join(', ')}` },
        { status: 400 }
      );
    }

    // temperature 范围校验
    const temp = Number(temperature);
    if (Number.isNaN(temp) || temp < 0 || temp > 2) {
      return NextResponse.json(
        { error: 'temperature 取值范围为 0-2' },
        { status: 400 }
      );
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: temp,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error Response:', errorText);
      let errorMessage = 'API请求失败';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.error?.code || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

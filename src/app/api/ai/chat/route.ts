import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.QWEN_API_KEY;
const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'AI 服务未配置' },
        { status: 503 }
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

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
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

import { NextResponse } from 'next/server';
import { refineDrapePhysics } from '@/services/ai/geminiService';
import { Message } from '@/models/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: Message[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'A valid message history is required' },
        { status: 400 }
      );
    }

    const physicsParams = await refineDrapePhysics(messages);

    return NextResponse.json({
      success: true,
      message: {
        role: 'model',
        content: physicsParams.explanation,
      },
      physicsParams,
    });
  } catch (error: any) {
    console.error('Error in conversation route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

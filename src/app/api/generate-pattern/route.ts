import { NextResponse } from 'next/server';
import { generateFabricPattern } from '@/services/ai/geminiService';
import { PatternStyle } from '@/models/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, style } = body as { prompt: string; style: PatternStyle };

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!style || !['banarasi', 'kanchipuram', 'kalamkari', 'ikat'].includes(style)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing heritage style parameter' },
        { status: 400 }
      );
    }

    const startTime = performance.now();
    const result = await generateFabricPattern(style, prompt);
    const endTime = performance.now();
    
    const generationTimeMs = Math.round(endTime - startTime);

    // Save record to local JSON DB
    const { saveGenerationRecord } = await import('@/lib/db');
    await saveGenerationRecord({
      style,
      prompt,
      patternUrl: result.patternUrl,
    });

    return NextResponse.json({
      success: true,
      patternUrl: result.patternUrl,
      promptUsed: result.promptUsed,
      generationTimeMs,
      isMocked: result.isMocked,
    });
  } catch (error: any) {
    console.error('Error generating fabric pattern:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

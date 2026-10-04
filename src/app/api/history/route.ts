import { NextResponse } from 'next/server';
import { getGenerationHistory } from '@/lib/db';

export async function GET() {
  try {
    const history = await getGenerationHistory();
    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve pattern history' },
      { status: 500 }
    );
  }
}

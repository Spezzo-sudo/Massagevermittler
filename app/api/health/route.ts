import { NextResponse } from 'next/server';

/** Health check returning gitsha + timestamp placeholder. */
export function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}

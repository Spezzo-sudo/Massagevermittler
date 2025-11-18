import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ status: 'signed_out' });
  response.cookies.set('sb-role', '', { path: '/', maxAge: 0 });
  return response;
}

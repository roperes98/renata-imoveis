import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  const headersList = await headers();
  // Try to get IP from x-forwarded-for (standard proxy header)
  // or x-real-ip
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');

  // If multiple IPs in x-forwarded-for, the first one is the client
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || 'Unknown';

  return NextResponse.json({ ip: clientIp });
}

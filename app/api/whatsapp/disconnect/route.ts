import { NextResponse } from 'next/server';
import { disconnectWhatsApp } from '@/src/lib/whatsapp';

export async function POST() {
  try {
    await disconnectWhatsApp();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

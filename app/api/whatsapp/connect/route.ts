import { NextRequest } from 'next/server';
import { connectWhatsApp, subscribeToStatus } from '@/src/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // controller already closed
        }
      };

      unsubscribe = subscribeToStatus((qr, status) => {
        send({ qr, status });
        if (status === 'connected' || status === 'disconnected') {
          unsubscribe?.();
          unsubscribe = null;
          try { controller.close(); } catch { /* already closed */ }
        }
      });

      connectWhatsApp().catch(err => {
        send({ status: 'error', message: (err as Error).message });
        unsubscribe?.();
        unsubscribe = null;
        try { controller.close(); } catch { /* already closed */ }
      });
    },
    cancel() {
      unsubscribe?.();
      unsubscribe = null;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cartService } from '@/src/services/cartService';
import { sendMessage } from '@/src/lib/whatsapp';
import { PRODUCTS } from '@/src/lib/products';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function deliveryDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toLocaleDateString('pt-BR');
}

function normalizeStatus(value: unknown) {
  return typeof value === 'string' ? value.toLowerCase() : undefined;
}

function isPaidEvent(body: any) {
  const status = normalizeStatus(body?.data?.status) || normalizeStatus(body?.billing?.status) || normalizeStatus(body?.status);
  const event = normalizeStatus(body?.event);
  return status === 'paid' || event?.includes('paid');
}

function extractPaymentId(body: any, params: URLSearchParams) {
  return (
    body?.data?.id ||
    body?.data?.billingId ||
    body?.billing?.id ||
    body?.billing?.paymentId ||
    body?.paymentId ||
    body?.id ||
    params.get('paymentId') ||
    params.get('id') ||
    undefined
  );
}

async function processWebhook(body: any, params: URLSearchParams) {
  console.log('[AbacatePay webhook] Received event:', {
    body,
    query: Object.fromEntries(params.entries()),
  });

  const paid = isPaidEvent(body);
  if (!paid) {
    console.log('[AbacatePay webhook] Ignoring non-paid event.');
    return NextResponse.json({ received: true });
  }

  const paymentId = extractPaymentId(body, params);
  if (!paymentId) {
    console.warn('[AbacatePay webhook] Missing payment ID in payload.');
    return NextResponse.json({ received: true });
  }

  const order = await cartService.getOrderByPaymentId(paymentId);
  if (!order) {
    console.warn('[AbacatePay webhook] Order not found for paymentId:', paymentId, body);
    return NextResponse.json({ received: true });
  }

  if (order.status === 'paid') {
    console.log('[AbacatePay webhook] Order already marked paid:', order.id);
    return NextResponse.json({ received: true });
  }

  await cartService.updateOrderStatus(order.docId, 'paid');
  await cartService.clearCart(order.userId);

  const itemLines = order.items.map(item => {
    const p = PRODUCTS[item.productId];
    return `• ${p?.name || item.productId} (${item.quantity}x)`;
  });

  const message =
    `✅ *Pagamento confirmado!* 🎉\n\n` +
    `*Itens comprados:*\n${itemLines.join('\n')}\n\n` +
    `💰 *Total pago:* ${formatCurrency(order.total)}\n` +
    `🚚 *Entrega estimada:* ${deliveryDate()}\n\n` +
    `Obrigado pela compra! Em breve você receberá mais informações sobre o envio. 📦`;

  try {
    await sendMessage(order.userId, message);
    console.log('[AbacatePay webhook] Confirmation sent to user:', order.userId);
  } catch (err) {
    console.error('Failed to send WhatsApp confirmation:', err);
  }

  return NextResponse.json({ received: true });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return processWebhook(body, request.nextUrl.searchParams);
  } catch (error) {
    console.error('AbacatePay webhook POST parse error:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const body: any = {};
  if (params.has('data')) {
    try {
      body.data = JSON.parse(params.get('data') || '{}');
    } catch {
      body.data = undefined;
    }
  }
  for (const [key, value] of params.entries()) {
    if (key !== 'data') body[key] = value;
  }
  return processWebhook(body, params);
}

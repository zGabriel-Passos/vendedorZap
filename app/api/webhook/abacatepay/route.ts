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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const isPaid =
      body?.data?.status === 'PAID' ||
      body?.data?.status === 'paid' ||
      body?.event === 'billing.paid';

    if (!isPaid) {
      return NextResponse.json({ received: true });
    }

    const billingId: string = body?.data?.id;
    if (!billingId) return NextResponse.json({ received: true });

    const order = await cartService.getOrderByPaymentId(billingId);
    if (!order || order.status === 'paid') return NextResponse.json({ received: true });

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
    } catch (err) {
      console.error('Failed to send WhatsApp confirmation:', err);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('AbacatePay webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { WASocket, proto } from '@whiskeysockets/baileys';
import { GroqService } from './groqService';
import { cartService } from './cartService';
import { PRODUCTS } from '../lib/products';
import { createPaymentForCart } from '../lib/abacatepay';
import { getMessageText, getSenderJid } from '../lib/whatsapp';

const MY_WHATSAPP_ID = process.env.MY_WHATSAPP_ID?.trim() || '5511999999999';

function normalizeJid(jid?: string) {
  return jid?.replace(/@c\.us$|@s\.whatsapp\.net$/i, '') || '';
}

function isAllowedMessage(jid?: string) {
  if (!jid) return false;
  if (jid.endsWith('@g.us')) return false;
  return normalizeJid(jid) === normalizeJid(MY_WHATSAPP_ID);
}

const PRODUCT_ALIAS: Record<string, string> = {
  iphone: 'iphone',
  macbook: 'macbook',
  airpod: 'airpods',
  airpods: 'airpods',
  carregador: 'charger',
  capa: 'case',
  case: 'case',
  charger: 'charger',
};

function resolveProductId(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [alias, id] of Object.entries(PRODUCT_ALIAS)) {
    if (lower.includes(alias)) return id;
  }
  return null;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function deliveryDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toLocaleDateString('pt-BR');
}

async function reply(sock: WASocket, jid: string, text: string) {
  await sock.sendMessage(jid, { text });
}

export async function handleMessage(sock: WASocket, msg: proto.IWebMessageInfo) {
  const jid = getSenderJid(msg);
  if (!isAllowedMessage(jid)) return;

  const body = getMessageText(msg).trim();
  if (!body) return;

  // Ensure session exists
  let session = await cartService.getUserSession(jid);
  if (!session) session = await cartService.createUserSession(jid, jid.replace('@s.whatsapp.net', ''));

  // --- Slash commands (fast path, no Groq needed) ---
  const cmd = body.startsWith('/') ? body.split(' ')[0].toLowerCase() : null;

  if (cmd === '/ajuda') {
    return reply(sock, jid, helpText());
  }

  if (cmd === '/produtos') {
    return reply(sock, jid, productsText());
  }

  if (cmd === '/carrinho') {
    return reply(sock, jid, await cartText(jid));
  }

  if (cmd === '/historico') {
    return reply(sock, jid, await historyText(jid));
  }

  if (cmd === '/frete') {
    return reply(sock, jid, freteText());
  }

  if (cmd === '/reset') {
    await cartService.clearCart(jid);
    return reply(sock, jid, '🔄 Conversa reiniciada! Como posso ajudá-lo hoje?');
  }

  // --- AI intent extraction ---
  const { intent, entities } = await GroqService.extractIntent(body);

  switch (intent) {
    case 'greeting':
      return reply(sock, jid,
        'Olá! 👋 Bem-vindo ao *Vendedor Zap*! 🤖\n\nSou seu assistente de vendas. Você pode:\n• Me dizer o que quer comprar naturalmente\n• Usar /produtos para ver o catálogo\n• Usar /ajuda para ver todos os comandos'
      );

    case 'help':
      return reply(sock, jid, helpText());

    case 'products':
      return reply(sock, jid, productsText());

    case 'view_cart':
      return reply(sock, jid, await cartText(jid));

    case 'history':
      return reply(sock, jid, await historyText(jid));

    case 'shipping':
      return reply(sock, jid, freteText());

    case 'reset':
      await cartService.clearCart(jid);
      return reply(sock, jid, '🔄 Conversa reiniciada! Como posso ajudá-lo hoje?');

    case 'add_to_cart': {
      const productNames: string[] = entities.product_names || [];
      const quantities: Record<string, number> = entities.quantities || {};
      const added: string[] = [];

      // CORRIGIDO: Primeiro adiciona os produtos, DEPOIS busca o carrinho
      for (const name of productNames) {
        const productId = resolveProductId(name);
        if (!productId) {
          console.log(`Product not resolved: ${name}`);
          continue;
        }

        const qty = quantities[name] || quantities[productId] || 1;

        console.log(`Adding to cart: ${productId} (${qty}x) for user ${jid}`);
        const success = await cartService.addToCart(jid, productId, qty);

        if (success && PRODUCTS[productId]) {
          added.push(PRODUCTS[productId].name);
        } else {
          console.log(`Failed to add: ${productId}`);
        }
      }

      if (added.length === 0) {
        return reply(sock, jid, 'Não encontrei esse produto. Use /produtos para ver o catálogo.');
      }

      // Agora sim busca o carrinho atualizado
      const cartSummary = await cartText(jid);

      return reply(sock, jid,
        `✅ Adicionado ao carrinho: *${added.join(', ')}*\n\n${cartSummary}\n\nPara finalizar, diga "quero pagar" ou use /carrinho.`
      );
    }

    case 'checkout': {
      const cartItems = await cartService.getCart(jid);
      if (cartItems.length === 0) {
        return reply(sock, jid, 'Seu carrinho está vazio! Use /produtos para ver o catálogo.');
      }

      const total = await cartService.calculateCartTotal(jid);
      const lines = cartItems.map(item => {
        const p = PRODUCTS[item.productId];
        let price = p?.price || 0;
        if (item.variation && p?.variations?.[item.variation]) price = p.variations[item.variation].price;
        return `• ${p?.name || item.productId} (${item.quantity}x) — ${formatCurrency(price * item.quantity)}`;
      });

      await reply(sock, jid,
        `🛒 *Resumo do pedido:*\n${lines.join('\n')}\n\n💰 *Total: ${formatCurrency(total)}*\n\nGerando link de pagamento...`
      );

      try {
        const { url, billingId } = await createPaymentForCart(cartItems, PRODUCTS, jid);

        // Save order
        await cartService.saveOrder({
          userId: jid,
          items: cartItems,
          total,
          status: 'pending',
          paymentLink: url,
          paymentId: billingId,
        });

        return reply(sock, jid,
          `💳 *Link de pagamento gerado!*\n\n👉 ${url}\n\nApós o pagamento, você receberá a confirmação aqui. 😊`
        );
      } catch (err) {
        console.error('Payment error:', err);
        return reply(sock, jid, 'Erro ao gerar link de pagamento. Tente novamente em instantes.');
      }
    }

    default:
      return reply(sock, jid,
        'Não entendi sua mensagem. 😅 Use /ajuda para ver os comandos disponíveis ou me diga o que deseja comprar!'
      );
  }
}

// --- Text helpers ---

function helpText() {
  return `📋 *Comandos disponíveis:*\n\n/produtos — Ver catálogo completo\n/carrinho — Ver seu carrinho\n/historico — Histórico de pedidos\n/frete — Informações de entrega\n/reset — Reiniciar conversa\n/ajuda — Esta mensagem\n\nVocê também pode falar naturalmente:\n_"Quero comprar iPhone com carregador"_\n_"Adiciona AirPods ao carrinho"_\n_"Quero finalizar a compra"_`;
}

function productsText() {
  const lines = Object.values(PRODUCTS).map(p =>
    `• *${p.name}* — ${formatCurrency(p.price)}\n  _${p.description}_`
  );
  return `🛍️ *Produtos disponíveis:*\n\n${lines.join('\n\n')}`;
}

async function cartText(userId: string) {
  const cart = await cartService.getCart(userId);
  if (cart.length === 0) return '🛒 Seu carrinho está vazio.';

  const total = await cartService.calculateCartTotal(userId);
  const lines = cart.map(item => {
    const p = PRODUCTS[item.productId];
    if (!p) return null;

    let price = p.price;
    if (item.variation && p.variations?.[item.variation]) {
      price = p.variations[item.variation].price;
    }

    return `• ${p.name} (${item.quantity}x) — ${formatCurrency(price * item.quantity)}`;
  }).filter(Boolean);

  return `🛒 *Seu carrinho:*\n${lines.join('\n')}\n\n💰 *Total: ${formatCurrency(total)}*`;
}

async function historyText(userId: string) {
  const orders = await cartService.getUserOrders(userId);
  if (orders.length === 0) return '📦 Você ainda não tem pedidos.';

  const lines = orders.map((o, i) => {
    const date = o.createdAt instanceof Date
      ? o.createdAt.toLocaleDateString('pt-BR')
      : new Date((o.createdAt as any)._seconds * 1000).toLocaleDateString('pt-BR');
    return `${i + 1}. Pedido ${o.id.slice(-6)} — ${formatCurrency(o.total)} — *${o.status}* — ${date}`;
  });

  return `📦 *Histórico de pedidos:*\n\n${lines.join('\n')}`;
}

function freteText() {
  return `🚚 *Informações de frete:*\n\n• Frete grátis para todo o Brasil!\n• Prazo de entrega: até 3 dias úteis\n• Estimativa para o próximo pedido: *${deliveryDate()}*`;
}
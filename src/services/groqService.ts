import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

type Intent =
  | 'greeting'
  | 'product_inquiry'
  | 'add_to_cart'
  | 'view_cart'
  | 'checkout'
  | 'help'
  | 'history'
  | 'reset'
  | 'products'
  | 'shipping'
  | 'unknown';

interface IntentResult {
  intent: Intent;
  entities: Record<string, any>;
  confidence: number;
}

export class GroqService {
  static async extractIntent(message: string): Promise<IntentResult> {
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama3-8b-8192',
        temperature: 0.1,
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: `Você é um assistente especializado em entender intenções de compra via WhatsApp.
Analise a mensagem e retorne APENAS um JSON válido:
{
  "intent": "greeting|product_inquiry|add_to_cart|view_cart|checkout|help|history|reset|products|shipping|unknown",
  "entities": {
    "product_names": ["lista de produtos mencionados"],
    "quantities": {"nome_produto": numero},
    "variations": {"nome_produto": "variacao"}
  },
  "confidence": 0.0
}`,
          },
          { role: 'user', content: message },
        ],
      });

      const raw = completion.choices[0]?.message?.content || '';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');
      return JSON.parse(jsonMatch[0]);
    } catch {
      return GroqService.fallback(message);
    }
  }

  private static fallback(message: string): IntentResult {
    const m = message.toLowerCase();

    if (/^\/ajuda/.test(m)) return { intent: 'help', entities: {}, confidence: 1 };
    if (/^\/carrinho/.test(m)) return { intent: 'view_cart', entities: {}, confidence: 1 };
    if (/^\/produtos/.test(m)) return { intent: 'products', entities: {}, confidence: 1 };
    if (/^\/historico/.test(m)) return { intent: 'history', entities: {}, confidence: 1 };
    if (/^\/frete/.test(m)) return { intent: 'shipping', entities: {}, confidence: 1 };
    if (/^\/reset/.test(m)) return { intent: 'reset', entities: {}, confidence: 1 };

    if (/\b(oi|olá|ola|hey|bom dia|boa tarde|boa noite)\b/.test(m))
      return { intent: 'greeting', entities: {}, confidence: 0.9 };

    if (/\b(ajuda|help)\b/.test(m)) return { intent: 'help', entities: {}, confidence: 0.9 };
    if (/\b(carrinho)\b/.test(m)) return { intent: 'view_cart', entities: {}, confidence: 0.9 };
    if (/\b(finalizar|checkout|pagar|pagamento)\b/.test(m))
      return { intent: 'checkout', entities: {}, confidence: 0.9 };
    if (/\b(histórico|historico|pedidos)\b/.test(m))
      return { intent: 'history', entities: {}, confidence: 0.9 };
    if (/\b(frete|entrega|prazo)\b/.test(m)) return { intent: 'shipping', entities: {}, confidence: 0.9 };
    if (/\b(produtos|catálogo|catalogo|lista)\b/.test(m))
      return { intent: 'products', entities: {}, confidence: 0.9 };

    const productMap: Record<string, string> = {
      iphone: 'iphone',
      macbook: 'macbook',
      airpod: 'airpods',
      carregador: 'carregador',
      capa: 'capa',
    };
    const found = Object.keys(productMap).filter(k => m.includes(k));

    if (found.length > 0 && /\b(quero|comprar|adicionar|coloca|queria)\b/.test(m)) {
      return {
        intent: 'add_to_cart',
        entities: {
          product_names: found,
          quantities: Object.fromEntries(found.map(k => [k, 1])),
        },
        confidence: 0.8,
      };
    }

    if (found.length > 0) {
      return { intent: 'product_inquiry', entities: { product_names: found }, confidence: 0.7 };
    }

    return { intent: 'unknown', entities: {}, confidence: 0.3 };
  }
}

// Named export for backward compatibility
export const groqService = GroqService;

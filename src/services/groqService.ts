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
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: `Você é um assistente especializado em entender intenções de compra via WhatsApp.

Produtos disponíveis (use exatamente estes nomes):
- iphone (iPhone 15 Pro)
- macbook (MacBook Pro 14")
- airpods (AirPods Pro)
- charger (Carregador USB-C)
- case (Capa para iPhone)

Analise a mensagem e retorne APENAS um JSON válido:
{
  "intent": "greeting|product_inquiry|add_to_cart|view_cart|checkout|help|history|reset|products|shipping|unknown",
  "entities": {
    "product_names": ["lista de IDs dos produtos mencionados: iphone, macbook, airpods, charger, case"],
    "quantities": {"product_id": numero},
    "variations": {"product_id": "variacao"}
  },
  "confidence": 0.0
}

IMPORTANTE: Use os IDs exatos dos produtos (iphone, macbook, airpods, charger, case), não os nomes em português.`,
          },
          { role: 'user', content: message },
        ],
      });

      const raw = completion.choices[0]?.message?.content || '';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');

      const result = JSON.parse(jsonMatch[0]);

      // Normalizar os nomes dos produtos para os IDs corretos
      if (result.entities?.product_names) {
        result.entities.product_names = result.entities.product_names.map((name: string) => {
          const normalized = name.toLowerCase();
          // Mapeamento de variações para IDs corretos
          if (normalized.includes('carregador')) return 'charger';
          if (normalized.includes('capa')) return 'case';
          if (normalized.includes('airpod')) return 'airpods';
          return normalized;
        });
      }

      return result;
    } catch (err) {
      console.error('Groq extraction error:', err);
      return GroqService.fallback(message);
    }
  }

  private static fallback(message: string): IntentResult {
    const m = message.toLowerCase();

    // Comandos slash
    if (/^\/ajuda/.test(m)) return { intent: 'help', entities: {}, confidence: 1 };
    if (/^\/carrinho/.test(m)) return { intent: 'view_cart', entities: {}, confidence: 1 };
    if (/^\/produtos/.test(m)) return { intent: 'products', entities: {}, confidence: 1 };
    if (/^\/historico/.test(m)) return { intent: 'history', entities: {}, confidence: 1 };
    if (/^\/frete/.test(m)) return { intent: 'shipping', entities: {}, confidence: 1 };
    if (/^\/reset/.test(m)) return { intent: 'reset', entities: {}, confidence: 1 };

    // Saudações
    if (/\b(oi|olá|ola|hey|bom dia|boa tarde|boa noite)\b/.test(m))
      return { intent: 'greeting', entities: {}, confidence: 0.9 };

    // Ajuda
    if (/\b(ajuda|help)\b/.test(m)) return { intent: 'help', entities: {}, confidence: 0.9 };

    // Carrinho
    if (/\b(carrinho)\b/.test(m)) return { intent: 'view_cart', entities: {}, confidence: 0.9 };

    // Checkout
    if (/\b(finalizar|checkout|pagar|pagamento|quero pagar)\b/.test(m))
      return { intent: 'checkout', entities: {}, confidence: 0.9 };

    // Histórico
    if (/\b(histórico|historico|pedidos)\b/.test(m))
      return { intent: 'history', entities: {}, confidence: 0.9 };

    // Frete
    if (/\b(frete|entrega|prazo)\b/.test(m))
      return { intent: 'shipping', entities: {}, confidence: 0.9 };

    // Produtos
    if (/\b(produtos|catálogo|catalogo|lista)\b/.test(m))
      return { intent: 'products', entities: {}, confidence: 0.9 };

    // Detecção de produtos
    // CORRIGIDO: Mapeamento correto para os IDs dos produtos
    const productPatterns = [
      { pattern: /\b(iphone|iphone 15|iphone pro)\b/, id: 'iphone' },
      { pattern: /\b(macbook|mac book|notebook)\b/, id: 'macbook' },
      { pattern: /\b(airpod|airpods|fone)\b/, id: 'airpods' },
      { pattern: /\b(carregador|carrega|charger)\b/, id: 'charger' },
      { pattern: /\b(capa|case|capinha)\b/, id: 'case' },
    ];

    const foundProducts: string[] = [];
    for (const { pattern, id } of productPatterns) {
      if (pattern.test(m)) {
        foundProducts.push(id);
      }
    }

    // Extrair quantidades
    const quantities: Record<string, number> = {};
    if (foundProducts.length > 0) {
      // Tentar detectar números na mensagem
      const numberMatch = m.match(/\b(\d+)\s*(x|unidade|unidades)?\b/);
      const qty = numberMatch ? parseInt(numberMatch[1]) : 1;

      foundProducts.forEach(productId => {
        quantities[productId] = qty;
      });
    }

    // Intenção de adicionar ao carrinho
    if (foundProducts.length > 0 && /\b(quero|comprar|adicionar|adiciona|coloca|queria|me vende|vende)\b/.test(m)) {
      return {
        intent: 'add_to_cart',
        entities: {
          product_names: foundProducts,
          quantities: quantities,
        },
        confidence: 0.8,
      };
    }

    // Consulta sobre produto
    if (foundProducts.length > 0) {
      return {
        intent: 'product_inquiry',
        entities: { product_names: foundProducts },
        confidence: 0.7
      };
    }

    return { intent: 'unknown', entities: {}, confidence: 0.3 };
  }
}

// Named export for backward compatibility
export const groqService = GroqService;
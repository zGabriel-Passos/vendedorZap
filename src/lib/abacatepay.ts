import axios from 'axios';

const BASE_URL = 'https://api.abacatepay.com/v1';

function headers() {
  return {
    Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

export interface PaymentItem {
  externalId: string;
  name: string;
  description: string;
  quantity: number;
  price: number; // in cents
}

export interface CreateBillingParams {
  frequency: 'ONE_TIME';
  methods: ('PIX' | 'CREDIT_CARD' | 'BOLETO')[];
  products: PaymentItem[];
  returnUrl: string;
  completionUrl: string;
  customer?: {
    name: string;
    email: string;
    cellphone: string;
    taxId: { number: string; type: 'CPF' | 'CNPJ' };
  };
}

export interface BillingResponse {
  data: {
    id: string;
    url: string;
    status: string;
    devMode: boolean;
    products: PaymentItem[];
    createdAt: string;
    updatedAt: string;
  };
  error: string | null;
}

export async function createBilling(params: CreateBillingParams): Promise<BillingResponse> {
  const response = await axios.post(`${BASE_URL}/billing/create`, params, { headers: headers() });
  return response.data;
}

export async function getBilling(billingId: string): Promise<BillingResponse> {
  const response = await axios.get(`${BASE_URL}/billing/${billingId}`, { headers: headers() });
  return response.data;
}

export async function createPaymentForCart(
  cartItems: { productId: string; quantity: number; variation?: string }[],
  productsMap: Record<string, { name: string; price: number; variations?: Record<string, { price: number }> }>,
  userId: string
): Promise<{ url: string; billingId: string }> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const products: PaymentItem[] = cartItems.map(item => {
    const product = productsMap[item.productId];
    let price = product.price;
    if (item.variation && product.variations?.[item.variation]) {
      price = product.variations[item.variation].price;
    }
    return {
      externalId: `${item.productId}_${item.variation || 'default'}`,
      name: product.name,
      description: item.variation ? `${product.name} - ${item.variation}` : product.name,
      quantity: item.quantity,
      price: Math.round(price * 100), // convert to cents
    };
  });

  // Log para debug
  console.log('[AbacatePay] Creating payment with params:', {
    frequency: 'ONE_TIME',
    methods: ['PIX'],
    products,
    returnUrl: `${baseUrl}/`,
    completionUrl: `${baseUrl}/api/webhook/abacatepay?userId=${userId}`,
  });

  // Tentando com customer mínimo para o modo de teste
  const cleanUserId = userId.replace(/[^\d]/g, '').slice(-10); // Últimos 10 dígitos

  const billing = await createBilling({
    frequency: 'ONE_TIME',
    methods: ['PIX'],
    products,
    returnUrl: `${baseUrl}/`,
    completionUrl: `${baseUrl}/api/webhook/abacatepay?userId=${userId}`,
    customer: {
      // Valores mínimos para tentar passar na validação do modo de teste
      name: `Teste ${cleanUserId}`,
      email: `teste${cleanUserId}@teste.com`,
      cellphone: cleanUserId.padStart(11, '0'), // Garantindo 11 dígitos para celular brasileiro
      taxId: {
        number: '12345678909', // CPF válido para teste
        type: 'CPF'
      }
    }
  });

  console.log('[AbacatePay] Billing response:', billing);

  if (billing.error) throw new Error(billing.error);

  return { url: billing.data.url, billingId: billing.data.id };
}

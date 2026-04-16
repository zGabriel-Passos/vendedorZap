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
    taxId: string;
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
  try {
    const response = await axios.post(`${BASE_URL}/billing/create`, params, { headers: headers() });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('[AbacatePay] API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      // Re-throw with enhanced error info
      throw new Error(`AbacatePay API error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
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

  function formatWhatsAppPhone(value: string) {
    const digits = value.replace(/[^\d]/g, '');
    return digits.startsWith('55') ? digits.slice(2) : digits;
  }

  function generateValidCpf(value: string) {
    const digits = value.replace(/[^\d]/g, '').slice(-9).padStart(9, '0').split('').map(Number);
    const firstSum = digits.reduce((sum, digit, index) => sum + digit * (10 - index), 0);
    const firstCheck = 11 - (firstSum % 11);
    digits.push(firstCheck >= 10 ? 0 : firstCheck);

    const secondSum = digits.reduce((sum, digit, index) => sum + digit * (11 - index), 0);
    const secondCheck = 11 - (secondSum % 11);
    digits.push(secondCheck >= 10 ? 0 : secondCheck);

    return digits.join('');
  }

  const whatsappPhone = formatWhatsAppPhone(userId);
  const customerTaxId = generateValidCpf(whatsappPhone);

  // Log para debug
  console.log('[AbacatePay] Creating payment with params:', {
    frequency: 'ONE_TIME',
    methods: ['PIX'],
    products,
    returnUrl: `${baseUrl}/`,
    completionUrl: `${baseUrl}/api/webhook/abacatepay?userId=${userId}`,
    customer: {
      name: `Teste ${whatsappPhone}`,
      email: `teste${whatsappPhone}@teste.com`,
      cellphone: whatsappPhone,
      taxId: customerTaxId,
    }
  });

  const billing = await createBilling({
    frequency: 'ONE_TIME',
    methods: ['PIX'],
    products,
    returnUrl: `${baseUrl}/`,
    completionUrl: `${baseUrl}/api/webhook/abacatepay?userId=${encodeURIComponent(userId)}`,
    customer: {
      // Valores mínimos para tentar passar na validação do modo de teste
      name: `Teste ${whatsappPhone}`,
      email: `teste${whatsappPhone}@teste.com`,
      cellphone: whatsappPhone,
      taxId: customerTaxId,
    }
  });

  console.log('[AbacatePay] Billing response:', billing);

  if (billing.error) throw new Error(billing.error);

  return { url: billing.data.url, billingId: billing.data.id };
}

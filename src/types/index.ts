export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  variations?: Record<string, { price: number; stock?: number }>;
}

export interface CartItem {
  productId: string;
  quantity: number;
  variation?: string;
}

export interface UserSession {
  userId: string;
  cart: CartItem[];
  lastInteraction: Date;
  phoneNumber?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentLink?: string;
  paymentId?: string;
  createdAt: Date;
  estimatedDelivery?: Date;
}

export interface WhatsAppMessage {
  from: string;
  body: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'document';
}

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from '@firebase/firestore';
import { db } from '../lib/firebase';
import { CartItem, UserSession, Order } from '../types';
import { PRODUCTS } from '../lib/products';

const SESSIONS = 'userSessions';
const ORDERS = 'orders';

export class FirebaseCartService {
  async getUserSession(userId: string): Promise<UserSession | null> {
    const snap = await getDoc(doc(db, SESSIONS, userId));
    return snap.exists() ? (snap.data() as UserSession) : null;
  }

  async createUserSession(userId: string, phoneNumber?: string): Promise<UserSession> {
    const session: UserSession = { userId, cart: [], lastInteraction: new Date(), phoneNumber };
    await setDoc(doc(db, SESSIONS, userId), session);
    return session;
  }

  async updateUserSession(userId: string, data: Partial<UserSession>): Promise<void> {
    await updateDoc(doc(db, SESSIONS, userId), { ...data, lastInteraction: new Date() });
  }

  async addToCart(userId: string, productId: string, quantity: number, variation?: string): Promise<boolean> {
    try {
      if (!PRODUCTS[productId]) return false;
      const session = await this.getUserSession(userId);
      const cart: CartItem[] = session?.cart || [];
      const idx = cart.findIndex(i => i.productId === productId && i.variation === variation);
      if (idx >= 0) {
        cart[idx].quantity += quantity;
      } else {
        cart.push({ productId, quantity, variation });
      }
      await this.updateUserSession(userId, { cart });
      return true;
    } catch {
      return false;
    }
  }

  async removeFromCart(userId: string, productId: string): Promise<boolean> {
    try {
      const session = await this.getUserSession(userId);
      if (!session) return false;
      await this.updateUserSession(userId, {
        cart: session.cart.filter(i => i.productId !== productId),
      });
      return true;
    } catch {
      return false;
    }
  }

  async getCart(userId: string): Promise<CartItem[]> {
    const session = await this.getUserSession(userId);
    return session?.cart || [];
  }

  async clearCart(userId: string): Promise<void> {
    await this.updateUserSession(userId, { cart: [] });
  }

  async calculateCartTotal(userId: string): Promise<number> {
    const cart = await this.getCart(userId);
    return cart.reduce((total, item) => {
      const product = PRODUCTS[item.productId];
      if (!product) return total;

      let price = product.price;
      if (item.variation && product.variations?.[item.variation]) {
        price = product.variations[item.variation].price;
      }

      return total + (price * item.quantity);
    }, 0);
  }

  async saveOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
    const id = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
    const fullOrder = { ...order, id, createdAt: new Date(), estimatedDelivery };
    await setDoc(doc(db, ORDERS, id), fullOrder);
    return id;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const q = query(
      collection(db, ORDERS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => (d as any).data() as Order);
  }

  async getOrderByPaymentId(paymentId: string): Promise<(Order & { docId: string }) | null> {
    const q = query(
      collection(db, ORDERS),
      where('paymentId', '==', paymentId),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { ...(snap.docs[0].data() as Order), docId: snap.docs[0].id };
  }

  async updateOrderStatus(docId: string, status: Order['status']): Promise<void> {
    await updateDoc(doc(db, ORDERS, docId), { status, paidAt: new Date() });
  }
}

export const cartService = new FirebaseCartService();

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
    console.log(`[CartService] Fetching session for userId: ${userId}`);
    const snap = await getDoc(doc(db, SESSIONS, userId));
    console.log(`[CartService] Session fetch result - exists: ${snap.exists()}, data: ${snap.exists() ? JSON.stringify(snap.data()) : 'null'}`);
    return snap.exists() ? (snap.data() as UserSession) : null;
  }

  async createUserSession(userId: string, phoneNumber?: string): Promise<UserSession> {
    const session: UserSession = { userId, cart: [], lastInteraction: new Date(), phoneNumber };
    await setDoc(doc(db, SESSIONS, userId), session);
    return session;
  }

  async updateUserSession(userId: string, data: Partial<UserSession>): Promise<void> {
    console.log(`[CartService] Updating session for userId: ${userId} with data:`, data);
    await updateDoc(doc(db, SESSIONS, userId), { ...data, lastInteraction: new Date() });
    console.log(`[CartService] Session updated successfully for userId: ${userId}`);
  }

  async addToCart(userId: string, productId: string, quantity: number, variation?: string): Promise<boolean> {
    try {
      console.log(`[CartService] Adding to cart - userId: ${userId}, productId: ${productId}, quantity: ${quantity}, variation: ${variation || 'undefined'}`);
      if (!PRODUCTS[productId]) {
        console.log(`[CartService] Product not found: ${productId}`);
        return false;
      }
      const session = await this.getUserSession(userId);
      console.log(`[CartService] Retrieved session:`, session);
      const cart: CartItem[] = session?.cart || [];
      const idx = cart.findIndex(i => i.productId === productId && i.variation === variation);
      if (idx >= 0) {
        cart[idx].quantity += quantity;
        // Ensure variation is not undefined if it exists
        if (variation !== undefined) {
          cart[idx].variation = variation;
        } else {
          delete cart[idx].variation;
        }
      } else {
        // Filtrar variações undefined para evitar erro no Firestore
        const cartItem: CartItem = { productId, quantity };
        if (variation !== undefined) {
          cartItem.variation = variation;
        }
        cart.push(cartItem);
      }
      console.log(`[CartService] Updated cart:`, cart);
      await this.updateUserSession(userId, { cart });
      console.log(`[CartService] Session updated successfully for userId: ${userId}`);
      return true;
    } catch (error) {
      console.error('[CartService] Error in addToCart:', error);
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

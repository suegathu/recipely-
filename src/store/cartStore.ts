import { create } from 'zustand';
import { supabase } from '../auth/supabase';

interface CartItem {
  productId: string;
  vendorId: string;
  name: string;
  imageURL: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: { id: string; vendorId: string; name: string; imageURLs: string[]; price: number }, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
  getVendorGroups: () => { vendorId: string; items: CartItem[] }[];
  syncFromSupabase: (userId: string) => Promise<void>;
  syncToSupabase: (userId: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }
      return {
        items: [...state.items, {
          productId: product.id,
          vendorId: product.vendorId,
          name: product.name,
          imageURL: product.imageURLs[0] ?? '',
          price: product.price,
          quantity,
        }],
      };
    });
  },

  removeItem: (productId) => {
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  getVendorGroups: () => {
    const map = new Map<string, CartItem[]>();
    for (const item of get().items) {
      const existing = map.get(item.vendorId) ?? [];
      existing.push(item);
      map.set(item.vendorId, existing);
    }
    return Array.from(map, ([vendorId, items]) => ({ vendorId, items }));
  },

  syncFromSupabase: async (userId) => {
    const { data } = await supabase
      .from('carts')
      .select('items')
      .eq('user_id', userId)
      .single();
    if (data?.items) {
      set({ items: data.items as CartItem[] });
    }
  },

  syncToSupabase: async (userId) => {
    const items = get().items;
    await supabase.from('carts').upsert({
      user_id: userId,
      items,
      updated_at: new Date().toISOString(),
    });
  },
}));

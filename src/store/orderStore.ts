import { create } from 'zustand';
import type { OrderStatus } from '../data/api/commerceTypes';

interface MockOrder {
  id: string;
  status: OrderStatus;
  items: { name: string; imageURL: string; price: number; quantity: number }[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  shippingAddress: { label: string; streetAddress: string; city: string; county: string };
  createdAt: string;
}

interface OrderState {
  orders: MockOrder[];
  currentOrder: MockOrder | null;
  isLoading: boolean;
  createOrder: (params: {
    items: { name: string; imageURL: string; price: number; quantity: number }[];
    subtotal: number;
    shippingCost: number;
    address: { label: string; streetAddress: string; city: string; county: string };
  }) => MockOrder;
  completePayment: (orderId: string) => void;
  getOrder: (orderId: string) => MockOrder | undefined;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,

  createOrder: ({ items, subtotal, shippingCost, address }) => {
    const order: MockOrder = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      status: 'pending_payment',
      items,
      subtotal,
      shippingCost,
      totalAmount: subtotal + shippingCost,
      shippingAddress: address,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      orders: [order, ...state.orders],
      currentOrder: order,
    }));
    return order;
  },

  completePayment: (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'paid' as OrderStatus } : o
      ),
      currentOrder: state.currentOrder?.id === orderId
        ? { ...state.currentOrder, status: 'paid' as OrderStatus }
        : state.currentOrder,
    }));
  },

  getOrder: (orderId) => get().orders.find((o) => o.id === orderId),
}));

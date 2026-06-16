import { and, asc, eq } from 'drizzle-orm';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { db, useLiveQuery } from '../db/client';
import { shoppingItems } from '../db/schema';

export type ShoppingItem = typeof shoppingItems.$inferSelect;

// Web fallback: Zustand in-memory store (SQLite unavailable on web).
const useWebStore = create<{
  items: ShoppingItem[];
  add: (item: ShoppingItem) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clearChecked: (userId: string) => void;
}>((set) => ({
  items: [],
  add: (item) => set((s) => ({ items: [item, ...s.items] })),
  toggle: (id) =>
    set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)) })),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clearChecked: (userId) =>
    set((s) => ({ items: s.items.filter((i) => !(i.userId === userId && i.checked)) })),
}));

export function useShoppingItems(userId: string): ShoppingItem[] {
  const webItems = useWebStore((s) => s.items);
  const { data: nativeData = [] } = useLiveQuery(
    db.select().from(shoppingItems).orderBy(asc(shoppingItems.checked), asc(shoppingItems.createdAt)),
  );
  const all = Platform.OS === 'web' ? webItems : nativeData;
  return all.filter((i) => i.userId === userId);
}

export function addShoppingItem(userId: string, text: string) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const item: ShoppingItem = { id, userId, text, checked: false, createdAt: Date.now() };
  if (Platform.OS === 'web') {
    useWebStore.getState().add(item);
    return;
  }
  db.insert(shoppingItems).values(item).run();
}

export function toggleShoppingItem(id: string, currentChecked: boolean) {
  if (Platform.OS === 'web') {
    useWebStore.getState().toggle(id);
    return;
  }
  db.update(shoppingItems).set({ checked: !currentChecked }).where(eq(shoppingItems.id, id)).run();
}

export function deleteShoppingItem(id: string) {
  if (Platform.OS === 'web') {
    useWebStore.getState().remove(id);
    return;
  }
  db.delete(shoppingItems).where(eq(shoppingItems.id, id)).run();
}

export function clearCheckedItems(userId: string) {
  if (Platform.OS === 'web') {
    useWebStore.getState().clearChecked(userId);
    return;
  }
  db.delete(shoppingItems)
    .where(and(eq(shoppingItems.userId, userId), eq(shoppingItems.checked, true)))
    .run();
}

import { eq } from 'drizzle-orm';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { db, useLiveQuery } from '../db/client';
import { bookmarks, recipeDetail } from '../db/schema';

type RecipeDetailRow = typeof recipeDetail.$inferSelect;

// Web fallback: Zustand in-memory store (SQLite unavailable on web).
const useWebStore = create<{
  items: RecipeDetailRow[];
  add: (recipe: RecipeDetailRow) => void;
  remove: (recipeId: string) => void;
}>((set) => ({
  items: [],
  add: (recipe) => set((s) => ({ items: [recipe, ...s.items] })),
  remove: (recipeId) => set((s) => ({ items: s.items.filter((i) => i.recipeId !== recipeId) })),
}));

export function useBookmarks(): RecipeDetailRow[] {
  const webItems = useWebStore((s) => s.items);
  const { data: nativeData = [] } = useLiveQuery(db.select().from(bookmarks));
  return Platform.OS === 'web' ? webItems : nativeData;
}

export function isBookmarked(recipeId: string): boolean {
  if (Platform.OS === 'web') {
    return useWebStore.getState().items.some((i) => i.recipeId === recipeId);
  }
  return db.select().from(bookmarks).where(eq(bookmarks.recipeId, recipeId)).get() !== undefined;
}

export function toggleBookmark(recipe: RecipeDetailRow) {
  if (Platform.OS === 'web') {
    const store = useWebStore.getState();
    if (isBookmarked(recipe.recipeId)) {
      store.remove(recipe.recipeId);
    } else {
      store.add(recipe);
    }
    return;
  }
  if (isBookmarked(recipe.recipeId)) {
    db.delete(bookmarks).where(eq(bookmarks.recipeId, recipe.recipeId)).run();
  } else {
    db.insert(bookmarks).values(recipe).run();
  }
}

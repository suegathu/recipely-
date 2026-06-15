import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { bookmarks, recipeDetail } from '../db/schema';

type RecipeDetailRow = typeof recipeDetail.$inferSelect;

// Mirrors presentation/recipeDetail/RecipeDetailViewModel.kt#toggleBookmark
export function isBookmarked(recipeId: string): boolean {
  const existing = db.select().from(bookmarks).where(eq(bookmarks.recipeId, recipeId)).get();
  return existing !== undefined;
}

export function toggleBookmark(recipe: RecipeDetailRow) {
  if (isBookmarked(recipe.recipeId)) {
    db.delete(bookmarks).where(eq(bookmarks.recipeId, recipe.recipeId)).run();
  } else {
    db.insert(bookmarks).values(recipe).run();
  }
}

export function bookmarksQuery() {
  return db.select().from(bookmarks);
}

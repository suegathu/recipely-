import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Mirrors app/src/main/java/com/loki/plitso/data/local/models — Category.kt
export const categories = sqliteTable('categories', {
  categoryId: text('category_id').primaryKey(),
  title: text('title').notNull(),
  image: text('image').notNull(),
});

// Mirrors Recipe.kt
export const recipes = sqliteTable('recipes', {
  recipeId: text('recipe_id').primaryKey(),
  title: text('title').notNull(),
  image: text('image').notNull(),
  categoryId: text('category_id').notNull(),
});

// Mirrors RecipeDetail.kt. `ingredients` is JSON-encoded text,
// mirroring the List<String> <-> String Converters.kt type converter.
export const recipeDetail = sqliteTable('recipe_detail', {
  recipeId: text('recipe_id').primaryKey(),
  title: text('title').notNull(),
  image: text('image').notNull(),
  country: text('country').notNull(),
  instructions: text('instructions').notNull(),
  ingredients: text('ingredients').notNull(),
});

// Mirrors Bookmark.kt (same shape as RecipeDetail)
export const bookmarks = sqliteTable('bookmarks', {
  recipeId: text('recipe_id').primaryKey(),
  title: text('title').notNull(),
  image: text('image').notNull(),
  country: text('country').notNull(),
  instructions: text('instructions').notNull(),
  ingredients: text('ingredients').notNull(),
});

// Mirrors DayRecipe.kt — single-row "recipe of the day" cache.
export const dayRecipe = sqliteTable('day_recipe', {
  recipeId: text('recipe_id').primaryKey(),
  title: text('title').notNull(),
  image: text('image').notNull(),
  updatedDate: integer('updated_date').notNull(),
});

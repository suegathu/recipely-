import { eq, like, or } from 'drizzle-orm';
import { db } from '../db/client';
import { categories, dayRecipe, recipeDetail, recipes } from '../db/schema';
import { mealdbApi } from '../api/mealdbApi';
import { toCategory, toRecipe, toRecipeDetail } from '../api/mappers';

// Mirrors data/repository/recipe/RecipeRepositoryImpl.kt#refreshDatabase (categories step)
export async function refreshCategories() {
  const response = await mealdbApi.getCategories();

  for (const dto of response.categories) {
    const category = toCategory(dto);
    await db
      .insert(categories)
      .values(category)
      .onConflictDoUpdate({ target: categories.categoryId, set: category });
  }
}

// Mirrors the per-category recipe fetch in RecipeRepositoryImpl.kt#refreshDatabase
export async function refreshCategoryRecipes(categoryId: string, categoryTitle: string) {
  const response = await mealdbApi.getCategoryRecipes(categoryTitle);

  for (const dto of response.meals ?? []) {
    const recipe = toRecipe(dto, categoryId);
    await db
      .insert(recipes)
      .values(recipe)
      .onConflictDoUpdate({ target: recipes.recipeId, set: recipe });
  }
}

// Mirrors RecipeRepositoryImpl.kt#getRecipeDetail — fetches and caches on miss.
export async function ensureRecipeDetail(id: string) {
  const existing = db.select().from(recipeDetail).where(eq(recipeDetail.recipeId, id)).get();
  if (existing) return existing;

  const response = await mealdbApi.getRecipeDetail(id);
  const dto = response.meals?.[0];
  if (!dto) throw new Error(`Recipe not found: ${id}`);

  const detail = toRecipeDetail(dto);
  db.insert(recipeDetail)
    .values(detail)
    .onConflictDoUpdate({ target: recipeDetail.recipeId, set: detail })
    .run();

  return detail;
}

// Mirrors RecipeRepositoryImpl.kt#getDayRecipe — "Recipe of the Day".
export async function ensureDayRecipe() {
  const existing = db.select().from(dayRecipe).get();
  if (existing) return existing;

  const response = await mealdbApi.getRandomRecipe();
  const dto = response.meals?.[0];
  if (!dto) return undefined;

  const recipe = {
    recipeId: dto.idMeal,
    title: dto.strMeal,
    image: dto.strMealThumb,
    updatedDate: Date.now(),
  };
  db.insert(dayRecipe).values(recipe).run();

  return recipe;
}

// Mirrors RecipeRepositoryImpl.kt#generateRandomRecipe — fetches and caches a fresh
// random recipe, used by Home's "Random Recipe" prompt.
export async function fetchRandomRecipeDetail() {
  const response = await mealdbApi.getRandomRecipe();
  const dto = response.meals?.[0];
  if (!dto) throw new Error('No random recipe available');

  const detail = toRecipeDetail(dto);
  db.insert(recipeDetail)
    .values(detail)
    .onConflictDoUpdate({ target: recipeDetail.recipeId, set: detail })
    .run();

  return detail;
}

// Mirrors SearchScreen's title/cuisine/ingredient filters over RecipeDetailDao.searchRecipe
export interface SearchFilters {
  title: boolean;
  cuisine: boolean;
  ingredient: boolean;
}

export async function searchRecipes(term: string, filters: SearchFilters) {
  const trimmed = term.trim();
  if (!trimmed) return [];

  const pattern = `%${trimmed}%`;
  const conditions = [];

  if (filters.title) conditions.push(like(recipeDetail.title, pattern));
  if (filters.cuisine) conditions.push(like(recipeDetail.country, pattern));
  if (filters.ingredient) conditions.push(like(recipeDetail.ingredients, pattern));

  // Default to title search if no filter is active.
  if (conditions.length === 0) conditions.push(like(recipeDetail.title, pattern));

  return db
    .select()
    .from(recipeDetail)
    .where(or(...conditions))
    .all();
}

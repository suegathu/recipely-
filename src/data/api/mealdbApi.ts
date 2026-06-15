import type { CategoryResponse, RecipeDetailResponse, RecipesResponse } from './types';

// Mirrors app/src/main/java/com/loki/plitso/data/remote/mealdb/MealdbApi.kt
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1/';

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`MealDB request failed: ${response.status} ${path}`);
  }
  return response.json() as Promise<T>;
}

export const mealdbApi = {
  getCategories: () => get<CategoryResponse>('categories.php'),

  getCategoryRecipes: (category: string) =>
    get<RecipesResponse>(`filter.php?c=${encodeURIComponent(category)}`),

  getRecipeDetail: (id: string) =>
    get<RecipeDetailResponse>(`lookup.php?i=${encodeURIComponent(id)}`),

  getRandomRecipe: () => get<RecipeDetailResponse>('random.php'),
};

import type { categories, recipeDetail, recipes } from '../db/schema';
import type { CategoryDto, RecipeDetailDto, RecipeDto } from './types';

type Category = typeof categories.$inferInsert;
type Recipe = typeof recipes.$inferInsert;
type RecipeDetail = typeof recipeDetail.$inferInsert;

// Mirrors data/remote/mealdb/mappers/Mapper.kt#sanitizeIngredients
export function sanitizeIngredients(dto: RecipeDetailDto): string[] {
  const ingredients: string[] = [];

  for (let i = 1; i <= 20; i++) {
    const measure = dto[`strMeasure${i}`];
    const ingredient = dto[`strIngredient${i}`];

    if (measure?.trim() && ingredient?.trim()) {
      ingredients.push(`${measure} ${ingredient}`);
    }
  }

  return ingredients;
}

export function toCategory(dto: CategoryDto): Category {
  return {
    categoryId: dto.idCategory,
    title: dto.strCategory,
    image: dto.strCategoryThumb,
  };
}

export function toRecipe(dto: RecipeDto, categoryId: string): Recipe {
  return {
    recipeId: dto.idMeal,
    title: dto.strMeal,
    image: dto.strMealThumb,
    categoryId,
  };
}

export function toRecipeDetail(dto: RecipeDetailDto): RecipeDetail {
  return {
    recipeId: dto.idMeal,
    title: dto.strMeal,
    image: dto.strMealThumb,
    country: dto.strArea,
    instructions: dto.strInstructions ?? '',
    ingredients: JSON.stringify(sanitizeIngredients(dto)),
  };
}

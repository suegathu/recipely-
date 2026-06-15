// Mirrors data/remote/mealdb/models — CategoryDto, RecipeDto, RecipeDetailDto

export interface CategoryDto {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription?: string;
}

export interface CategoryResponse {
  categories: CategoryDto[];
}

export interface RecipeDto {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

export interface RecipesResponse {
  meals: RecipeDto[];
}

export interface RecipeDetailDto {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strArea: string;
  strInstructions?: string;
  // Also includes strIngredient1..20 / strMeasure1..20, accessed via bracket notation.
  [key: string]: string | undefined;
}

export interface RecipeDetailResponse {
  meals: RecipeDetailDto[];
}

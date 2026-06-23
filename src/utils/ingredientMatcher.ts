import { supabase } from '../auth/supabase';

const MEASURE_WORDS = [
  'g', 'kg', 'ml', 'l', 'oz', 'lb', 'cup', 'cups', 'tbsp', 'tsp',
  'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons', 'pinch', 'handful',
  'slice', 'slices', 'piece', 'pieces', 'clove', 'cloves', 'bunch',
  'small', 'medium', 'large', 'to', 'of', 'fresh', 'dried', 'chopped',
  'minced', 'diced', 'sliced', 'ground', 'whole', 'finely', 'roughly',
];

export function normalizeIngredient(raw: string): string {
  let cleaned = raw.toLowerCase().trim();
  cleaned = cleaned.replace(/^[\d\/\.\s]+/, '').trim();
  const words = cleaned.split(/\s+/).filter((w) => !MEASURE_WORDS.includes(w));
  return words.join(' ').trim();
}

interface ProductRow {
  id: string;
  vendor_id: string;
  name: string;
  image_urls: string[];
  price: number;
  unit: string;
  recipe_ingredient_aliases: string[];
}

export interface IngredientMatch {
  raw: string;
  normalized: string;
  product: ProductRow | null;
}

export async function matchIngredientsToProducts(ingredients: string[]): Promise<IngredientMatch[]> {
  const { data: products } = await supabase
    .from('products')
    .select('id, vendor_id, name, image_urls, price, unit, recipe_ingredient_aliases')
    .eq('is_available', true);

  if (!products) {
    return ingredients.map((raw) => ({ raw, normalized: normalizeIngredient(raw), product: null }));
  }

  return ingredients.map((raw) => {
    const normalized = normalizeIngredient(raw);
    if (!normalized) return { raw, normalized, product: null };

    const match = products.find((p) =>
      p.recipe_ingredient_aliases.some((alias: string) =>
        alias.includes(normalized) || normalized.includes(alias)
      )
    );

    return { raw, normalized, product: match ?? null };
  });
}

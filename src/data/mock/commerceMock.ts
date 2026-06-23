import type { ProductCategory } from '../api/commerceTypes';

export const PRODUCT_CATEGORIES: { key: ProductCategory; label: string; icon: string }[] = [
  { key: 'produce', label: 'Produce', icon: '🥬' },
  { key: 'meat', label: 'Meat', icon: '🥩' },
  { key: 'spice', label: 'Spices', icon: '🌶️' },
  { key: 'dairy', label: 'Dairy', icon: '🥛' },
  { key: 'grain', label: 'Grains', icon: '🌾' },
  { key: 'seafood', label: 'Seafood', icon: '🐟' },
  { key: 'meal_kit', label: 'Meal Kits', icon: '📦' },
  { key: 'condiment', label: 'Condiments', icon: '🫙' },
];

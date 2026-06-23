import { create } from 'zustand';
import { supabase } from '../auth/supabase';
import type { ProductCategory } from '../data/api/commerceTypes';

interface ProductRow {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  image_urls: string[];
  category: string;
  price: number;
  currency: string;
  unit: string;
  stock_quantity: number;
  is_available: boolean;
  tags: string[];
  recipe_ingredient_aliases: string[];
}

interface VendorRow {
  id: string;
  owner_id: string;
  business_name: string;
  description: string;
  logo_url: string | null;
  cover_image_url: string | null;
  phone: string;
  email: string;
  status: string;
  street_address: string;
  city: string;
  county: string;
  lat: number | null;
  lng: number | null;
  rating: number;
  total_orders: number;
}

interface MarketplaceState {
  products: ProductRow[];
  vendors: VendorRow[];
  filteredProducts: ProductRow[];
  featuredProducts: ProductRow[];
  selectedCategory: ProductCategory | null;
  searchQuery: string;
  isLoading: boolean;
  loadProducts: () => Promise<void>;
  loadVendors: () => Promise<void>;
  filterByCategory: (category: ProductCategory | null) => void;
  search: (query: string) => void;
  getProduct: (productId: string) => ProductRow | undefined;
  getVendor: (vendorId: string) => VendorRow | undefined;
  getVendorProducts: (vendorId: string) => ProductRow[];
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  products: [],
  vendors: [],
  filteredProducts: [],
  featuredProducts: [],
  selectedCategory: null,
  searchQuery: '',
  isLoading: false,

  loadProducts: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const featured = data.filter((p: ProductRow) => p.category === 'meal_kit' || p.price >= 500);
      set({ products: data, filteredProducts: data, featuredProducts: featured, isLoading: false });
    } else {
      console.error('Failed to load products:', error);
      set({ isLoading: false });
    }
  },

  loadVendors: async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('status', 'approved');

    if (!error && data) {
      set({ vendors: data });
    }
  },

  filterByCategory: (category) => {
    const { products } = get();
    if (!category) {
      set({ selectedCategory: null, filteredProducts: products, searchQuery: '' });
    } else {
      set({
        selectedCategory: category,
        filteredProducts: products.filter((p) => p.category === category),
        searchQuery: '',
      });
    }
  },

  search: (query) => {
    const { products } = get();
    if (!query.trim()) {
      set({ searchQuery: '', filteredProducts: products, selectedCategory: null });
    } else {
      const q = query.toLowerCase();
      set({
        searchQuery: query,
        selectedCategory: null,
        filteredProducts: products.filter((p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)) ||
          p.recipe_ingredient_aliases.some((a) => a.includes(q))
        ),
      });
    }
  },

  getProduct: (productId) => get().products.find((p) => p.id === productId),

  getVendor: (vendorId) => get().vendors.find((v) => v.id === vendorId),

  getVendorProducts: (vendorId) => get().products.filter((p) => p.vendor_id === vendorId),
}));


// ── User ────────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  phone: string | null;
  role: UserRole;
  vendorId: string | null;
  defaultAddressId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Address ─────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  county: string;
  postalCode: string;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
  createdAt: string;
}

export interface AddressFormData {
  label: string;
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  county: string;
  postalCode: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
}

// ── Vendor ──────────────────────────────────────────────────────────────

export type VendorStatus = 'pending' | 'approved' | 'suspended';

export interface VendorAddress {
  streetAddress: string;
  city: string;
  county: string;
  lat: number;
  lng: number;
}

export interface Vendor {
  id: string;
  ownerId: string;
  businessName: string;
  description: string;
  logoURL: string | null;
  coverImageURL: string | null;
  phone: string;
  email: string;
  status: VendorStatus;
  address: VendorAddress;
  rating: number;
  totalOrders: number;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface VendorRegistrationData {
  businessName: string;
  description: string;
  phone: string;
  email: string;
  address: VendorAddress;
}

// ── Product ─────────────────────────────────────────────────────────────

export type ProductCategory =
  | 'ingredient'
  | 'meal_kit'
  | 'spice'
  | 'condiment'
  | 'dairy'
  | 'produce'
  | 'meat'
  | 'seafood'
  | 'grain'
  | 'beverage'
  | 'other';

export type ProductUnit = 'kg' | 'g' | 'piece' | 'bunch' | 'pack' | 'ml' | 'L' | 'dozen';

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  imageURLs: string[];
  category: ProductCategory;
  price: number;
  currency: 'KES';
  unit: ProductUnit;
  stockQuantity: number;
  isAvailable: boolean;
  tags: string[];
  recipeIngredientAliases: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: ProductCategory;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
}

// ── Cart ────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  vendorId: string;
  name: string;
  imageURL: string;
  price: number;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

// ── Order ───────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type VendorOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered';

export interface OrderItem {
  productId: string;
  vendorId: string;
  name: string;
  imageURL: string;
  price: number;
  quantity: number;
}

export interface VendorSubOrder {
  vendorId: string;
  vendorName: string;
  items: OrderItem[];
  subtotal: number;
  status: VendorOrderStatus;
}

export interface PesapalInfo {
  orderTrackingId: string;
  merchantReference: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  transactionDate: string | null;
}

export interface SendyInfo {
  orderId: string | null;
  trackingLink: string | null;
  status: string | null;
  eta: string | null;
}

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  currency: 'KES';
  shippingAddress: Address;
  pesapal: PesapalInfo;
  sendy: SendyInfo | null;
  vendorOrders: VendorSubOrder[];
  createdAt: string;
  updatedAt: string;
}

// ── IPN Log ─────────────────────────────────────────────────────────────

export interface IpnLog {
  orderTrackingId: string;
  merchantReference: string;
  notificationType: string;
  payload: Record<string, unknown>;
  processedAt: string;
}

// ── API Response Types ──────────────────────────────────────────────────

export interface CreateOrderResponse {
  orderId: string;
  paymentUrl: string;
}

export interface DeliveryQuote {
  cost: number;
  currency: 'KES';
  eta: string;
  distance: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  lastId: string | null;
}

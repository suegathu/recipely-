-- Plitso Marketplace Schema

-- User profiles (extends Firebase Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  uid TEXT PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin')),
  vendor_id TEXT,
  default_address_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User addresses
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user_profiles(uid) ON DELETE CASCADE,
  label TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  county TEXT NOT NULL,
  postal_code TEXT DEFAULT '',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL REFERENCES user_profiles(uid),
  business_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  logo_url TEXT,
  cover_image_url TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  county TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  rating DOUBLE PRECISION DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  commission_rate DOUBLE PRECISION DEFAULT 0.10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_urls TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'other',
  price NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  unit TEXT NOT NULL DEFAULT 'piece',
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  tags TEXT[] DEFAULT '{}',
  recipe_ingredient_aliases TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_category ON products(category) WHERE is_available = TRUE;
CREATE INDEX idx_products_available ON products(is_available);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL REFERENCES user_profiles(uid),
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  shipping_address JSONB,
  pesapal_order_tracking_id TEXT,
  pesapal_merchant_reference TEXT,
  pesapal_payment_method TEXT,
  pesapal_payment_status TEXT,
  pesapal_transaction_date TEXT,
  sendy_order_id TEXT,
  sendy_tracking_link TEXT,
  sendy_status TEXT,
  sendy_eta TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Cart (one per user)
CREATE TABLE IF NOT EXISTS carts (
  user_id TEXT PRIMARY KEY REFERENCES user_profiles(uid) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- IPN audit logs
CREATE TABLE IF NOT EXISTS ipn_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_tracking_id TEXT,
  merchant_reference TEXT,
  notification_type TEXT,
  payload JSONB,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipn_logs ENABLE ROW LEVEL SECURITY;

-- Policies: user_profiles
CREATE POLICY "Users read own profile" ON user_profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users update own profile" ON user_profiles FOR UPDATE USING (uid = current_setting('app.current_user_id', TRUE));
CREATE POLICY "Users insert own profile" ON user_profiles FOR INSERT WITH CHECK (TRUE);

-- Policies: addresses
CREATE POLICY "Users manage own addresses" ON addresses FOR ALL USING (user_id = current_setting('app.current_user_id', TRUE));

-- Policies: vendors (publicly readable)
CREATE POLICY "Anyone can read vendors" ON vendors FOR SELECT USING (TRUE);
CREATE POLICY "Owners manage own vendor" ON vendors FOR ALL USING (owner_id = current_setting('app.current_user_id', TRUE));

-- Policies: products (publicly readable)
CREATE POLICY "Anyone can read available products" ON products FOR SELECT USING (TRUE);
CREATE POLICY "Vendor owners manage products" ON products FOR ALL USING (
  vendor_id IN (SELECT id FROM vendors WHERE owner_id = current_setting('app.current_user_id', TRUE))
);

-- Policies: orders
CREATE POLICY "Customers read own orders" ON orders FOR SELECT USING (customer_id = current_setting('app.current_user_id', TRUE));
CREATE POLICY "Customers create orders" ON orders FOR INSERT WITH CHECK (customer_id = current_setting('app.current_user_id', TRUE));

-- Policies: carts
CREATE POLICY "Users manage own cart" ON carts FOR ALL USING (user_id = current_setting('app.current_user_id', TRUE));

-- Policies: ipn_logs (service role only, no public access)
CREATE POLICY "No public access to ipn_logs" ON ipn_logs FOR ALL USING (FALSE);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  product JSONB,
  customer_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  notes TEXT,
  payment_method TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Migration: 00_init_schema
-- Description: Creates initial tables for M=Milyarderrrrr!!!!

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE', 'INVESTMENT'))
);

-- 2. Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  amount NUMERIC NOT NULL,
  notes TEXT,
  transaction_date TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE', 'INVESTMENT')),
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_period TEXT CHECK (recurring_period IN ('NONE', 'WEEKLY', 'MONTHLY', 'YEARLY'))
);

-- 3. Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  target_date TEXT NOT NULL
);

-- 4. Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  monthly_limit NUMERIC NOT NULL
);

-- 5. Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('CASH', 'STOCK', 'MUTUAL_FUND', 'GOLD', 'CRYPTO', 'PROPERTY')),
  value NUMERIC NOT NULL DEFAULT 0
);

-- 6. Create liabilities table
CREATE TABLE IF NOT EXISTS liabilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0
);

-- Note: We are using TEXT for ids because the original app generates ids like 'tx-169...' or 'cat-exp-1'
-- Let's also enable Row Level Security (RLS) and allow public access for now 
-- (assuming no auth is implemented yet in the original JSON file based app)

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since the app currently has no auth)
CREATE POLICY "Enable all operations for categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for goals" ON goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for budgets" ON budgets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for assets" ON assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for liabilities" ON liabilities FOR ALL USING (true) WITH CHECK (true);

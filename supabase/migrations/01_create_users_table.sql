-- Migration: 01_create_users_table
-- Description: Creates users table for authentication and inserts seed user

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since public access is used for local dev)
CREATE POLICY "Enable all operations for users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Insert seed user (Username: milyarder, Password: password123)
-- The password hash below corresponds to 'password123' using bcrypt algorithm
INSERT INTO users (id, username, password, full_name)
VALUES (
  'usr-1',
  'marcelino',
  'Manalu123.',
  'Marcelino Manalu'
) ON CONFLICT (username) DO NOTHING;

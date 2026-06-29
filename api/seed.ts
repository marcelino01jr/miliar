import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';

// Inline seed data (from src/utils/seed.ts) so we don't import front-end modules
function getSeedData() {
  return {
    categories: [
      { id: 'cat-inc-sal', name: 'Gaji & Upah', icon: 'Landmark', color: '#10B981', type: 'INCOME' },
      { id: 'cat-inc-free', name: 'Freelance', icon: 'Sparkles', color: '#06B6D4', type: 'INCOME' },
      { id: 'cat-inc-inv', name: 'Dividen & Bunga', icon: 'TrendingUp', color: '#8B5CF6', type: 'INCOME' },
      { id: 'cat-exp-cof', name: 'Kopi & Nongki', icon: 'Coffee', color: '#F59E0B', type: 'EXPENSE' },
      { id: 'cat-exp-food', name: 'Makan & Resto', icon: 'UtensilsCrossed', color: '#EF4444', type: 'EXPENSE' },
      { id: 'cat-exp-trans', name: 'Transport', icon: 'Car', color: '#3B82F6', type: 'EXPENSE' },
      { id: 'cat-exp-shop', name: 'Belanja', icon: 'ShoppingBag', color: '#EC4899', type: 'EXPENSE' },
      { id: 'cat-exp-bill', name: 'Tagihan & Utilitas', icon: 'Zap', color: '#F97316', type: 'EXPENSE' },
      { id: 'cat-exp-ent', name: 'Hiburan', icon: 'Gamepad2', color: '#A855F7', type: 'EXPENSE' },
      { id: 'cat-inv-stock', name: 'Saham', icon: 'BarChart3', color: '#6366F1', type: 'INVESTMENT' },
      { id: 'cat-inv-crypto', name: 'Kripto', icon: 'Bitcoin', color: '#F59E0B', type: 'INVESTMENT' },
      { id: 'cat-inv-reksa', name: 'Reksa Dana', icon: 'PieChart', color: '#14B8A6', type: 'INVESTMENT' },
    ],
    transactions: [],
    goals: [],
    budgets: [],
    assets: [],
    liabilities: [],
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Check if data already exists
    const { data: categories } = await supabase.from('categories').select('id').limit(1);

    if (categories && categories.length > 0) {
      return res.json({ message: 'Database already has data. Skipping seed.', seeded: false });
    }

    const seedData = getSeedData();

    if (seedData.categories.length > 0) await supabase.from('categories').insert(seedData.categories);

    return res.json({ message: 'Database seeded successfully!', seeded: true });
  } catch (err: any) {
    console.error('Seed error:', err);
    return res.status(500).json({ error: err.message });
  }
}

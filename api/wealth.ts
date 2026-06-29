import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [
      { data: categories },
      { data: transactions },
      { data: goals },
      { data: budgets },
      { data: assets },
      { data: liabilities },
    ] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('transactions').select('*').order('transaction_date', { ascending: false }),
      supabase.from('goals').select('*'),
      supabase.from('budgets').select('*'),
      supabase.from('assets').select('*'),
      supabase.from('liabilities').select('*'),
    ]);

    return res.json({
      categories: categories || [],
      transactions: transactions || [],
      goals: goals || [],
      budgets: budgets || [],
      assets: assets || [],
      liabilities: liabilities || [],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

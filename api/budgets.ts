import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category_id, monthly_limit } = req.body;
    if (!category_id) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    const limitNum = Number(monthly_limit);
    const { data: existing } = await supabase.from('budgets').select('id').eq('category_id', category_id).single();

    if (existing) {
      if (limitNum <= 0) {
        await supabase.from('budgets').delete().eq('category_id', category_id);
      } else {
        await supabase.from('budgets').update({ monthly_limit: limitNum }).eq('category_id', category_id);
      }
    } else if (limitNum > 0) {
      await supabase.from('budgets').insert({
        id: `b-${Date.now()}`,
        category_id,
        monthly_limit: limitNum,
      });
    }

    const { data: budgets } = await supabase.from('budgets').select('*');
    return res.json({ success: true, budgets: budgets || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

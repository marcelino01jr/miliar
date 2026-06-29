import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, amount, notes, transaction_date, type, category_id, is_recurring, recurring_period } = req.body;

    if (id) {
      // Update existing
      const { data, error } = await supabase
        .from('transactions')
        .update({
          amount: Number(amount),
          notes: notes || '',
          transaction_date,
          type,
          category_id,
          is_recurring: !!is_recurring,
          recurring_period: recurring_period || 'NONE',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, transaction: data });
    } else {
      // Create new
      const newTx = {
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        amount: Number(amount),
        notes: notes || '',
        transaction_date,
        type,
        category_id,
        is_recurring: !!is_recurring,
        recurring_period: recurring_period || 'NONE',
      };
      const { data, error } = await supabase.from('transactions').insert(newTx).select().single();

      if (error) throw error;
      return res.status(201).json({ success: true, transaction: data });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

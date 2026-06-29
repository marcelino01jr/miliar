import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, name, amount } = req.body;

    if (id) {
      const { data, error } = await supabase
        .from('liabilities')
        .update({ name, amount: Number(amount) })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, liability: data });
    } else {
      const newLiability = {
        id: `lia-${Date.now()}`,
        name,
        amount: Number(amount),
      };
      const { data, error } = await supabase.from('liabilities').insert(newLiability).select().single();

      if (error) throw error;
      return res.status(201).json({ success: true, liability: data });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

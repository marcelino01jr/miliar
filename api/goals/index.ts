import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, title, target_amount, current_amount, target_date } = req.body;

    if (id) {
      const { data, error } = await supabase
        .from('goals')
        .update({
          title,
          target_amount: Number(target_amount),
          current_amount: Number(current_amount),
          target_date,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, goal: data });
    } else {
      const newGoal = {
        id: `g-${Date.now()}`,
        title,
        target_amount: Number(target_amount),
        current_amount: Number(current_amount),
        target_date,
      };
      const { data, error } = await supabase.from('goals').insert(newGoal).select().single();

      if (error) throw error;
      return res.status(201).json({ success: true, goal: data });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

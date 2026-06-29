import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, name, asset_type, value } = req.body;

    if (id) {
      const { data, error } = await supabase
        .from('assets')
        .update({ name, asset_type, value: Number(value) })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, asset: data });
    } else {
      const newAsset = {
        id: `ast-${Date.now()}`,
        name,
        asset_type,
        value: Number(value),
      };
      const { data, error } = await supabase.from('assets').insert(newAsset).select().single();

      if (error) throw error;
      return res.status(201).json({ success: true, asset: data });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

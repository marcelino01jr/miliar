import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, icon, color, type } = req.body;
    if (!name || !color || !type) {
      return res.status(400).json({ error: 'Nama, tipe, dan warna kategori wajib diisi!' });
    }

    const newCategory = {
      id: `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      icon: icon || 'Folder',
      color,
      type,
    };
    const { data, error } = await supabase.from('categories').insert(newCategory).select().single();
    if (error) throw error;
    return res.status(201).json({ success: true, category: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

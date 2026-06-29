import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import bcrypt from 'bcryptjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return res.status(401).json({ error: 'Username tidak ditemukan' });
    }

    // Check password (bcrypt or plain-text fallback)
    let passwordMatches = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
      passwordMatches = bcrypt.compareSync(password, user.password);
    } else {
      passwordMatches = user.password === password;
    }

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Password salah' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message });
  }
}

import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

// Supabase client (reused across serverless invocations within the same cold-start)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// Gemini AI client
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' },
  },
});

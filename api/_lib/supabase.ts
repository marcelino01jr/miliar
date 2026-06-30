import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let rawSupabase: any;
if (supabaseUrl && supabaseKey) {
  try {
    rawSupabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  } catch (e) {
    console.error('Failed to create Supabase client:', e);
  }
}

export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (!supabaseUrl || !supabaseKey || !rawSupabase) {
      throw new Error(
        'Supabase environment variables are missing or invalid. ' +
        'Please configure SUPABASE_URL and SUPABASE_ANON_KEY in your Vercel project Settings > Environment Variables.'
      );
    }
    return Reflect.get(rawSupabase, prop);
  }
});

const geminiApiKey = process.env.GEMINI_API_KEY;
let rawAi: any;
if (geminiApiKey) {
  try {
    rawAi = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
  } catch (e) {
    console.error('Failed to create Gemini AI client:', e);
  }
}

export const ai = new Proxy({} as any, {
  get(target, prop) {
    if (!geminiApiKey || !rawAi) {
      throw new Error(
        'Gemini API key is missing. Please configure GEMINI_API_KEY in your Vercel project Settings > Environment Variables.'
      );
    }
    return Reflect.get(rawAi, prop);
  }
});


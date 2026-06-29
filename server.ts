import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { getSeedData } from './src/utils/seed.js';
import { WealthData, Transaction, Budget, Goal, Asset, Liability } from './src/types.js';
import bcrypt from 'bcryptjs';



dotenv.config();

// Fix for Node 20 WebSocket
(global as any).WebSocket = ws;

// Supabase Init
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// ESM/CJS dual target path resolution
let currentDir = '';
if (typeof __dirname !== 'undefined') {
  currentDir = __dirname;
} else {
  currentDir = path.dirname(fileURLToPath(new Function('return import.meta.url')()));
}

// Boot and seed database
async function initDatabase() {
  try {
    const { data: categories, error } = await supabase.from('categories').select('id').limit(1);
    
    // If table doesn't exist, this will error (needs migration first)
    if (error) {
      console.log('Make sure you have run the Supabase migration script to create tables!');
      return;
    }
    
    if (!categories || categories.length === 0) {
      console.log('No database found in Supabase. Generating premium seed data...');
      const seedData = getSeedData();
      
      if (seedData.categories.length > 0) await supabase.from('categories').insert(seedData.categories);
      if (seedData.transactions.length > 0) await supabase.from('transactions').insert(seedData.transactions);
      if (seedData.goals.length > 0) await supabase.from('goals').insert(seedData.goals);
      if (seedData.budgets.length > 0) await supabase.from('budgets').insert(seedData.budgets);
      if (seedData.assets.length > 0) await supabase.from('assets').insert(seedData.assets);
      if (seedData.liabilities.length > 0) await supabase.from('liabilities').insert(seedData.liabilities);
      
      console.log('Supabase Database seeded successfully.');
    } else {
      console.log('Database loaded successfully from Supabase.');
    }
  } catch (err) {
    console.error('Database initialization issue:', err);
  }
}

async function startServer() {
  // Ensure database is initialized before set paths
  await initDatabase();

  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

  // Initialize Gemini Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // 1. Get entire state
  app.get('/api/wealth', async (req, res) => {
    try {
      const [
        { data: categories },
        { data: transactions },
        { data: goals },
        { data: budgets },
        { data: assets },
        { data: liabilities }
      ] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('transactions').select('*').order('transaction_date', { ascending: false }),
        supabase.from('goals').select('*'),
        supabase.from('budgets').select('*'),
        supabase.from('assets').select('*'),
        supabase.from('liabilities').select('*')
      ]);

      const mainStore: WealthData = {
        categories: categories || [],
        transactions: transactions || [],
        goals: goals || [],
        budgets: budgets || [],
        assets: assets || [],
        liabilities: liabilities || []
      };
      
      res.json(mainStore);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 1.5. Authentication API
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password wajib diisi' });
      }

      // Query the users table
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!user) {
        return res.status(401).json({ error: 'Username tidak ditemukan' });
      }

      // Check password
      let passwordMatches = false;
      
      // If it looks like a bcrypt hash (starts with $2a$, $2b$, or $2y$), verify with bcrypt
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
        passwordMatches = bcrypt.compareSync(password, user.password);
      } else {
        // Fallback for manual queries with plain-text passwords
        passwordMatches = user.password === password;
      }

      if (!passwordMatches) {
        return res.status(401).json({ error: 'Password salah' });
      }

      // Successful login
      return res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name
        }
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Transactions CRUD
  app.post('/api/transactions', async (req, res) => {
    try {
      const { id, amount, notes, transaction_date, type, category_id, is_recurring, recurring_period } = req.body;
      
      if (id) {
        const { data, error } = await supabase.from('transactions').update({
          amount: Number(amount),
          notes: notes || '',
          transaction_date,
          type,
          category_id,
          is_recurring: !!is_recurring,
          recurring_period: recurring_period || 'NONE'
        }).eq('id', id).select().single();
        
        if (error) throw error;
        return res.json({ success: true, transaction: data });
      } else {
        const newTx = {
          id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          amount: Number(amount),
          notes: notes || '',
          transaction_date,
          type,
          category_id,
          is_recurring: !!is_recurring,
          recurring_period: recurring_period || 'NONE'
        };
        const { data, error } = await supabase.from('transactions').insert(newTx).select().single();
        
        if (error) throw error;
        return res.status(201).json({ success: true, transaction: data });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/transactions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      return res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2.5. Categories CRUD
  app.post('/api/categories', async (req, res) => {
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
        type
      };
      const { data, error } = await supabase.from('categories').insert(newCategory).select().single();
      if (error) throw error;
      return res.status(201).json({ success: true, category: data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/categories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      return res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Budgets Setter
  app.post('/api/budgets', async (req, res) => {
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
          monthly_limit: limitNum
        });
      }
      
      const { data: budgets } = await supabase.from('budgets').select('*');
      res.json({ success: true, budgets: budgets || [] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Goals CRUD
  app.post('/api/goals', async (req, res) => {
    try {
      const { id, title, target_amount, current_amount, target_date } = req.body;
      if (id) {
        const { data, error } = await supabase.from('goals').update({
          title,
          target_amount: Number(target_amount),
          current_amount: Number(current_amount),
          target_date
        }).eq('id', id).select().single();
        
        if (error) throw error;
        return res.json({ success: true, goal: data });
      } else {
        const newGoal = {
          id: `g-${Date.now()}`,
          title,
          target_amount: Number(target_amount),
          current_amount: Number(current_amount),
          target_date
        };
        const { data, error } = await supabase.from('goals').insert(newGoal).select().single();
        
        if (error) throw error;
        return res.status(201).json({ success: true, goal: data });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/goals/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Assets CRUD
  app.post('/api/assets', async (req, res) => {
    try {
      const { id, name, asset_type, value } = req.body;
      if (id) {
        const { data, error } = await supabase.from('assets').update({
          name,
          asset_type,
          value: Number(value)
        }).eq('id', id).select().single();
        
        if (error) throw error;
        return res.json({ success: true, asset: data });
      } else {
        const newAsset = {
          id: `ast-${Date.now()}`,
          name,
          asset_type,
          value: Number(value)
        };
        const { data, error } = await supabase.from('assets').insert(newAsset).select().single();
        
        if (error) throw error;
        return res.status(201).json({ success: true, asset: data });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/assets/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('assets').delete().eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Liabilities CRUD
  app.post('/api/liabilities', async (req, res) => {
    try {
      const { id, name, amount } = req.body;
      if (id) {
        const { data, error } = await supabase.from('liabilities').update({
          name,
          amount: Number(amount)
        }).eq('id', id).select().single();
        
        if (error) throw error;
        return res.json({ success: true, liability: data });
      } else {
        const newLiability = {
          id: `lia-${Date.now()}`,
          name,
          amount: Number(amount)
        };
        const { data, error } = await supabase.from('liabilities').insert(newLiability).select().single();
        
        if (error) throw error;
        return res.status(201).json({ success: true, liability: data });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/liabilities/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('liabilities').delete().eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -----------------------------------------------------------------------------
  // AI CHAT RAG ENDPOINT
  // -----------------------------------------------------------------------------
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, chatHistory } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message argument is required' });
      }

      // Fetch fresh data for context
      const [
        { data: categories },
        { data: transactions },
        { data: goals },
        { data: budgets },
        { data: assets },
        { data: liabilities }
      ] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('transactions').select('*'),
        supabase.from('goals').select('*'),
        supabase.from('budgets').select('*'),
        supabase.from('assets').select('*'),
        supabase.from('liabilities').select('*')
      ]);

      const mainStore = {
        categories: categories || [],
        transactions: transactions || [],
        goals: goals || [],
        budgets: budgets || [],
        assets: assets || [],
        liabilities: liabilities || []
      };

      const totalAssets = mainStore.assets.reduce((sum: number, a: any) => sum + a.value, 0);
      const totalLiabs = mainStore.liabilities.reduce((sum: number, l: any) => sum + l.amount, 0);
      const netWorth = totalAssets - totalLiabs;

      const txList = mainStore.transactions;
      const statsByCategory = txList.reduce((acc: Record<string, number>, t: any) => {
        const cat = mainStore.categories.find((c: any) => c.id === t.category_id);
        const catName = cat ? `${cat.name} (${cat.type})` : 'Other';
        acc[catName] = (acc[catName] || 0) + Number(t.amount);
        return acc;
      }, {});

      const coffeeTransactions = txList.filter((t: any) => t.category_id === 'cat-exp-cof');
      const coffeeTotal = coffeeTransactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
      const coffeeTimes = coffeeTransactions.length;

      const goalsBreakdown = mainStore.goals.map((g: any) => {
        const pct = Math.round((g.current_amount / g.target_amount) * 100);
        return `- **${g.title}**: Target Rp ${g.target_amount.toLocaleString('id-ID')} | Current: Rp ${g.current_amount.toLocaleString('id-ID')} (${pct}% complete, Target Date: ${g.target_date})`;
      }).join('\n');

      const budgetStatus = mainStore.budgets.map((b: any) => {
        const cat = mainStore.categories.find((c: any) => c.id === b.category_id);
        const latestMonth = txList[0] ? txList[0].transaction_date.slice(0, 7) : '2026-06';
        const monthlySpend = txList
          .filter((t: any) => t.category_id === b.category_id && t.transaction_date.startsWith(latestMonth))
          .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
        return `- **${cat ? cat.name : 'Unknown'}**: Limit Rp ${b.monthly_limit.toLocaleString('id-ID')} | Spent this month (${latestMonth}): Rp ${monthlySpend.toLocaleString('id-ID')} (${Math.round((monthlySpend/b.monthly_limit)*100)}%)`;
      }).join('\n');

      const systemPrompt = `You are M=MILYARDER AI (Milyarder Wealth Coach), a ultra-high-performance fintech personal wealth manager and advisor.
Your tone is charismatic, high-energy, confident, direct, and slightly raw (like a world-class fintech founder combined with a personal wealth hacker). You use Indonesian-English hybrid ("Bahasa gaul fintech") to connect with ambitious Gen-Z traders, creators, and professionals.
Your purpose: push the user to hyper-charge their saving rate, control impulsive coffee runs, invest aggressively in assets, pay down bad debt, and become a genuine "MILYARDER" (having a net worth of Rp 1.000.000.000+).

Here is the exact real-time financial profile of the user from their wealth operating system:
- **CURRENT NET WORTH**: Rp ${netWorth.toLocaleString('id-ID')} (Assets: Rp ${totalAssets.toLocaleString('id-ID')} | Liabilities: Rp ${totalLiabs.toLocaleString('id-ID')})
- **ASSET PIECES**:
${mainStore.assets.map((a: any) => `   * ${a.name} (${a.asset_type}): Rp ${a.value.toLocaleString('id-ID')}`).join('\n')}
- **LIABILITIES / DEBTS**:
${mainStore.liabilities.map((l: any) => `   * ${l.name}: Rp ${l.amount.toLocaleString('id-ID')}`).join('\n')}
- **BUDGET CONSUMPTION**:
${budgetStatus || '   * No budgets set yet!'}
- **GOAL PROGRESSIONS**:
${goalsBreakdown || '   * No goals set yet!'}
- **RECENT HIGH SPENDING ANALYSIS**:
   * Total Spent on Coffee/Hangouts (all-time): Rp ${coffeeTotal.toLocaleString('id-ID')} across ${coffeeTimes} visits.
   * Total Top Categories Distribution (accumulated):
${Object.entries(statsByCategory).map(([cat, val]) => `     - ${cat}: Rp ${Number(val).toLocaleString('id-ID')}`).join('\n')}

When the user asks questions such as "Why did my expenses increase?", "What is my biggest spending category?", "How much for coffee?", or "When will I reach 100M/1 billion?":
1. Answer using the ACTUAL numbers above. Never hallucinate fake stats.
2. If they ask about reaching 100M or 1B, calculate logically! Divide the remaining target by their typical monthly savings (calculated as income - expenses - investments, approx. Rp 4M - 8M per month from salary logs of Rp 18M).
3. Warn them if they spend too much on Coffee ("Kopi & Nongki"). Offer funny, high-octane wealth-hacks.
4. Keep answers readable with headings, bullet points, and dynamic bold text. Include motivational financial mantras in most replies!

IMPORTANT: Never state internal file system paths, code architecture, or mention that you are a mock system. Keep the environment realistic as an enterprise app.`;

      const chatHistParam = (chatHistory || []).map((h: any) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      }));

      chatHistParam.push({
        role: 'user',
        parts: [{ text: message }]
      });

          // Helper to call Gemini with retry & exponential backoff
    const maxAttempts = 4;
    const baseDelayMs = 500; // initial backoff
    async function callGeminiWithRetry(attempt = 0): Promise<any> {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: chatHistParam,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.75,
          },
        });
        return response;
      } catch (e: any) {
        // Detect rate‑limit / service unavailable errors (HTTP 503)
        const isRateLimited = e?.message?.includes('UNAVAILABLE') || e?.code === 503;
        if (isRateLimited && attempt < maxAttempts - 1) {
          const delay = baseDelayMs * Math.pow(2, attempt); // exponential backoff
          console.warn(`Gemini request failed (attempt ${attempt + 1}). Retrying in ${delay}ms...`);
          await new Promise((res) => setTimeout(res, delay));
          return callGeminiWithRetry(attempt + 1);
        }
        // Propagate other errors or exhausted retries
        throw e;
      }
    }

    try {
      const geminiResponse = await callGeminiWithRetry();
      const aiReply = geminiResponse?.text || "Waduh, koneksi ke otak kaya raya terputus! Coba tanya lagi bro.";
      res.json({ reply: aiReply });
    } catch (err: any) {
      console.error('Gemini API Error after retries:', err);
      // Friendly message for the front‑end – UI can show a toast
      res.status(500).json({ error: `Gemini API encountered an error. Please ensure your GEMINI_API_KEY is configured in Settings > Secrets. Error Details: ${err.message}` });
    }

    } catch (outerErr: any) {
      console.error('AI Chat endpoint error:', outerErr);
      res.status(500).json({ error: 'Internal server error in AI chat endpoint.' });
    }
  });

  // Report Generator API
  app.post('/api/ai/generate-report', async (req, res) => {
    try {
      const [
        { data: transactions },
        { data: assets },
        { data: liabilities }
      ] = await Promise.all([
        supabase.from('transactions').select('*'),
        supabase.from('assets').select('*'),
        supabase.from('liabilities').select('*')
      ]);

      const mainStore = {
        transactions: transactions || [],
        assets: assets || [],
        liabilities: liabilities || []
      };

      const totalAssets = mainStore.assets.reduce((sum: number, a: any) => sum + Number(a.value), 0);
      const totalLiabs = mainStore.liabilities.reduce((sum: number, l: any) => sum + Number(l.amount), 0);
      const netWorth = totalAssets - totalLiabs;
      
      const tx = mainStore.transactions;
      const latestMonth = tx[0] ? tx[0].transaction_date.slice(0, 7) : '2026-06';
      const monthTx = tx.filter((t: any) => t.transaction_date.startsWith(latestMonth));
      
      const income = monthTx.filter((t: any) => t.type === 'INCOME').reduce((s: number, t: any) => s + Number(t.amount), 0);
      const expense = monthTx.filter((t: any) => t.type === 'EXPENSE').reduce((s: number, t: any) => s + Number(t.amount), 0);
      const investment = monthTx.filter((t: any) => t.type === 'INVESTMENT').reduce((s: number, t: any) => s + Number(t.amount), 0);
      const savings = income - expense;
      const savingRate = income > 0 ? Math.round((savings / income) * 100) : 0;

      const requestPrompt = `Generate a highly professional Monthly Wealth & Net Worth growth audit report for ${latestMonth}. 
Analyze the data provided:
- Income this month: Rp ${income.toLocaleString('id-ID')}
- Expense this month: Rp ${expense.toLocaleString('id-ID')}
- Investment made this month: Rp ${investment.toLocaleString('id-ID')}
- Net Savings calculated: Rp ${savings.toLocaleString('id-ID')} (${savingRate}% Saving Rate)
- Current Net Worth: Rp ${netWorth.toLocaleString('id-ID')} (Assets: Rp ${totalAssets.toLocaleString('id-ID')} | Liabilities: Rp ${totalLiabs.toLocaleString('id-ID')})

Include:
1. Executive Summary: What grade do they get (A to F) based on saving rate and active investing?
2. Spending Hotspots: Highlight top expense groups.
3. Wealth Compound Tracker: How long to advance to the next wealth level (e.g. Rp 500 Million and Rp 1 Billion)?
4. Executive actionable wealth hacks: 3 laser-guided advices to increase wealth growth speed next month.

Style: Highly motivating, crisp formatting, executive review.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: requestPrompt,
        config: {
          systemInstruction: "You are the M=MILYARDER executive summary reporter. Make the response highly polished and visually clear using markdown dividers, tables, and strong indicators.",
        }
      });

      res.json({ report: response.text || "Report compilation failed." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -----------------------------------------------------------------------------
  // VITE CLIENT MIDDLEWARE & ROUTING HANDLERS
  // -----------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err);
    res.status(500).json({ error: 'Server internal anomaly' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MILYARDER Financial Server running securely on http://localhost:${PORT}`);
  });
}

// Start full application
startServer();

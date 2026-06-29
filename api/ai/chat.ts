import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, ai } from '../../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
      { data: liabilities },
    ] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('transactions').select('*'),
      supabase.from('goals').select('*'),
      supabase.from('budgets').select('*'),
      supabase.from('assets').select('*'),
      supabase.from('liabilities').select('*'),
    ]);

    const mainStore = {
      categories: categories || [],
      transactions: transactions || [],
      goals: goals || [],
      budgets: budgets || [],
      assets: assets || [],
      liabilities: liabilities || [],
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

    const goalsBreakdown = mainStore.goals
      .map((g: any) => {
        const pct = Math.round((g.current_amount / g.target_amount) * 100);
        return `- **${g.title}**: Target Rp ${g.target_amount.toLocaleString('id-ID')} | Current: Rp ${g.current_amount.toLocaleString('id-ID')} (${pct}% complete, Target Date: ${g.target_date})`;
      })
      .join('\n');

    const budgetStatus = mainStore.budgets
      .map((b: any) => {
        const cat = mainStore.categories.find((c: any) => c.id === b.category_id);
        const latestMonth = txList[0] ? txList[0].transaction_date.slice(0, 7) : '2026-06';
        const monthlySpend = txList
          .filter((t: any) => t.category_id === b.category_id && t.transaction_date.startsWith(latestMonth))
          .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
        return `- **${cat ? cat.name : 'Unknown'}**: Limit Rp ${b.monthly_limit.toLocaleString('id-ID')} | Spent this month (${latestMonth}): Rp ${monthlySpend.toLocaleString('id-ID')} (${Math.round((monthlySpend / b.monthly_limit) * 100)}%)`;
      })
      .join('\n');

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
      parts: [{ text: h.text }],
    }));

    chatHistParam.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Retry with exponential backoff
    const maxAttempts = 4;
    const baseDelayMs = 500;

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
        const isRateLimited = e?.message?.includes('UNAVAILABLE') || e?.code === 503;
        if (isRateLimited && attempt < maxAttempts - 1) {
          const delay = baseDelayMs * Math.pow(2, attempt);
          await new Promise((r) => setTimeout(r, delay));
          return callGeminiWithRetry(attempt + 1);
        }
        throw e;
      }
    }

    const geminiResponse = await callGeminiWithRetry();
    const aiReply = geminiResponse?.text || 'Waduh, koneksi ke otak kaya raya terputus! Coba tanya lagi bro.';
    return res.json({ reply: aiReply });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return res.status(500).json({
      error: `Gemini API encountered an error. Please ensure your GEMINI_API_KEY is configured in Settings > Secrets. Error Details: ${err.message}`,
    });
  }
}

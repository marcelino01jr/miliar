import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, ai } from '../../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [
      { data: transactions },
      { data: assets },
      { data: liabilities },
    ] = await Promise.all([
      supabase.from('transactions').select('*'),
      supabase.from('assets').select('*'),
      supabase.from('liabilities').select('*'),
    ]);

    const mainStore = {
      transactions: transactions || [],
      assets: assets || [],
      liabilities: liabilities || [],
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
        systemInstruction:
          'You are the M=MILYARDER executive summary reporter. Make the response highly polished and visually clear using markdown dividers, tables, and strong indicators.',
      },
    });

    return res.json({ report: response.text || 'Report compilation failed.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

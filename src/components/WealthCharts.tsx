import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Transaction, Category, Asset, Liability } from '../types';

interface WealthChartsProps {
  transactions: Transaction[];
  categories: Category[];
  assets: Asset[];
  liabilities: Liability[];
}

export default function WealthCharts({
  transactions,
  categories,
  assets,
  liabilities,
}: WealthChartsProps) {
  const formatRupiahShort = (value: number) => {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1) + ' Miliar';
    }
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + ' Juta';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(0) + ' Ribu';
    }
    return value.toString();
  };

  const currentNetWorth = useMemo(() => {
    const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
    const totalLiabs = liabilities.reduce((sum, l) => sum + l.amount, 0);
    return totalAssets - totalLiabs;
  }, [assets, liabilities]);

  // 1. Group past 12 months
  const monthlyData = useMemo(() => {
    const monthsMap: Record<string, { month: string; income: number; expense: number; investment: number }> = {};
    const today = new Date();

    // Prepare 12 months slots
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = d.toISOString().slice(0, 7); // "YYYY-MM"
      monthsMap[monthStr] = {
        month: monthStr,
        income: 0,
        expense: 0,
        investment: 0,
      };
    }

    // Populate actuals
    transactions.forEach((tx) => {
      const month = tx.transaction_date.slice(0, 7);
      if (monthsMap[month]) {
        if (tx.type === 'INCOME') monthsMap[month].income += tx.amount;
        if (tx.type === 'EXPENSE') monthsMap[month].expense += tx.amount;
        if (tx.type === 'INVESTMENT') monthsMap[month].investment += tx.amount;
      }
    });

    // Translate to accumulated net worth timeline
    let runningNetWorth = currentNetWorth;
    const items = Object.keys(monthsMap).sort();
    
    // Process backwards to calculate historical running net worth
    const reversedResults: { label: string; netWorth: number; income: number; expense: number; investment: number }[] = [];
    
    // We start from current net worth at the latest month
    for (let i = items.length - 1; i >= 0; i--) {
      const m = items[i];
      const data = monthsMap[m];
      const d = new Date(m + '-02');
      const label = d.toLocaleDateString('id-ID', { month: 'short' });
      
      reversedResults.push({
        label,
        netWorth: runningNetWorth,
        income: data.income,
        expense: data.expense,
        investment: data.investment,
      });

      // Historical net worth before this month's net change:
      // running = previous + income - expense - investment
      // So previous = running - income + expense + investment
      runningNetWorth = runningNetWorth - data.income + data.expense + data.investment;
    }

    return reversedResults.reverse();
  }, [transactions, currentNetWorth]);

  // 2. Spending Breakdown
  const spendingDonutData = useMemo(() => {
    const map: Record<string, { name: string; value: number; color: string }> = {};

    transactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((tx) => {
        const cat = categories.find((c) => c.id === tx.category_id);
        const name = cat ? cat.name : 'Lainnya';
        const color = cat ? cat.color : '#64748B';
        
        if (!map[name]) {
          map[name] = { name, value: 0, color };
        }
        map[name].value += tx.amount;
      });

    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  // 3. Investment Allocation
  const investmentDonutData = useMemo(() => {
    const map: Record<string, { name: string; value: number; color: string }> = {};

    transactions
      .filter((t) => t.type === 'INVESTMENT')
      .forEach((tx) => {
        const cat = categories.find((c) => c.id === tx.category_id);
        const name = cat ? cat.name : 'Lainnya';
        const color = cat ? cat.color : '#6366f1';

        if (!map[name]) {
          map[name] = { name, value: 0, color };
        }
        map[name].value += tx.amount;
      });

    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-10">
      {/* Chart 1: Net Worth Timeline */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 flex flex-col gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-slate-400 font-mono tracking-wide uppercase">
            PERTUMBUHAN KEKAYAAN BERSIH
          </span>
          <span className="text-[10px] text-slate-500">
            Total Aset dikurangi Total Liabilitas diakumulasikan bulanan
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatRupiahShort}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)' }}
                labelClassName="text-slate-500 font-mono text-[10px] font-bold"
                formatter={(val: number) => [
                  <span className="text-slate-800 font-extrabold font-sans">
                    Rp {val.toLocaleString('id-ID')}
                  </span>,
                  <span className="text-indigo-650 font-mono text-[10px] uppercase font-bold">Kekayaan Bersih</span>,
                ]}
              />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#netWorthGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Income vs Expense comparison */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 flex flex-col gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-slate-400 font-mono tracking-wide uppercase">
            PEMASUKAN VS PENGELUARAN
          </span>
          <span className="text-[10px] text-slate-500">Perbandingan arus kas masuk & keluar 6 bulan terakhir</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData.slice(-6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatRupiahShort}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)' }}
                labelClassName="text-slate-500 font-mono text-[10px] font-bold"
                formatter={(val: number, name: string) => [
                  <span className="text-slate-800 font-semibold">Rp {val.toLocaleString('id-ID')}</span>,
                  <span className={name === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-650'}>{name}</span>
                ]}
              />
              <Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
              <Bar name="Pemasukan" dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar name="Pengeluaran" dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Spending Breakdown Donut */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 flex flex-col gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="flex flex-col gap-0.5 flex-1">
          <span className="text-xs font-bold text-slate-400 font-mono tracking-wide uppercase">
            DISTRIBUSI PENGELUARAN
          </span>
          <span className="text-[10px] text-slate-500">Rincian alokasi biaya pengeluaran konsumsi bulanan</span>
        </div>
        <div className="flex flex-col min-[400px]:flex-row items-center gap-4 h-64">
          <div className="h-full w-full max-w-[200px] sm:max-w-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {spendingDonutData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)' }}
                  formatter={(val: number) => [`Rp ${val.toLocaleString('id-ID')}`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 w-full max-h-56 overflow-y-auto pr-1">
            {spendingDonutData.slice(0, 5).map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-700 font-semibold truncate">{entry.name}</span>
                </div>
                <span className="font-mono text-slate-500 font-bold shrink-0 text-[11px]">
                  {formatRupiahShort(entry.value)}
                </span>
              </div>
            ))}
            {spendingDonutData.length === 0 && (
              <span className="text-xs text-slate-400 italic">Belum ada catatan pengeluaran.</span>
            )}
          </div>
        </div>
      </div>

      {/* Chart 4: Investment Allocation Donut */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 flex flex-col gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="flex flex-col gap-0.5 flex-1">
          <span className="text-xs font-bold text-slate-400 font-mono tracking-wide uppercase">
            ALOKASI PENEMPATAN INVESTASI
          </span>
          <span className="text-[10px] text-slate-500">Rincian pembagian dana penempatan investasi aktif</span>
        </div>
        <div className="flex flex-col min-[400px]:flex-row items-center gap-4 h-64">
          <div className="h-full w-full max-w-[200px] sm:max-w-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={investmentDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {investmentDonutData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)' }}
                  formatter={(val: number) => [`Rp ${val.toLocaleString('id-ID')}`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 w-full max-h-56 overflow-y-auto pr-1">
            {investmentDonutData.map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-700 font-semibold truncate">{entry.name}</span>
                </div>
                <span className="font-mono text-slate-500 font-bold shrink-0 text-[11px]">
                  {formatRupiahShort(entry.value)}
                </span>
              </div>
            ))}
            {investmentDonutData.length === 0 && (
              <span className="text-xs text-slate-400 italic">Belum ada catatan investasi.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

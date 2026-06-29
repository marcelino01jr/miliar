import { useMemo, useState } from 'react';
import { Transaction } from '../types';

interface HeatmapGridProps {
  transactions: Transaction[];
}

export default function HeatmapGrid({ transactions }: HeatmapGridProps) {
  const [hoverDay, setHoverDay] = useState<{ date: string; amount: number } | null>(null);

  // Generate grid representing last 18 weeks (18 columns * 7 rows = 126 days)
  const heatmapData = useMemo(() => {
    const today = new Date();
    const days: { date: string; dayName: string; amount: number }[] = [];
    
    // Go 125 days back
    for (let i = 125; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10); // YYYY-MM-DD
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });

      // Gather expenses spent on this date
      const spent = transactions
        .filter((t) => t.type === 'EXPENSE' && t.transaction_date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);

      days.push({
        date: dateStr,
        dayName,
        amount: spent,
      });
    }
    return days;
  }, [transactions]);

  // Color mapper based on Rupiah volume (Light Theme)
  const getBoxColor = (amount: number) => {
    if (amount === 0) return 'bg-slate-100 border-slate-200 hover:bg-slate-200/50';
    if (amount <= 50000) return 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100';
    if (amount <= 200000) return 'bg-indigo-150 border-indigo-200 hover:bg-indigo-250';
    if (amount <= 1000000) return 'bg-indigo-400 border-indigo-450 hover:bg-indigo-500 text-white';
    return 'bg-indigo-600 border-indigo-650 hover:bg-indigo-700 text-white';
  };

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col gap-3 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
      {/* Title block */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">
            JURNAL MATRIKS KEKAYAAN
          </span>
          <span className="text-[10px] text-slate-500">Intensitas pengeluaran harian 125 hari terakhir</span>
        </div>
        {/* Color Legend */}
        <div className="flex items-center gap-1.5 text-[8px] text-slate-500 font-mono font-bold">
          <span>Rendah</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-200" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-50 border border-indigo-100" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-150 border border-indigo-200" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-400 border border-indigo-450" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600 border border-indigo-650" />
          <span>Tinggi</span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto py-1 pr-1">
        <div className="flex flex-wrap gap-1 min-w-[340px] items-center justify-start">
          {heatmapData.map((day) => (
            <button
              key={day.date}
              onMouseEnter={() => setHoverDay({ date: day.date, amount: day.amount })}
              onMouseLeave={() => setHoverDay(null)}
              onClick={() => setHoverDay({ date: day.date, amount: day.amount })}
              className={`w-4 h-4 rounded-xs shrink-0 border transition-all duration-150 cursor-pointer ${getBoxColor(
                day.amount
              )}`}
              title={`${day.date} : ${formatRupiah(day.amount)}`}
            />
          ))}
        </div>
      </div>

      {/* Interactive Tooltip */}
      <div className="h-4 flex items-center justify-center">
        {hoverDay ? (
          <span className="text-[10px] text-indigo-600 font-mono font-bold animate-fade-in">
            📅 {hoverDay.date} — Pengeluaran: <span className="text-slate-800 font-extrabold">{formatRupiah(hoverDay.amount)}</span>
          </span>
        ) : (
          <span className="text-[9px] text-slate-500 font-mono italic">
            Arahkan kursor atau ketuk kotak untuk melihat pengeluaran harian.
          </span>
        )}
      </div>
    </div>
  );
}

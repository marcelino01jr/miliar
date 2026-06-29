import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Landmark, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { Asset, Liability } from '../types';

interface StatsHeroProps {
  netWorth: number;
  income: number;
  expense: number;
  investment: number;
  savingRate: number;
  assets: Asset[];
  liabilities: Liability[];
}

export default function StatsHero({
  netWorth,
  income,
  expense,
  investment,
  savingRate,
  assets,
  liabilities,
}: StatsHeroProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const formatRupiah = (num: number) => {
    return 'Rp ' + Math.abs(num).toLocaleString('id-ID');
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Prime Net Worth Hero Card */}
      <div className="relative bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        {/* Ambient background glows */}
        <div className="absolute top-[-50%] right-[-20%] w-72 h-72 rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-50%] left-[-20%] w-72 h-72 rounded-full bg-teal-500/5 blur-[100px] pointer-events-none" />

        <div className="flex flex-col gap-2 relative z-10">
          <span className="text-xs md:text-sm font-semibold tracking-wider text-slate-400 uppercase font-mono">
            ESTIMASI KEKAYAAN BERSIH
          </span>
          
          <div className="flex items-baseline flex-wrap gap-3">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-800 select-all font-sans">
              {netWorth < 0 && '-'}{formatRupiah(netWorth)}
            </h1>
            <div className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/15">
              <TrendingUp size={13} />
              <span>+8.4% MoM (dari bln lalu)</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Total Aset ({formatRupiah(assets.reduce((s, a) => s + a.value, 0))}) dikurangi Total Hutang ({formatRupiah(liabilities.reduce((s, l) => s + l.amount, 0))}).
          </p>

          {/* Key Metrics Columns */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase font-mono">
                Pemasukan
              </span>
              <div className="flex items-center gap-1">
                <ArrowUpRight size={14} className="text-emerald-500" />
                <span className="text-xs md:text-base font-bold text-slate-700 truncate">
                  {formatRupiah(income)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase font-mono">
                Pengeluaran
              </span>
              <div className="flex items-center gap-1">
                <ArrowDownRight size={14} className="text-rose-500" />
                <span className="text-xs md:text-base font-bold text-slate-700 truncate">
                  {formatRupiah(expense)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase font-mono">
                Investasi
              </span>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-xs md:text-base font-bold text-slate-700 truncate">
                  {formatRupiah(investment)}
                </span>
              </div>
            </div>
          </div>

          {/* Saving Rate Bar */}
          <div className="flex flex-col gap-1.5 mt-5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-450 font-semibold uppercase">RASIO MENABUNG</span>
              <span className={`font-bold ${savingRate > 40 ? 'text-teal-600' : 'text-slate-600'}`}>
                {savingRate}% dari Pemasukan Ditabung
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-450 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(Math.max(savingRate, 0), 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-450 font-medium">
              Rasio tabungan sehat &gt; 35%. {savingRate > 50 ? 'Kamu berjiwa milyarder sejati! 🔥' : 'Fokus pangkas kopi dan gaya hidup bro!' }
            </p>
          </div>

          {/* Toggle sheet for Breakdown */}
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center justify-center gap-1.5 w-full mt-4 py-2 hover:bg-slate-50 rounded-xl transition-all duration-200 text-xs font-semibold text-slate-500 hover:text-slate-800 border border-transparent hover:border-slate-200 font-mono cursor-pointer"
          >
            {showBreakdown ? (
              <>
                <span>Sembunyikan Pembukuan Aset</span>
                <ChevronUp size={15} />
              </>
            ) : (
              <>
                <span>Lihat List Aset & Hutang ({assets.length + liabilities.length} Akun)</span>
                <ChevronDown size={15} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Slideout Ledger Drawer in place */}
      {showBreakdown && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col md:flex-row gap-6 animate-fade-in shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          {/* Assets panel */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-600 font-mono text-xs font-extrabold uppercase tracking-wide border-b border-slate-100 pb-2">
              <Landmark size={14} />
              <span>ASET KEKAYAAN ({assets.length})</span>
            </div>
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
              {assets.map((ast) => (
                <div key={ast.id} className="flex justify-between items-center text-xs p-1">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700">{ast.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {ast.asset_type === 'CASH' ? 'KAS' :
                       ast.asset_type === 'STOCK' ? 'SAHAM' :
                       ast.asset_type === 'MUTUAL_FUND' ? 'REKSA DANA' :
                       ast.asset_type === 'GOLD' ? 'EMAS' :
                       ast.asset_type === 'CRYPTO' ? 'KRIPTO' : 'PROPERTI'}
                    </span>
                  </div>
                  <span className="font-bold text-slate-800 font-mono">{formatRupiah(ast.value)}</span>
                </div>
              ))}
              {assets.length === 0 && <span className="text-xs text-slate-400 italic">Aset kosong.</span>}
            </div>
          </div>

          {/* Liabilities panel */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-rose-600 font-mono text-xs font-extrabold uppercase tracking-wide border-b border-slate-100 pb-2">
              <ShieldAlert size={14} />
              <span>HUTANG & LIABILITAS ({liabilities.length})</span>
            </div>
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
              {liabilities.map((lia) => (
                <div key={lia.id} className="flex justify-between items-center text-xs p-1">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700">{lia.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">LIABILITAS AKTIF</span>
                  </div>
                  <span className="font-bold text-rose-600 font-mono">{formatRupiah(lia.amount)}</span>
                </div>
              ))}
              {liabilities.length === 0 && <span className="text-xs text-slate-400 italic">Keren! Kamu bebas hutang! 🚀</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

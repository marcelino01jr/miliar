import { useState, useEffect, FormEvent } from 'react';
import { X, Calendar, Edit3, RefreshCw, ChevronDown } from 'lucide-react';
import { Category, Transaction, CategoryType, RecurringPeriod } from '../types';

interface QuickAddProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmit: (data: Partial<Transaction>) => void;
  editTransaction?: Transaction | null;
  onRefreshData?: () => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function QuickAdd({
  isOpen,
  onClose,
  categories,
  onSubmit,
  editTransaction,
  onRefreshData,
  showToast,
}: QuickAddProps) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<CategoryType>('EXPENSE');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPeriod, setRecurringPeriod] = useState<RecurringPeriod>('NONE');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);

  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366F1');

  // Load editing state if passed
  useEffect(() => {
    if (editTransaction) {
      setAmount(editTransaction.amount.toString());
      setNotes(editTransaction.notes);
      setType(editTransaction.type);
      setCategoryId(editTransaction.category_id);
      setDate(editTransaction.transaction_date);
      setIsRecurring(editTransaction.is_recurring);
      setRecurringPeriod(editTransaction.recurring_period);
    } else {
      // Clear for new additions
      setAmount('');
      setNotes('');
      setType('EXPENSE');
      setDate(new Date().toISOString().slice(0, 10));
      setIsRecurring(false);
      setRecurringPeriod('NONE');
    }
  }, [editTransaction, isOpen]);

  // Sync default category when type or categories change
  useEffect(() => {
    if (!editTransaction) {
      const typeCategories = categories.filter((c) => c.type === type);
      if (typeCategories.length > 0) {
        setCategoryId(typeCategories[0].id);
      }
    }
  }, [type, categories, editTransaction]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Tolong masukkan kuantitas Rupiah yang valid!');
      return;
    }
    if (!categoryId) {
      alert('Tolong pilih kategori transaksi Anda.');
      return;
    }

    onSubmit({
      id: editTransaction?.id, // include if editing
      amount: Number(amount),
      notes: notes.trim(),
      transaction_date: date,
      type,
      category_id: categoryId,
      is_recurring: isRecurring,
      recurring_period: isRecurring ? recurringPeriod : 'NONE',
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        id="quick-add-modal"
        className="w-full sm:max-w-md bg-white border-t sm:border border-slate-200/90 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-none flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-sm font-semibold text-slate-500 font-mono">
              {editTransaction ? 'UBAH LOG TRANSAKSI' : '5-DETIK TAMBAH CEPAT'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Amount Box */}
          <div className="flex flex-col gap-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 focus-within:border-indigo-400 transition-all duration-150">
            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">NOMINAL (Rupiah)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl md:text-3xl font-extrabold text-indigo-650">Rp</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent border-none text-slate-800 text-2xl md:text-3xl font-black focus:outline-none focus:ring-0 p-0 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Flow Segment Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-50 rounded-xl border border-slate-200">
            {(['EXPENSE', 'INCOME', 'INVESTMENT'] as CategoryType[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setType(tab)}
                className={`py-2 text-[11px] font-extrabold rounded-lg tracking-wider transition-all duration-200 cursor-pointer ${
                  type === tab
                    ? tab === 'INCOME'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-950/10'
                      : tab === 'INVESTMENT'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/10'
                      : 'bg-rose-500 text-white shadow-lg shadow-rose-950/10'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {tab === 'INCOME' ? 'MASUK' : tab === 'INVESTMENT' ? 'INVESTASI' : 'KELUAR'}
              </button>
            ))}
          </div>

          {/* Quick Choice Category Items */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">KATEGORI</label>
              <button
                type="button"
                onClick={() => setIsAddingCat(!isAddingCat)}
                className="text-[9px] text-indigo-650 hover:text-indigo-500 font-extrabold font-mono tracking-wide cursor-pointer"
              >
                {isAddingCat ? 'BATAL' : '+ KATEGORI BARU'}
              </button>
            </div>

            {isAddingCat && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2.5 animate-fade-in mt-1">
                <span className="text-[9px] font-bold text-slate-500 font-mono">TAMBAH KATEGORI KUSTOM ({type})</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nama Kategori..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 text-slate-800 p-2 rounded-lg text-xs outline-none focus:border-indigo-400 font-semibold"
                  />
                  <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 px-2 rounded-lg">
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="w-5 h-5 rounded border border-slate-200 cursor-pointer bg-transparent p-0"
                    />
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">{newCatColor}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!newCatName.trim()) return;
                    try {
                      const res = await fetch('/api/categories', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: newCatName.trim(),
                          color: newCatColor,
                          type: type,
                          icon: 'Folder'
                        }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setNewCatName('');
                        setIsAddingCat(false);
                        if (onRefreshData) onRefreshData();
                        if (showToast) showToast('Kategori berhasil ditambahkan!');
                        if (data && data.category && data.category.id) {
                          setCategoryId(data.category.id);
                        }
                      } else {
                        const data = await res.json();
                        alert(data.error || 'Gagal menyimpan kategori.');
                      }
                    } catch (err) {
                      console.error(err);
                      alert('Terjadi kesalahan.');
                    }
                  }}
                  className="w-full py-1.5 bg-indigo-650 hover:bg-indigo-550 text-white font-extrabold text-[9px] rounded-lg tracking-wider uppercase font-mono shadow-sm cursor-pointer"
                >
                  SIMPAN KATEGORI
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  style={{
                    borderColor: categoryId === cat.id ? cat.color : '',
                    backgroundColor: categoryId === cat.id ? `${cat.color}10` : '',
                  }}
                  className={`flex items-center gap-2 p-3 text-xs font-semibold rounded-xl border border-slate-205 text-slate-650 hover:text-slate-805 hover:border-slate-350 transition-all text-left truncate cursor-pointer`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">MEMO / CATATAN</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 focus-within:border-slate-300 rounded-xl px-3 py-2.5 transition-colors">
              <Edit3 size={15} className="text-slate-400" />
              <input
                type="text"
                placeholder="Misal: Grabfood, DCA Saham, dll."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-transparent border-none text-slate-700 text-xs focus:outline-none focus:ring-0 p-0 font-sans font-semibold"
              />
            </div>
          </div>

          {/* Date Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">TANGGAL TRANSAKSI</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 focus-within:border-slate-300 rounded-xl px-3 py-2.5 transition-colors">
              <Calendar size={15} className="text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent border-none text-slate-700 text-xs focus:outline-none focus:ring-0 p-0 font-mono"
              />
            </div>
          </div>

          {/* Recurring Option */}
          <div className="flex flex-col gap-2 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-700">Transaksi Berulang (Recurring)</span>
                <span className="text-[9px] text-slate-400 font-medium">Pencatatan otomatis setiap siklus</span>
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-white border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {isRecurring && (
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-2 mt-2 animate-fade-in shadow-sm">
                <RefreshCw size={12} className="text-indigo-500 rotate-180 animate-spin-slow" />
                <span className="text-[10px] text-slate-500 font-mono">Siklus:</span>
                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                    className="bg-transparent border-none text-[10px] text-indigo-600 font-bold focus:ring-0 focus:outline-none p-0 cursor-pointer font-mono flex items-center gap-1.5"
                  >
                    <span>
                      {recurringPeriod === 'WEEKLY' ? 'Mingguan' :
                       recurringPeriod === 'MONTHLY' ? 'Bulanan' :
                       recurringPeriod === 'YEARLY' ? 'Tahunan' : 'Pilih Siklus'}
                    </span>
                    <ChevronDown size={12} className={`stroke-[3.5] text-indigo-600 transition-transform ${isPeriodDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isPeriodDropdownOpen && (
                    <div className="absolute z-50 left-0 mt-2 w-28 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg animate-fade-in">
                      {[
                        { value: 'WEEKLY', label: 'Mingguan' },
                        { value: 'MONTHLY', label: 'Bulanan' },
                        { value: 'YEARLY', label: 'Tahunan' },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            setRecurringPeriod(item.value as RecurringPeriod);
                            setIsPeriodDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-[10px] text-slate-650 hover:bg-slate-50 hover:text-slate-900 font-mono transition-all cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            className="w-full py-4 mt-2 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-550 hover:to-teal-450 text-white font-extrabold text-sm rounded-2xl tracking-wide shadow-md active:scale-98 transition-all cursor-pointer font-mono"
          >
            {editTransaction ? 'SIMPAN PERUBAHAN' : 'MASUKKAN JURNAL KEKAYAAN 💸'}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo, FormEvent } from 'react';
import {
  Coins,
  TrendingUp,
  Award,
  Wallet,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  Edit,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  TrendingDown,
  Activity,
  AlertTriangle,
  Flame,
  Calendar,
  Landmark,
  ShieldX,
  RefreshCw,
  Sparkles,
  LogOut,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Category, Transaction, Goal, Budget, Asset, Liability, WealthData } from './types';
import StatsHero from './components/StatsHero';
import BottomNav from './components/BottomNav';
import QuickAdd from './components/QuickAdd';
import HeatmapGrid from './components/HeatmapGrid';
import WealthCharts from './components/WealthCharts';
import ComingSoonAI from './components/ComingSoonAI';
import Login from './components/Login';


export default function App() {
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; full_name: string } | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [wealthData, setWealthData] = useState<WealthData | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
  } | null>(null);

  const triggerConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string; type?: 'danger' | 'warning' | 'info' }
  ) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmState(null);
      },
      confirmText: options?.confirmText || 'Ya, Hapus',
      cancelText: options?.cancelText || 'Batal',
      type: options?.type || 'danger'
    });
  };

  // Asset/Liability/Goal state additions
  const [isAsetModalOpen, setIsAsetModalOpen] = useState(false);
  const [isLiaModalOpen, setIsLiaModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  
  // Custom new forms states
  const [newAsetName, setNewAsetName] = useState('');
  const [newAsetType, setNewAsetType] = useState('CASH');
  const [newAsetValue, setNewAsetValue] = useState('');

  const [newLiaName, setNewLiaName] = useState('');
  const [newLiaAmount, setNewLiaAmount] = useState('');

  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalCurrent, setNewGoalCurrent] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');

  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetLimit, setNewBudgetLimit] = useState('');
  const [isBudgetDropdownOpen, setIsBudgetDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isAssetTypeDropdownOpen, setIsAssetTypeDropdownOpen] = useState(false);
  const [isManageCatOpen, setIsManageCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'INCOME' | 'EXPENSE' | 'INVESTMENT'>('EXPENSE');
  const [newCatColor, setNewCatColor] = useState('#6366F1');

  // Fetch full state from backend
  const fetchWealthData = async () => {
    try {
      const res = await fetch('/api/wealth');
      const data = await res.json();
      setWealthData(data);
    } catch (err) {
      console.error('Error fetching global wallet logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('milyarder_user');
    const savedTime = localStorage.getItem('milyarder_user_time');
    
    if (savedUser && savedTime) {
      const isExpired = Date.now() - Number(savedTime) > 60 * 60 * 1000; // 1 hour in ms
      if (isExpired) {
        localStorage.removeItem('milyarder_user');
        localStorage.removeItem('milyarder_user_time');
      } else {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (err) {
          console.error('Error parsing saved user session:', err);
        }
      }
    } else if (savedUser) {
      localStorage.setItem('milyarder_user_time', Date.now().toString());
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error parsing saved user session:', err);
      }
    }
    setIsAuthChecking(false);
    fetchWealthData();
  }, []);

  const handleLogout = () => {
    triggerConfirm(
      'Keluar Sistem',
      'Apakah Anda yakin ingin keluar dari sistem finansial M=Milyarder OS?',
      () => {
        localStorage.removeItem('milyarder_user');
        localStorage.removeItem('milyarder_user_time');
        setCurrentUser(null);
        setActiveTab('home');
        showToast('Berhasil keluar sistem!');
      },
      { confirmText: 'Keluar', type: 'warning' }
    );
  };

  const handleTransactionSubmit = async (txData: Partial<Transaction>) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData),
      });
      if (res.ok) {
        await fetchWealthData();
        showToast(txData.id ? 'Transaksi berhasil diperbarui!' : 'Transaksi berhasil ditambahkan!');
      } else {
        showToast('Gagal menyimpan transaksi.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses transaksi.', 'error');
    }
  };

  const handleTransactionDelete = async (id: string) => {
    triggerConfirm(
      'Hapus Transaksi',
      'Apakah Anda yakin ingin menghapus catatan transaksi ini secara permanen dari jurnal?',
      async () => {
        try {
          const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
          if (res.ok) {
            await fetchWealthData();
            showToast('Transaksi berhasil dihapus!');
          } else {
            showToast('Gagal menghapus transaksi.', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Terjadi kesalahan.', 'error');
        }
      }
    );
  };

  const handleBudgetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newBudgetCategory || !newBudgetLimit) return;
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: newBudgetCategory,
          monthly_limit: Number(newBudgetLimit),
        }),
      });
      if (res.ok) {
        setNewBudgetLimit('');
        await fetchWealthData();
        showToast('Batas anggaran berhasil diperbarui!');
      } else {
        showToast('Gagal memperbarui anggaran.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan.', 'error');
    }
  };

  const handleAssetAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newAsetName || !newAsetValue) return;
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAsetName,
          asset_type: newAsetType,
          value: Number(newAsetValue),
        }),
      });
      if (res.ok) {
        setNewAsetName('');
        setNewAsetValue('');
        setIsAsetModalOpen(false);
        await fetchWealthData();
        showToast('Aset berhasil disimpan!');
      } else {
        showToast('Gagal menyimpan aset.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan.', 'error');
    }
  };

  const handleAssetDelete = async (id: string) => {
    triggerConfirm(
      'Hapus Aset',
      'Apakah Anda yakin ingin menghapus akun aset kekayaan ini dari neraca keuangan Anda?',
      async () => {
        try {
          const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
          if (res.ok) {
            await fetchWealthData();
            showToast('Aset berhasil dihapus!');
          } else {
            showToast('Gagal menghapus aset.', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Terjadi kesalahan.', 'error');
        }
      }
    );
  };

  const handleLiabilityAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newLiaName || !newLiaAmount) return;
    try {
      const res = await fetch('/api/liabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLiaName,
          amount: Number(newLiaAmount),
        }),
      });
      if (res.ok) {
        setNewLiaName('');
        setNewLiaAmount('');
        setIsLiaModalOpen(false);
        await fetchWealthData();
        showToast('Liabilitas berhasil disimpan!');
      } else {
        showToast('Gagal menyimpan liabilitas.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan.', 'error');
    }
  };

  const handleLiabilityDelete = async (id: string) => {
    triggerConfirm(
      'Hapus Liabilitas',
      'Apakah Anda yakin ingin menghapus liabilitas hutang ini dari daftar tanggungan Anda?',
      async () => {
        try {
          const res = await fetch(`/api/liabilities/${id}`, { method: 'DELETE' });
          if (res.ok) {
            await fetchWealthData();
            showToast('Liabilitas berhasil dihapus!');
          } else {
            showToast('Gagal menghapus liabilitas.', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Terjadi kesalahan.', 'error');
        }
      }
    );
  };

  const handleGoalAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || !newGoalTarget || !newGoalDate) return;
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newGoalTitle,
          target_amount: Number(newGoalTarget),
          current_amount: Number(newGoalCurrent || 0),
          target_date: newGoalDate,
        }),
      });
      if (res.ok) {
        setNewGoalTitle('');
        setNewGoalTarget('');
        setNewGoalCurrent('');
        setNewGoalDate('');
        setIsGoalModalOpen(false);
        await fetchWealthData();
        showToast('Target tabungan berhasil dibuat!');
      } else {
        showToast('Gagal membuat target tabungan.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan.', 'error');
    }
  };

  const handleGoalDelete = async (id: string) => {
    triggerConfirm(
      'Hapus Sasaran Tabungan',
      'Apakah Anda yakin ingin menghapus target tabungan/goal ini? Seluruh progres akan dihapus.',
      async () => {
        try {
          const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
          if (res.ok) {
            await fetchWealthData();
            showToast('Target tabungan berhasil dihapus!');
          } else {
            showToast('Gagal menghapus target.', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Terjadi kesalahan.', 'error');
        }
      }
    );
  };

  const handleCategoryAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          color: newCatColor,
          type: newCatType,
          icon: 'Folder'
        }),
      });
      if (res.ok) {
        setNewCatName('');
        await fetchWealthData();
        showToast('Kategori berhasil ditambahkan!');
      } else {
        const data = await res.json();
        showToast(data.error || 'Gagal menyimpan kategori.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan.', 'error');
    }
  };

  const handleCategoryDelete = async (id: string) => {
    triggerConfirm(
      'Hapus Kategori',
      'Apakah Anda yakin ingin menghapus kategori ini? Seluruh budget terkait kategori ini akan terhapus secara otomatis.',
      async () => {
        try {
          const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
          if (res.ok) {
            await fetchWealthData();
            showToast('Kategori berhasil dihapus!');
          } else {
            showToast('Gagal menghapus kategori. Pastikan tidak ada transaksi menggunakan kategori ini.', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Terjadi kesalahan.', 'error');
        }
      }
    );
  };

  // Computations based on current stores
  const calculatedMetrics = useMemo(() => {
    if (!wealthData) return { netWorth: 0, income: 0, expense: 0, investment: 0, savingRate: 0 };
    
    const assetsVal = wealthData.assets.reduce((sum, a) => sum + a.value, 0);
    const liabsVal = wealthData.liabilities.reduce((sum, l) => sum + l.amount, 0);
    const netWorth = assetsVal - liabsVal;

    // Filter by the most recent active month in logs to show realistic totals
    const sortedTx = [...wealthData.transactions].sort((a,b) => b.transaction_date.localeCompare(a.transaction_date));
    const latestMonth = sortedTx[0] ? sortedTx[0].transaction_date.slice(0, 7) : '2026-06';

    const monthTx = wealthData.transactions.filter(t => t.transaction_date.startsWith(latestMonth));
    const monthlyIncome = monthTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const monthlyExpense = monthTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    const monthlyInvestment = monthTx.filter(t => t.type === 'INVESTMENT').reduce((s, t) => s + t.amount, 0);

    // Saving rate = ((Income - Expense) / Income) * 100
    const savings = monthlyIncome - monthlyExpense;
    const savingRate = monthlyIncome > 0 ? Math.round((savings / monthlyIncome) * 100) : 0;

    return {
      netWorth,
      income: monthlyIncome || 18000000, // safety fallback values if empty
      expense: monthlyExpense || 8500000,
      investment: monthlyInvestment || 5000000,
      savingRate,
      latestMonthName: new Date(latestMonth + '-02').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    };
  }, [wealthData]);

  // Top spending indicators compute
  const spendingStats = useMemo(() => {
    if (!wealthData) return { maxExpense: 0, maxExpenseNote: '', maxCategory: 'Kopi & Nongki', busiestDay: 'Sabtu' };

    const expensesOnly = wealthData.transactions.filter(t => t.type === 'EXPENSE');
    
    // Largest transaction done
    let maxExpense = 0;
    let maxExpenseNote = 'N/A';
    expensesOnly.forEach(t => {
      if (t.amount > maxExpense) {
        maxExpense = t.amount;
        maxExpenseNote = t.notes || 'Unspecified Expense';
      }
    });

    // Most frequent category
    const countMap: Record<string, number> = {};
    expensesOnly.forEach(t => {
      countMap[t.category_id] = (countMap[t.category_id] || 0) + 1;
    });
    let maxFreqId = '';
    let maxFreqCount = 0;
    Object.entries(countMap).forEach(([id, qty]) => {
      if (qty > maxFreqCount) {
        maxFreqCount = qty;
        maxFreqId = id;
      }
    });
    const topCategoryObj = wealthData.categories.find(c => c.id === maxFreqId);
    
    // Most expensive day of week
    const dayExpCombined: Record<number, number> = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 };
    expensesOnly.forEach(t => {
      const dayNum = new Date(t.transaction_date).getDay();
      dayExpCombined[dayNum] += t.amount;
    });
    const daysIndonesian = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    let mostExpDayIndex = 5; // default Jumat
    let maxDayAmt = 0;
    Object.entries(dayExpCombined).forEach(([dayIdx, amt]) => {
      if (amt > maxDayAmt) {
        maxDayAmt = amt;
        mostExpDayIndex = Number(dayIdx);
      }
    });

    return {
      maxExpense,
      maxExpenseNote,
      maxCategory: topCategoryObj ? topCategoryObj.name : 'Food & Dining',
      busiestDay: daysIndonesian[mostExpDayIndex],
    };
  }, [wealthData]);

  // Target goals computations with estimated release dates
  const parsedGoals = useMemo(() => {
    if (!wealthData) return [];
    
    // Calculate standard monthly savings proxy (approx. Rp 5.000.000)
    const sortedTx = [...wealthData.transactions].sort((a,b) => b.transaction_date.localeCompare(a.transaction_date));
    const latestMonth = sortedTx[0] ? sortedTx[0].transaction_date.slice(0, 7) : '2026-06';
    const monthTx = wealthData.transactions.filter(t => t.transaction_date.startsWith(latestMonth));
    const monthlyIncome = monthTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const monthlyExpense = monthTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    const typicalSavings = Math.max(monthlyIncome - monthlyExpense, 3500000); // hard floor at 3.5M

    return wealthData.goals.map(g => {
      const remaining = Math.max(g.target_amount - g.current_amount, 0);
      const percent = Math.min(Math.round((g.current_amount / g.target_amount) * 105), 100);
      
      // Months to target = remaining / typical monthly savings
      const monthsToTarget = Math.ceil(remaining / typicalSavings);
      const estFinishDate = new Date();
      estFinishDate.setMonth(estFinishDate.getMonth() + monthsToTarget);
      const readableDate = estFinishDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

      return {
        ...g,
        percent,
        remaining,
        estimatedFinish: remaining === 0 ? 'Tuntas! 🎉' : readableDate,
      };
    });
  }, [wealthData]);

  // Filter & Search ledger transactions
  const filteredTransactions = useMemo(() => {
    if (!wealthData) return [];
    return wealthData.transactions.filter((tx) => {
      const notesMatches = tx.notes.toLowerCase().includes(searchQuery.toLowerCase());
      const typeMatches = filterType === 'ALL' || tx.type === filterType;
      
      let categoryMatches = true;
      if (filterCategory !== 'ALL') {
        categoryMatches = tx.category_id === filterCategory;
      }

      return notesMatches && typeMatches && categoryMatches;
    });
  }, [wealthData, searchQuery, filterType, filterCategory]);

  // Paginated elements
  const totalLedgerPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const startObj = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startObj, startObj + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-3xl border-4 border-indigo-100 border-t-indigo-650 animate-spin" />
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-extrabold text-slate-800 font-sans tracking-tight">M=MILYARDER OS BOOTING...</h2>
          <p className="text-xs text-slate-500 font-medium">Memverifikasi enkripsi sesi...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Login 
        onLoginSuccess={(user) => {
          localStorage.setItem('milyarder_user_time', Date.now().toString());
          setCurrentUser(user);
        }} 
      />
    );
  }

  if (isLoading || !wealthData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-3xl border-4 border-indigo-100 border-t-indigo-650 animate-spin" />
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-extrabold text-slate-800 font-sans tracking-tight">MEMUAT DATA DOMPET...</h2>
          <p className="text-xs text-slate-500 font-medium">Menghubungkan ke server finansial aman...</p>
        </div>
      </div>
    );
  }

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const translateType = (type: string) => {
    switch (type) {
      case 'INCOME': return 'PEMASUKAN';
      case 'EXPENSE': return 'PENGELUARAN';
      case 'INVESTMENT': return 'INVESTASI';
      default: return type;
    }
  };

  const translatePeriod = (period: string) => {
    switch (period) {
      case 'WEEKLY': return 'MINGGUAN';
      case 'MONTHLY': return 'BULANAN';
      case 'YEARLY': return 'TAHUNAN';
      default: return period;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 pb-28">
      {/* Top Executive Navigation */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 py-4 px-4 shadow-[0_2px_15px_rgba(15,23,42,0.015)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent font-sans uppercase select-none">
                CALON MILYARDER
              </span>
              <div className="px-2 py-0.5 rounded-md bg-indigo-650/10 text-indigo-400 border border-indigo-500/15 text-[9px] font-bold font-mono select-none">
                v2.0
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 ml-4">
              {[
                { id: 'home', label: 'Beranda' },
                { id: 'transactions', label: 'Transaksi' },
                { id: 'analytics', label: 'Analitik' },
                { id: 'goals', label: 'Sasaran' },
                { id: 'ai', label: 'Asisten AI' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-indigo-50 text-indigo-655 border border-indigo-150 shadow-sm shadow-indigo-100/10'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-extrabold text-slate-700 font-mono uppercase">
                {currentUser?.full_name}
              </span>
              <span className="text-[8px] text-indigo-650 font-bold font-mono tracking-widest uppercase">
                {currentUser?.username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-150 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              title="Keluar dari OS"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 mt-6 flex flex-col gap-6">
        {/* 1. HOME SCENE */}
        {activeTab === 'home' && (
          <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-6 animate-fade-in">
            {/* Left Column (Main Stats & Logs) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Stats Hero Card */}
              <StatsHero
                netWorth={calculatedMetrics.netWorth}
                income={calculatedMetrics.income}
                expense={calculatedMetrics.expense}
                investment={calculatedMetrics.investment}
                savingRate={calculatedMetrics.savingRate}
                assets={wealthData.assets}
                liabilities={wealthData.liabilities}
              />

              {/* Heatmap Section */}
              <HeatmapGrid transactions={wealthData.transactions} />

              {/* Recent items ledger link */}
              <section className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">
                    CATATAN TRANSAKSI TERAKHIR
                  </span>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-[10px] text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    LIHAT JURNAL LENGKAP &rarr;
                  </button>
                </div>
                
                <div className="flex flex-col gap-2">
                  {wealthData.transactions.slice(0, 5).map((tx) => {
                    const cat = wealthData.categories.find(c => c.id === tx.category_id);
                    return (
                      <div key={tx.id} className="bg-white border border-slate-200/90 p-4 rounded-2xl flex justify-between items-center gap-3 shadow-[0_2px_8px_rgba(15,23,42,0.015)]">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-2 rounded-full h-8 shrink-0"
                            style={{ backgroundColor: cat ? cat.color : '#64748B' }}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-extrabold text-slate-750 truncate">{tx.notes || 'Tanpa Catatan'}</span>
                            <span className="text-[9px] text-slate-500 font-mono tracking-tight mt-0.5">
                              {tx.transaction_date} | {cat ? cat.name : 'Lainnya'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className={`text-xs font-black font-mono ${
                            tx.type === 'INCOME' ? 'text-emerald-600' : tx.type === 'INVESTMENT' ? 'text-indigo-600' : 'text-rose-600'
                          }`}>
                            {tx.type === 'INCOME' ? '+' : '-'}{formatRupiah(tx.amount)}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wide mt-0.5">
                            {translateType(tx.type)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right Column (Controls & Analytics) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Top Spending highlights */}
              <section className="flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">
                  SOROTAN ANATOMI PENGELUARAN
                </span>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                  <div className="bg-white border border-slate-200/90 p-4 rounded-2xl flex flex-col gap-1.5 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">PENGELUARAN TERBESAR</span>
                    <h3 className="text-base font-extrabold text-rose-600 font-mono leading-none truncate">
                      {formatRupiah(spendingStats.maxExpense)}
                    </h3>
                    <span className="text-[10px] text-slate-500 truncate mt-0.5">Catatan: {spendingStats.maxExpenseNote}</span>
                  </div>

                  <div className="bg-white border border-slate-200/90 p-4 rounded-2xl flex flex-col gap-1.5 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">KATEGORI TERSERING</span>
                    <h3 className="text-base font-extrabold text-indigo-600 leading-none truncate">
                      {spendingStats.maxCategory}
                    </h3>
                    <span className="text-[10px] text-slate-500 mt-0.5">Sektor konsumsi tertinggi</span>
                  </div>

                  <div className="bg-white border border-slate-200/90 p-4 rounded-2xl flex flex-col gap-1.5 col-span-2 lg:col-span-1 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">HARI TERBOROS</span>
                    <h3 className="text-base font-extrabold text-teal-600 leading-none">
                      {spendingStats.busiestDay}
                    </h3>
                    <span className="text-[10px] text-slate-500 mt-0.5">Hari dengan belanja terbanyak</span>
                  </div>
                </div>
              </section>

              {/* Quick Sprints Insights: Category Budgets */}
              <section className="flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">
                  ANGGARAN KONTROL KONSUMSI
                </span>
                <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                  {wealthData.budgets.map((b) => {
                    const cat = wealthData.categories.find(c => c.id === b.category_id);
                    const currentMonthStr = wealthData.transactions[0] ? wealthData.transactions[0].transaction_date.slice(0, 7) : '2026-06';
                    const spent = wealthData.transactions
                      .filter(t => t.category_id === b.category_id && t.transaction_date.startsWith(currentMonthStr))
                      .reduce((sum, t) => sum + t.amount, 0);

                    const remains = b.monthly_limit - spent;
                    const ratio = Math.min(Math.round((spent / b.monthly_limit) * 105), 100);
                    const isExceeded = remains < 0;

                    return (
                      <div
                        key={b.id}
                        className={`p-4 rounded-2xl border ${
                          isExceeded
                            ? 'bg-rose-50 border-rose-200'
                            : remains < b.monthly_limit * 0.2
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-white border-slate-200/90 shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start text-xs mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: cat ? cat.color : '#64748B' }}
                            />
                            <span className="font-bold text-slate-700">{cat ? cat.name : 'Lainnya'}</span>
                          </div>
                          <span className={`font-mono text-[10px] font-bold ${isExceeded ? 'text-rose-600' : 'text-slate-500'}`}>
                            {remains < 0 ? 'LIMIT LEWAT!' : 'Sisa: ' + formatRupiah(remains)}
                          </span>
                        </div>

                        {/* Bar indicator */}
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-2 border border-slate-200/50">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isExceeded ? 'bg-rose-500' : remains < b.monthly_limit * 0.2 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${ratio}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[9px] text-slate-500 font-mono font-semibold">
                          <span>Pakai: {formatRupiah(spent)}</span>
                          <span>Batas: {formatRupiah(b.monthly_limit)}</span>
                        </div>

                        {isExceeded && (
                          <div className="mt-2.5 flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 rounded-lg p-1.5 text-[9px] text-rose-400 font-bold font-mono">
                            <AlertTriangle size={11} className="shrink-0" />
                            <span>BAHAYA: Segera pangkas anggaran bro!</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Set budget inline input */}
                <form onSubmit={handleBudgetSubmit} className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
                  <div className="flex flex-col gap-1 w-full text-xs">
                    <span className="font-bold text-slate-500 font-mono uppercase tracking-wide">BATASI ANGGARAN</span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsBudgetDropdownOpen(!isBudgetDropdownOpen)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 text-slate-750 p-2.5 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all"
                      >
                        {wealthData.categories.find(c => c.id === newBudgetCategory) ? (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: wealthData.categories.find(c => c.id === newBudgetCategory)?.color }} />
                            <span>{wealthData.categories.find(c => c.id === newBudgetCategory)?.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-550">Pilih Kategori...</span>
                        )}
                        <ChevronDown size={14} className={`text-slate-500 transition-transform ${isBudgetDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isBudgetDropdownOpen && (
                        <div className="absolute z-50 bottom-full mb-1 left-0 right-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setNewBudgetCategory('');
                              setIsBudgetDropdownOpen(false);
                            }}
                            className="w-full px-3.5 py-2.5 text-left text-xs text-slate-400 hover:bg-slate-50 transition-all cursor-pointer border-b border-slate-100"
                          >
                            Pilih Kategori...
                          </button>
                          {wealthData.categories.filter(c => c.type === 'EXPENSE').map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setNewBudgetCategory(c.id);
                                setIsBudgetDropdownOpen(false);
                              }}
                              className="w-full px-3.5 py-2.5 text-left text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-all cursor-pointer"
                            >
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                              <span>{c.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 w-full text-xs">
                    <span className="font-mono text-slate-500 font-bold uppercase tracking-wider">LIMIT BULANAN (Rp)</span>
                    <input
                      type="number"
                      placeholder="Contoh: 1500000"
                      value={newBudgetLimit}
                      onChange={(e) => setNewBudgetLimit(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl font-mono focus:outline-none focus:ring-0 focus:border-indigo-400"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer h-10 flex items-center justify-center shrink-0"
                  >
                    ATUR ANGGARAN
                  </button>
                </form>

                {/* Kelola Kategori Toggle & Panel */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col gap-3 mt-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-400 font-mono text-xs uppercase tracking-wide">KELOLA KATEGORI</span>
                    <button
                      type="button"
                      onClick={() => setIsManageCatOpen(!isManageCatOpen)}
                      className="text-[10px] text-indigo-650 hover:text-indigo-500 font-extrabold uppercase font-mono tracking-wider cursor-pointer"
                    >
                      {isManageCatOpen ? 'TUTUP PANEL' : 'BUKA PANEL'}
                    </button>
                  </div>

                  {isManageCatOpen && (
                    <div className="flex flex-col gap-4 animate-fade-in mt-1.5">
                      {/* Form Tambah Kategori */}
                      <form onSubmit={handleCategoryAdd} className="flex flex-col gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-slate-500 font-mono font-bold">NAMA KATEGORI</span>
                          <input
                            type="text"
                            placeholder="Misal: Hiburan, Kebutuhan Rumah"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            className="bg-white border border-slate-200 text-slate-850 p-2 rounded-lg text-xs outline-none font-sans focus:border-indigo-500 transition-colors"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-slate-500 font-mono font-bold">TIPE</span>
                            <select
                              value={newCatType}
                              onChange={(e) => setNewCatType(e.target.value as any)}
                              className="bg-white border border-slate-200 text-slate-800 p-2 rounded-lg text-xs outline-none cursor-pointer focus:border-indigo-500"
                            >
                              <option value="EXPENSE">Pengeluaran</option>
                              <option value="INCOME">Pemasukan</option>
                              <option value="INVESTMENT">Investasi</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-slate-500 font-mono font-bold">WARNA</span>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={newCatColor}
                                onChange={(e) => setNewCatColor(e.target.value)}
                                className="w-8 h-8 rounded border border-slate-200 cursor-pointer bg-transparent p-0"
                              />
                              <span className="text-[10px] font-mono text-slate-450 uppercase">{newCatColor}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full mt-1.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] rounded-lg tracking-wider uppercase font-mono shadow-md cursor-pointer"
                        >
                          + TAMBAH KATEGORI KUSTOM
                        </button>
                      </form>

                      {/* List Kategori Saat Ini */}
                      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                        <span className="text-[9px] font-bold text-slate-500 font-mono tracking-wider uppercase">KATEGORI AKTIF</span>
                        {wealthData.categories.map((c) => (
                          <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                              <span className="text-xs font-bold text-slate-750">{c.name}</span>
                              <span className="text-[9px] text-slate-500 font-mono lowercase">
                                ({c.type === 'INCOME' ? 'pemasukan' : c.type === 'INVESTMENT' ? 'investasi' : 'pengeluaran'})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCategoryDelete(c.id)}
                              className="text-slate-500 hover:text-rose-450 p-1 cursor-pointer transition-colors"
                              title="Hapus Kategori"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
        {/* 2. TRANSACTIONS LEDGER SCENE */}
        {activeTab === 'transactions' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Title & Stats */}
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-extrabold text-slate-800 font-sans tracking-tight uppercase">Jurnal Buku Besar Keuangan</h2>
              <p className="text-xs text-slate-500">Tercatat total {filteredTransactions.length} transaksi di database lokal</p>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-6">
              {/* Left Column: Filters */}
              <div className="lg:col-span-4 flex flex-col gap-4 h-fit lg:sticky lg:top-24">
                {/* Filters panel */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
                  {/* Text Search */}
                  <div className="flex items-center gap-2 bg-slate-55/60 border border-slate-200 focus-within:border-indigo-400 rounded-xl px-3 py-2.5 transition-colors">
                    <Search size={15} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Cari deskripsi transaksi..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full bg-transparent border-none text-slate-800 text-xs focus:ring-0 focus:outline-none p-0 font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Flow Filter tabs */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-450 font-mono tracking-wider">TIPE CASHFLOW</span>
                      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 rounded-xl border border-slate-200">
                        {['ALL', 'EXPENSE', 'INCOME', 'INVESTMENT'].map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              setFilterType(type);
                              setCurrentPage(1);
                            }}
                            className={`py-1.5 text-[9px] font-black tracking-wider rounded-lg transition-all cursor-pointer ${
                              filterType === type
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            {type === 'ALL' ? 'SEMUA' : type === 'EXPENSE' ? 'KELUAR' : type === 'INCOME' ? 'MASUK' : 'INVEST'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category selectors */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-450 font-mono tracking-wider">KATEGORI SEKTOR</span>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 text-slate-700 p-2.5 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all text-xs font-semibold"
                        >
                          {filterCategory === 'ALL' ? (
                            <span>Semua Kategori ({wealthData.categories.length})</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: wealthData.categories.find(c => c.id === filterCategory)?.color }} />
                              <span>{wealthData.categories.find(c => c.id === filterCategory)?.name}</span>
                            </div>
                          )}
                          <ChevronDown size={14} className={`text-slate-450 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isFilterDropdownOpen && (
                          <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                            <button
                              type="button"
                              onClick={() => {
                                setFilterCategory('ALL');
                                setCurrentPage(1);
                                setIsFilterDropdownOpen(false);
                              }}
                              className="w-full px-3.5 py-2.5 text-left text-xs text-slate-400 hover:bg-slate-50 transition-all cursor-pointer border-b border-slate-100"
                            >
                              Semua Kategori ({wealthData.categories.length})
                            </button>
                            {wealthData.categories.map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setFilterCategory(c.id);
                                  setCurrentPage(1);
                                  setIsFilterDropdownOpen(false);
                                }}
                                className="w-full px-3.5 py-2.5 text-left text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-all cursor-pointer font-semibold"
                              >
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                                <span>{c.name} ({translateType(c.type)})</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: List & Pagination */}
              <div className="lg:col-span-8 flex flex-col gap-2 mt-4 lg:mt-0">
                {paginatedTransactions.map((tx) => {
                  const cat = wealthData.categories.find(c => c.id === tx.category_id);
                  return (
                    <div
                      key={tx.id}
                      className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-2xl flex items-center justify-between gap-4 group transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-100"
                          style={{ backgroundColor: cat ? cat.color : '#64748B' }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                            {tx.notes || 'Tanpa memo'}
                          </span>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono mt-0.5">
                            <span>{tx.transaction_date}</span>
                            <span>|</span>
                            <span className="font-semibold uppercase tracking-wide">{cat ? cat.name : 'Lainnya'}</span>
                            {tx.is_recurring && (
                              <>
                                <span>|</span>
                                <span className="text-indigo-650 font-semibold uppercase">{translatePeriod(tx.recurring_period)} BERULANG</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex flex-col items-end font-mono">
                          <span className={`text-xs font-extrabold ${
                            tx.type === 'INCOME' ? 'text-emerald-600' : tx.type === 'INVESTMENT' ? 'text-indigo-600' : 'text-rose-600'
                          }`}>
                            {tx.type === 'INCOME' ? '+' : '-'}{formatRupiah(tx.amount)}
                          </span>
                          <span className="text-[8px] text-slate-450 tracking-wider uppercase font-semibold font-mono">
                            {translateType(tx.type)}
                          </span>
                        </div>

                        {/* CRUD Controls */}
                        <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditTx(tx);
                              setIsQuickAddOpen(true);
                            }}
                            className="p-1 px-2.5 bg-slate-50 border border-slate-205 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-lg text-[10px] font-mono cursor-pointer"
                            title="Ubah logs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleTransactionDelete(tx.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Hapus logs"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredTransactions.length === 0 && (
                  <div className="text-center p-8 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center gap-2">
                    <ShieldX size={28} className="text-slate-400" />
                    <span className="text-xs text-slate-600 font-semibold font-mono">Pencarian kosong bro!</span>
                    <p className="text-[10px] text-slate-400">Catatan tidak cocok dengan saringan filter.</p>
                  </div>
                )}

                {/* Pagination Docks */}
                {filteredTransactions.length > itemsPerPage && (
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-200">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 text-xs text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200 transition-all disabled:opacity-45 cursor-pointer flex items-center gap-1 font-mono font-bold"
                    >
                      <ChevronLeft size={13} />
                      <span>SEBELUMNYA</span>
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      HALAMAN {currentPage} DARI {totalLedgerPages}
                    </span>
                    <button
                      disabled={currentPage === totalLedgerPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalLedgerPages))}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 text-xs text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200 transition-all disabled:opacity-45 cursor-pointer flex items-center gap-1 font-mono font-bold"
                    >
                      <span>SELANJUTNYA</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {/* 3. ANALYTICS VIEW SCENE */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-1 text-center md:text-left">
              <h2 className="text-xl font-black text-white font-mono tracking-tight uppercase">MILYARDERRRRR VISUAL ENGINE 📊</h2>
              <p className="text-xs text-zinc-500">Visualisasi komparatif multi-dimensi real-time ditenagai Recharts</p>
            </div>
            
            <WealthCharts
              transactions={wealthData.transactions}
              categories={wealthData.categories}
              assets={wealthData.assets}
              liabilities={wealthData.liabilities}
            />
          </div>
        )}
               {/* 4. GOALS, ASSETS & LIABILITIES (NET WORTH ENGINE) */}
        {activeTab === 'goals' && (
          <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-6 animate-fade-in">
            {/* Title */}
            <div className="lg:col-span-12 flex flex-col gap-1.5">
              <h2 className="text-xl font-extrabold text-white font-mono tracking-tight uppercase">Aset & Sasaran Target Kekayaan</h2>
              <p className="text-xs text-slate-500">Rumus: Kekayaan Bersih = (Kas + Saham + Reksa Dana + Emas + Kripto + Properti) - (Hutang / KPR / PayLater)</p>
            </div>

            {/* Left Column: Goals Milestones (span 7) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <section className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">SASARAN TARGET GOALS ({parsedGoals.length})</span>
                  <button
                    onClick={() => setIsGoalModalOpen(!isGoalModalOpen)}
                    className="px-2.5 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white text-[10px] font-bold font-mono rounded-lg transition-all border border-indigo-150 cursor-pointer shadow-sm"
                  >
                    {isGoalModalOpen ? 'BATAL' : '+ TAMBAH TARGET'}
                  </button>
                </div>

                {/* Goal Form */}
                {isGoalModalOpen && (
                  <form onSubmit={handleGoalAdd} className="bg-white border border-slate-200/90 p-4 rounded-2xl flex flex-col gap-3 w-full animate-fade-in shadow-sm">
                    <span className="text-xs font-extrabold text-indigo-650 font-mono">TAMBAH TARGET TABUNGAN</span>
                    <div className="flex flex-col gap-2 text-xs">
                      <input
                        type="text"
                        placeholder="Nama Sasaran (misal: S2 di ITB, Beli Mobil)"
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl w-full focus:outline-none focus:border-indigo-450 transition-colors"
                        required
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Target (Rp)"
                          value={newGoalTarget}
                          onChange={(e) => setNewGoalTarget(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl w-full font-mono focus:outline-none focus:border-indigo-450 transition-colors"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Awal (Rp)"
                          value={newGoalCurrent}
                          onChange={(e) => setNewGoalCurrent(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl w-full font-mono focus:outline-none focus:border-indigo-450 transition-colors"
                        />
                      </div>
                      <input
                        type="date"
                        value={newGoalDate}
                        onChange={(e) => setNewGoalDate(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl w-full font-mono focus:outline-none focus:border-indigo-450 transition-colors"
                        required
                      />
                    </div>
                    <button type="submit" className="py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold text-xs rounded-xl tracking-wide transition-all cursor-pointer font-mono shadow-md">
                      SIMPAN TARGET TABUNGAN
                    </button>
                  </form>
                )}

                {/* Grid map */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {parsedGoals.map((g) => (
                    <div key={g.id} className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex flex-col gap-2 relative group hover:border-slate-700/80 transition-all">
                      <div className="flex justify-between items-start text-xs">
                        <div className="flex flex-col max-w-[80%]">
                          <span className="font-extrabold text-slate-200 truncate">{g.title}</span>
                          <span className="text-[9px] text-slate-550 font-mono">Tanggal Target: {g.target_date}</span>
                        </div>
                        <button
                          onClick={() => handleGoalDelete(g.id)}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:text-rose-455 text-slate-550 transition-all cursor-pointer shrink-0"
                          title="Hapus target"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Progress details */}
                      <div className="flex items-end justify-between font-mono text-[10px] mt-2">
                        <span className="text-slate-450 font-bold">Kemajuan ({g.percent}%)</span>
                        <span className="text-slate-100 font-extrabold">{formatRupiah(g.current_amount)} / {formatRupiah(g.target_amount)}</span>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-850">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full transition-all"
                          style={{ width: `${g.percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[9px] bg-slate-950 p-2 rounded-xl mt-1.5 border border-slate-850/60 font-mono">
                        <span className="text-slate-500">ESTIMASI SELESAI:</span>
                        <span className="font-bold text-teal-400">{g.estimatedFinish}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Assets & Liabilities Ledger (span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Assets Section */}
              <section className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">ASET KEKAYAAN AKTIF</span>
                  <button
                    onClick={() => setIsAsetModalOpen(!isAsetModalOpen)}
                    className="text-[9px] text-indigo-600 hover:underline font-mono font-bold cursor-pointer"
                  >
                    {isAsetModalOpen ? 'BATAL' : '+ TAMBAH ASET'}
                  </button>
                </div>

                {isAsetModalOpen && (
                  <form onSubmit={handleAssetAdd} className="bg-white border border-slate-200/90 p-3 rounded-2xl flex flex-col gap-2 animate-fade-in text-xs mb-3 shadow-sm">
                    <input
                      type="text"
                      placeholder="Nama Akun (e.g. Bank Mandiri, Bibit)"
                      value={newAsetName}
                      onChange={(e) => setNewAsetName(e.target.value)}
                      className="bg-slate-55 border border-slate-200 text-slate-800 p-2 rounded-xl w-full focus:outline-none focus:border-indigo-400 transition-colors"
                      required
                    />
                    <div className="flex gap-2">
                      <div className="relative w-full">
                        <button
                          type="button"
                          onClick={() => setIsAssetTypeDropdownOpen(!isAssetTypeDropdownOpen)}
                          className="w-full bg-slate-55 border border-slate-200 hover:border-slate-300 text-slate-700 p-2.5 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all text-xs font-semibold"
                        >
                          <span>
                            {newAsetType === 'CASH' ? 'KAS' :
                             newAsetType === 'STOCK' ? 'SAHAM' :
                             newAsetType === 'MUTUAL_FUND' ? 'REKSA DANA' :
                             newAsetType === 'GOLD' ? 'EMAS' :
                             newAsetType === 'CRYPTO' ? 'KRIPTO' : 'PROPERTI'}
                          </span>
                          <ChevronDown size={14} className={`text-slate-450 transition-transform ${isAssetTypeDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isAssetTypeDropdownOpen && (
                          <div className="absolute z-50 bottom-full mb-1 left-0 right-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                            {[
                              { value: 'CASH', label: 'KAS (CASH)' },
                              { value: 'STOCK', label: 'SAHAM (STOCK)' },
                              { value: 'MUTUAL_FUND', label: 'REKSA DANA (MUTUAL FUND)' },
                              { value: 'GOLD', label: 'EMAS (GOLD)' },
                              { value: 'CRYPTO', label: 'KRIPTO (CRYPTO)' },
                              { value: 'PROPERTY', label: 'PROPERTI (PROPERTY)' },
                            ].map((item) => (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => {
                                  setNewAsetType(item.value);
                                  setIsAssetTypeDropdownOpen(false);
                                }}
                                className="w-full px-3.5 py-2.5 text-left text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer font-semibold"
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <input
                        type="number"
                        placeholder="Nilai (IDR)"
                        value={newAsetValue}
                        onChange={(e) => setNewAsetValue(e.target.value)}
                        className="bg-slate-55 border border-slate-200 text-slate-800 p-2 rounded-xl text-xs w-full font-mono focus:outline-none focus:border-indigo-400 transition-colors"
                        required
                      />
                    </div>
                    <button type="submit" className="py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold rounded-xl transition-all font-mono text-[10px] cursor-pointer shadow-md">
                      SIMPAN ASET
                    </button>
                  </form>
                )}

                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1 shadow-sm">
                  {wealthData.assets.map(a => (
                    <div key={a.id} className="flex justify-between items-center text-xs group">
                      <div className="flex items-center gap-2 min-w-0">
                        <Landmark size={14} className="text-emerald-600 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="font-extrabold text-slate-850 truncate">{a.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono leading-none mt-0.5 font-semibold">
                            {a.asset_type === 'CASH' ? 'KAS' :
                             a.asset_type === 'STOCK' ? 'SAHAM' :
                             a.asset_type === 'MUTUAL_FUND' ? 'REKSA DANA' :
                             a.asset_type === 'GOLD' ? 'EMAS' :
                             a.asset_type === 'CRYPTO' ? 'KRIPTO' : 'PROPERTI'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-slate-700 font-mono text-[11px]">{formatRupiah(a.value)}</span>
                        <button
                          onClick={() => handleAssetDelete(a.id)}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:text-rose-600 text-slate-400 transition-all cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Liabilities Section */}
              <section className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">LIABILITAS HUTANG</span>
                  <button
                    onClick={() => setIsLiaModalOpen(!isLiaModalOpen)}
                    className="text-[9px] text-indigo-650 hover:underline font-mono font-bold cursor-pointer"
                  >
                    {isLiaModalOpen ? 'BATAL' : '+ TAMBAH HUTANG'}
                  </button>
                </div>

                {isLiaModalOpen && (
                  <form onSubmit={handleLiabilityAdd} className="bg-white border border-slate-200/90 p-3 rounded-2xl flex flex-col gap-2 animate-fade-in text-xs mb-3 shadow-sm">
                    <input
                      type="text"
                      placeholder="Nama Hutang (e.g. BTN Apartemen, CC)"
                      value={newLiaName}
                      onChange={(e) => setNewLiaName(e.target.value)}
                      className="bg-slate-55 border border-slate-200 text-slate-800 p-2 rounded-xl w-full focus:outline-none focus:border-indigo-400 transition-colors"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Total Hutang (IDR)"
                      value={newLiaAmount}
                      onChange={(e) => setNewLiaAmount(e.target.value)}
                      className="bg-slate-55 border border-slate-200 text-slate-800 p-2 rounded-xl w-full font-mono focus:outline-none focus:border-indigo-400 transition-colors"
                      required
                    />
                    <button type="submit" className="py-2.5 bg-indigo-600 hover:bg-indigo-555 text-white font-extrabold rounded-xl transition-all font-mono text-[10px] cursor-pointer shadow-md">
                      SIMPAN LIABILITAS
                    </button>
                  </form>
                )}

                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1 shadow-sm">
                  {wealthData.liabilities.map(l => (
                    <div key={l.id} className="flex justify-between items-center text-xs group">
                      <div className="flex items-center gap-2 min-w-0">
                        <AlertTriangle size={14} className="text-rose-600 shrink-0" />
                        <span className="font-extrabold text-slate-800 truncate">{l.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-rose-650 font-mono text-[11px]">{formatRupiah(l.amount)}</span>
                        <button
                          onClick={() => handleLiabilityDelete(l.id)}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:text-rose-600 text-slate-400 transition-all cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {wealthData.liabilities.length === 0 && (
                    <div className="text-center py-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center gap-1">
                      <Flame size={18} className="text-amber-500 animate-pulse" />
                      <span className="text-[10px] text-emerald-600 font-mono font-extrabold uppercase">BEBAS HUTANG! 🚀</span>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}


        {/* 5. AI ASSISTANT CONSOLE SCENE */}
        {
          <ComingSoonAI />
        }

      </main>

      {/* Primary Bottom Mobile Navigation */}
      <div className="lg:hidden">
        <BottomNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setCurrentPage(1); // safety reset paging
          }}
          onOpenQuickAdd={() => {
            setEditTx(null); // adding mode
            setIsQuickAddOpen(true);
          }}
        />
      </div>

      {/* Floating Instant Drawer for 5Sec logs */}
      <QuickAdd
        isOpen={isQuickAddOpen}
        onClose={() => {
          setIsQuickAddOpen(false);
          setEditTx(null);
        }}
        categories={wealthData.categories}
        onSubmit={handleTransactionSubmit}
        editTransaction={editTx}
        onRefreshData={fetchWealthData}
        showToast={showToast}
      />

      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-fade-in pointer-events-none">
          <div className={`p-4 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center gap-3 max-w-sm ${
            toast.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300 shadow-emerald-950/20'
              : toast.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/30 text-rose-300 shadow-rose-950/20'
              : 'bg-slate-900/80 border-slate-700/30 text-slate-350 shadow-slate-950/20'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertTriangle size={16} className="text-rose-400 shrink-0" />
            ) : (
              <Info size={16} className="text-indigo-400 shrink-0" />
            )}
            <span className="text-xs font-bold font-mono tracking-tight">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Premium Confirm Modal Dialog */}
      {confirmState && confirmState.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900/90 border border-slate-800/80 p-6 rounded-3xl w-full max-w-sm flex flex-col gap-4 shadow-2xl animate-scale-up">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                confirmState.type === 'danger'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : confirmState.type === 'warning'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                <AlertTriangle size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-slate-100">{confirmState.title}</span>
                <span className="text-[9px] text-slate-500 font-mono font-bold tracking-widest uppercase mt-0.5">SISTEM KONFIRMASI MILYARDER</span>
              </div>
            </div>

            <p className="text-xs text-slate-350 leading-relaxed font-sans">
              {confirmState.message}
            </p>

            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 cursor-pointer text-center font-mono tracking-wide transition-all"
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                onClick={confirmState.onConfirm}
                className={`flex-1 py-2.5 font-bold text-xs rounded-xl cursor-pointer text-center font-mono tracking-wide transition-all text-white ${
                  confirmState.type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-950/20'
                    : confirmState.type === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-950/20'
                    : 'bg-indigo-650 hover:bg-indigo-550 shadow-lg shadow-indigo-950/20'
                }`}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

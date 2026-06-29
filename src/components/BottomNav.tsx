import { Home, Receipt, BarChart3, Target, Sparkles, Plus } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
}

export default function BottomNav({ activeTab, setActiveTab, onOpenQuickAdd }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'transactions', label: 'Transaksi', icon: Receipt },
    { id: 'analytics', label: 'Analitik', icon: BarChart3 },
    { id: 'goals', label: 'Sasaran', icon: Target },
    { id: 'ai', label: 'Asisten AI', icon: Sparkles },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-xl border-t border-slate-200/80 px-4 py-2 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 group transition-all duration-200 cursor-pointer"
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50 scale-110'
                    : 'text-slate-400 hover:text-slate-600 group-hover:scale-105'
                }`}
              >
                <Icon size={20} className="stroke-[2.25]" />
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors duration-200 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Center Floating Action Button with subtle offset */}
        <div className="absolute top-[-26px] left-1/2 transform -translate-x-1/2">
          <button
            onClick={onOpenQuickAdd}
            className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-teal-500 hover:from-indigo-450 hover:to-teal-450 text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(99,102,241,0.25)] active:scale-95 hover:scale-105 transition-all duration-200 border-2 border-white cursor-pointer"
            title="Tambah Transaksi (5-Detik)"
          >
            <Plus size={24} className="stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
}

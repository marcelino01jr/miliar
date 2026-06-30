import { useState, FormEvent, useEffect, useMemo } from 'react';
import { Lock, User, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLoginSuccess: (user: { id: string; username: string; full_name: string }) => void;
}

const QUOTES = [
  "Sedikit demi sedikit menjadi bukit.",
  "Investasi terbaik adalah konsistensi.",
  "Hari ini menabung, esok menuai hasil.",
  "Disiplin adalah investasi terbaik.",
  "Keuangan yang teratur adalah awal dari kebebasan finansial.",
  "Kekayaan bukan tentang seberapa banyak uang yang Anda hasilkan, tetapi seberapa baik Anda mengelolanya."
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "Selamat Pagi ☀️";
  if (hour >= 11 && hour < 15) return "Selamat Siang 🌤️";
  if (hour >= 15 && hour < 18) return "Selamat Sore 🌇";
  return "Selamat Malam 🌙";
};

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState('Menghubungkan ke server...');

  // Get greeting and quote once per mount/refresh
  const greeting = useMemo(() => getGreeting(), []);
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  // Loading text rotation
  useEffect(() => {
    if (!isLoading) return;
    const texts = [
      'Menghubungkan ke server...',
      'Memverifikasi akun...',
      'Menyiapkan dashboard...',
      'Hampir selesai...'
    ];
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % texts.length;
      setLoadingText(texts[currentIndex]);
    }, 1200);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Mouse Glow position tracker
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Floating particles background data helper
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 2,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * -15,
    }));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError('Username dan kata sandi wajib diisi!');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
        }),
      });

      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (text.includes('<!DOCTYPE html>') || text.includes('<html') || text.includes('A server error occurred')) {
          throw new Error(
            'Server backend mengembalikan error (HTML/Text). ' +
            'Kemungkinan besar Environment Variables (SUPABASE_URL, SUPABASE_ANON_KEY) belum diset di dashboard Vercel Anda, atau server sedang cold-start/error.'
          );
        }
        throw new Error(text || `Koneksi gagal dengan status ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat masuk.');
      }

      localStorage.setItem('milyarder_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err: any) {
      console.error('Login error details:', err);
      if (err.message.includes('Unexpected token') || err.message.includes('is not valid JSON')) {
        setError(
          'Gagal membaca respon server. Mohon pastikan Environment Variables ' +
          '(SUPABASE_URL dan SUPABASE_ANON_KEY) sudah dikonfigurasi di Vercel Settings.'
        );
      } else {
        setError(err.message || 'Gagal terhubung ke server finansial.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between items-center py-8 px-4 overflow-hidden select-none font-sans">
      
      {/* 1. Aurora Gradient Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Sky blob */}
        <motion.div
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-sky-200/40 blur-[120px]"
          animate={{
            x: [0, 60, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Emerald blob */}
        <motion.div
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 blur-[120px]"
          animate={{
            x: [0, -50, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Indigo blob */}
        <motion.div
          className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-100/30 blur-[120px]"
          animate={{
            x: [0, -40, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* 2. Soft Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-40 z-0" />

      {/* 3. Mouse Glow Effect */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 opacity-40 blur-[140px]"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(14, 165, 233, 0.12), rgba(16, 185, 129, 0.12), transparent 80%)`
        }}
      />

      {/* 4. Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-sky-300/40"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              x: [0, Math.random() * 60 - 30],
              y: [0, Math.random() * 60 - 30],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Spacer header */}
      <div className="w-full flex justify-center items-center pointer-events-none" />

      {/* 5. Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] bg-white/70 backdrop-blur-2xl border border-white/80 p-8 rounded-[32px] shadow-[0_24px_50px_-12px_rgba(15,23,42,0.06)] relative z-10 flex flex-col gap-6"
      >
        {/* Header content */}
        <div className="flex flex-col items-center text-center gap-2">
          <span className="text-[10px] font-bold font-mono tracking-widest text-slate-450 uppercase">
            {greeting}
          </span>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-sky-600 via-indigo-650 to-emerald-500 bg-clip-text text-transparent leading-none mt-1 font-sans">
            CALON MILYARDER
          </h1>
          <p className="text-xs text-slate-450 font-medium">
            Kelola keuangan pribadi dengan lebih cerdas.
          </p>
          <div className="mt-2.5 px-4 py-2.5 rounded-2xl bg-slate-50/50 border border-slate-100/65 text-[10px] text-slate-400 italic">
            "{quote}"
          </div>
        </div>

        {/* Dynamic Error Panel with Shake Animation */}
        {error && (
          <motion.div
            initial={{ x: -8, opacity: 0 }}
            animate={{ x: [0, -8, 8, -8, 8, 0], opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-650 text-xs font-semibold leading-relaxed flex items-start gap-2.5"
          >
            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-bold tracking-wider uppercase ml-1" id="username-label">
              Nama Pengguna
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                <User size={16} />
              </div>
              <input
                type="text"
                placeholder="Masukkan username..."
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                disabled={isLoading}
                aria-labelledby="username-label"
                className="bg-white border border-slate-200/80 focus:border-sky-500/80 focus:ring-4 focus:ring-sky-500/10 text-slate-800 placeholder-slate-400 rounded-2xl pl-11 pr-4 py-3.5 w-full text-xs outline-none transition-all duration-300 hover:border-slate-350"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-bold tracking-wider uppercase ml-1" id="password-label">
              Kata Sandi
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\s/g, ''))}
                disabled={isLoading}
                aria-labelledby="password-label"
                className="bg-white border border-slate-200/80 focus:border-sky-500/80 focus:ring-4 focus:ring-sky-500/10 text-slate-800 placeholder-slate-400 rounded-2xl pl-11 pr-11 py-3.5 w-full text-xs outline-none transition-all duration-300 hover:border-slate-350"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Premium Shine glare Gradient Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-4 bg-gradient-to-r from-sky-500 via-blue-600 to-emerald-500 text-white font-bold text-xs rounded-full tracking-wider uppercase transition-all duration-300 shadow-lg shadow-sky-500/20 active:scale-[0.98] hover:scale-[1.01] hover:shadow-sky-500/35 hover:shadow-xl disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 group relative overflow-hidden focus-visible:ring-4 focus-visible:ring-sky-500/25"
          >
            {/* Moving shine effect on hover */}
            <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
            
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="font-mono text-[9px]">{loadingText}</span>
              </div>
            ) : (
              <>
                <Sparkles size={14} className="text-sky-100 group-hover:rotate-12 transition-transform" />
                <span>AKSES DASHBOARD MILYARDER</span>
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Footer */}
      <footer className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mt-8 relative z-10 select-none">
        <div className="flex flex-col gap-1 text-center">
          <span>VERSI 2.0</span>
          <span>© 2026 CALON MILYARDER • BUILT WITH ❤️</span>
        </div>
      </footer>
    </div>
  );
}
import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Trash2, ShieldCheck, Printer, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface AIChatProps {
  onRefreshAllData: () => void;
}

export default function AIChat({ onRefreshAllData }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  
  // Report Modal state
  const [reportText, setReportText] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadingPhrases = [
    'Menganalisis total aset & tabunganmu...',
    'Menghitung frekuensi nongkrong & pengeluaran kopi...',
    'Memproyeksikan bunga majemuk & wealth timeline...',
    'Memeriksa status target tabungan & rencana...',
    'Mengumpulkan saran finansial ala Coach M=Milyarder...',
  ];

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Loading animation phrases
  useEffect(() => {
    if (isLoading) {
      let idx = 0;
      setLoadingStep(loadingPhrases[0]);
      const timer = setInterval(() => {
        idx = (idx + 1) % loadingPhrases.length;
        setLoadingStep(loadingPhrases[idx]);
      }, 2500);
      return () => clearInterval(timer);
    }
  }, [isLoading]);

  // Welcome message if chat empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: `Halo Bro! Saya **Asisten AI M=MILYARDER**, pemandu rute kekayaan finansialmu. 🚀💸

Saya sudah membaca seluruh catatan keuanganmu, mulai dari saldo kas, saham, reksa dana, emas, kripto, properti, cicilan/liabilitas, hingga semua pengeluaran transaksi harianmu.

Tanyakan apa saja kepada saya, misalnya:
* *Kenapa pengeluaran saya bisa melonjak bulan ini?*
* *Kapan saya bisa menyentuh target 100 juta pertama?*
* *Berapa pengeluaran saya untuk kopi & nongkrong?*
* *Analisis alokasi investasi dan berikan saran portofolio!*

Gunakan tombol cepat di bawah atau tulis pertanyaanmu sesukamu. Let's make you a milyarderrrrrr! 🔥`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'bot',
            text: data.reply,
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'bot',
            text: `❌ Maaf bro, koneksi terganggu! Pastikan GEMINI_API_KEY kamu sudah di-input dengan benar di panel Settings > Secrets.\n\n*Detail Error: ${data.error || 'Unknown server response'}*`,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: '❌ Gagal menghubungi server asisten AI. Pastikan server lokal Anda aktif.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (isGeneratingReport) return;
    setIsGeneratingReport(true);

    try {
      const res = await fetch('/api/ai/report', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setReportText(data.report);
      } else {
        alert('Gagal membuat laporan audit: ' + (data.error || 'Server error'));
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const speedQueries = [
    { label: '🔍 Analisis Anggaran & Boros', q: 'Analisis anggaran belanja saya, apa saja pengeluaran terbesar yang bisa dipangkas?' },
    { label: '📈 Rekomendasi Portofolio', q: 'Bagaimana pembagian alokasi aset/investasi saya saat ini? Berikan kritik portofolio.' },
    { label: '💰 Target 100 Juta', q: 'Berdasarkan saving rate dan penghasilan saya saat ini, hitung secara matematis berapa bulan lagi saya bisa mengumpulkan uang 100 juta rupiah?' },
    { label: '🛡️ Evaluasi Rasio Hutang', q: 'Apakah kondisi hutang/liabilitas saya saat ini aman dan sehat dibanding total kas aset saya?' },
  ];

  const renderMarkdownText = (text: string) => {
    // Simple bold/list markdown formatter in pure React
    return text.split('\n').map((line, idx) => {
      let content = line;
      let isList = false;

      if (content.startsWith('* ') || content.startsWith('- ')) {
        content = content.substring(2);
        isList = true;
      } else if (content.startsWith('• ')) {
        content = content.substring(2);
        isList = true;
      }

      // Format bold text **word**
      const parts = content.split('**');
      const formatted = parts.map((part, i) => {
        if (i % 2 === 1) return <strong key={i} className="font-extrabold text-indigo-650">{part}</strong>;
        return part;
      });

      if (isList) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs md:text-sm font-medium py-0.5 leading-relaxed text-slate-700">
            {formatted}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs md:text-sm font-medium py-1 leading-relaxed text-slate-750 min-h-[1rem]">
          {formatted}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[600px] w-full gap-4">
      {/* Header and Report Button */}
      <div className="flex justify-between items-center bg-white border border-slate-200/80 rounded-2xl p-4 shrink-0 shadow-[0_2px_10px_rgb(0,0,0,0.01)]">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-500 animate-pulse" />
          <div>
            <h2 className="text-xs md:text-sm font-black text-slate-850 tracking-tight font-sans">
              COACH FINANCIAL AI
            </h2>
            <p className="text-[9px] text-slate-450 font-mono">DITENAGAI GEMINI 2.5 FLASH PRO</p>
          </div>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={isGeneratingReport}
          className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-550 hover:to-indigo-650 text-white rounded-xl text-[10px] md:text-xs font-bold font-mono tracking-tight flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 transition-all select-none"
        >
          {isGeneratingReport ? (
            <>
              <RefreshCw size={12} className="animate-spin" />
              <span>Memproses Audit...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={14} />
              <span>BUAT LAPORAN AUDIT KEKAYAAN 💸</span>
            </>
          )}
        </button>
      </div>

      {/* Main chat log */}
      <div className="flex-1 bg-white border border-slate-200/90 rounded-3xl p-4 flex flex-col overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
        {/* Chat window Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2 shrink-0">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-indigo-600" />
            <span className="text-xs font-bold text-slate-600 font-mono">ASISTEN ADVOKASI M=MILYARDER</span>
          </div>
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 rounded-lg transition-all border border-transparent hover:border-rose-100 cursor-pointer"
            title="Bersihkan obrolan"
          >
            <Trash2 size={11} />
            <span>Bersihkan</span>
          </button>
        </div>

        {/* Scrollable messages area */}
        <div className="flex-1 overflow-y-auto space-y-4 px-1 py-2">
          {messages.map((m) => {
            const isBot = m.sender === 'bot';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${
                  isBot ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-start'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg items-center justify-center flex shrink-0 border ${
                    isBot
                      ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {isBot ? <Bot size={14} /> : <User size={14} />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl border ${
                    isBot
                      ? 'bg-slate-50 border-slate-150 text-slate-700 rounded-tl-sm shadow-[0_2px_8px_rgba(15,23,42,0.01)]'
                      : 'bg-indigo-600 border-indigo-500 text-white rounded-tr-sm shadow-[0_3px_12px_rgba(99,102,241,0.15)]'
                  }`}
                >
                  <div className="select-all break-words">
                    {isBot ? renderMarkdownText(m.text) : <p className="text-xs md:text-sm font-semibold">{m.text}</p>}
                  </div>
                  <span className={`block text-[9px] mt-1.5 font-mono ${isBot ? 'text-slate-400' : 'text-indigo-200'}`}>
                    {m.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-start mr-auto max-w-[80%] animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 items-center justify-center flex shrink-0">
                <Bot size={14} className="animate-spin-slow" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 rounded-tl-sm flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                  <span className="text-[10px] text-indigo-600 font-mono font-bold">COACH MILYARDER SEDANG BERPIKIR...</span>
                </div>
                <p className="text-xs text-slate-450 font-medium font-sans italic">{loadingStep}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Suggested Quick Questions */}
        <div className="overflow-x-auto py-2 shrink-0 border-t border-slate-100 mt-1">
          <div className="flex gap-2 w-max pr-2">
            {speedQueries.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip.q)}
                disabled={isLoading}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 text-[10px] font-bold rounded-xl transition-all cursor-pointer truncate max-w-xs"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 mt-2 shrink-0"
        >
          <input
            type="text"
            placeholder={isLoading ? 'Tunggu coach berpikir...' : 'Tanyakan keuanganmu di sini...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-400 text-slate-800 px-4 py-3 text-xs md:text-sm rounded-2xl focus:outline-none focus:ring-0 disabled:opacity-60 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 shrink-0 bg-indigo-600 hover:bg-indigo-550 text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shadow-lg active:scale-95"
          >
            <Send size={15} />
          </button>
        </form>
      </div>

      {/* Laporan Bulanan Printer Modal */}
      {reportText && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-slate-250 w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck size={18} />
                <span className="text-sm font-extrabold font-mono">LOG AUDIT KEUANGAN FINTECH</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all border border-slate-200"
                  title="Cetak Laporan"
                >
                  <Printer size={13} />
                  <span>Cetak PDF</span>
                </button>
                <button
                  onClick={() => setReportText(null)}
                  className="p-1 px-2 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer text-xs transition-colors"
                >
                  Tutup [X]
                </button>
              </div>
            </div>

            {/* Content box */}
            <div id="printable-area" className="flex-1 overflow-y-auto p-6 md:p-8 bg-white select-all font-sans">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight">AUDIT KEKAYAAN REAL-TIME M=MILYARDER</h1>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-wide mt-1">Dibuat: {new Date().toISOString().slice(0, 10)} | Sasaran: Portofolio Pribadi</p>
              </div>
              <div className="markdown-body text-slate-700 text-xs md:text-sm leading-relaxed space-y-3">
                {renderMarkdownText(reportText)}
              </div>
            </div>
            
            {/* Disclaimer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center shrink-0">
              <p className="text-[9px] text-slate-400 font-mono">Aman, tersimpan lokal, dan ditenagai kecerdasan buatan Gemini, Google AI Studio.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

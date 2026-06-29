import { motion } from 'framer-motion';
import { Sparkles, Coffee } from 'lucide-react';

export default function ComingSoonAI() {
  return (
    <motion.div
      className="flex items-center justify-center min-h-[70vh]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-xl p-8 max-w-md text-center">
        <Sparkles className="mx-auto text-indigo-600" size={48} />
        <h2 className="mt-4 text-2xl font-extrabold text-slate-800 tracking-tight">
          AI Assistant – Coming Soon
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Kami sedang menyiapkan asisten AI premium yang akan membantu mengelola keuangan Anda secara cerdas.
          Sementara itu, nikmati kopi &amp; nongki sambil menunggu!
        </p>
        <button
          disabled
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-400 rounded-lg opacity-50 cursor-not-allowed"
        >
          <Coffee size={16} />
          Segera Hadir
        </button>
      </div>
    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Check, Sparkles } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getInitials } from '../utils/format';

export default function ProfileModal() {
  const { userName, setUserName, isProfileOpen, setIsProfileOpen } = usePlayer();
  const [nameInput, setNameInput] = useState<string>(userName);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Sync input value whenever modal opens
  useEffect(() => {
    if (isProfileOpen) {
      setNameInput(userName);
      setSavedSuccess(false);
    }
  }, [isProfileOpen, userName]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isProfileOpen) {
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProfileOpen, setIsProfileOpen]);

  if (!isProfileOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nameInput.trim();
    if (!clean) return;

    setUserName(clean);
    setSavedSuccess(true);
    setTimeout(() => {
      setIsProfileOpen(false);
      setSavedSuccess(false);
    }, 400);
  };

  const previewInitials = getInitials(nameInput || userName);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsProfileOpen(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 select-none overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle Pink Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => setIsProfileOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2.5 text-pink-400">
            <User size={20} />
            <span className="text-xs font-bold tracking-widest uppercase">Profil Pengguna</span>
          </div>

          <h2 className="text-2xl font-black text-white mt-1">Ubah Nama Profil</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Fitur profil ini dikhususkan untuk memperbarui nama panggilan atau nama tampilan Anda di aplikasi.
          </p>

          {/* Live Avatar Preview */}
          <div className="mt-6 flex flex-col items-center justify-center gap-3 py-4 bg-zinc-950/60 rounded-2xl border border-zinc-800/60">
            <motion.div
              key={previewInitials}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-pink-200 text-black font-black text-2xl grid place-items-center shadow-lg shadow-pink-500/20"
            >
              {previewInitials}
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-bold text-white max-w-[280px] truncate">
                {nameInput.trim() || 'Nama Kamu'}
              </p>
              <p className="text-[11px] text-pink-400/90 font-medium flex items-center justify-center gap-1 mt-0.5">
                <Sparkles size={12} /> Pratinjau Tampilan
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Nama Tampilan
                </label>
                <span className="text-[11px] font-mono text-zinc-500">
                  {nameInput.length}/30
                </span>
              </div>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value.slice(0, 30))}
                placeholder="Masukkan nama baru..."
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-pink-400 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors shadow-inner"
                autoFocus
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-pink-400 text-black hover:bg-pink-300 active:scale-95 transition-all shadow-md shadow-pink-500/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {savedSuccess ? (
                  <>
                    <Check size={16} /> Tersimpan!
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


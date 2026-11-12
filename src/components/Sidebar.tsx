import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Library, LucideIcon, User } from 'lucide-react';
import { NavView } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { getInitials } from '../utils/format';

interface SidebarProps {
  view: NavView | '';
  setView: (view: NavView) => void;
}

const ITEMS: [NavView, string, LucideIcon][] = [
  ['home', 'Beranda', Home],
  ['search', 'Cari', Search],
  ['library', 'Koleksi', Library],
];

export default function Sidebar({ view, setView }: SidebarProps) {
  const { userName, setIsProfileOpen } = usePlayer();
  return (
    <aside className="w-60 shrink-0 bg-black p-5 flex flex-col gap-8 border-r border-zinc-900 select-none">
      <div className="flex items-center gap-2 px-2 cursor-pointer" onClick={() => setView('home')}>
        <div className="flex items-end gap-[3px] h-6">
          {[10, 18, 24, 14, 20].map((h, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-pink-400"
              style={{ height: h }}
            />
          ))}
        </div>
        <span className="text-2xl font-extrabold tracking-tight text-white">
          BILEKMUSIC<span className="text-pink-400">.</span>
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {ITEMS.map(([key, label, Icon]) => {
          const active = view === key;
          return (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                active ? 'text-pink-400' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="navpill"
                  className="absolute inset-0 rounded-xl bg-zinc-900"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon size={20} className="relative z-10" />
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        {/* User Profile Card */}
        <div
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 hover:border-pink-400/50 hover:bg-zinc-800/90 transition-all cursor-pointer group shadow-sm"
          title="Klik untuk mengubah nama profil"
        >
          <div className="w-9 h-9 rounded-full bg-pink-300 text-black font-extrabold text-xs grid place-items-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
            {getInitials(userName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-zinc-200 group-hover:text-white truncate">
              {userName}
            </p>
            <p className="text-[11px] text-zinc-500 group-hover:text-pink-400 transition-colors">
              Ubah Profil
            </p>
          </div>
          <User size={15} className="text-zinc-500 group-hover:text-pink-400 transition-colors shrink-0 mr-1" />
        </div>

        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/50 p-3.5 text-sm text-zinc-400">
          <p className="font-semibold text-zinc-200 text-xs">Coba juga</p>
          <p className="mt-0.5 text-pink-400/90 text-xs hover:underline cursor-pointer">indie malam ↗</p>
        </div>
      </div>
    </aside>
  );
}

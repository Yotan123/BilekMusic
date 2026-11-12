import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Play, Loader2 } from 'lucide-react';
import Cover from '../components/Cover';
import { SONGS as FALLBACK_SONGS } from '../data/mockData';
import { usePlayer } from '../context/PlayerContext';
import { getInitials } from '../utils/format';
import { Song } from '../types';

export default function HomeView() {
  const { currentSong, playSong, userName, setIsProfileOpen } = usePlayer();
  const [chip, setChip] = useState('Untukmu');
  const [songs, setSongs] = useState<Song[]>(FALLBACK_SONGS);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadHome() {
      if (window.electronAPI?.getHomeSongs) {
        setLoading(true);
        try {
          const list = await window.electronAPI.getHomeSongs();
          if (list && list.length > 0) {
            setSongs(list);
          }
        } catch (err) {
          console.warn('Could not fetch home songs:', err);
        } finally {
          setLoading(false);
        }
      }
    }
    loadHome();
  }, []);

  const handleChipClick = async (c: string) => {
    setChip(c);
    if (window.electronAPI?.searchSongs) {
      setLoading(true);
      try {
        const queryMap: Record<string, string> = {
          Untukmu: 'Popular Hits',
          Santai: 'Acoustic Chill Indonesian',
          Galau: 'Lagu Galau Indonesia Populer',
          Fokus: 'Lofi Study Beats',
        };
        const query = queryMap[c] || c;
        const res = await window.electronAPI.searchSongs(query);
        if (res && res.length > 0) {
          setSongs(res);
        }
      } catch (err) {
        console.warn('Chip search failed:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const featuredSong = songs[0] || FALLBACK_SONGS[0];

  return (
    <div className="p-8 max-w-6xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-500 font-medium">Hei, {userName}. Mau dengerin apa?</p>
          <h1 className="text-5xl font-extrabold tracking-tight mt-1 text-white">
            Putar sesukamu.
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-zinc-400 hover:text-white transition-colors">
            <Bell size={22} />
          </button>
          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-10 h-10 rounded-full bg-pink-200 hover:bg-pink-300 text-black text-sm font-bold grid place-items-center shadow hover:scale-105 transition-all cursor-pointer ring-2 ring-transparent hover:ring-pink-400"
            title="Klik untuk ubah nama profil"
          >
            {getInitials(userName)}
          </button>
        </div>
      </div>

      {/* Mood Chips */}
      <div className="flex gap-3 mt-6">
        {['Untukmu', 'Santai', 'Galau', 'Fokus'].map((c) => (
          <button
            key={c}
            onClick={() => handleChipClick(c)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              chip === c
                ? 'bg-pink-400 text-black shadow-lg shadow-pink-500/20'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {c}
          </button>
        ))}
        {loading && (
          <div className="flex items-center pl-2">
            <Loader2 size={18} className="animate-spin text-pink-400" />
          </div>
        )}
      </div>

      {/* Featured Banner */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        className="relative mt-8 h-72 rounded-3xl overflow-hidden bg-zinc-900 shadow-xl border border-zinc-800/40"
      >
        <Cover song={featuredSong} className="absolute inset-0" rounded="rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
        <div className="relative h-full p-10 flex flex-col justify-end">
          <p className="text-xs font-bold tracking-[0.2em] text-pink-400 uppercase">
            PILIHAN BILEKMUSIC ↗
          </p>
          <h2 className="text-5xl font-extrabold tracking-tight mt-3 leading-[1.05] text-white max-w-lg truncate">
            {featuredSong.title}
          </h2>
          <p className="text-sm text-zinc-300 mt-2 font-medium">
            {featuredSong.artist} · {featuredSong.album}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.08 }}
          onClick={() => playSong(featuredSong, songs)}
          className="absolute right-10 bottom-10 w-16 h-16 rounded-full bg-pink-400 text-black grid place-items-center shadow-2xl shadow-pink-500/30 cursor-pointer"
          title="Putar Sekarang"
        >
          <Play fill="currentColor" size={26} className="ml-0.5" />
        </motion.button>
      </motion.div>

      {/* Recommendations Grid */}
      <div className="flex items-baseline justify-between mt-10">
        <h3 className="text-2xl font-bold text-white">Pas sama rasamu</h3>
        <span className="text-sm font-semibold text-pink-400 cursor-pointer hover:underline">
          Lihat semua
        </span>
      </div>

      <div className="grid grid-cols-5 gap-5 mt-4">
        {songs.slice(0, 10).map((s) => (
          <motion.button
            key={s.id}
            whileHover={{ y: -4 }}
            onClick={() => playSong(s, songs)}
            className="text-left rounded-2xl bg-zinc-900/70 border border-zinc-800/40 hover:border-zinc-700/60 p-3 transition-colors group cursor-pointer"
          >
            <Cover song={s} className="aspect-square w-full shadow-md" />
            <p
              className={`mt-3 font-semibold text-sm truncate ${
                currentSong.id === s.id ? 'text-pink-400' : 'text-zinc-100 group-hover:text-white'
              }`}
            >
              {s.title}
            </p>
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {s.artist} · {s.album}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

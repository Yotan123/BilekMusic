import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import Cover from '../components/Cover';
import TrackRow from '../components/TrackRow';
import { usePlayer } from '../context/PlayerContext';
import { Song } from '../types';

export default function LibraryView() {
  const { currentSong, isPlaying, playSong, likedList, queue, userName } = usePlayer();
  const [tab, setTab] = useState<'Playlist' | 'Lagu disukai' | 'Album'>('Playlist');

  const displayList: Song[] = tab === 'Lagu disukai' ? likedList : queue;

  return (
    <div className="p-8 max-w-5xl mx-auto select-none">
      <h1 className="text-5xl font-extrabold tracking-tight text-white">Ruang favorit.</h1>

      {/* Tabs */}
      <div className="flex gap-3 mt-6">
        {(['Playlist', 'Lagu disukai', 'Album'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setTab(c)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              tab === c
                ? 'bg-pink-400 text-black shadow-md shadow-pink-500/20'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {c}
            {c === 'Lagu disukai' && likedList.length > 0 && (
              <span className="ml-1.5 opacity-75">({likedList.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Featured Header Card */}
      <div className="mt-8 rounded-3xl bg-pink-100 text-black p-6 flex items-center gap-6 shadow-xl">
        <Cover
          song={displayList[0] || currentSong}
          className="w-36 h-36 shrink-0 shadow-lg"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs tracking-[0.2em] font-bold text-zinc-600 uppercase">
            {tab === 'Lagu disukai' ? 'KOLEKSI FAVORIT' : 'PLAYLIST PILIHANMU'}
          </p>
          <h2 className="text-5xl font-extrabold tracking-tight leading-none mt-2 truncate">
            {tab === 'Lagu disukai' ? 'Lagu yang Disukai' : 'Lewat tengah malam.'}
          </h2>
          <p className="text-sm font-medium mt-2 text-zinc-700">
            {tab === 'Lagu disukai'
              ? `Koleksi ${userName} · ${displayList.length} lagu disukai`
              : `Koleksi ${userName} · ${displayList.length} lagu tersedia`}
          </p>
        </div>
        {displayList.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => playSong(displayList[0], displayList)}
            className="flex items-center gap-2 rounded-full bg-zinc-950 text-white px-7 py-3 font-semibold shadow-lg hover:bg-zinc-900 transition-colors shrink-0 cursor-pointer"
          >
            <Play size={18} fill="currentColor" /> Putar
          </motion.button>
        )}
      </div>

      {/* Table Header */}
      <div className="mt-8 mb-2 grid grid-cols-[32px_1fr_1fr_40px_60px] gap-4 px-3 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
        <span className="text-center">#</span>
        <span>Judul</span>
        <span>Album</span>
        <span className="text-center">Suka</span>
        <span className="text-right">Durasi</span>
      </div>

      {/* Track List */}
      {displayList.length > 0 ? (
        <div className="space-y-1">
          {displayList.map((s, i) => (
            <TrackRow
              key={s.id}
              song={s}
              index={i}
              currentId={currentSong.id}
              playing={isPlaying && currentSong.id === s.id}
              onPlay={() => playSong(s, displayList)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 text-center text-zinc-500 py-12 bg-zinc-900/30 rounded-2xl border border-zinc-800/40">
          <p className="text-base font-medium">
            {tab === 'Lagu disukai' ? 'Belum ada lagu yang disukai.' : 'Belum ada lagu di tab ini.'}
          </p>
          <p className="text-sm mt-1">
            Klik ikon hati pada lagu yang kamu sukai untuk menambahkannya ke sini.
          </p>
        </div>
      )}
    </div>
  );
}

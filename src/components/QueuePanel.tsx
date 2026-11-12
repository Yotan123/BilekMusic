import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Trash2, ListMusic, History } from 'lucide-react';
import Cover from './Cover';
import { fmt } from '../utils/format';
import { usePlayer } from '../context/PlayerContext';

export default function QueuePanel() {
  const {
    queue,
    currentSong,
    isPlaying,
    playSong,
    removeFromQueue,
    clearQueue,
    isQueueOpen,
    setIsQueueOpen,
  } = usePlayer();

  if (!isQueueOpen) return null;

  const currentIdx = queue.findIndex((s) => s.id === currentSong.id);

  // Songs that will play NEXT in chronological sequence
  const upNextList = currentIdx !== -1 ? queue.slice(currentIdx + 1) : queue;

  // Songs that were already played earlier in this queue
  const previousList = currentIdx > 0 ? queue.slice(0, currentIdx) : [];

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: 420, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 420, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed top-0 right-0 w-[420px] h-[calc(100vh-90px)] bg-zinc-950/95 backdrop-blur-2xl border-l border-zinc-800/80 z-50 flex flex-col shadow-2xl select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <ListMusic size={20} className="text-pink-400" />
            <h2 className="font-extrabold text-lg text-white">Antrean Putar</h2>
            <span className="text-xs bg-zinc-800 text-zinc-300 font-bold px-2 py-0.5 rounded-full">
              {queue.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 1 && (
              <button
                onClick={clearQueue}
                className="text-xs text-zinc-400 hover:text-pink-400 transition-colors px-2.5 py-1 rounded-md hover:bg-zinc-800/60 cursor-pointer"
                title="Kosongkan antrean selain lagu yang sedang diputar"
              >
                Bersihkan
              </button>
            )}
            <button
              onClick={() => setIsQueueOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
              title="Tutup Antrean"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 noscroll">
          {/* Section: Currently Playing */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-pink-400 mb-2.5 flex items-center justify-between">
              <span>Sedang Diputar</span>
              <span className="text-[11px] text-zinc-500 font-normal">
                Posisi {currentIdx !== -1 ? currentIdx + 1 : 1} dari {queue.length}
              </span>
            </p>
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-900/90 border border-pink-400/30 shadow-lg shadow-pink-500/5">
              <Cover
                song={currentSong}
                className="w-14 h-14 shrink-0 shadow-md"
                rounded="rounded-xl"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white truncate">
                  {currentSong.title}
                </p>
                <p className="text-xs text-zinc-400 truncate mt-0.5">
                  {currentSong.artist}
                </p>
                <p className="text-[11px] text-zinc-500 font-mono mt-1">
                  {fmt(currentSong.dur)}
                </p>
              </div>

              {/* Animated Equalizer indicator */}
              <div className="flex items-end gap-[3px] h-4 px-2">
                {[12, 16, 8, 14].map((h, i) => (
                  <span
                    key={i}
                    className={`w-[2.5px] rounded-full bg-pink-400 ${
                      isPlaying ? 'animate-pulse' : 'opacity-40'
                    }`}
                    style={{ height: isPlaying ? h : 4 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Section: Up Next (in exact playback sequence) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Berikutnya Dalam Antrean
              </p>
              <span className="text-xs text-pink-400 font-medium">
                {upNextList.length} lagu berikutnya
              </span>
            </div>

            {upNextList.length > 0 ? (
              <div className="space-y-1.5">
                {upNextList.map((song, relIdx) => {
                  const actualIdx = (currentIdx !== -1 ? currentIdx + 1 : 0) + relIdx;

                  return (
                    <div
                      key={`${song.id}-${actualIdx}`}
                      className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900/80 transition-all border border-transparent hover:border-zinc-800/60"
                    >
                      <button
                        onClick={() => playSong(song)}
                        className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden cursor-pointer"
                        title="Putar lagu ini sekarang"
                      >
                        <Cover
                          song={song}
                          className="w-full h-full object-cover"
                          rounded="rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play size={16} fill="white" className="text-white ml-0.5" />
                        </div>
                      </button>

                      <div
                        onClick={() => playSong(song)}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <p className="font-semibold text-xs text-zinc-200 group-hover:text-white truncate">
                          {song.title}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {song.artist}
                        </p>
                      </div>

                      <span className="text-xs text-zinc-500 font-mono group-hover:hidden">
                        {fmt(song.dur)}
                      </span>

                      <button
                        onClick={() => removeFromQueue(actualIdx)}
                        className="hidden group-hover:block p-1 text-zinc-500 hover:text-red-400 transition-colors rounded cursor-pointer"
                        title="Hapus dari antrean"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 px-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 text-zinc-500">
                <ListMusic size={24} className="mx-auto text-zinc-600 mb-1.5" />
                <p className="text-xs font-semibold text-zinc-400">
                  Antrean berikutnya selesai
                </p>
                <p className="text-[11px] mt-1 text-zinc-500">
                  Cari lagu atau putar dari koleksi untuk menambah lagu baru.
                </p>
              </div>
            )}
          </div>

          {/* Section: Previously Played in this Queue */}
          {previousList.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5 text-zinc-500">
                <History size={14} />
                <p className="text-xs font-bold uppercase tracking-wider">
                  Sudah Diputar ({previousList.length})
                </p>
              </div>

              <div className="space-y-1.5 opacity-65 hover:opacity-100 transition-opacity">
                {previousList.map((song, prevIdx) => (
                  <div
                    key={`prev-${song.id}-${prevIdx}`}
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900/60 transition-all"
                  >
                    <button
                      onClick={() => playSong(song)}
                      className="relative w-9 h-9 shrink-0 rounded-lg overflow-hidden cursor-pointer"
                      title="Putar ulang lagu ini"
                    >
                      <Cover
                        song={song}
                        className="w-full h-full object-cover"
                        rounded="rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={14} fill="white" className="text-white ml-0.5" />
                      </div>
                    </button>

                    <div
                      onClick={() => playSong(song)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <p className="font-medium text-xs text-zinc-300 group-hover:text-white truncate">
                        {song.title}
                      </p>
                      <p className="text-[10px] text-zinc-500 truncate">
                        {song.artist}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromQueue(prevIdx)}
                      className="hidden group-hover:block p-1 text-zinc-500 hover:text-red-400 transition-colors rounded cursor-pointer"
                      title="Hapus dari daftar riwayat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

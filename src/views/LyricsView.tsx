import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Music2, SlidersHorizontal } from 'lucide-react';
import Cover from '../components/Cover';
import { usePlayer } from '../context/PlayerContext';

const MASK = 'linear-gradient(transparent, #000 15%, #000 85%, transparent)';

export default function LyricsView() {
  const { currentSong, currentTime, isPlaying, seek, lyrics, lyricsLoading } = usePlayer();
  const [offset, setOffset] = useState<number>(0); // Sync offset in seconds
  const [showOffsetControl, setShowOffsetControl] = useState<boolean>(false);

  // Reset offset when song changes
  useEffect(() => {
    setOffset(0);
  }, [currentSong.id]);

  // Adjusted time for lyrics calculation
  const adjustedTime = Math.max(0, currentTime + offset);

  // Find exact active lyric line based on adjusted playback seconds
  let activeIdx = -1;
  if (lyrics && lyrics.length > 0) {
    for (let i = 0; i < lyrics.length; i++) {
      if (adjustedTime >= lyrics[i][0]) {
        activeIdx = i;
      } else {
        break;
      }
    }
  }

  const refs = useRef<(HTMLParagraphElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset scroll to top instantly when track changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [currentSong.id]);

  // Smoothly center the active lyric line without jitter or layout shifts
  useEffect(() => {
    if (activeIdx >= 0 && refs.current[activeIdx] && containerRef.current) {
      const container = containerRef.current;
      const activeEl = refs.current[activeIdx];
      if (activeEl) {
        const containerHeight = container.clientHeight;
        const elTop = activeEl.offsetTop;
        const elHeight = activeEl.clientHeight;
        const targetScroll = elTop - (containerHeight / 2) + (elHeight / 2);

        container.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth',
        });
      }
    }
  }, [activeIdx]);

  const [color1, color2] = currentSong.c || ['#27272a', '#ec4899'];

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      {/* Background Animated Glowing Blobs + Glassmorphism */}
      <div className="absolute inset-0 bg-zinc-950 overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-[60%] h-[70%] rounded-full filter blur-[100px]"
          style={{ background: color2, opacity: 0.55 }}
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 right-0 w-[55%] h-[65%] rounded-full filter blur-[120px]"
          style={{ background: color1, opacity: 0.7 }}
        />
      </div>
      <div className="absolute inset-0 backdrop-blur-3xl bg-black/55" />

      {/* Top Floating Controls: Lyrics Offset Sync */}
      <div className="absolute top-6 right-10 z-30 flex items-center gap-2">
        {showOffsetControl && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-700/80 px-3 py-1.5 rounded-full shadow-lg text-xs"
          >
            <span className="text-zinc-400 font-medium">Kalibrasi:</span>
            <button
              onClick={() => setOffset((o) => Math.round((o - 0.5) * 10) / 10)}
              className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 hover:bg-zinc-700 font-mono"
              title="Perlambat lirik 0.5 detik"
            >
              -0.5s
            </button>
            <span className="font-mono text-pink-400 font-bold min-w-[36px] text-center">
              {offset > 0 ? `+${offset}s` : `${offset}s`}
            </span>
            <button
              onClick={() => setOffset((o) => Math.round((o + 0.5) * 10) / 10)}
              className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 hover:bg-zinc-700 font-mono"
              title="Percepat lirik 0.5 detik"
            >
              +0.5s
            </button>
            {offset !== 0 && (
              <button
                onClick={() => setOffset(0)}
                className="text-[11px] text-zinc-400 hover:text-white underline ml-1"
              >
                Reset
              </button>
            )}
          </motion.div>
        )}

        <button
          onClick={() => setShowOffsetControl((v) => !v)}
          className={`p-2 rounded-full border transition-colors cursor-pointer ${
            showOffsetControl || offset !== 0
              ? 'bg-pink-400/20 border-pink-400 text-pink-300'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
          title="Sesuaikan Sinkronisasi Waktu Lirik"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* 50/50 Split Screen */}
      <div className="relative h-full grid grid-cols-2 gap-12 px-12 z-10">
        {/* Left: Album Cover & Track Information */}
        <div className="flex items-center justify-center p-6">
          <motion.div
            key={currentSong.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: isPlaying ? 1 : 0.95 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className="w-full max-w-[480px]"
          >
            <Cover
              song={currentSong}
              className="aspect-square w-full shadow-[0_40px_100px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/10"
              rounded="rounded-3xl"
            />
            <p className="mt-8 text-4xl font-extrabold tracking-tight text-white leading-tight truncate">
              {currentSong.title}
            </p>
            <p className="text-xl text-white/60 font-medium mt-1 truncate">
              {currentSong.artist} · {currentSong.album}
            </p>
          </motion.div>
        </div>

        {/* Right: Apple Music-style Dynamic Synced Lyrics */}
        <div
          ref={containerRef}
          className="noscroll h-full overflow-y-auto"
          style={{
            maskImage: MASK,
            WebkitMaskImage: MASK,
          }}
        >
          {lyricsLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-zinc-400">
              <Loader2 size={36} className="animate-spin text-pink-400" />
              <p className="text-lg font-medium">Mencari lirik tersinkronisasi...</p>
            </div>
          ) : lyrics && lyrics.length > 0 ? (
            <div className="py-[40vh] pr-8">
              {/* Instrumental Intro Indicator before vocals start */}
              {activeIdx === -1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex items-center gap-3 text-pink-400 mb-8"
                >
                  <Music2 size={24} />
                  <span className="text-sm uppercase font-bold tracking-widest text-zinc-400">
                    Intro Musik
                  </span>
                </motion.div>
              )}

              {lyrics.map((l, i) => {
                const on = i === activeIdx;
                const dist = Math.abs(i - activeIdx);

                return (
                  <motion.p
                    key={`${i}-${l[0]}`}
                    ref={(el) => {
                      refs.current[i] = el;
                    }}
                    onClick={() => seek(l[0])}
                    initial={false}
                    animate={{
                      scale: on ? 1.06 : 0.94,
                      opacity: on ? 1 : activeIdx === -1 ? 0.35 : dist === 1 ? 0.45 : 0.25,
                      color: on ? '#ffffff' : '#a1a1aa',
                    }}
                    transition={{
                      scale: { type: 'spring', stiffness: 220, damping: 28 },
                      opacity: { duration: 0.3, ease: 'easeOut' },
                      color: { duration: 0.3, ease: 'easeOut' },
                    }}
                    style={{
                      transformOrigin: 'left center',
                      willChange: 'transform, opacity',
                    }}
                    className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight my-6 cursor-pointer hover:!opacity-95"
                  >
                    {l[1]}
                  </motion.p>
                );
              })}
            </div>
          ) : (
            <div className="h-full grid place-items-center text-2xl font-bold text-white/50 text-center px-6">
              Lirik belum tersedia untuk lagu ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

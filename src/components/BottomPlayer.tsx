import React from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Mic2,
  ListMusic,
  Loader2,
} from 'lucide-react';
import Cover from './Cover';
import { fmt } from '../utils/format';
import { usePlayer } from '../context/PlayerContext';

interface IconBtnProps {
  on?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  title?: string;
}

function IconBtn({ on, onClick, children, title }: IconBtnProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`transition-colors p-1.5 rounded-lg hover:bg-zinc-800/40 cursor-pointer ${
        on ? 'text-pink-400' : 'text-zinc-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

interface BottomPlayerProps {
  lyricsOn: boolean;
  toggleLyrics: () => void;
}

export default function BottomPlayer({ lyricsOn, toggleLyrics }: BottomPlayerProps) {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    seek,
    likedSongs,
    toggleLike,
    next,
    prev,
    shuffle,
    setShuffle,
    repeat,
    setRepeat,
    volume,
    setVolume,
    toggleMute,
    audioLoading,
    isQueueOpen,
    toggleQueue,
  } = usePlayer();

  const isLiked = !!likedSongs[currentSong.id];
  const maxDur = duration > 0 ? duration : currentSong.dur || 1;
  const pct = Math.min(100, Math.max(0, (currentTime / maxDur) * 100));

  return (
    <footer className="h-[90px] shrink-0 grid grid-cols-[1fr_minmax(420px,640px)_1fr] items-center gap-4 px-6 bg-black border-t border-zinc-900 select-none z-40">
      {/* Left: Track Info & Like */}
      <div className="flex items-center gap-3.5 min-w-0">
        <Cover
          song={currentSong}
          className="w-14 h-14 shrink-0 shadow-md"
          rounded="rounded-xl"
        />
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate text-white">
            {currentSong.title}
          </p>
          <p className="text-xs text-zinc-400 truncate mt-0.5">
            {currentSong.artist}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => toggleLike(currentSong)}
          className={`ml-2 p-1.5 transition-colors cursor-pointer ${
            isLiked ? 'text-pink-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title={isLiked ? 'Hapus dari Favorit' : 'Sukai'}
        >
          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
        </motion.button>
      </div>

      {/* Center: Controls & Scrubber */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-6">
          <IconBtn on={shuffle} onClick={() => setShuffle(!shuffle)} title="Acak">
            <Shuffle size={18} />
          </IconBtn>
          <IconBtn onClick={prev} title="Sebelumnya">
            <SkipBack size={22} fill="currentColor" />
          </IconBtn>
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.06 }}
            onClick={togglePlay}
            disabled={audioLoading}
            className="w-11 h-11 rounded-full bg-pink-400 text-black grid place-items-center shadow-lg shadow-pink-500/20 cursor-pointer disabled:opacity-80"
            title={isPlaying ? 'Jeda' : 'Putar'}
          >
            {audioLoading ? (
              <Loader2 size={20} className="animate-spin text-black" />
            ) : isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-0.5" />
            )}
          </motion.button>
          <IconBtn onClick={next} title="Berikutnya">
            <SkipForward size={22} fill="currentColor" />
          </IconBtn>
          <IconBtn on={repeat} onClick={() => setRepeat(!repeat)} title="Ulangi">
            <Repeat size={18} />
          </IconBtn>
        </div>

        <div className="flex items-center gap-3 w-full text-xs text-zinc-500 grp">
          <span className="w-9 text-right font-mono">{fmt(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={maxDur}
            step="0.5"
            value={Math.floor(currentTime)}
            onChange={(e) => seek(Number(e.target.value))}
            className="flex-1"
            style={{
              background: `linear-gradient(to right, #f472b6 ${pct}%, #3f3f46 ${pct}%)`,
            }}
          />
          <span className="w-9 font-mono">{fmt(maxDur)}</span>
        </div>
      </div>

      {/* Right: Lyrics, Queue, Volume */}
      <div className="flex items-center justify-end gap-4">
        <IconBtn on={lyricsOn} onClick={toggleLyrics} title="Lirik (Now Playing)">
          <Mic2 size={20} />
        </IconBtn>
        <IconBtn on={isQueueOpen} onClick={toggleQueue} title="Antrean Putar">
          <ListMusic size={20} />
        </IconBtn>
        <div className="flex items-center gap-2 grp">
          <button
            onClick={toggleMute}
            className="text-zinc-400 hover:text-white p-1 cursor-pointer"
            title={volume === 0 ? 'Nyalakan suara' : 'Bisukan'}
          >
            {volume > 0 ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-24"
            style={{
              background: `linear-gradient(to right, #f472b6 ${volume}%, #3f3f46 ${volume}%)`,
            }}
          />
        </div>
      </div>
    </footer>
  );
}

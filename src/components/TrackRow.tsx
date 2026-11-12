import React from 'react';
import { Heart } from 'lucide-react';
import Cover from './Cover';
import { fmt } from '../utils/format';
import { Song } from '../types';
import { usePlayer } from '../context/PlayerContext';

interface TrackRowProps {
  song: Song;
  index: number;
  currentId: string | number;
  playing: boolean;
  onPlay: (id: string | number) => void;
}

export default function TrackRow({ song, index, currentId, playing, onPlay }: TrackRowProps) {
  const { likedSongs, toggleLike } = usePlayer();
  const active = currentId === song.id;
  const isLiked = !!likedSongs[song.id];

  return (
    <div
      onClick={() => onPlay(song.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPlay(song.id);
        }
      }}
      className="w-full grid grid-cols-[32px_1fr_1fr_40px_60px] items-center gap-4 px-3 py-2 rounded-xl hover:bg-zinc-900/80 transition-colors text-left group cursor-pointer"
    >
      <span className="text-sm text-zinc-500 text-center font-medium">
        {active && playing ? (
          <span className="text-pink-400 font-bold inline-block animate-pulse">♪</span>
        ) : (
          <span className="group-hover:text-zinc-300">{index + 1}</span>
        )}
      </span>
      <div className="flex items-center gap-3 min-w-0">
        <Cover song={song} className="w-11 h-11 shrink-0 shadow-sm" rounded="rounded-lg" />
        <div className="min-w-0">
          <p className={`truncate font-medium text-sm ${active ? 'text-pink-400' : 'text-zinc-100 group-hover:text-white'}`}>
            {song.title}
          </p>
          <p className="truncate text-xs text-zinc-400">{song.artist}</p>
        </div>
      </div>
      <span className="text-sm text-zinc-400 truncate">{song.album}</span>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(song);
          }}
          className={`p-1.5 rounded-full transition-all cursor-pointer ${
            isLiked
              ? 'text-pink-400 opacity-100'
              : 'text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-zinc-200'
          }`}
          title={isLiked ? 'Hapus dari Favorit' : 'Sukai Lagu'}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>
      <span className="text-sm text-zinc-400 text-right font-mono">{fmt(song.dur)}</span>
    </div>
  );
}

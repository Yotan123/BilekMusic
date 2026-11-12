import React from 'react';
import { Song } from '../types';

interface CoverProps {
  song: Song;
  className?: string;
  rounded?: string;
}

export default function Cover({ song, className = '', rounded = 'rounded-2xl' }: CoverProps) {
  if (song.cover) {
    return (
      <div className={`relative overflow-hidden ${rounded} ${className} bg-zinc-900`}>
        <img
          src={song.cover}
          alt={song.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </div>
    );
  }

  const [color1, color2] = song.c || ['#3f3f46', '#ec4899'];

  return (
    <div
      className={`relative overflow-hidden ${rounded} ${className}`}
      style={{ background: `linear-gradient(145deg, ${color1}, #09090b)` }}
    >
      <div
        className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 rounded-full blur-2xl opacity-60"
        style={{ background: color2 }}
      />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
    </div>
  );
}

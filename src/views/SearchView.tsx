import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic2, Play, X, Loader2, Music, Heart } from 'lucide-react';
import Cover from '../components/Cover';
import TrackRow from '../components/TrackRow';
import { usePlayer } from '../context/PlayerContext';
import { Song } from '../types';

export default function SearchView() {
  const { currentSong, isPlaying, playSong, likedSongs, toggleLike } = usePlayer();
  const [q, setQ] = useState<string>('');
  const [filter, setFilter] = useState<string>('Semua');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('[SearchView] Performing search for:', query);
      if (window.electronAPI?.searchSongs) {
        const searchResults = await window.electronAPI.searchSongs(query);
        console.log('[SearchView] Search results received:', searchResults?.length);
        setResults(searchResults || []);
      } else {
        console.warn('[SearchView] window.electronAPI.searchSongs is not available.');
      }
    } catch (err) {
      console.error('[SearchView] Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Perform search on query change with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      performSearch(q);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  const best = results[0];

  return (
    <div className="p-8 max-w-4xl mx-auto select-none">
      <h1 className="text-5xl font-extrabold tracking-tight text-white">Cari bunyimu.</h1>

      {/* Search Input Bar */}
      <div className="mt-6 flex items-center gap-3 rounded-full border border-pink-400/70 bg-zinc-900 px-5 py-3 focus-within:border-pink-400 transition-colors shadow-inner">
        <Search size={20} className="text-pink-400 shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') performSearch(q);
          }}
          placeholder="Lagu, album, atau artis YouTube Music..."
          className="flex-1 bg-transparent outline-none text-white placeholder-zinc-500 text-sm"
          autoFocus
        />
        {loading && <Loader2 size={18} className="text-pink-400 animate-spin" />}
        {q && !loading && (
          <button
            onClick={() => {
              setQ('');
              setResults([]);
            }}
            className="p-1 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
        <Mic2 size={20} className="text-pink-400 shrink-0 cursor-pointer" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 mt-5">
        {['Semua', 'Lagu', 'Album', 'Artis'].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
              filter === c
                ? 'bg-pink-400 text-black shadow-md shadow-pink-500/20'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Results Section */}
      {!q.trim() ? (
        <div className="mt-20 flex flex-col items-center justify-center text-center text-zinc-500 gap-3">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <Music size={28} />
          </div>
          <p className="text-base font-medium text-zinc-400">
            Ketik judul lagu atau artis untuk mencari
          </p>
          <p className="text-xs text-zinc-600 max-w-sm">
            Temukan jutaan lagu, album, dan artis dengan lirik tersinkronisasi di YouTube Music.
          </p>
        </div>
      ) : loading && results.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-zinc-500 gap-3">
          <Loader2 size={32} className="animate-spin text-pink-400" />
          <p className="text-sm">Mencari di YouTube Music...</p>
        </div>
      ) : best ? (
        <>
          <h3 className="text-2xl font-bold mt-8 mb-3 text-white">Paling cocok</h3>
          <div
            onClick={() => playSong(best, results)}
            className="w-full flex items-center gap-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/50 p-4 text-left hover:bg-zinc-800/80 transition-colors group cursor-pointer"
          >
            <Cover song={best} className="w-20 h-20 shadow-md shrink-0" rounded="rounded-xl" />
            <div className="flex-1 min-w-0">
              <p className="text-xs tracking-widest font-bold text-pink-400">YOUTUBE MUSIC</p>
              <p className="text-2xl font-bold text-white truncate mt-0.5">{best.title}</p>
              <p className="text-zinc-400 text-sm mt-0.5 truncate">
                {best.artist} · {best.album}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(best);
              }}
              className={`p-3 rounded-full transition-colors cursor-pointer ${
                likedSongs[best.id] ? 'text-pink-400' : 'text-zinc-500 hover:text-white'
              }`}
              title={likedSongs[best.id] ? 'Hapus dari Favorit' : 'Sukai'}
            >
              <Heart size={22} fill={likedSongs[best.id] ? 'currentColor' : 'none'} />
            </button>
            <div className="w-12 h-12 rounded-full bg-pink-400/10 text-pink-400 group-hover:bg-pink-400 group-hover:text-black grid place-items-center transition-colors mr-2 shrink-0">
              <Play size={22} fill="currentColor" className="ml-0.5" />
            </div>
          </div>

          <h3 className="text-2xl font-bold mt-8 mb-2 text-white">Lagu</h3>
          <div className="space-y-1">
            {results.map((s, i) => (
              <TrackRow
                key={s.id}
                song={s}
                index={i}
                currentId={currentSong.id}
                playing={isPlaying && currentSong.id === s.id}
                onPlay={() => playSong(s, results)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-16 text-center text-zinc-500">
          <p className="text-lg">Tidak ada hasil untuk “{q}”.</p>
          <p className="text-sm mt-1">Coba kata kunci lain atau periksa ejaan.</p>
        </div>
      )}
    </div>
  );
}

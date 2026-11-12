# Bitchord Desktop — Proyek Vite + React + Tailwind + Framer Motion

Versi desktop dari desain mobile Bitchord (Beranda, Cari, Koleksi, Pemutar lagu) dengan shell sidebar + bottom player bar, dan tampilan **Now Playing & Lyrics** ala Apple Music.

## 1. Setup

```bash
npm create vite@latest bitchord-desktop -- --template react
cd bitchord-desktop
npm install framer-motion lucide-react@0.383.0
npm install -D tailwindcss@3.4.17 postcss autoprefixer
npx tailwindcss init -p
```

> `lucide-react@0.383.0` dipin supaya nama ikon (`Home`, `Mic2`) sesuai kode di bawah. Kalau memakai versi terbaru, ganti `Home` → `House` dan `Mic2` → `MicVocal`.

Struktur akhir:

```
src/
├─ main.jsx
├─ App.jsx
├─ index.css
├─ data.js
├─ utils.js
├─ components/
│  ├─ Cover.jsx
│  ├─ Sidebar.jsx
│  ├─ TrackRow.jsx
│  └─ PlayerBar.jsx
└─ views/
   ├─ HomeView.jsx
   ├─ SearchView.jsx
   ├─ LibraryView.jsx
   └─ LyricsView.jsx
```

Jalankan dengan `npm run dev`.

## 2. Konfigurasi

### `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
```

### `index.html` (tambahkan font di `<head>`)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
```

### `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root {
  height: 100%;
  margin: 0;
  background: #09090b;
  color: #fafafa;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.noscroll::-webkit-scrollbar { display: none; }
.noscroll { scrollbar-width: none; }

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 9999px;
  outline: none;
  cursor: pointer;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  opacity: 0;
}
.grp:hover input[type="range"]::-webkit-slider-thumb { opacity: 1; }
```

### `src/main.jsx`

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## 3. Data & utilitas

### `src/data.js`

```js
// Ganti bagian ini dengan data dinamis (API / hasil model rekomendasi) bila perlu.
export const SONGS = [
  { id: 0, title: "Ruang Sendiri", artist: "Nara", album: "Sisi Sunyi", dur: 222, c: ["#52525b", "#ec4899"] },
  { id: 1, title: "Pelan-pelan", artist: "Nara", album: "Sesi Kamar", dur: 252, c: ["#27272a", "#a1a1aa"] },
  { id: 2, title: "Kota Setelah Hujan", artist: "Sela", album: "Kota Setelah Hujan", dur: 238, c: ["#3f3f46", "#f472b6"] },
  { id: 3, title: "Sampai Pagi", artist: "Sela feat. Nara", album: "Kota Setelah Hujan", dur: 206, c: ["#18181b", "#9d174d"] },
  { id: 4, title: "Ruang di Antara", artist: "Sela", album: "Kota Setelah Hujan", dur: 248, c: ["#44403c", "#fb7185"] },
  { id: 5, title: "Ruang Sendiri (Akustik)", artist: "Nara", album: "Sesi Kamar", dur: 236, c: ["#292524", "#f9a8d4"] },
];

// Format: songId -> [[detikMulai, "teks"], ...]
export const LYRICS = {
  0: [
    [0, "♪"],
    [12, "Lampu kota menyala satu-satu,"],
    [24, "aku menghitung langkah yang pulang sendiri."],
    [36, "Hujan mengetuk kaca jendela,"],
    [48, "seperti kabar lama yang enggan pergi."],
    [62, "Beri aku ruang, untuk pulang."],
    [76, "Tak apa jika sunyi ikut duduk,"],
    [90, "asal ia tak bicara terlalu keras."],
    [104, "Di sini aku belajar diam,"],
    [118, "tanpa harus terdengar baik-baik saja."],
    [134, "Beri aku ruang, untuk pulang."],
    [150, "Biar pagi datang pelan-pelan,"],
    [170, "dan aku masih di sini, utuh."],
    [195, "♪"],
  ],
};
```

### `src/utils.js`

```js
export const fmt = (s) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
```

## 4. Komponen

### `src/components/Cover.jsx`

```jsx
// Placeholder cover generatif. Ganti dengan <img src={song.cover} /> bila punya gambar asli.
export default function Cover({ song, className = "", rounded = "rounded-2xl" }) {
  return (
    <div
      className={`relative overflow-hidden ${rounded} ${className}`}
      style={{ background: `linear-gradient(145deg, ${song.c[0]}, #09090b)` }}
    >
      <div
        className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 rounded-full blur-2xl opacity-60"
        style={{ background: song.c[1] }}
      />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
    </div>
  );
}
```

### `src/components/Sidebar.jsx`

```jsx
import { motion } from "framer-motion";
import { Home, Search, Library } from "lucide-react";

const ITEMS = [
  ["home", "Beranda", Home],
  ["search", "Cari", Search],
  ["library", "Koleksi", Library],
];

export default function Sidebar({ view, setView }) {
  return (
    <aside className="w-60 shrink-0 bg-black p-5 flex flex-col gap-8 border-r border-zinc-900">
      <div className="flex items-center gap-2 px-2">
        <div className="flex items-end gap-[3px] h-6">
          {[10, 18, 24, 14, 20].map((h, i) => (
            <span key={i} className="w-[3px] rounded-full bg-pink-400" style={{ height: h }} />
          ))}
        </div>
        <span className="text-2xl font-extrabold tracking-tight">
          bitchord<span className="text-pink-400">.</span>
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
                active ? "text-pink-400" : "text-zinc-400 hover:text-white"
              }`}
            >
              {active && (
                <motion.span layoutId="navpill" className="absolute inset-0 rounded-xl bg-zinc-900" />
              )}
              <Icon size={20} className="relative" />
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl bg-zinc-900 p-4 text-sm text-zinc-400">
        <p className="font-semibold text-zinc-200">Coba juga</p>
        <p className="mt-1">indie malam ↗</p>
      </div>
    </aside>
  );
}
```

### `src/components/TrackRow.jsx`

```jsx
import Cover from "./Cover";
import { fmt } from "../utils";

export default function TrackRow({ song, index, currentId, playing, onPlay }) {
  const active = currentId === song.id;
  return (
    <button
      onClick={() => onPlay(song.id)}
      className="w-full grid grid-cols-[32px_1fr_1fr_60px] items-center gap-4 px-3 py-2 rounded-xl hover:bg-zinc-900 text-left"
    >
      <span className="text-sm text-zinc-500 text-center">
        {active && playing ? <span className="text-pink-400">♪</span> : index + 1}
      </span>
      <div className="flex items-center gap-3 min-w-0">
        <Cover song={song} className="w-11 h-11 shrink-0" rounded="rounded-lg" />
        <div className="min-w-0">
          <p className={`truncate font-medium ${active ? "text-pink-400" : ""}`}>{song.title}</p>
          <p className="truncate text-sm text-zinc-500">{song.artist}</p>
        </div>
      </div>
      <span className="text-sm text-zinc-500 truncate">{song.album}</span>
      <span className="text-sm text-zinc-500 text-right">{fmt(song.dur)}</span>
    </button>
  );
}
```

### `src/components/PlayerBar.jsx`

```jsx
import { motion } from "framer-motion";
import {
  Heart, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat,
  Volume2, VolumeX, Mic2, ListMusic,
} from "lucide-react";
import Cover from "./Cover";
import { fmt } from "../utils";

function IconBtn({ on, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`transition-colors ${on ? "text-pink-400" : "text-zinc-400 hover:text-white"}`}
    >
      {children}
    </button>
  );
}

export default function PlayerBar({
  song, playing, setPlaying, time, seek, liked, toggleLike, next, prev,
  shuffle, setShuffle, repeat, setRepeat, vol, setVol, lyricsOn, toggleLyrics,
}) {
  const pct = (time / song.dur) * 100;

  return (
    <footer className="h-[90px] shrink-0 grid grid-cols-[1fr_minmax(420px,640px)_1fr] items-center gap-4 px-5 bg-black border-t border-zinc-900">
      {/* Kiri */}
      <div className="flex items-center gap-3 min-w-0">
        <Cover song={song} className="w-14 h-14 shrink-0" rounded="rounded-lg" />
        <div className="min-w-0">
          <p className="font-semibold truncate">{song.title}</p>
          <p className="text-sm text-zinc-500 truncate">{song.artist}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={toggleLike}
          className={`ml-2 ${liked ? "text-pink-400" : "text-zinc-400"}`}
        >
          <Heart size={20} fill={liked ? "currentColor" : "none"} />
        </motion.button>
      </div>

      {/* Tengah */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-6">
          <IconBtn on={shuffle} onClick={() => setShuffle(!shuffle)}><Shuffle size={18} /></IconBtn>
          <IconBtn onClick={prev}><SkipBack size={22} fill="currentColor" /></IconBtn>
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.06 }}
            onClick={() => setPlaying(!playing)}
            className="w-11 h-11 rounded-full bg-pink-400 text-black grid place-items-center"
          >
            {playing ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-0.5" />
            )}
          </motion.button>
          <IconBtn onClick={next}><SkipForward size={22} fill="currentColor" /></IconBtn>
          <IconBtn on={repeat} onClick={() => setRepeat(!repeat)}><Repeat size={18} /></IconBtn>
        </div>
        <div className="flex items-center gap-3 w-full text-xs text-zinc-500 grp">
          <span className="w-9 text-right">{fmt(time)}</span>
          <input
            type="range" min="0" max={song.dur} step="1" value={Math.floor(time)}
            onChange={(e) => seek(+e.target.value)}
            className="flex-1"
            style={{ background: `linear-gradient(to right,#f472b6 ${pct}%,#3f3f46 ${pct}%)` }}
          />
          <span className="w-9">{fmt(song.dur)}</span>
        </div>
      </div>

      {/* Kanan */}
      <div className="flex items-center justify-end gap-4">
        <IconBtn on={lyricsOn} onClick={toggleLyrics}><Mic2 size={20} /></IconBtn>
        <IconBtn><ListMusic size={20} /></IconBtn>
        <div className="flex items-center gap-2 grp">
          <button onClick={() => setVol(vol ? 0 : 70)} className="text-zinc-400">
            {vol ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <input
            type="range" min="0" max="100" value={vol}
            onChange={(e) => setVol(+e.target.value)}
            className="w-24"
            style={{ background: `linear-gradient(to right,#f472b6 ${vol}%,#3f3f46 ${vol}%)` }}
          />
        </div>
      </div>
    </footer>
  );
}
```

## 5. Views

### `src/views/HomeView.jsx`

```jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Play } from "lucide-react";
import Cover from "../components/Cover";
import { SONGS } from "../data";

export default function HomeView({ currentId, onPlay }) {
  const [chip, setChip] = useState("Untukmu");
  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-500">Hei, Alin. Mau dengerin apa?</p>
          <h1 className="text-5xl font-extrabold tracking-tight mt-1">Putar sesukamu.</h1>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="text-zinc-400" size={22} />
          <div className="w-10 h-10 rounded-full bg-pink-200 text-black text-sm font-semibold grid place-items-center">AL</div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        {["Untukmu", "Santai", "Galau", "Fokus"].map((c) => (
          <button
            key={c}
            onClick={() => setChip(c)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              chip === c ? "bg-pink-400 text-black" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <motion.div whileHover={{ scale: 1.005 }} className="relative mt-8 h-72 rounded-3xl overflow-hidden bg-zinc-900">
        <Cover song={SONGS[0]} className="absolute inset-0" rounded="rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
        <div className="relative h-full p-10 flex flex-col justify-end">
          <p className="text-xs tracking-[0.2em] text-pink-400">PILIHAN BITCHORD ↗</p>
          <h2 className="text-6xl font-extrabold tracking-tight mt-3 leading-[1.02]">
            Lewat tengah<br />malam.
          </h2>
          <p className="text-sm text-zinc-300 mt-3">Lagu pelan, pikiran jalan. · 24 lagu</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.08 }}
          onClick={() => onPlay(0)}
          className="absolute right-10 bottom-10 w-16 h-16 rounded-full bg-pink-400 text-black grid place-items-center"
        >
          <Play fill="currentColor" size={26} />
        </motion.button>
      </motion.div>

      <div className="flex items-baseline justify-between mt-10">
        <h3 className="text-2xl font-bold">Pas sama rasamu</h3>
        <span className="text-sm font-semibold text-pink-400">Lihat semua</span>
      </div>
      <div className="grid grid-cols-5 gap-5 mt-4">
        {SONGS.slice(0, 5).map((s) => (
          <motion.button
            key={s.id} whileHover={{ y: -4 }} onClick={() => onPlay(s.id)}
            className="text-left rounded-2xl bg-zinc-900 p-3"
          >
            <Cover song={s} className="aspect-square w-full" />
            <p className={`mt-3 font-semibold truncate ${currentId === s.id ? "text-pink-400" : ""}`}>{s.title}</p>
            <p className="text-sm text-zinc-500 truncate">{s.artist} · {s.album}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
```

### `src/views/SearchView.jsx`

```jsx
import { useState } from "react";
import { Search, Mic2, Play, X } from "lucide-react";
import Cover from "../components/Cover";
import TrackRow from "../components/TrackRow";
import { SONGS } from "../data";

export default function SearchView({ currentId, playing, onPlay }) {
  const [q, setQ] = useState("ruang");
  const [filter, setFilter] = useState("Semua");
  const results = SONGS.filter((s) =>
    (s.title + s.artist + s.album).toLowerCase().includes(q.toLowerCase())
  );
  const best = results[0];

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-5xl font-extrabold tracking-tight">Cari bunyimu.</h1>

      <div className="mt-6 flex items-center gap-3 rounded-full border border-pink-400/70 bg-zinc-900 px-5 py-3 focus-within:border-pink-400">
        <Search size={20} className="text-pink-400" />
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Lagu, album, atau artis"
          className="flex-1 bg-transparent outline-none"
        />
        {q && (
          <button onClick={() => setQ("")}><X size={18} className="text-zinc-400" /></button>
        )}
        <Mic2 size={20} className="text-pink-400" />
      </div>

      <div className="flex gap-3 mt-5">
        {["Semua", "Lagu", "Album", "Artis"].map((c) => (
          <button
            key={c} onClick={() => setFilter(c)}
            className={`px-5 py-2 rounded-full text-sm font-semibold ${
              filter === c ? "bg-pink-400 text-black" : "bg-zinc-900 text-zinc-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {best ? (
        <>
          <h3 className="text-2xl font-bold mt-8 mb-3">Paling cocok</h3>
          <button
            onClick={() => onPlay(best.id)}
            className="w-full flex items-center gap-5 rounded-2xl bg-zinc-900 p-4 text-left hover:bg-zinc-800 transition-colors"
          >
            <Cover song={best} className="w-20 h-20" rounded="rounded-xl" />
            <div className="flex-1">
              <p className="text-xs tracking-widest font-bold text-pink-400">LAGU</p>
              <p className="text-2xl font-bold">{best.title}</p>
              <p className="text-zinc-500">{best.artist} · 2025</p>
            </div>
            <Play className="text-pink-400 mr-2" />
          </button>

          <h3 className="text-2xl font-bold mt-8 mb-2">Lagu</h3>
          {results.map((s, i) => (
            <TrackRow key={s.id} song={s} index={i} currentId={currentId} playing={playing} onPlay={onPlay} />
          ))}
        </>
      ) : (
        <p className="mt-10 text-zinc-500">Tidak ada hasil untuk “{q}”.</p>
      )}
    </div>
  );
}
```

### `src/views/LibraryView.jsx`

```jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Cover from "../components/Cover";
import TrackRow from "../components/TrackRow";
import { SONGS } from "../data";

export default function LibraryView({ currentId, playing, onPlay }) {
  const [tab, setTab] = useState("Playlist");
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-5xl font-extrabold tracking-tight">Ruang favorit.</h1>

      <div className="flex gap-3 mt-6">
        {["Playlist", "Lagu disukai", "Album"].map((c) => (
          <button
            key={c} onClick={() => setTab(c)}
            className={`px-5 py-2 rounded-full text-sm font-semibold ${
              tab === c ? "bg-pink-400 text-black" : "bg-zinc-900 text-zinc-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-3xl bg-pink-100 text-black p-6 flex items-center gap-6">
        <Cover song={SONGS[0]} className="w-36 h-36 shrink-0" />
        <div className="flex-1">
          <p className="text-xs tracking-[0.2em] text-zinc-600">PLAYLIST PILIHANMU</p>
          <h2 className="text-5xl font-extrabold tracking-tight leading-none mt-2">Lewat tengah malam.</h2>
          <p className="text-sm mt-2">oleh Bitchord · Disimpan · 24 lagu · 1 jam 32 menit</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }} onClick={() => onPlay(0)}
          className="flex items-center gap-2 rounded-full bg-zinc-950 text-white px-7 py-3 font-semibold"
        >
          <Play size={18} /> Putar
        </motion.button>
      </div>

      <div className="mt-8 mb-2 grid grid-cols-[32px_1fr_1fr_60px] gap-4 px-3 text-xs uppercase tracking-wider text-zinc-500">
        <span>#</span><span>Judul</span><span>Album</span><span className="text-right">Durasi</span>
      </div>
      {[0, 1, 2, 3].map((id, i) => (
        <TrackRow key={id} song={SONGS[id]} index={i} currentId={currentId} playing={playing} onPlay={onPlay} />
      ))}
    </div>
  );
}
```

### `src/views/LyricsView.jsx`

```jsx
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Cover from "../components/Cover";
import { LYRICS } from "../data";

const MASK = "linear-gradient(transparent, #000 15%, #000 85%, transparent)";

export default function LyricsView({ song, time, playing, seek }) {
  const lines = LYRICS[song.id];
  const activeIdx = lines ? lines.reduce((acc, l, i) => (time >= l[0] ? i : acc), 0) : -1;
  const refs = useRef([]);

  // Auto-scroll: baris aktif selalu di tengah
  useEffect(() => {
    if (activeIdx >= 0 && refs.current[activeIdx]) {
      refs.current[activeIdx].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIdx, song.id]);

  return (
    <div className="relative h-full overflow-hidden">
      {/* Latar: blob warna cover + glassmorphism */}
      <div className="absolute inset-0 bg-zinc-950">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-[60%] h-[70%] rounded-full"
          style={{ background: song.c[1], opacity: 0.55 }}
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity }}
          className="absolute -bottom-32 right-0 w-[55%] h-[65%] rounded-full"
          style={{ background: song.c[0] }}
        />
      </div>
      <div className="absolute inset-0 backdrop-blur-3xl bg-black/50" />

      {/* Konten 50/50 */}
      <div className="relative h-full grid grid-cols-2 gap-10 px-12">
        <div className="flex items-center justify-center">
          <motion.div
            key={song.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: playing ? 1 : 0.94 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="w-full max-w-[520px]"
          >
            <Cover
              song={song}
              className="aspect-square w-full shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
              rounded="rounded-3xl"
            />
            <p className="mt-6 text-4xl font-extrabold tracking-tight">{song.title}</p>
            <p className="text-lg text-white/60">{song.artist} · {song.album}</p>
          </motion.div>
        </div>

        <div className="noscroll h-full overflow-y-auto" style={{ maskImage: MASK, WebkitMaskImage: MASK }}>
          {lines ? (
            <div className="py-[40vh] pr-6">
              {lines.map((l, i) => {
                const on = i === activeIdx;
                const dist = Math.abs(i - activeIdx);
                return (
                  <motion.p
                    key={i}
                    ref={(el) => (refs.current[i] = el)}
                    onClick={() => seek(l[0])}
                    animate={{
                      fontSize: on ? 46 : 26,
                      opacity: on ? 1 : 0.5,
                      filter: on ? "blur(0px)" : `blur(${Math.min(dist * 0.6, 2.5)}px)`,
                    }}
                    transition={{ type: "spring", stiffness: 140, damping: 20 }}
                    className="font-extrabold leading-tight tracking-tight my-5 cursor-pointer hover:!opacity-80"
                  >
                    {l[1]}
                  </motion.p>
                );
              })}
            </div>
          ) : (
            <div className="h-full grid place-items-center text-2xl font-bold text-white/50">
              Lirik belum tersedia untuk lagu ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## 6. Root

### `src/App.jsx`

```jsx
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./components/Sidebar";
import PlayerBar from "./components/PlayerBar";
import HomeView from "./views/HomeView";
import SearchView from "./views/SearchView";
import LibraryView from "./views/LibraryView";
import LyricsView from "./views/LyricsView";
import { SONGS } from "./data";

export default function App() {
  const [view, setView] = useState("home");
  const [lastView, setLastView] = useState("home");
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(70);
  const [liked, setLiked] = useState({});
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(true);
  const [vol, setVol] = useState(70);

  const song = SONGS[cur];

  const go = (id) => { setCur(id); setTime(0); setPlaying(true); };
  const next = () =>
    go(shuffle ? Math.floor(Math.random() * SONGS.length) : (cur + 1) % SONGS.length);
  const prev = () => (time > 3 ? setTime(0) : go((cur - 1 + SONGS.length) % SONGS.length));

  // Simulasi progres lagu (ganti dengan <audio> element untuk audio sungguhan)
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setTime((x) => x + 0.25), 250);
    return () => clearInterval(t);
  }, [playing]);

  // Lagu selesai
  const nextRef = useRef(next);
  nextRef.current = next;
  useEffect(() => {
    if (time >= song.dur) {
      if (repeat) nextRef.current();
      else { setPlaying(false); setTime(song.dur); }
    }
  }, [time, song.dur, repeat]);

  const toggleLyrics = () => {
    if (view === "lyrics") setView(lastView);
    else { setLastView(view); setView("lyrics"); }
  };

  const body = {
    home: <HomeView currentId={cur} onPlay={go} />,
    search: <SearchView currentId={cur} playing={playing} onPlay={go} />,
    library: <LibraryView currentId={cur} playing={playing} onPlay={go} />,
    lyrics: <LyricsView song={song} time={time} playing={playing} seek={setTime} />,
  }[view];

  return (
    <div className="h-full flex flex-col bg-zinc-950 min-w-[1000px]">
      <div className="flex flex-1 min-h-0">
        <Sidebar view={view === "lyrics" ? "" : view} setView={setView} />
        <main
          className={`relative flex-1 min-w-0 ${
            view === "lyrics" ? "overflow-hidden" : "overflow-y-auto noscroll"
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              className="h-full"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {body}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <PlayerBar
        song={song} playing={playing} setPlaying={setPlaying}
        time={time} seek={setTime}
        liked={!!liked[cur]} toggleLike={() => setLiked({ ...liked, [cur]: !liked[cur] })}
        next={next} prev={prev}
        shuffle={shuffle} setShuffle={setShuffle}
        repeat={repeat} setRepeat={setRepeat}
        vol={vol} setVol={setVol}
        lyricsOn={view === "lyrics"} toggleLyrics={toggleLyrics}
      />
    </div>
  );
}
```

## 7. Ide pengembangan lanjutan

- **Audio sungguhan:** tambahkan `<audio ref>` di `App.jsx`, hubungkan `time` ke `onTimeUpdate`, dan `vol` ke `audio.volume`. Tambahkan field `src` di `SONGS`.
- **Cover asli:** tambahkan `cover` di data lagu, lalu ganti isi `Cover.jsx` dengan `<img>`. Warna `c` bisa diambil otomatis dari gambar (misalnya dengan `colorthief`).
- **Lirik LRC:** parse file `.lrc` menjadi format `[[detik, "teks"], ...]` supaya bisa memuat lirik apa pun.
- **Rekomendasi ML (relevan untuk skripsimu):** isi section "Pas sama rasamu" dan "Untukmu" dari endpoint model rekomendasi (misalnya FastAPI) lewat `fetch` di `HomeView`. Chip *Santai / Galau / Fokus* bisa dijadikan parameter mood untuk model.
- **State global:** kalau aplikasi membesar, pindahkan state pemutar ke Zustand atau Context.

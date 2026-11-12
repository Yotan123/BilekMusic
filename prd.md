# Product Requirements Document (PRD) - LyricalYT

## 1. Project Overview
LyricalYT is a desktop third-party YouTube Music client focused on a highly aesthetic, Apple Music-style dynamic synced lyrics experience. The application fetches audio-only streams to save bandwidth and provides a premium visual experience.

## 2. Tech Stack
- **Environment:** Node.js, Electron (Desktop Shell)
- **Frontend:** React (Vite), TypeScript, Tailwind CSS
- **Animations:** Framer Motion (for buttery smooth lyrics scrolling)
- **Icons:** Lucide React
- **Backend/Data Sources:**
  - `ytmusic-api`: To query search results and fetch track metadata.
  - `@distube/ytdl-core` (or similar): To extract the raw audio-only stream URL (M4A/OPUS) bypassing video playback.
  - `LRCLIB API` (https://lrclib.net/api/get): To fetch `.lrc` synchronized lyrics.

## 3. UI/UX Architecture (Static Design is Ready)
The static UI has already been generated. The layout consists of:
1. **Left Sidebar:** Vertical navigation (Beranda, Cari, Koleksi).
2. **Bottom Control Bar:** Persistent player spanning the full width, containing album art, track info, playback controls, and progress bar.
3. **Main Content Area (Split Screen):** 
   - Left side: Massive album art with shadows.
   - Right side: Vertical list of synced lyrics.
4. **Theming:** Dark mode by default (`bg-zinc-950`), heavy glassmorphism (`backdrop-blur-3xl`), and neon pink accent colors.

## 4. Development Milestones for AI Agent
- **Phase 1: Project Scaffolding:** Initialize the Electron + React (Vite) environment and install all necessary dependencies (Tailwind, Framer Motion, ytmusic-api, etc.).
- **Phase 2: UI Integration:** Import the provided static React UI code into the project structure.
- **Phase 3: State Management:** Implement a global React Context (`PlayerContext`) to manage playback state, current track, volume, and precise audio current time.
- **Phase 4: Backend Wiring (IPC):** 
  - Connect the Search UI to `ytmusic-api`.
  - Wire track selection to the audio extractor (`ytdl-core`) and feed the URL to an HTML5 `<audio>` element.
- **Phase 5: Dynamic Lyrics:** Fetch `.lrc` from LRCLIB upon track load, parse the timestamps, and sync the Framer Motion scrolling with the `<audio>` `timeupdate` event.
export interface Song {
  id: string | number;
  title: string;
  artist: string;
  album: string;
  dur: number; // Duration in seconds
  c: [string, string]; // Accent gradient colors [startColor, endColor]
  cover?: string; // Optional actual artwork URL
  videoId?: string; // YouTube Video ID for backend wiring
}

export type LyricLine = [number, string]; // [timestampInSeconds, text]

export type LyricsMap = Record<string | number, LyricLine[]>;

export type NavView = 'home' | 'search' | 'library' | 'lyrics';

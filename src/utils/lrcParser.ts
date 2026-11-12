import { LyricLine } from '../types';

/**
 * Parses a standard .lrc format string into an array of [seconds, text]
 * e.g. "[00:10.40] And said drink from me" -> [10.4, "And said drink from me"]
 */
export function parseLrc(lrcText: string): LyricLine[] {
  if (!lrcText || typeof lrcText !== 'string') return [];

  const lines = lrcText.split('\n');
  const result: LyricLine[] = [];
  // Regex to match [mm:ss.xx] or [mm:ss.xxx] or [mm:ss]
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Reset regex lastIndex
    timeRegex.lastIndex = 0;
    const matches = [...trimmed.matchAll(timeRegex)];
    if (matches.length === 0) continue;

    // The text is the remainder of the line after all timestamp tags
    const text = trimmed.replace(timeRegex, '').trim();

    for (const match of matches) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const fractionStr = match[3] || '0';
      // If 2 digits, hundredths of a second; if 3 digits, milliseconds
      const fraction = parseInt(fractionStr.padEnd(3, '0').slice(0, 3), 10) / 1000;
      const totalSeconds = minutes * 60 + seconds + fraction;

      result.push([totalSeconds, text]);
    }
  }

  // Sort chronologically by timestamp
  result.sort((a, b) => a[0] - b[0]);

  return result;
}

/**
 * Splits plain lyrics into timed pseudo-lines if synced lyrics are not available
 */
export function parsePlainLyrics(plainText: string, duration: number): LyricLine[] {
  if (!plainText || typeof plainText !== 'string') return [];
  const rawLines = plainText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (rawLines.length === 0) return [];

  const interval = Math.max(2, (duration || 180) / rawLines.length);
  return rawLines.map((line, idx) => [idx * interval, line]);
}

/**
 * Formats seconds into M:SS display string
 */
export const fmt = (s: number): string => {
  if (isNaN(s) || s < 0) return '0:00';
  const minutes = Math.floor(s / 60);
  const seconds = Math.floor(s % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Generates up to 2 uppercase initials from a name
 */
export const getInitials = (name: string): string => {
  if (!name) return 'U';
  const clean = name.trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) {
    return parts[0].slice(0, Math.min(2, parts[0].length)).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

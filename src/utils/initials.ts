/**
 * Initials from a full name: first letter of each word, uppercased, max 3.
 *   "Sumangal Kumar Dey" -> "SKD"
 *   "Sanchita Sai"        -> "SS"
 */
export const getInitials = (name?: string): string => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
};

/** A stable, pleasant background colour derived from the name. */
const PALETTE = ['#0B192C', '#1D70B8', '#7C3AED', '#059669', '#D97706', '#B91C1C'];
export const colorForName = (name?: string): string => {
  const s = (name || '?').trim();
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
};

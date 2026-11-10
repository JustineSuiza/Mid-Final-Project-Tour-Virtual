export const CATEGORY_COLORS = {
  Historical: '#b4451f',
  Religious: '#8a3ba3',
  Cultural: '#c27c00',
  Nature: '#23864f',
  Museum: '#114e5c',
};

export const RANKS = [
  'Curious Traveler',
  'Trail Scout',
  'Heritage Explorer',
  'Culture Keeper',
  'Kabalen Guide',
  'CALABARZON Legend',
];

export const PJ = {
  medium: 'PlusJakartaSans_500Medium',
  bold: 'PlusJakartaSans_700Bold',
  extra: 'PlusJakartaSans_800ExtraBold',
};

let fontMode = 'system';

export function markProgressFonts(mode) {
  if (mode === 'web' || mode === 'native') fontMode = mode;
  else fontMode = mode ? 'native' : 'system';
}

export function f(kind) {
  const fontWeight = kind === 'extra' ? '800' : kind === 'bold' ? '700' : '500';
  if (fontMode === 'web') return { fontFamily: 'Plus Jakarta Sans', fontWeight };
  if (fontMode === 'native') {
    return { fontFamily: kind === 'extra' ? PJ.extra : kind === 'bold' ? PJ.bold : PJ.medium };
  }
  return { fontWeight };
}

export function progressPalette(isDark) {
  return {
    bg: isDark ? '#0b1619' : '#f3f7f8',
    card: isDark ? '#122227' : '#ffffff',
    ink: isDark ? '#e8f1f3' : '#12262c',
    mut: isDark ? '#8fa9b1' : '#5f7780',
    line: isDark ? '#22393f' : '#e1e9ec',
    trk: isDark ? '#1d3238' : '#e3eaec',
    pri: isDark ? '#1f8396' : '#114e5c',
    acc: '#f5b942',
    ok: '#1f9d63',
    bad: '#d64545',
    okbg: isDark ? '#12352a' : '#e4f6ec',
    badbg: isDark ? '#3b1d1f' : '#fdeaea',
    h1: '#14606f',
    h2: '#0b3a45',
  };
}

export function categoryColor(category) {
  return CATEGORY_COLORS[category] || '#114e5c';
}

export function starCount(pct) {
  if (pct >= 100) return 3;
  if (pct >= 80) return 2;
  if (pct >= 60) return 1;
  return 0;
}

export function starText(pct) {
  const n = starCount(pct);
  return `${'★'.repeat(n)}${'☆'.repeat(3 - n)}`;
}

export function levelMeta(xp) {
  const level = Math.floor(xp / 250) + 1;
  const into = xp % 250;
  return {
    level,
    into,
    rank: RANKS[Math.min(level - 1, RANKS.length - 1)],
    toNext: 250 - into,
    width: into / 2.5,
  };
}

export function buildDashboard(destinations, attempts) {
  const byId = new Map(destinations.map((d) => [d.id, {
    id: d.id,
    name: d.name,
    category: d.category,
    attempts: 0,
    bestPct: null,
  }]));
  const percents = [];
  for (const attempt of attempts) {
    const pct = attempt.total ? Math.round((attempt.score / attempt.total) * 100) : 0;
    percents.push({ pct, category: attempt.category });
    const row = byId.get(attempt.destinationId);
    if (!row) continue;
    row.attempts += 1;
    if (row.bestPct === null || pct > row.bestPct) row.bestPct = pct;
  }
  const rows = destinations.map((d) => byId.get(d.id));
  const scored = rows.filter((d) => d.bestPct !== null);
  const avg = scored.length
    ? Math.round(scored.reduce((sum, d) => sum + d.bestPct, 0) / scored.length)
    : null;
  return {
    destinations: rows,
    recent: percents.slice(-6),
    quizzesTaken: percents.length,
    stars: scored.reduce((sum, d) => sum + starCount(d.bestPct), 0),
    xp: percents.reduce((sum, a) => sum + a.pct, 0) + scored.length * 50,
    done: scored.length,
    avg,
  };
}

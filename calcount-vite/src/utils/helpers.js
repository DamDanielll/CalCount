export function fmt(n) { return Math.round(n * 10) / 10; }

export function pct(val, max) { return max > 0 ? Math.min((val / max) * 100, 100) : 0; }

export function progressColor(p) {
  if (p >= 100) return 'var(--red)';
  if (p >= 80) return 'var(--amber)';
  return 'var(--green)';
}

export function macroColor(key) {
  return { protein: 'var(--blue)', carbs: 'var(--amber)', fat: 'var(--red)', fiber: 'var(--green)' }[key];
}

export function foodEmoji(name) {
  const n = name.toLowerCase();
  if (n.match(/coffee|espresso|latte/)) return '☕';
  if (n.match(/egg/)) return '🥚';
  if (n.match(/chicken|turkey/)) return '🍗';
  if (n.match(/beef|steak|burger/)) return '🥩';
  if (n.match(/fish|salmon|tuna/)) return '🐟';
  if (n.match(/salad|veggie|vegetable|broccoli|spinach/)) return '🥗';
  if (n.match(/pizza/)) return '🍕';
  if (n.match(/bread|toast|sandwich/)) return '🍞';
  if (n.match(/rice/)) return '🍚';
  if (n.match(/pasta|noodle/)) return '🍝';
  if (n.match(/banana/)) return '🍌';
  if (n.match(/apple/)) return '🍎';
  if (n.match(/milk|yogurt|cheese|dairy/)) return '🥛';
  if (n.match(/protein|shake|bar/)) return '💪';
  if (n.match(/cereal|oat|granola/)) return '🥣';
  if (n.match(/juice|smoothie/)) return '🥤';
  return '🍽️';
}

export function totals(entries) {
  return entries.reduce((a, e) => ({
    cal: a.cal + e.cal,
    protein: a.protein + (e.protein || 0),
    carbs: a.carbs + (e.carbs || 0),
    fat: a.fat + (e.fat || 0),
    fiber: a.fiber + (e.fiber || 0),
  }), { cal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
}

export function mealTotals(items) {
  return items.reduce((a, e) => ({
    cal: a.cal + (e.cal || 0),
    protein: a.protein + (e.protein || 0),
    carbs: a.carbs + (e.carbs || 0),
    fat: a.fat + (e.fat || 0),
    fiber: a.fiber + (e.fiber || 0),
  }), { cal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
}

export function formatHistDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const diff = Math.floor((today - d) / 86400000);
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

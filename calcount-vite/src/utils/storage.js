const TODAY = new Date().toISOString().split('T')[0];

export function getToday() { return TODAY; }
export function saveEntries(entries) { localStorage.setItem('ns_entries_' + TODAY, JSON.stringify(entries)); }
export function loadEntries() { return JSON.parse(localStorage.getItem('ns_entries_' + TODAY) || '[]'); }
export function saveGoal(goal) { localStorage.setItem('ns_goal', goal); }
export function loadGoal() { return parseInt(localStorage.getItem('ns_goal') || '2000'); }
export function saveKey(key) { localStorage.setItem('ns_key', key); }
export function loadKey() { return localStorage.getItem('ns_key') || ''; }
export function saveMeals(meals) { localStorage.setItem('ns_meals', JSON.stringify(meals)); }
export function loadMeals() { return JSON.parse(localStorage.getItem('ns_meals') || '[]'); }

export function getPastDays() {
  const days = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('ns_entries_')) {
      const date = key.replace('ns_entries_', '');
      if (date !== TODAY) {
        try {
          const entries = JSON.parse(localStorage.getItem(key) || '[]');
          if (entries.length > 0) days.push({ date, entries });
        } catch {}
      }
    }
  }
  return days.sort((a, b) => b.date.localeCompare(a.date));
}

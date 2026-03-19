import { TODAY } from './helpers';

export const storage = {
  getKey: () => localStorage.getItem('ns_key') || '',
  setKey: (k) => localStorage.setItem('ns_key', k),

  getGoal: () => parseInt(localStorage.getItem('ns_goal') || '2000'),
  setGoal: (g) => localStorage.setItem('ns_goal', g),

  getEntries: () => JSON.parse(localStorage.getItem('ns_entries_' + TODAY) || '[]'),
  setEntries: (entries) => localStorage.setItem('ns_entries_' + TODAY, JSON.stringify(entries)),

  getMeals: () => JSON.parse(localStorage.getItem('ns_meals') || '[]'),
  setMeals: (meals) => localStorage.setItem('ns_meals', JSON.stringify(meals)),

  getPastDays: () => {
    const days = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ns_entries_')) {
        const date = key.replace('ns_entries_', '');
        if (date !== TODAY) {
          try {
            const entries = JSON.parse(localStorage.getItem(key) || '[]');
            if (entries.length > 0) days.push({ date, entries });
          } catch {
            // ignore corrupt entries
          }
        }
      }
    }
    return days.sort((a, b) => b.date.localeCompare(a.date));
  },
};

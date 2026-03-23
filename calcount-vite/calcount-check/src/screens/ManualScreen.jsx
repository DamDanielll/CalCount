import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';

const MACRO_FIELDS = [
  { id: 'protein', label: 'Protein', color: 'var(--blue)' },
  { id: 'carbs',   label: 'Carbs',   color: 'var(--amber)' },
  { id: 'fat',     label: 'Fat',     color: 'var(--red)' },
  { id: 'fiber',   label: 'Fiber',   color: 'var(--green)' },
];

export default function ManualScreen() {
  const { dispatch, goTo } = useApp();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', cal: '', protein: '', carbs: '', fat: '', fiber: '' });

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleAdd() {
    const name = form.name.trim();
    const cal = parseInt(form.cal);
    if (!name) { toast('Enter a food name', 'error'); return; }
    if (!cal || cal <= 0) { toast('Enter calories', 'error'); return; }
    dispatch({
      type: 'ADD_ENTRY',
      entry: {
        id: Date.now(),
        name,
        cal,
        protein: parseFloat(form.protein) || 0,
        carbs:   parseFloat(form.carbs)   || 0,
        fat:     parseFloat(form.fat)     || 0,
        fiber:   parseFloat(form.fiber)   || 0,
      },
    });
    toast(`Added ${name} — ${cal} kcal`);
    goTo('home');
  }

  return (
    <div className="review-screen">
      <div className="review-header" style={{ marginBottom: 20 }}>
        <div className="back-btn" onClick={() => goTo('home')}>←</div>
        <div>
          <div className="label">Add Entry</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.06em' }}>
            Manual Entry
          </div>
        </div>
      </div>

      <div className="form-field">
        <label>Food Name</label>
        <input
          className="input-field"
          type="text"
          placeholder="e.g. Chicken Breast"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          autoFocus
        />
      </div>

      <div className="form-field">
        <label>Calories (kcal)</label>
        <input
          className="input-field"
          type="number"
          placeholder="e.g. 165"
          value={form.cal}
          onChange={(e) => set('cal', e.target.value)}
        />
      </div>

      <div className="label" style={{ marginBottom: 12, marginTop: 4 }}>Macros (optional)</div>

      <div className="macro-inputs" style={{ marginBottom: 20 }}>
        {MACRO_FIELDS.map((f) => (
          <div key={f.id} className="macro-input-wrap">
            <label>
              <div className="macro-dot" style={{ background: f.color }} />
              {f.label} (g)
            </label>
            <input
              className="input-field"
              type="number"
              placeholder="0"
              value={form[f.id]}
              onChange={(e) => set(f.id, e.target.value)}
              style={{ borderColor: f.color + '28' }}
            />
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={handleAdd}>
        Add to Log
      </button>
      <div style={{ height: 20 }} />
    </div>
  );
}

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fmt } from '../utils/helpers';

const MACROS = [
  { key: 'protein', label: 'Protein', color: 'var(--blue)' },
  { key: 'carbs', label: 'Carbs', color: 'var(--amber)' },
  { key: 'fat', label: 'Fat', color: 'var(--red)' },
  { key: 'fiber', label: 'Fiber', color: 'var(--green)' },
];

function calcTotals(data, trackMode, servings, grams) {
  if (trackMode === 'grams') {
    const g = parseFloat(grams) || 0;
    const p100 = data.per100g;
    const hasP100 = p100 && p100.calories != null;
    const base = hasP100 ? p100 : (data.servingGrams ? {
      calories: (data.calories / data.servingGrams) * 100,
      protein: (data.protein / data.servingGrams) * 100,
      carbs: (data.carbs / data.servingGrams) * 100,
      fat: (data.fat / data.servingGrams) * 100,
      fiber: (data.fiber / data.servingGrams) * 100,
    } : null);
    if (!base) return { cal: Math.round(data.calories), protein: data.protein, carbs: data.carbs, fat: data.fat, fiber: data.fiber };
    const factor = g / 100;
    return {
      cal: Math.round((base.calories || 0) * factor),
      protein: fmt((base.protein || 0) * factor),
      carbs: fmt((base.carbs || 0) * factor),
      fat: fmt((base.fat || 0) * factor),
      fiber: fmt((base.fiber || 0) * factor),
    };
  } else {
    return {
      cal: Math.round(data.calories * servings),
      protein: fmt((data.protein || 0) * servings),
      carbs: fmt((data.carbs || 0) * servings),
      fat: fmt((data.fat || 0) * servings),
      fiber: fmt((data.fiber || 0) * servings),
    };
  }
}

export default function BarcodeReviewScreen() {
  const {
    barcodeData, setBarcodeData,
    updateEntries, goTo, toast,
  } = useApp();

  const data = barcodeData;
  const [servings, setServings] = useState(1);
  const [trackMode, setTrackMode] = useState('servings');
  const [grams, setGrams] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);

  const isGrams = trackMode === 'grams';
  const hasGramData = data?.per100g?.calories != null || data?.servingGrams;
  const t = calcTotals(data, trackMode, servings, grams);

  function handleAdd() {
    if (trackMode === 'grams' && (!grams || parseFloat(grams) <= 0)) {
      toast('Enter the weight in grams', 'error'); return;
    }
    updateEntries(prev => [...prev, {
      id: Date.now(),
      name: data.name,
      cal: t.cal, protein: t.protein, carbs: t.carbs, fat: t.fat, fiber: t.fiber,
    }]);
    setBarcodeData(null);
    toast(`Added ${data.name} — ${t.cal} kcal`);
    goTo('home');
  }

  if (!data) { goTo('home'); return null; }

  return (
    <div className="review-screen">
      <div className="review-header">
        <div className="back-btn" onClick={() => goTo('home')}>←</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="label">Barcode Scan</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: '0.06em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data.name}
          </div>
        </div>
      </div>

      {/* Amount step */}
      <div className="prompt-step">
        <div className="prompt-step-num">?</div>
        <div className="prompt-step-body">
          <div className="prompt-step-q">How much are you having?</div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {['servings', 'grams'].map(mode => (
              <div
                key={mode}
                onClick={() => setTrackMode(mode)}
                style={{
                  flex: 1, padding: 10, borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                  fontWeight: 600, fontSize: 13, letterSpacing: '0.04em',
                  border: `1px solid ${trackMode === mode ? 'rgba(46,229,160,0.4)' : 'var(--border)'}`,
                  background: trackMode === mode ? 'rgba(46,229,160,0.1)' : 'var(--bg3)',
                  color: trackMode === mode ? 'var(--green)' : 'var(--text2)',
                }}
              >
                {mode === 'servings' ? 'Servings' : 'Grams'}
              </div>
            ))}
          </div>

          {!isGrams ? (
            <div className="servings-control">
              <div className="serv-btn" onClick={() => { const v = Math.round((servings - 0.5) * 10) / 10; if (v >= 0.5) setServings(v); }}>−</div>
              <div className="serv-display">
                <input
                  type="number"
                  value={servings}
                  min="0.5"
                  step="0.5"
                  onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) setServings(v); }}
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: '0.06em', background: 'transparent', border: 'none', color: 'var(--text)', width: 90, textAlign: 'center', outline: 'none' }}
                />
                <div className="serv-label">{data.servingSize ? `× ${data.servingSize}` : 'servings'}</div>
              </div>
              <div className="serv-btn" onClick={() => setServings(Math.round((servings + 0.5) * 10) / 10)}>+</div>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                placeholder="e.g. 150"
                value={grams}
                onChange={e => setGrams(e.target.value)}
                className="input-field"
                style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.06em', paddingRight: 60, textAlign: 'center' }}
              />
              <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text3)', fontWeight: 600 }}>g</div>
              {!hasGramData && <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 8, textAlign: 'center' }}>⚠️ No per-100g data available — estimate based on serving size</div>}
            </div>
          )}
        </div>
      </div>

      {/* Live total */}
      <div className="total-card" style={{ marginBottom: 14 }}>
        <div className="label" style={{ marginBottom: 6 }}>Total to Log</div>
        <div className="total-cal">
          {t.cal}<span style={{ fontSize: 18, fontWeight: 400, color: 'var(--text2)' }}> kcal</span>
        </div>
        <div className="total-macros">
          {MACROS.map(m => (
            <div className="total-macro" key={m.key} style={{ color: m.color }}>
              <span>{t[m.key]}</span>g {m.label}
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" style={{ marginBottom: 10 }} onClick={handleAdd}>
        Add to Log
      </button>

      {/* Collapsible nutrition breakdown */}
      <div
        style={{ textAlign: 'center', fontSize: 13, color: 'var(--text2)', cursor: 'pointer', marginBottom: 12, padding: '8px 0' }}
        onClick={() => setShowBreakdown(v => !v)}
      >
        {showBreakdown ? '▲ Hide' : '▼ View'} nutrition breakdown
      </div>

      {showBreakdown && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="label" style={{ marginBottom: 12 }}>Per Serving · {data.servingSize || '1 serving'}</div>
          <div className="nutrition-table">
            <div className="nut-row">
              <div className="nut-name">🔥 Calories</div>
              <div className="nut-val">{data.calories} kcal</div>
            </div>
            {MACROS.map(m => (
              <div className="nut-row" key={m.key}>
                <div className="nut-name">
                  <div className="macro-dot" style={{ background: m.color }} />
                  {m.label}
                </div>
                <div className="nut-val" style={{ color: m.color }}>{fmt(data[m.key] || 0)}g</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="btn btn-secondary" style={{ marginBottom: 20 }} onClick={() => goTo('barcode')}>
        Scan Again
      </button>
    </div>
  );
}

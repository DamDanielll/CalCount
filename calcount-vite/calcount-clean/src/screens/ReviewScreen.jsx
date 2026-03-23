import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { calcReviewTotals, fmt, macroColor } from '../utils/helpers';

const MACROS = [
  { key: 'protein', label: 'Protein', color: 'var(--blue)' },
  { key: 'carbs',   label: 'Carbs',   color: 'var(--amber)' },
  { key: 'fat',     label: 'Fat',     color: 'var(--red)' },
  { key: 'fiber',   label: 'Fiber',   color: 'var(--green)' },
];

export default function ReviewScreen() {
  const { state, dispatch, goTo } = useApp();
  const toast = useToast();
  const n = state.scanned;
  if (!n) { goTo('home'); return null; }

  const isGrams = state.trackMode === 'grams';
  const hasGramData = n.per100g?.calories != null || n.servingGrams;
  const t = calcReviewTotals(n, state.trackMode, state.servings, state.grams);

  function addToLog() {
    const nameEl = document.getElementById('rev-name');
    const foodName = nameEl ? nameEl.value.trim() : (n.name || 'Scanned Item');
    if (!foodName) { toast('Enter a food name', 'error'); nameEl?.focus(); return; }
    if (isGrams && (!state.grams || parseFloat(state.grams) <= 0)) {
      toast('Enter the weight in grams', 'error'); return;
    }
    dispatch({
      type: 'ADD_ENTRY',
      entry: { id: Date.now(), name: foodName, cal: t.cal, protein: t.protein, carbs: t.carbs, fat: t.fat, fiber: t.fiber },
    });
    toast(`Added ${foodName} — ${t.cal} kcal`);
    goTo('home');
  }

  return (
    <div className="review-screen">
      <div className="review-header">
        <div className="back-btn" onClick={() => goTo('home')}>←</div>
        <div>
          <div className="label">Scanned Label</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.06em' }}>
            {n.name || 'Scanned Item'}
          </div>
        </div>
      </div>

      {state.capturedImg && (
        <img className="review-img" src={state.capturedImg} alt="Scanned label" />
      )}

      {/* Editable food name */}
      <div className="card" style={{ padding: '16px 18px', marginBottom: 12 }}>
        <div className="label" style={{ marginBottom: 8 }}>What food is this?</div>
        <input
          id="rev-name"
          className="input-field"
          type="text"
          defaultValue={n.name || ''}
          placeholder="e.g. Greek Yogurt, Protein Bar..."
        />
      </div>

      {/* Per-serving nutrition table */}
      <div className="card">
        <div className="label" style={{ marginBottom: 12 }}>Per Serving · {n.servingSize || '1 serving'}</div>
        <div className="nutrition-table">
          <div className="nut-row">
            <div className="nut-name">🔥 Calories</div>
            <div className="nut-val">{n.calories} kcal</div>
          </div>
          {MACROS.map((m) => (
            <div key={m.key} className="nut-row">
              <div className="nut-name">
                <div className="macro-dot" style={{ background: m.color }} />
                {m.label}
              </div>
              <div className="nut-val" style={{ color: m.color }}>{fmt(n[m.key] || 0)}g</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {['servings', 'grams'].map((mode) => {
          const active = state.trackMode === mode;
          return (
            <div
              key={mode}
              onClick={() => dispatch({ type: 'SET_TRACK_MODE', mode })}
              style={{
                flex: 1, padding: 12, borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                fontWeight: 600, fontSize: 14, letterSpacing: '0.04em',
                border: `1px solid ${active ? 'rgba(46,229,160,0.4)' : 'var(--border)'}`,
                background: active ? 'rgba(46,229,160,0.1)' : 'var(--bg3)',
                color: active ? 'var(--green)' : 'var(--text2)',
              }}
            >
              {mode === 'servings' ? 'By Servings' : 'By Grams'}
            </div>
          );
        })}
      </div>

      {/* Amount input */}
      <div className="card">
        <div className="label" style={{ marginBottom: 14 }}>How much did you eat?</div>

        {!isGrams ? (
          <>
            <div className="servings-control">
              <div
                className="serv-btn"
                onClick={() => {
                  const v = Math.round((state.servings - 0.5) * 10) / 10;
                  if (v >= 0.5) dispatch({ type: 'SET_SERVINGS', value: v });
                }}
              >−</div>
              <div className="serv-display">
                <input
                  type="number"
                  value={state.servings}
                  min="0.5"
                  step="0.5"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v > 0) dispatch({ type: 'SET_SERVINGS', value: v });
                  }}
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: '0.06em',
                    background: 'transparent', border: 'none', color: 'var(--text)',
                    width: 90, textAlign: 'center', outline: 'none',
                  }}
                />
                <div className="serv-label">servings</div>
              </div>
              <div
                className="serv-btn"
                onClick={() => {
                  const v = Math.round((state.servings + 0.5) * 10) / 10;
                  dispatch({ type: 'SET_SERVINGS', value: v });
                }}
              >+</div>
            </div>
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
              Use +/− or type the amount directly
            </div>
          </>
        ) : (
          <>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                placeholder="e.g. 150"
                value={state.grams}
                autoFocus
                onChange={(e) => dispatch({ type: 'SET_GRAMS', value: e.target.value })}
                className="input-field"
                style={{
                  fontSize: 28, fontFamily: "'Bebas Neue', sans-serif",
                  letterSpacing: '0.06em', paddingRight: 60, textAlign: 'center',
                }}
              />
              <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text3)', fontWeight: 600 }}>g</div>
            </div>
            {!hasGramData && (
              <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 8, textAlign: 'center' }}>
                ⚠️ No per-100g data found on label — estimate based on serving size
              </div>
            )}
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
              Type the weight in grams you ate
            </div>
          </>
        )}
      </div>

      {/* Total card */}
      <div className="total-card">
        <div className="label" style={{ marginBottom: 6 }}>Total to Log</div>
        <div className="total-cal">
          {t.cal}<span style={{ fontSize: 18, fontWeight: 400, color: 'var(--text2)' }}> kcal</span>
        </div>
        <div className="total-macros">
          {MACROS.map((m) => (
            <div key={m.key} className="total-macro" style={{ color: m.color }}>
              {t[m.key]}g {m.label}
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" style={{ marginBottom: 12 }} onClick={addToLog}>
        Add to Log
      </button>
      <button className="btn btn-secondary" onClick={() => goTo('scan')}>
        Rescan
      </button>
      <div style={{ height: 20 }} />
    </div>
  );
}

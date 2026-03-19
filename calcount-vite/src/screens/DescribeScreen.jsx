import { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { estimateNutrition } from '../utils/api';

const MACROS = [
  { key: 'protein', label: 'Protein', color: 'var(--blue)',  unit: 'g' },
  { key: 'carbs',   label: 'Carbs',   color: 'var(--amber)', unit: 'g' },
  { key: 'fat',     label: 'Fat',     color: 'var(--red)',   unit: 'g' },
  { key: 'fiber',   label: 'Fiber',   color: 'var(--green)', unit: 'g' },
];

const EXAMPLES = [
  '2 scrambled eggs with cheese',
  '1 cup cooked white rice',
  'Large banana',
  'Homemade chicken stir fry, 1 plate',
  '30g whey protein powder',
  'Slice of pepperoni pizza',
];

export default function DescribeScreen() {
  const { state, dispatch, goTo } = useApp();
  const toast = useToast();
  const r = state.describeResult;

  // Refs for result inputs so we can read editable values on "Add to Log"
  const nameRef   = useRef(null);
  const calRef    = useRef(null);
  const macroRefs = { protein: useRef(null), carbs: useRef(null), fat: useRef(null), fiber: useRef(null) };

  async function handleEstimate() {
    const text = state.describeText.trim();
    if (!text) { toast('Describe what you ate first', 'error'); return; }
    dispatch({ type: 'SET_DESCRIBE_LOADING', value: true });
    dispatch({ type: 'SET_DESCRIBE_RESULT', result: null });
    try {
      const result = await estimateNutrition(text, state.apiKey);
      dispatch({ type: 'SET_DESCRIBE_RESULT', result });
    } catch (err) {
      dispatch({ type: 'SET_DESCRIBE_LOADING', value: false });
      toast('Estimate failed: ' + (err.message || 'unknown error'), 'error');
    }
  }

  function handleAdd() {
    const name = nameRef.current?.value.trim() || r?.name || '';
    const cal  = parseInt(calRef.current?.value) || 0;
    if (!name) { toast('Enter a food name', 'error'); return; }
    if (!cal || cal <= 0) { toast('Enter valid calories', 'error'); return; }
    dispatch({
      type: 'ADD_ENTRY',
      entry: {
        id: Date.now(),
        name,
        cal,
        protein: parseFloat(macroRefs.protein.current?.value) || 0,
        carbs:   parseFloat(macroRefs.carbs.current?.value)   || 0,
        fat:     parseFloat(macroRefs.fat.current?.value)     || 0,
        fiber:   parseFloat(macroRefs.fiber.current?.value)   || 0,
      },
    });
    toast(`Added ${name} — ${cal} kcal`);
    dispatch({ type: 'CLEAR_DESCRIBE' });
    goTo('home');
  }

  const confidenceColor =
    r?.confidence === 'high'   ? 'var(--green)' :
    r?.confidence === 'medium' ? 'var(--amber)' :
    r                          ? 'var(--red)'   : '';
  const confidenceBg =
    r?.confidence === 'high'   ? 'rgba(46,229,160,0.1)'  :
    r?.confidence === 'medium' ? 'rgba(249,199,64,0.1)'  :
    r                          ? 'rgba(255,107,107,0.1)' : '';
  const confidenceLabel =
    r?.confidence === 'high'   ? '✓ High confidence' :
    r?.confidence === 'medium' ? '~ Medium confidence' :
    r                          ? '? Low confidence — consider editing' : '';

  return (
    <div className="review-screen">
      <div className="review-header" style={{ marginBottom: 20 }}>
        <div className="back-btn" onClick={() => goTo('home')}>←</div>
        <div>
          <div className="label">AI Nutrition Estimate</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.06em' }}>
            Describe a Food
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="label" style={{ marginBottom: 10 }}>What did you eat?</div>
        <textarea
          className="describe-textarea"
          placeholder="e.g. 200g grilled chicken breast with rice and broccoli"
          value={state.describeText}
          onChange={(e) => dispatch({ type: 'SET_DESCRIBE_TEXT', value: e.target.value })}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {EXAMPLES.map((ex) => (
            <div
              key={ex}
              className="readd-btn"
              style={{ cursor: 'pointer', fontSize: 10 }}
              onClick={() => {
                dispatch({ type: 'SET_DESCRIBE_TEXT', value: ex });
              }}
            >
              {ex}
            </div>
          ))}
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{ marginBottom: 16 }}
        disabled={state.describeLoading}
        onClick={handleEstimate}
      >
        {state.describeLoading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            Estimating…
          </span>
        ) : '🧠 \u00A0Estimate with AI'}
      </button>

      {r && (
        <>
          <div className="confidence-badge" style={{ background: confidenceBg, color: confidenceColor }}>
            {confidenceLabel}
          </div>
          {r.note && (
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.5, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 10 }}>
              💬 {r.note}
            </div>
          )}

          <div className="card" style={{ padding: '14px 16px', marginBottom: 14 }}>
            <div className="label" style={{ marginBottom: 10 }}>Estimated values — tap to edit</div>
            <div className="estimate-result">
              <div className="estimate-row">
                <div className="estimate-label">🔥 Calories</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    ref={calRef}
                    className="estimate-input"
                    type="number"
                    defaultValue={r.calories}
                  />
                  <span className="estimate-unit">kcal</span>
                </div>
              </div>
              {MACROS.map((m) => (
                <div key={m.key} className="estimate-row">
                  <div className="estimate-label">
                    <div className="macro-dot" style={{ background: m.color }} />
                    {m.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      ref={macroRefs[m.key]}
                      className="estimate-input"
                      type="number"
                      defaultValue={r[m.key]}
                      style={{ color: m.color }}
                    />
                    <span className="estimate-unit">{m.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label>Food Name</label>
            <input
              ref={nameRef}
              className="input-field"
              type="text"
              defaultValue={r.name}
            />
          </div>

          <button className="btn btn-primary" style={{ marginBottom: 12 }} onClick={handleAdd}>
            Add to Log
          </button>
        </>
      )}

      <div style={{ height: 20 }} />
    </div>
  );
}

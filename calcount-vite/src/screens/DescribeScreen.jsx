import { useApp } from '../context/AppContext';
import { estimateNutrition } from '../utils/api';

const MACROS = [
  { key: 'protein', label: 'Protein', color: 'var(--blue)', unit: 'g' },
  { key: 'carbs', label: 'Carbs', color: 'var(--amber)', unit: 'g' },
  { key: 'fat', label: 'Fat', color: 'var(--red)', unit: 'g' },
  { key: 'fiber', label: 'Fiber', color: 'var(--green)', unit: 'g' },
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
  const {
    apiKey, goTo, toast,
    describeText, setDescribeText,
    describeResult, setDescribeResult,
    describeLoading, setDescribeLoading,
    updateEntries,
  } = useApp();

  const r = describeResult;
  const loading = describeLoading;

  const confidenceColor = r
    ? (r.confidence === 'high' ? 'var(--green)' : r.confidence === 'medium' ? 'var(--amber)' : 'var(--red)')
    : '';
  const confidenceBg = r
    ? (r.confidence === 'high' ? 'rgba(46,229,160,0.1)' : r.confidence === 'medium' ? 'rgba(249,199,64,0.1)' : 'rgba(255,107,107,0.1)')
    : '';
  const confidenceLabel = r
    ? (r.confidence === 'high' ? '✓ High confidence' : r.confidence === 'medium' ? '~ Medium confidence' : '? Low confidence — consider editing')
    : '';

  async function handleEstimate() {
    const text = describeText.trim();
    if (!text) { toast('Describe what you ate first', 'error'); return; }
    setDescribeLoading(true);
    setDescribeResult(null);
    try {
      const result = await estimateNutrition(text, apiKey);
      setDescribeResult(result);
    } catch (err) {
      toast('Estimate failed: ' + (err.message || 'unknown error'), 'error');
    } finally {
      setDescribeLoading(false);
    }
  }

  function handleAdd() {
    const nameEl = document.getElementById('est-name');
    const calEl = document.getElementById('est-cal');
    const name = nameEl?.value.trim() || r.name;
    const cal = parseInt(calEl?.value) || 0;
    if (!name) { toast('Enter a food name', 'error'); return; }
    if (!cal || cal <= 0) { toast('Enter valid calories', 'error'); return; }
    updateEntries(prev => [...prev, {
      id: Date.now(), name, cal,
      protein: parseFloat(document.getElementById('est-protein')?.value) || 0,
      carbs: parseFloat(document.getElementById('est-carbs')?.value) || 0,
      fat: parseFloat(document.getElementById('est-fat')?.value) || 0,
      fiber: parseFloat(document.getElementById('est-fiber')?.value) || 0,
    }]);
    toast(`Added ${name} — ${cal} kcal`);
    setDescribeResult(null);
    setDescribeText('');
    goTo('home');
  }

  return (
    <div className="review-screen">
      <div className="review-header" style={{ marginBottom: 20 }}>
        <div className="back-btn" onClick={() => goTo('home')}>←</div>
        <div>
          <div className="label">AI Nutrition Estimate</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.06em' }}>Describe a Food</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="label" style={{ marginBottom: 10 }}>What did you eat?</div>
        <textarea
          id="desc-input"
          className="describe-textarea"
          placeholder="e.g. 200g grilled chicken breast with rice and broccoli"
          value={describeText}
          onChange={e => setDescribeText(e.target.value)}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {EXAMPLES.map(ex => (
            <div
              key={ex}
              className="readd-btn"
              style={{ cursor: 'pointer', fontSize: 10 }}
              onClick={() => {
                setDescribeText(ex);
                setTimeout(() => {
                  const t = document.getElementById('desc-input');
                  if (t) { t.focus(); t.setSelectionRange(t.value.length, t.value.length); }
                }, 50);
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
        onClick={handleEstimate}
        disabled={loading}
      >
        {loading
          ? <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Estimating…</span>
          : '🧠 \u00a0Estimate with AI'}
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
                  <input className="estimate-input" id="est-cal" type="number" defaultValue={r.calories} />
                  <span className="estimate-unit">kcal</span>
                </div>
              </div>
              {MACROS.map(m => (
                <div className="estimate-row" key={m.key}>
                  <div className="estimate-label">
                    <div className="macro-dot" style={{ background: m.color }} />
                    {m.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input className="estimate-input" id={`est-${m.key}`} type="number" defaultValue={r[m.key]} style={{ color: m.color }} />
                    <span className="estimate-unit">{m.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label>Food Name</label>
            <input id="est-name" className="input-field" type="text" defaultValue={r.name} />
          </div>

          <button className="btn btn-primary" style={{ marginBottom: 12 }} onClick={handleAdd}>Add to Log</button>
        </>
      )}

      <div style={{ height: 20 }} />
    </div>
  );
}

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import BottomNav from '../components/BottomNav';
import { totals, pct, progressColor, macroColor, foodEmoji, fmt } from '../utils/helpers';

export default function HomeScreen() {
  const { state, dispatch, goTo } = useApp();
  const toast = useToast();
  const t = totals(state.entries);
  const p = pct(t.cal, state.goal);
  const col = progressColor(p);
  const remaining = state.goal - t.cal;
  const statusText = p >= 100 ? '🔴 Over limit' : p >= 80 ? '🟡 Almost full' : '🟢 On track';
  const statusBg =
    p >= 100 ? 'rgba(255,107,107,0.12)' : p >= 80 ? 'rgba(249,199,64,0.12)' : 'rgba(46,229,160,0.12)';

  const macros = [
    { key: 'protein', label: 'Protein' },
    { key: 'carbs',   label: 'Carbs' },
    { key: 'fat',     label: 'Fat' },
    { key: 'fiber',   label: 'Fiber' },
  ];

  // Edit modal state (local, only rendered from home)
  const editEntry = state.editIdx !== null ? state.entries[state.editIdx] : null;
  const [editDraft, setEditDraft] = useState(null);

  function openEdit(idx) {
    const e = state.entries[idx];
    setEditDraft({ name: e.name, cal: e.cal, protein: e.protein||0, carbs: e.carbs||0, fat: e.fat||0, fiber: e.fiber||0 });
    dispatch({ type: 'SET_EDIT_IDX', idx });
  }

  function saveEdit() {
    const name = editDraft.name.trim();
    const cal = parseInt(editDraft.cal);
    if (!name) { toast('Enter a food name', 'error'); return; }
    if (!cal || cal <= 0) { toast('Enter valid calories', 'error'); return; }
    dispatch({
      type: 'UPDATE_ENTRY',
      idx: state.editIdx,
      entry: { ...state.entries[state.editIdx], ...editDraft, name, cal },
    });
    toast('Entry updated!');
  }

  function cancelEdit() {
    dispatch({ type: 'SET_EDIT_IDX', idx: null });
    setEditDraft(null);
  }

  function saveMeal() {
    if (state.selectedIdxs.size === 0) return;
    const mealName = prompt('Name this meal:', 'My Meal');
    if (!mealName) return;
    const items = [...state.selectedIdxs].map((i) => ({ ...state.entries[i] }));
    dispatch({ type: 'SAVE_MEAL', name: mealName.trim(), items });
    toast(`Saved "${mealName}" as a meal 🍱`);
  }

  return (
    <>
      <div className="screen">
        <div className="screen-inner">
          {/* Header */}
          <div className="home-header">
            <div>
              <div className="home-date">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <div className="brand">CalCount</div>
            </div>
            <div className="settings-btn" onClick={() => goTo('settings')}>⚙️</div>
          </div>

          {/* Calorie card */}
          <div className="card cal-card">
            <div className="label" style={{ marginBottom: 10 }}>Calories</div>
            <div className="cal-numbers">
              <div className="cal-big" style={{ color: col }}>{t.cal}</div>
              <div className="cal-goal">/ {state.goal} kcal</div>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${p}%`, background: col }} />
              {p > 100 && <div className="progress-stripe" />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <div className="status-badge" style={{ background: statusBg, color: col }}>{statusText}</div>
              <div className="cal-remaining" style={{ color: col }}>
                {remaining >= 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over`}
              </div>
            </div>
          </div>

          {/* Macros */}
          <div className="macro-grid" style={{ marginBottom: 14 }}>
            {macros.map((m) => (
              <div key={m.key} className="macro-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="macro-dot" style={{ background: macroColor(m.key) }} />
                  <span className="label">{m.label}</span>
                </div>
                <div className="macro-val" style={{ color: macroColor(m.key) }}>
                  {fmt(t[m.key])}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text2)' }}>g</span>
                </div>
                <div className="macro-bar-track">
                  <div
                    className="macro-bar-fill"
                    style={{ width: `${Math.min((t[m.key] / 150) * 100, 100)}%`, background: macroColor(m.key) }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Scan CTA */}
          <div className="scan-cta" onClick={() => goTo('scan')}>
            <div className="scan-icon-wrap">📷</div>
            <div className="scan-cta-text">
              <h3>Scan Nutrition Label</h3>
              <p>Point camera at any label — CalCount does the rest</p>
            </div>
          </div>

          {/* Action buttons */}
          <button className="btn btn-secondary" style={{ marginBottom: 10 }} onClick={() => goTo('manual')}>
            ✏️ &nbsp;Add Manually
          </button>
          <button
            className="btn btn-secondary"
            style={{ marginBottom: 20, borderColor: 'rgba(167,139,250,0.3)', color: 'var(--purple)' }}
            onClick={() => { dispatch({ type: 'CLEAR_DESCRIBE' }); goTo('describe'); }}
          >
            🧠 &nbsp;Describe a Food — AI Estimates
          </button>

          {/* Entries list */}
          <div className="card" style={{ padding: '14px 18px' }}>
            <div className="entries-header">
              <span className="label">Food Log · {state.entries.length} items</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {state.entries.length > 1 && (
                  <button
                    className="clear-btn"
                    style={{ color: 'var(--blue)' }}
                    onClick={() => dispatch({ type: 'SET_SELECT_MODE', value: true })}
                  >
                    Select
                  </button>
                )}
                {state.entries.length > 0 && (
                  <button
                    className="clear-btn"
                    onClick={() => { dispatch({ type: 'CLEAR_ENTRIES' }); }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Select bar */}
            {state.selectMode && (
              <div className="select-bar">
                <div className="select-count">{state.selectedIdxs.size} selected</div>
                <div className="select-actions">
                  <button
                    className="sel-action-btn"
                    style={{ background: 'var(--bg3)', color: 'var(--text2)' }}
                    onClick={() => dispatch({ type: 'SET_SELECT_MODE', value: false })}
                  >
                    Cancel
                  </button>
                  <button
                    className="sel-action-btn"
                    style={{ background: 'rgba(46,229,160,0.15)', color: 'var(--green)', opacity: state.selectedIdxs.size === 0 ? 0.4 : 1 }}
                    disabled={state.selectedIdxs.size === 0}
                    onClick={saveMeal}
                  >
                    Save as Meal
                  </button>
                </div>
              </div>
            )}

            {/* Entry items */}
            {state.entries.length === 0 ? (
              <div className="empty-state">No entries yet.<br />Scan a label or add manually.</div>
            ) : (
              state.entries.map((e, i) => {
                const isChecked = state.selectedIdxs.has(i);
                return (
                  <div
                    key={e.id || i}
                    className="entry-item"
                    style={state.selectMode ? { cursor: 'pointer' } : undefined}
                    onClick={state.selectMode ? () => dispatch({ type: 'TOGGLE_SELECTION', idx: i }) : undefined}
                  >
                    {state.selectMode && (
                      <div
                        className={`entry-checkbox ${isChecked ? 'checked' : ''}`}
                        onClick={(ev) => { ev.stopPropagation(); dispatch({ type: 'TOGGLE_SELECTION', idx: i }); }}
                      >
                        {isChecked ? '✓' : ''}
                      </div>
                    )}
                    <div className="entry-left">
                      <div className="entry-avatar" style={{ background: 'var(--bg3)' }}>{foodEmoji(e.name)}</div>
                      <div style={{ minWidth: 0 }}>
                        <div className="entry-name">{e.name}</div>
                        <div className="entry-macros">
                          {e.protein ? <span style={{ color: 'var(--blue)' }}>{fmt(e.protein)}g P</span> : null}
                          {e.protein && e.carbs ? ' · ' : null}
                          {e.carbs ? <span style={{ color: 'var(--amber)' }}>{fmt(e.carbs)}g C</span> : null}
                          {(e.protein || e.carbs) && e.fat ? ' · ' : null}
                          {e.fat ? <span style={{ color: 'var(--red)' }}>{fmt(e.fat)}g F</span> : null}
                          {!e.protein && !e.carbs && !e.fat ? 'No macros logged' : null}
                        </div>
                      </div>
                    </div>
                    {!state.selectMode && (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="entry-cal" style={{ color: col }}>{e.cal}</div>
                        <div
                          className="entry-edit"
                          title="Edit"
                          onClick={(ev) => { ev.stopPropagation(); openEdit(i); }}
                        >✏️</div>
                        <div
                          className="entry-edit"
                          title="Duplicate"
                          style={{ background: 'rgba(167,139,250,0.1)', borderColor: 'rgba(167,139,250,0.2)', color: 'var(--purple)' }}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            dispatch({ type: 'DUPLICATE_ENTRY', idx: i });
                            toast(`Duplicated ${e.name}`);
                          }}
                        >📋</div>
                        <div
                          className="entry-del"
                          onClick={(ev) => { ev.stopPropagation(); dispatch({ type: 'DELETE_ENTRY', idx: i }); }}
                        >✕</div>
                      </div>
                    )}
                    {state.selectMode && (
                      <div className="entry-cal" style={{ color: col }}>{e.cal}</div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Saved Meals */}
          <button className="btn btn-secondary" style={{ marginTop: 4 }} onClick={() => goTo('meals')}>
            🍱 &nbsp;Saved Meals
          </button>
        </div>
      </div>

      {/* Edit modal */}
      {editEntry && editDraft && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) cancelEdit(); }}
        >
          <div className="modal-sheet">
            <div className="modal-title">Edit Entry</div>
            <div className="modal-field" style={{ marginBottom: 10 }}>
              <label>Food Name</label>
              <input
                className="input-field"
                type="text"
                value={editDraft.name}
                onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
              />
            </div>
            <div className="modal-field" style={{ marginBottom: 10 }}>
              <label>Calories (kcal)</label>
              <input
                className="input-field"
                type="number"
                value={editDraft.cal}
                onChange={(e) => setEditDraft({ ...editDraft, cal: e.target.value })}
              />
            </div>
            <div className="modal-grid">
              {[
                { key: 'protein', label: 'Protein (g)', color: 'rgba(94,184,255,0.2)' },
                { key: 'carbs',   label: 'Carbs (g)',   color: 'rgba(249,199,64,0.2)' },
                { key: 'fat',     label: 'Fat (g)',     color: 'rgba(255,107,107,0.2)' },
                { key: 'fiber',   label: 'Fiber (g)',   color: 'rgba(46,229,160,0.2)' },
              ].map((f) => (
                <div key={f.key} className="modal-field">
                  <label style={{ color: f.color.replace('0.2', '1').replace('rgba', 'rgba') }}>{f.label}</label>
                  <input
                    className="input-field"
                    type="number"
                    value={editDraft[f.key]}
                    onChange={(e) => setEditDraft({ ...editDraft, [f.key]: e.target.value })}
                    style={{ borderColor: f.color }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={cancelEdit}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="home" />
    </>
  );
}

import { useState } from 'react';
import { Settings, Camera, ScanBarcode, Pencil, Brain, UtensilsCrossed, Check, Copy, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import FoodIcon from '../components/FoodIcon';
import { totals, pct, progressColor, macroColor, fmt } from '../utils/helpers';

export default function HomeScreen() {
  const {
    entries, updateEntries, goal, goTo, toast,
    selectMode, setSelectMode, selectedIdxs, setSelectedIdxs,
    editIdx, setEditIdx, updateMeals,
  } = useApp();

  const t = totals(entries);
  const p = pct(t.cal, goal);
  const col = progressColor(p);
  const remaining = goal - t.cal;
  const statusText = p >= 100 ? 'Over limit' : p >= 80 ? 'Almost full' : 'On track';
  const statusBg = p >= 100 ? 'rgba(255,107,107,0.12)' : p >= 80 ? 'rgba(249,199,64,0.12)' : 'rgba(46,229,160,0.12)';

  const macros = [
    { key: 'protein', label: 'Protein', val: t.protein },
    { key: 'carbs', label: 'Carbs', val: t.carbs },
    { key: 'fat', label: 'Fat', val: t.fat },
    { key: 'fiber', label: 'Fiber', val: t.fiber },
  ];

  const editEntry = editIdx !== null ? entries[editIdx] : null;
  const [edName, setEdName] = useState('');
  const [edCal, setEdCal] = useState('');
  const [edProtein, setEdProtein] = useState('');
  const [edCarbs, setEdCarbs] = useState('');
  const [edFat, setEdFat] = useState('');
  const [edFiber, setEdFiber] = useState('');

  function openEdit(idx) {
    const e = entries[idx];
    setEdName(e.name);
    setEdCal(e.cal);
    setEdProtein(e.protein || 0);
    setEdCarbs(e.carbs || 0);
    setEdFat(e.fat || 0);
    setEdFiber(e.fiber || 0);
    setEditIdx(idx);
  }

  function saveEdit() {
    if (!edName.trim()) { toast('Enter a food name', 'error'); return; }
    const cal = parseInt(edCal);
    if (!cal || cal <= 0) { toast('Enter valid calories', 'error'); return; }
    updateEntries(prev => {
      const next = [...prev];
      next[editIdx] = {
        ...next[editIdx],
        name: edName.trim(), cal,
        protein: parseFloat(edProtein) || 0,
        carbs: parseFloat(edCarbs) || 0,
        fat: parseFloat(edFat) || 0,
        fiber: parseFloat(edFiber) || 0,
      };
      return next;
    });
    setEditIdx(null);
    toast('Entry updated!');
  }

  function toggleSelect(idx) {
    setSelectedIdxs(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function saveAsMeal() {
    if (selectedIdxs.size === 0) return;
    const mealName = window.prompt('Name this meal:', 'My Meal');
    if (!mealName) return;
    const items = [...selectedIdxs].map(i => ({ ...entries[i] }));
    updateMeals(prev => [...prev, { id: Date.now(), name: mealName.trim(), items }]);
    setSelectMode(false);
    setSelectedIdxs(new Set());
    toast(`Saved "${mealName}" as a meal`);
  }

  return (
    <>
      <div className="screen">
        <div className="screen-inner">
          <div className="home-header">
            <div>
              <div className="home-date">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <h1 className="brand">CalCount</h1>
            </div>
            <div className="settings-btn" onClick={() => goTo('settings')}><Settings size={16} /></div>
          </div>

          <div className="card cal-card">
            <div className="label" style={{ marginBottom: 10 }}>Calories</div>
            <div className="cal-numbers">
              <div className="cal-big" style={{ color: col }}>{t.cal}</div>
              <div className="cal-goal">/ {goal} kcal</div>
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

          <div className="macro-grid" style={{ marginBottom: 14 }}>
            {macros.map(m => (
              <div className="macro-item" key={m.key}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="macro-dot" style={{ background: macroColor(m.key) }} />
                  <span className="label">{m.label}</span>
                </div>
                <div className="macro-val" style={{ color: macroColor(m.key) }}>
                  {fmt(m.val)}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text2)' }}>g</span>
                </div>
                <div className="macro-bar-track">
                  <div className="macro-bar-fill" style={{ width: `${Math.min((m.val / 150) * 100, 100)}%`, background: macroColor(m.key) }} />
                </div>
              </div>
            ))}
          </div>

          <div className="scan-btn-row">
            <div className="scan-split-btn scan-split-label" onClick={() => goTo('scan')}>
              <span className="scan-split-icon"><Camera size={28} /></span>
              <span className="scan-split-title">Nutrition Label</span>
              <span className="scan-split-sub">AI scan</span>
            </div>
            <div className="scan-split-btn scan-split-barcode" onClick={() => goTo('barcode')}>
              <span className="scan-split-icon"><ScanBarcode size={28} /></span>
              <span className="scan-split-title">Barcode</span>
              <span className="scan-split-sub">Product lookup</span>
            </div>
          </div>

          <button className="btn btn-secondary" style={{ marginBottom: 10 }} onClick={() => goTo('manual')}>
            <Pencil size={15} /> Add Manually
          </button>

          <button
            className="btn btn-secondary"
            style={{ marginBottom: 20, borderColor: 'rgba(167,139,250,0.3)', color: 'var(--purple)' }}
            onClick={() => goTo('describe')}
          >
            <Brain size={15} /> Describe a Food — AI Estimates
          </button>

          <div className="card" style={{ padding: '14px 18px' }}>
            <div className="entries-header">
              <span className="label">Food Log · {entries.length} items</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {entries.length > 1 && (
                  <button className="clear-btn" style={{ color: 'var(--blue)' }} onClick={() => { setSelectMode(true); setSelectedIdxs(new Set()); }}>
                    Select
                  </button>
                )}
                {entries.length > 0 && (
                  <button className="clear-btn" onClick={() => { updateEntries([]); }}>Clear</button>
                )}
              </div>
            </div>

            {selectMode && (
              <div className="select-bar">
                <div className="select-count">{selectedIdxs.size} selected</div>
                <div className="select-actions">
                  <button className="sel-action-btn" style={{ background: 'var(--bg3)', color: 'var(--text2)' }} onClick={() => { setSelectMode(false); setSelectedIdxs(new Set()); }}>Cancel</button>
                  <button className="sel-action-btn" style={{ background: 'rgba(46,229,160,0.15)', color: 'var(--green)', opacity: selectedIdxs.size === 0 ? 0.4 : 1 }} onClick={saveAsMeal} disabled={selectedIdxs.size === 0}>Save as Meal</button>
                </div>
              </div>
            )}

            {entries.length === 0 ? (
              <div className="empty-state">No entries yet.<br />Scan a label or add manually.</div>
            ) : (
              entries.map((e, i) => {
                const isChecked = selectedIdxs.has(i);
                return (
                  <div
                    key={e.id}
                    className="entry-item"
                    style={selectMode ? { cursor: 'pointer' } : {}}
                    onClick={selectMode ? () => toggleSelect(i) : undefined}
                  >
                    {selectMode && (
                      <div
                        className={`entry-checkbox ${isChecked ? 'checked' : ''}`}
                        onClick={e2 => { e2.stopPropagation(); toggleSelect(i); }}
                      >
                        {isChecked ? <Check size={13} /> : null}
                      </div>
                    )}
                    <div className="entry-left">
                      <div className="entry-avatar" style={{ background: 'var(--bg3)' }}>
                        <FoodIcon name={e.name} size={18} />
                      </div>
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
                    {!selectMode ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="entry-cal" style={{ color: col }}>{e.cal}</div>
                        <div className="entry-edit" title="Edit" onClick={ev => { ev.stopPropagation(); openEdit(i); }}>
                          <Pencil size={14} />
                        </div>
                        <div
                          className="entry-edit"
                          title="Duplicate"
                          style={{ background: 'rgba(167,139,250,0.1)', borderColor: 'rgba(167,139,250,0.2)', color: 'var(--purple)' }}
                          onClick={ev => {
                            ev.stopPropagation();
                            updateEntries(prev => {
                              const next = [...prev];
                              next.splice(i + 1, 0, { ...prev[i], id: Date.now() });
                              return next;
                            });
                            toast(`Duplicated ${e.name}`);
                          }}
                        >
                          <Copy size={14} />
                        </div>
                        <div className="entry-del" onClick={ev => { ev.stopPropagation(); updateEntries(prev => prev.filter((_, idx) => idx !== i)); }}>
                          <X size={13} />
                        </div>
                      </div>
                    ) : (
                      <div className="entry-cal" style={{ color: col }}>{e.cal}</div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <button className="btn btn-secondary" style={{ marginTop: 4 }} onClick={() => goTo('meals')}>
            <UtensilsCrossed size={15} /> Saved Meals
          </button>
        </div>
      </div>

      {editEntry && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setEditIdx(null); }}>
          <div className="modal-sheet">
            <div className="modal-title">Edit Entry</div>
            <div className="modal-field" style={{ marginBottom: 10 }}>
              <label>Food Name</label>
              <input className="input-field" type="text" value={edName} onChange={e => setEdName(e.target.value)} />
            </div>
            <div className="modal-field" style={{ marginBottom: 10 }}>
              <label>Calories (kcal)</label>
              <input className="input-field" type="number" value={edCal} onChange={e => setEdCal(e.target.value)} />
            </div>
            <div className="modal-grid">
              <div className="modal-field">
                <label style={{ color: 'var(--blue)' }}>Protein (g)</label>
                <input className="input-field" type="number" value={edProtein} onChange={e => setEdProtein(e.target.value)} style={{ borderColor: 'rgba(94,184,255,0.2)' }} />
              </div>
              <div className="modal-field">
                <label style={{ color: 'var(--amber)' }}>Carbs (g)</label>
                <input className="input-field" type="number" value={edCarbs} onChange={e => setEdCarbs(e.target.value)} style={{ borderColor: 'rgba(249,199,64,0.2)' }} />
              </div>
              <div className="modal-field">
                <label style={{ color: 'var(--red)' }}>Fat (g)</label>
                <input className="input-field" type="number" value={edFat} onChange={e => setEdFat(e.target.value)} style={{ borderColor: 'rgba(255,107,107,0.2)' }} />
              </div>
              <div className="modal-field">
                <label style={{ color: 'var(--green)' }}>Fiber (g)</label>
                <input className="input-field" type="number" value={edFiber} onChange={e => setEdFiber(e.target.value)} style={{ borderColor: 'rgba(46,229,160,0.2)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditIdx(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="home" />
    </>
  );
}

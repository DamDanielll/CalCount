import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import BottomNav from '../components/BottomNav';

export default function SettingsScreen() {
  const { state, dispatch, goTo } = useApp();
  const toast = useToast();
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [showKeyEditor,  setShowKeyEditor]  = useState(false);
  const [newGoal, setNewGoal] = useState(state.goal);
  const [newKey,  setNewKey]  = useState(state.apiKey);

  function saveGoal() {
    const g = parseInt(newGoal);
    if (!g || g < 100) { toast('Enter a valid goal', 'error'); return; }
    dispatch({ type: 'SET_GOAL', goal: g });
    toast('Goal updated!');
    setShowGoalEditor(false);
  }

  function saveKey() {
    const k = newKey.trim();
    if (!k.startsWith('sk-ant-')) { toast('Invalid API key', 'error'); return; }
    dispatch({ type: 'SET_API_KEY', apiKey: k });
    toast('API key updated!');
    setShowKeyEditor(false);
  }

  function clearData() {
    if (!confirm("Clear all of today's entries?")) return;
    dispatch({ type: 'CLEAR_ENTRIES' });
    toast('Cleared!');
    goTo('home');
  }

  return (
    <>
      <div className="screen">
        <div className="screen-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, paddingTop: 8 }}>
            <div className="back-btn" onClick={() => goTo('home')}>←</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: '0.06em' }}>
              Settings
            </div>
          </div>

          <div className="card">
            <div className="settings-item" onClick={() => setShowGoalEditor((v) => !v)}>
              <div>
                <div className="settings-label">Daily Calorie Goal</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Your target for today</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="settings-value">{state.goal} kcal</div>
                <div className="settings-arrow">›</div>
              </div>
            </div>

            <div className="settings-item" onClick={() => setShowKeyEditor((v) => !v)}>
              <div>
                <div className="settings-label">API Key</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                  sk-ant-...{state.apiKey.slice(-6)}
                </div>
              </div>
              <div className="settings-arrow">›</div>
            </div>
          </div>

          {showGoalEditor && (
            <div>
              <div className="form-field">
                <label>New Calorie Goal</label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="2000"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  autoFocus
                />
              </div>
              <button className="btn btn-primary" style={{ marginBottom: 10 }} onClick={saveGoal}>
                Save Goal
              </button>
            </div>
          )}

          {showKeyEditor && (
            <div>
              <div className="form-field">
                <label>New API Key</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="sk-ant-..."
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  autoFocus
                />
              </div>
              <button className="btn btn-primary" style={{ marginBottom: 10 }} onClick={saveKey}>
                Save Key
              </button>
            </div>
          )}

          <div className="card" style={{ marginTop: 0 }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
              📱 <strong style={{ color: 'var(--text2)' }}>Add to Home Screen</strong><br />
              In Safari: tap Share → "Add to Home Screen" to install as an app.<br /><br />
              💾 <strong style={{ color: 'var(--text2)' }}>Data Storage</strong><br />
              All data is saved locally on your device. Logs reset each day automatically.<br /><br />
              💰 <strong style={{ color: 'var(--text2)' }}>API Cost</strong><br />
              Each label scan costs ~$0.001. Your $5 free credit lasts years at typical usage.
            </div>
          </div>

          <button className="btn btn-danger" style={{ marginTop: 8 }} onClick={clearData}>
            Clear All Today's Data
          </button>
        </div>
      </div>

      <BottomNav active="settings" />
    </>
  );
}

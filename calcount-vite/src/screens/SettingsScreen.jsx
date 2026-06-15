import { useState } from 'react';
import { ArrowLeft, Smartphone, Save, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

const InfoIcon = ({ icon: Icon }) => (
  <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: 4 }}>
    <Icon size={13} />
  </span>
);

export default function SettingsScreen() {
  const { goal, setGoal, apiKey, setApiKey, updateEntries, goTo, toast } = useApp();
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [showKeyEditor, setShowKeyEditor] = useState(false);
  const [newGoal, setNewGoal] = useState(goal);
  const [newKey, setNewKey] = useState(apiKey);

  function saveGoal() {
    const g = parseInt(newGoal);
    if (!g || g < 100) { toast('Enter a valid goal', 'error'); return; }
    setGoal(g);
    toast('Goal updated!');
    setShowGoalEditor(false);
  }

  function saveKey() {
    const k = newKey.trim();
    if (!k.startsWith('sk-ant-')) { toast('Invalid API key', 'error'); return; }
    setApiKey(k);
    toast('API key updated!');
    setShowKeyEditor(false);
  }

  function clearData() {
    if (!window.confirm("Clear all of today's entries?")) return;
    updateEntries([]);
    toast('Cleared!');
    goTo('home');
  }

  return (
    <>
      <div className="screen">
        <div className="screen-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, paddingTop: 8 }}>
            <div className="back-btn" onClick={() => goTo('home')}><ArrowLeft size={18} /></div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: '0.06em' }}>Settings</div>
          </div>

          <div className="card">
            <div className="settings-item" onClick={() => setShowGoalEditor(v => !v)}>
              <div>
                <div className="settings-label">Daily Calorie Goal</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Your target for today</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="settings-value">{goal} kcal</div>
                <div className="settings-arrow">›</div>
              </div>
            </div>
            <div className="settings-item" onClick={() => setShowKeyEditor(v => !v)}>
              <div>
                <div className="settings-label">API Key</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>sk-ant-...{apiKey.slice(-6)}</div>
              </div>
              <div className="settings-arrow">›</div>
            </div>
          </div>

          {showGoalEditor && (
            <div>
              <div className="form-field">
                <label>New Calorie Goal</label>
                <input className="input-field" type="number" placeholder="2000" value={newGoal} onChange={e => setNewGoal(e.target.value)} />
              </div>
              <button className="btn btn-primary" style={{ marginBottom: 10 }} onClick={saveGoal}>Save Goal</button>
            </div>
          )}

          {showKeyEditor && (
            <div>
              <div className="form-field">
                <label>New API Key</label>
                <input className="input-field" type="password" placeholder="sk-ant-..." value={newKey} onChange={e => setNewKey(e.target.value)} />
              </div>
              <button className="btn btn-primary" style={{ marginBottom: 10 }} onClick={saveKey}>Save Key</button>
            </div>
          )}

          <div className="card" style={{ marginTop: 0 }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.8 }}>
              <InfoIcon icon={Smartphone} /><strong style={{ color: 'var(--text2)' }}>Add to Home Screen</strong><br />
              In Safari: tap Share → "Add to Home Screen" to install as an app.<br /><br />
              <InfoIcon icon={Save} /><strong style={{ color: 'var(--text2)' }}>Data Storage</strong><br />
              All data is saved locally on your device. Logs reset each day automatically.<br /><br />
              <InfoIcon icon={DollarSign} /><strong style={{ color: 'var(--text2)' }}>API Cost</strong><br />
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

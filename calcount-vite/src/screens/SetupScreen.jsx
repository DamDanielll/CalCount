import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function SetupScreen() {
  const { apiKey, setApiKey, goal, setGoal, goTo, toast } = useApp();
  const [keyVal, setKeyVal] = useState(apiKey);
  const [goalVal, setGoalVal] = useState(goal || '');

  function handleSave() {
    const key = keyVal.trim();
    const g = parseInt(goalVal);
    if (!key.startsWith('sk-ant-')) { toast('Enter a valid API key (starts with sk-ant-)', 'error'); return; }
    if (!g || g < 100) { toast('Enter a calorie goal (e.g. 2000)', 'error'); return; }
    setApiKey(key);
    setGoal(g);
    goTo('home');
  }

  return (
    <div className="setup-wrap">
      <div className="setup-logo">🔢</div>
      <div className="setup-title">CalCount</div>
      <p className="setup-sub">Scan any nutrition label with your camera — AI reads it instantly. Track calories and macros all day.</p>

      <div className="setup-field">
        <label>Anthropic API Key</label>
        <input
          className="input-field"
          type="password"
          placeholder="sk-ant-..."
          value={keyVal}
          onChange={e => setKeyVal(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <p className="api-note">
          Get a free key at{' '}
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">console.anthropic.com</a>
          {' '}— stored only on your device, never shared.
        </p>
      </div>

      <div className="setup-field">
        <label>Daily Calorie Goal</label>
        <input
          className="input-field"
          type="number"
          placeholder="2000"
          value={goalVal}
          onChange={e => setGoalVal(e.target.value)}
        />
      </div>

      <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={handleSave}>
        Get Started →
      </button>
    </div>
  );
}

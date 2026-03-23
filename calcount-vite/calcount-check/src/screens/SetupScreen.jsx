import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';

export default function SetupScreen() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const [key, setKey] = useState(state.apiKey);
  const [goal, setGoal] = useState(state.goal || '');

  function handleSave() {
    const k = key.trim();
    const g = parseInt(goal);
    if (!k.startsWith('sk-ant-')) {
      toast('Enter a valid API key (starts with sk-ant-)', 'error');
      return;
    }
    if (!g || g < 100) {
      toast('Enter a calorie goal (e.g. 2000)', 'error');
      return;
    }
    dispatch({ type: 'SETUP_SAVE', apiKey: k, goal: g });
  }

  return (
    <div className="setup-wrap">
      <div className="setup-logo">🔢</div>
      <div className="setup-title">CalCount</div>
      <p className="setup-sub">
        Scan any nutrition label with your camera — AI reads it instantly. Track calories and
        macros all day.
      </p>

      <div className="setup-field">
        <label>Anthropic API Key</label>
        <input
          className="input-field"
          type="password"
          placeholder="sk-ant-..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <p className="api-note">
          Get a free key at{' '}
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">
            console.anthropic.com
          </a>{' '}
          — stored only on your device, never shared.
        </p>
      </div>

      <div className="setup-field">
        <label>Daily Calorie Goal</label>
        <input
          className="input-field"
          type="number"
          placeholder="2000"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
      </div>

      <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={handleSave}>
        Get Started →
      </button>
    </div>
  );
}

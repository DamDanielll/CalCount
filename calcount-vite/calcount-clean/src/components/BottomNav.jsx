import { useApp } from '../context/AppContext';

const TABS = [
  { id: 'home',    icon: '📊', label: 'Today' },
  { id: 'scan',    icon: '📷', label: 'Scan' },
  { id: 'history', icon: '📅', label: 'History' },
  { id: 'settings',icon: '⚙️', label: 'Settings' },
];

export default function BottomNav({ active }) {
  const { goTo } = useApp();
  return (
    <div className="bottom-nav">
      {TABS.map((t) => (
        <div
          key={t.id}
          className={`nav-item ${active === t.id ? 'active' : ''}`}
          onClick={() => goTo(t.id)}
        >
          <div className="nav-icon">{t.icon}</div>
          <div className="nav-label">{t.label}</div>
        </div>
      ))}
    </div>
  );
}

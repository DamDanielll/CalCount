import { useApp } from '../context/AppContext';

export default function BottomNav({ active }) {
  const { goTo } = useApp();

  const items = [
    { key: 'home', icon: '📊', label: 'Today' },
    { key: 'scan', icon: '📷', label: 'Scan' },
    { key: 'history', icon: '📅', label: 'History' },
    { key: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="bottom-nav">
      {items.map(item => (
        <div
          key={item.key}
          className={`nav-item ${active === item.key ? 'active' : ''}`}
          onClick={() => goTo(item.key)}
        >
          <div className="nav-icon">{item.icon}</div>
          <div className="nav-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

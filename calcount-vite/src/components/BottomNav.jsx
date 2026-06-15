import { BarChart2, Camera, Calendar, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav({ active }) {
  const { goTo } = useApp();

  const items = [
    { key: 'home', icon: <BarChart2 size={22} />, label: 'Today' },
    { key: 'scan', icon: <Camera size={22} />, label: 'Scan' },
    { key: 'history', icon: <Calendar size={22} />, label: 'History' },
    { key: 'settings', icon: <Settings size={22} />, label: 'Settings' },
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

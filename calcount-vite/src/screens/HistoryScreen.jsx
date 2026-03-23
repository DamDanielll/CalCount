import { useState } from 'react';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import { getPastDays } from '../utils/storage';
import { fmt, formatHistDate, progressColor, pct } from '../utils/helpers';

export default function HistoryScreen() {
  const { goal, updateEntries, toast } = useApp();
  const [expanded, setExpanded] = useState({});
  const days = getPastDays();

  function toggleDay(date) {
    setExpanded(prev => ({ ...prev, [date]: !prev[date] }));
  }

  function readdEntry(date, idx) {
    const past = JSON.parse(localStorage.getItem('ns_entries_' + date) || '[]');
    const entry = past[idx];
    if (!entry) return;
    updateEntries(prev => [...prev, { ...entry, id: Date.now() }]);
    toast(`Added ${entry.name} — ${entry.cal} kcal`);
  }

  function readdAll(date) {
    const past = JSON.parse(localStorage.getItem('ns_entries_' + date) || '[]');
    updateEntries(prev => [...prev, ...past.map(e => ({ ...e, id: Date.now() + Math.random() }))]);
    toast(`Added ${past.length} items to today`);
  }

  return (
    <>
      <div className="screen">
        <div className="screen-inner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingTop: 8 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>Previous Days</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: '0.06em' }}>History</div>
            </div>
          </div>

          {days.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 60 }}>No previous logs yet.<br />Come back tomorrow!</div>
          ) : (
            days.map(day => {
              const totalCal = day.entries.reduce((s, e) => s + e.cal, 0);
              const totalP = day.entries.reduce((s, e) => s + (e.protein || 0), 0);
              const totalC = day.entries.reduce((s, e) => s + (e.carbs || 0), 0);
              const totalF = day.entries.reduce((s, e) => s + (e.fat || 0), 0);
              const p = pct(totalCal, goal);
              const col = progressColor(p);
              const isOpen = !!expanded[day.date];

              return (
                <div className="hist-day" key={day.date}>
                  <div className="hist-day-header" onClick={() => toggleDay(day.date)}>
                    <div className="hist-day-left">
                      <div className="hist-day-date">{formatHistDate(day.date)}</div>
                      <div className="hist-day-meta">{day.entries.length} items · P:{fmt(totalP)}g C:{fmt(totalC)}g F:{fmt(totalF)}g</div>
                    </div>
                    <div className="hist-day-right">
                      <div className="hist-day-cal" style={{ color: col }}>{totalCal} kcal</div>
                      <div className="hist-chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="hist-entries">
                      {day.entries.map((e, i) => (
                        <div className="hist-entry" key={i}>
                          <div>
                            <div className="hist-entry-name">{e.name}</div>
                            <div className="hist-entry-macros">
                              {e.protein ? <span style={{ color: 'var(--blue)' }}>{fmt(e.protein)}g P</span> : null}
                              {e.protein && e.carbs ? ' · ' : null}
                              {e.carbs ? <span style={{ color: 'var(--amber)' }}>{fmt(e.carbs)}g C</span> : null}
                              {(e.protein || e.carbs) && e.fat ? ' · ' : null}
                              {e.fat ? <span style={{ color: 'var(--red)' }}>{fmt(e.fat)}g F</span> : null}
                            </div>
                          </div>
                          <div className="hist-entry-right">
                            <div className="hist-entry-cal">{e.cal}</div>
                            <button className="readd-btn" onClick={() => readdEntry(day.date, i)}>📋 Copy</button>
                          </div>
                        </div>
                      ))}
                      <button className="readd-all-btn" onClick={() => readdAll(day.date)}>
                        📋 Copy All to Today
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <BottomNav active="history" />
    </>
  );
}

import { ArrowLeft, Lightbulb, UtensilsCrossed, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import { mealTotals, fmt } from '../utils/helpers';

export default function MealsScreen() {
  const { meals, updateMeals, updateEntries, goTo, toast } = useApp();

  function addMeal(meal) {
    updateEntries(prev => [...prev, ...meal.items.map(item => ({ ...item, id: Date.now() + Math.random() }))]);
    toast(`Added ${meal.name} — ${mealTotals(meal.items).cal} kcal`);
    goTo('home');
  }

  function deleteMeal(id) {
    if (!window.confirm('Delete this meal?')) return;
    updateMeals(prev => prev.filter(m => m.id !== id));
  }

  return (
    <>
      <div className="screen">
        <div className="screen-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingTop: 8 }}>
            <div className="back-btn" onClick={() => goTo('home')}><ArrowLeft size={18} /></div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>Quick Add</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: '0.06em' }}>Saved Meals</div>
            </div>
          </div>

          <div className="card" style={{ padding: '14px 16px', marginBottom: 16, borderColor: 'rgba(46,229,160,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
              <Lightbulb size={14} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                <strong style={{ color: 'var(--text)' }}>How to save a meal:</strong> Go to Today → tap{' '}
                <span style={{ color: 'var(--blue)', fontWeight: 600 }}>Select</span> next to the food log → check entries → tap{' '}
                <span style={{ color: 'var(--green)', fontWeight: 600 }}>Save as Meal</span>
              </span>
            </div>
          </div>

          {meals.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 60 }}>
              No saved meals yet.<br />
              <span style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                Go to Today's log → tap <strong style={{ color: 'var(--blue)' }}>Select</strong> → pick entries → <strong style={{ color: 'var(--green)' }}>Save as Meal</strong>
              </span>
            </div>
          ) : (
            meals.map(m => {
              const t = mealTotals(m.items);
              return (
                <div className="meal-item" key={m.id}>
                  <div className="meal-icon"><UtensilsCrossed size={20} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="meal-name">{m.name}</div>
                    <div className="meal-meta">{m.items.length} items · P:{fmt(t.protein)}g C:{fmt(t.carbs)}g F:{fmt(t.fat)}g</div>
                  </div>
                  <div className="meal-actions">
                    <button className="meal-add-btn" onClick={() => addMeal(m)}>+ Add {t.cal} kcal</button>
                    <div className="meal-del-btn" onClick={() => deleteMeal(m.id)}><X size={14} /></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <BottomNav active="meals" />
    </>
  );
}

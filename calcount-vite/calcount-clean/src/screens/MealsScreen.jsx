import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import BottomNav from '../components/BottomNav';
import { mealTotals, fmt } from '../utils/helpers';

export default function MealsScreen() {
  const { state, dispatch, goTo } = useApp();
  const toast = useToast();

  function addMeal(meal) {
    dispatch({ type: 'ADD_MEAL_ENTRIES', items: meal.items });
    toast(`Added ${meal.name} — ${mealTotals(meal.items).cal} kcal`);
    goTo('home');
  }

  function deleteMeal(id) {
    if (!confirm('Delete this meal?')) return;
    dispatch({ type: 'DELETE_MEAL', id });
  }

  return (
    <>
      <div className="screen">
        <div className="screen-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingTop: 8 }}>
            <div className="back-btn" onClick={() => goTo('home')}>←</div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>Quick Add</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: '0.06em' }}>
                Saved Meals
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '14px 16px', marginBottom: 16, borderColor: 'rgba(46,229,160,0.15)' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
              💡 <strong style={{ color: 'var(--text)' }}>How to save a meal:</strong> Go to Today → tap{' '}
              <span style={{ color: 'var(--blue)', fontWeight: 600 }}>Select</span> next to the food log → check
              the entries you want → tap{' '}
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>Save as Meal</span>
            </div>
          </div>

          {state.meals.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 60 }}>
              No saved meals yet.<br />
              <span style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                Go to Today's log → tap <strong style={{ color: 'var(--blue)' }}>Select</strong> → pick entries →{' '}
                <strong style={{ color: 'var(--green)' }}>Save as Meal</strong>
              </span>
            </div>
          ) : (
            state.meals.map((m) => {
              const t = mealTotals(m.items);
              return (
                <div key={m.id} className="meal-item">
                  <div className="meal-icon">🍱</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="meal-name">{m.name}</div>
                    <div className="meal-meta">
                      {m.items.length} items · P:{fmt(t.protein)}g C:{fmt(t.carbs)}g F:{fmt(t.fat)}g
                    </div>
                  </div>
                  <div className="meal-actions">
                    <button className="meal-add-btn" onClick={() => addMeal(m)}>
                      + Add {t.cal} kcal
                    </button>
                    <div className="meal-del-btn" onClick={() => deleteMeal(m.id)}>✕</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <BottomNav active="home" />
    </>
  );
}

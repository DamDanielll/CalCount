import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ManualScreen() {
  const { updateEntries, goTo, toast, barcodeData, setBarcodeData } = useApp();
  const [name, setName] = useState('');
  const [cal, setCal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [fromBarcode, setFromBarcode] = useState(false);

  useEffect(() => {
    if (barcodeData) {
      setName(barcodeData.name || '');
      setCal(barcodeData.calories ? String(barcodeData.calories) : '');
      setProtein(barcodeData.protein ? String(barcodeData.protein) : '');
      setCarbs(barcodeData.carbs ? String(barcodeData.carbs) : '');
      setFat(barcodeData.fat ? String(barcodeData.fat) : '');
      setFiber(barcodeData.fiber ? String(barcodeData.fiber) : '');
      setFromBarcode(true);
      setBarcodeData(null);
    }
  }, []);

  const macroFields = [
    { id: 'protein', label: 'Protein', color: 'var(--blue)', val: protein, set: setProtein },
    { id: 'carbs', label: 'Carbs', color: 'var(--amber)', val: carbs, set: setCarbs },
    { id: 'fat', label: 'Fat', color: 'var(--red)', val: fat, set: setFat },
    { id: 'fiber', label: 'Fiber', color: 'var(--green)', val: fiber, set: setFiber },
  ];

  function handleAdd() {
    if (!name.trim()) { toast('Enter a food name', 'error'); return; }
    const calories = parseInt(cal);
    if (!calories || calories <= 0) { toast('Enter calories', 'error'); return; }
    updateEntries(prev => [...prev, {
      id: Date.now(), name: name.trim(), cal: calories,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      fiber: parseFloat(fiber) || 0,
    }]);
    toast(`Added ${name} — ${calories} kcal`);
    goTo('home');
  }

  return (
    <div className="review-screen">
      <div className="review-header" style={{ marginBottom: 20 }}>
        <div className="back-btn" onClick={() => goTo('home')}><ArrowLeft size={18} /></div>
        <div>
          <div className="label">Add Entry</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.06em' }}>
            {fromBarcode ? 'Barcode Lookup' : 'Manual Entry'}
          </div>
          {fromBarcode && (
            <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 2 }}>Auto-filled from barcode scan — edit if needed</div>
          )}
        </div>
      </div>

      <div className="form-field">
        <label>Food Name</label>
        <input className="input-field" type="text" placeholder="e.g. Chicken Breast" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="form-field">
        <label>Calories (kcal)</label>
        <input className="input-field" type="number" placeholder="e.g. 165" value={cal} onChange={e => setCal(e.target.value)} />
      </div>

      <div className="label" style={{ marginBottom: 12, marginTop: 4 }}>Macros (optional)</div>
      <div className="macro-inputs" style={{ marginBottom: 20 }}>
        {macroFields.map(f => (
          <div className="macro-input-wrap" key={f.id}>
            <label>
              <div className="macro-dot" style={{ background: f.color }} />
              {f.label} (g)
            </label>
            <input
              className="input-field"
              type="number"
              placeholder="0"
              value={f.val}
              onChange={e => f.set(e.target.value)}
              style={{ borderColor: `${f.color}28` }}
            />
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={handleAdd}>Add to Log</button>
      <div style={{ height: 20 }} />
    </div>
  );
}

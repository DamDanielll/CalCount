import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { useApp } from '../context/AppContext';
import { lookupBarcode } from '../utils/barcode';

export default function BarcodeScreen() {
  const { goTo, toast, setBarcodeData } = useApp();
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const handledRef = useRef(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, []);

  async function startScanning() {
    handledRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      const reader = new BrowserMultiFormatReader();
      controlsRef.current = await reader.decodeFromStream(stream, videoRef.current, (result) => {
        if (result && !handledRef.current) {
          handledRef.current = true;
          handleBarcode(result.getText());
        }
      });
    } catch {
      toast('Camera access denied — enter barcode manually', 'error');
    }
  }

  function stopScanning() {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
  }

  async function handleBarcode(code) {
    stopScanning();
    setLoading(true);
    try {
      const product = await lookupBarcode(code);
      setBarcodeData(product);
      toast(`Found: ${product.name}`);
      goTo('manual');
    } catch (err) {
      setLoading(false);
      if (err.notFound) {
        toast('Product not found — enter nutrition manually', 'error');
      } else {
        toast('Lookup failed — check your connection', 'error');
      }
      startScanning();
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    const code = manualCode.trim();
    if (code) handleBarcode(code);
  }

  return (
    <div className="scan-screen">
      <video ref={videoRef} className="scan-video" playsInline autoPlay muted />

      <div className="scan-overlay">
        <div className="scan-frame barcode-frame"><span /></div>
        <div className="scan-hint">Align barcode within the frame</div>
      </div>

      {loading && (
        <div className="processing-overlay">
          <div className="spinner" />
          <div className="processing-text">Looking up product…</div>
          <div className="scan-processing-hint">Fetching nutrition data from Open Food Facts</div>
        </div>
      )}

      <div className="barcode-manual-entry">
        <form onSubmit={handleManualSubmit}>
          <input
            className="input-field barcode-input"
            type="tel"
            inputMode="numeric"
            placeholder="Or type barcode number (e.g. 0123456789012)"
            value={manualCode}
            onChange={e => setManualCode(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
            Look Up
          </button>
        </form>
      </div>

      <div className="scan-bar">
        <div className="scan-back" onClick={() => { stopScanning(); goTo('home'); }}>✕</div>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Barcode Lookup
        </div>
        <div style={{ width: 48 }} />
      </div>
    </div>
  );
}

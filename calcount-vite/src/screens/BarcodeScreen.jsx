import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { lookupBarcode } from '../utils/barcode';

export default function BarcodeScreen() {
  const { goTo, toast, setBarcodeData } = useApp();
  const videoRef = useRef(null);
  const localStreamRef = useRef(null);
  const detectorRef = useRef(null);
  const scanningRef = useRef(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasDetector] = useState(() => 'BarcodeDetector' in window);

  useEffect(() => {
    if (hasDetector) {
      detectorRef.current = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'],
      });
    }
    startCamera();
    return () => stopCamera();
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      localStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      if (hasDetector) {
        scanningRef.current = true;
        requestAnimationFrame(scanLoop);
      }
    } catch {
      toast('Camera access denied — enter barcode manually', 'error');
    }
  }

  function stopCamera() {
    scanningRef.current = false;
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
  }

  async function scanLoop() {
    if (!scanningRef.current || !videoRef.current || !detectorRef.current) return;
    const video = videoRef.current;
    if (video.readyState >= video.HAVE_ENOUGH_DATA) {
      try {
        const codes = await detectorRef.current.detect(video);
        if (codes.length > 0 && scanningRef.current) {
          scanningRef.current = false;
          await handleBarcode(codes[0].rawValue);
          return;
        }
      } catch {}
    }
    if (scanningRef.current) requestAnimationFrame(scanLoop);
  }

  async function handleBarcode(code) {
    stopCamera();
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
      // restart camera so user can try another barcode
      startCamera();
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
        <div className="scan-hint">
          {hasDetector ? 'Align barcode within the frame' : 'BarcodeDetector not supported — enter code below'}
        </div>
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
        <div className="scan-back" onClick={() => { stopCamera(); goTo('home'); }}>✕</div>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Barcode Lookup
        </div>
        <div style={{ width: 48 }} />
      </div>
    </div>
  );
}

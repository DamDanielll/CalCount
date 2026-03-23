import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { scanLabel } from '../utils/api';

// Camera stream is kept in a module-level ref so it can be reused across renders
let _stream = null;

export function stopCamera() {
  if (_stream) {
    _stream.getTracks().forEach((t) => t.stop());
    _stream = null;
  }
}

export default function ScanScreen() {
  const { state, dispatch, goTo } = useApp();
  const toast = useToast();
  const videoRef = useRef(null);

  useEffect(() => {
    // Start camera on mount
    if (!state.processing) startCamera();
    // Stop camera when leaving scan screen
    return () => {
      // Only stop if we're navigating away (not just re-rendering)
    };
  }, []);

  // Attach stream to video element after render
  useEffect(() => {
    if (videoRef.current && _stream) {
      videoRef.current.srcObject = _stream;
      videoRef.current.play().catch(() => {});
    }
  });

  async function startCamera() {
    if (_stream) {
      if (videoRef.current && !videoRef.current.srcObject) {
        videoRef.current.srcObject = _stream;
        videoRef.current.play().catch(() => {});
      }
      return;
    }
    try {
      _stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = _stream;
        videoRef.current.play().catch(() => {});
      }
    } catch {
      toast('Camera access denied. Use library instead.', 'error');
    }
  }

  function captureFrame() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    const canvas = document.createElement('canvas');
    const MAX = 1200;
    let w = video.videoWidth;
    let h = video.videoHeight;
    if (w > MAX) { h = Math.round((h * MAX) / w); w = MAX; }
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(video, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.82);
  }

  async function processImage(dataUrl) {
    stopCamera();
    dispatch({ type: 'SET_PROCESSING', value: true });
    // Force re-render to show processing overlay
    try {
      const result = await scanLabel(dataUrl, state.apiKey);
      dispatch({ type: 'SET_SCANNED', scanned: result, capturedImg: dataUrl });
    } catch (err) {
      dispatch({ type: 'SET_PROCESSING', value: false });
      toast('Could not read label: ' + (err.message || 'unknown error'), 'error');
      startCamera();
    }
  }

  function handleCapture() {
    const img = captureFrame();
    if (!img) { toast('Camera not ready', 'error'); return; }
    processImage(img);
  }

  function handleLibrary() {
    document.getElementById('cc-file-input').click();
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => processImage(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleCancel() {
    stopCamera();
    goTo('home');
  }

  return (
    <div className="scan-screen">
      <video ref={videoRef} className="scan-video" playsInline autoPlay muted />

      <div className="scan-overlay">
        <div className="scan-frame"><span /></div>
        <div className="scan-hint">Align nutrition label within the frame</div>
      </div>

      {state.processing && (
        <div className="processing-overlay">
          <div className="spinner" />
          <div className="processing-text">Reading label…</div>
          <div className="scan-processing-hint">Claude AI is extracting calories and macros from your photo</div>
        </div>
      )}

      <div className="scan-bar">
        <div className="scan-back" onClick={handleCancel}>✕</div>
        <div className="capture-btn" onClick={handleCapture}>
          <div className="capture-inner" />
        </div>
        <div className="library-btn" onClick={handleLibrary}>🖼</div>
      </div>

      <input
        id="cc-file-input"
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}

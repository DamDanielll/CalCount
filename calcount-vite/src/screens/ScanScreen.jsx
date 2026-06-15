import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { scanLabel } from '../utils/api';

const STABILITY_THRESHOLD = 8;   // avg pixel diff per channel to consider "still"
const STABILITY_FRAMES = 18;      // consecutive stable frames before auto-capture (~0.6s at 30fps)
const SAMPLE_SIZE = 80;           // downscale canvas for diff comparison

export default function ScanScreen() {
  const {
    goTo, toast, apiKey,
    setScanned, setServings, setCapturedImg,
    processing, setProcessing,
    cameraStreamRef,
  } = useApp();

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const stableCountRef = useRef(0);
  const prevDataRef = useRef(null);
  const rafRef = useRef(null);
  const capturedRef = useRef(false);
  const [stability, setStability] = useState(0); // 0–100 for the indicator

  useEffect(() => {
    startCamera();
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  async function startCamera() {
    capturedRef.current = false;
    stableCountRef.current = 0;
    prevDataRef.current = null;

    if (cameraStreamRef.current) {
      if (videoRef.current && !videoRef.current.srcObject) {
        videoRef.current.srcObject = cameraStreamRef.current;
        videoRef.current.play();
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        cameraStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch {
        toast('Camera access denied. Use library instead.', 'error');
        return;
      }
    }

    rafRef.current = requestAnimationFrame(stabilityLoop);
  }

  function stabilityLoop() {
    if (capturedRef.current) return;
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      rafRef.current = requestAnimationFrame(stabilityLoop);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = SAMPLE_SIZE;
    canvas.height = SAMPLE_SIZE;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

    if (prevDataRef.current) {
      let diff = 0;
      for (let i = 0; i < data.length; i += 4) {
        diff += Math.abs(data[i] - prevDataRef.current[i]);
        diff += Math.abs(data[i + 1] - prevDataRef.current[i + 1]);
        diff += Math.abs(data[i + 2] - prevDataRef.current[i + 2]);
      }
      const avgDiff = diff / (SAMPLE_SIZE * SAMPLE_SIZE * 3);

      if (avgDiff < STABILITY_THRESHOLD) {
        stableCountRef.current += 1;
      } else {
        stableCountRef.current = 0;
      }

      const pct = Math.min((stableCountRef.current / STABILITY_FRAMES) * 100, 100);
      setStability(Math.round(pct));

      if (stableCountRef.current >= STABILITY_FRAMES && !capturedRef.current) {
        capturedRef.current = true;
        const img = captureFrame();
        if (img) processImage(img);
        return;
      }
    }

    prevDataRef.current = data;
    rafRef.current = requestAnimationFrame(stabilityLoop);
  }

  function captureFrame() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    const canvas = document.createElement('canvas');
    const MAX = 1200;
    let w = video.videoWidth, h = video.videoHeight;
    if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(video, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.82);
  }

  async function processImage(dataUrl) {
    cancelAnimationFrame(rafRef.current);
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    setCapturedImg(dataUrl);
    setProcessing(true);
    setStability(0);
    try {
      const result = await scanLabel(dataUrl, apiKey);
      setScanned(result);
      setServings(1);
      setProcessing(false);
      goTo('review');
    } catch (err) {
      setProcessing(false);
      toast('Could not read label: ' + (err.message || 'unknown error'), 'error');
      capturedRef.current = false;
      startCamera();
    }
  }

  function handleCapture() {
    if (capturedRef.current) return;
    capturedRef.current = true;
    cancelAnimationFrame(rafRef.current);
    const img = captureFrame();
    if (!img) { toast('Camera not ready', 'error'); return; }
    processImage(img);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => processImage(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  const stabilityColor = stability < 50 ? 'var(--amber)' : stability < 100 ? 'var(--blue)' : 'var(--green)';

  return (
    <div className="scan-screen">
      <video ref={videoRef} className="scan-video" playsInline autoPlay muted />

      <div className="scan-overlay">
        <div className="scan-frame"><span /></div>
        <div className="scan-hint">Align nutrition label within the frame</div>

        <div className="stability-wrap">
          <div className="stability-track">
            <div className="stability-fill" style={{ width: `${stability}%`, background: stabilityColor }} />
          </div>
          <div className="stability-label" style={{ color: stabilityColor }}>
            {stability < 100 ? 'Hold steady…' : 'Capturing…'}
          </div>
        </div>
      </div>

      {processing && (
        <div className="processing-overlay">
          <div className="spinner" />
          <div className="processing-text">Reading label…</div>
          <div className="scan-processing-hint">Claude AI is extracting calories and macros from your photo</div>
        </div>
      )}

      <div className="scan-bar">
        <div className="scan-back" onClick={() => goTo('home')}>✕</div>
        <div className="capture-btn" onClick={handleCapture}><div className="capture-inner" /></div>
        <div className="library-btn" onClick={() => fileInputRef.current?.click()}>🖼</div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { scanLabel } from '../utils/api';

export default function ScanScreen() {
  const {
    goTo, toast, apiKey,
    setScanned, setServings, setCapturedImg,
    processing, setProcessing,
    cameraStreamRef,
  } = useApp();

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {};
  }, []);

  async function startCamera() {
    if (cameraStreamRef.current) {
      if (videoRef.current && !videoRef.current.srcObject) {
        videoRef.current.srcObject = cameraStreamRef.current;
        videoRef.current.play();
      }
      return;
    }
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
    }
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
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    setCapturedImg(dataUrl);
    setProcessing(true);
    try {
      const result = await scanLabel(dataUrl, apiKey);
      setScanned(result);
      setServings(1);
      setProcessing(false);
      goTo('review');
    } catch (err) {
      setProcessing(false);
      toast('Could not read label: ' + (err.message || 'unknown error'), 'error');
      goTo('scan');
    }
  }

  function handleCapture() {
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

  return (
    <div className="scan-screen">
      <video ref={videoRef} className="scan-video" playsInline autoPlay muted />

      <div className="scan-overlay">
        <div className="scan-frame"><span /></div>
        <div className="scan-hint">Align nutrition label within the frame</div>
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

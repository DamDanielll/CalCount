import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { loadEntries, loadGoal, loadKey, loadMeals, saveEntries, saveGoal, saveKey, saveMeals } from '../utils/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [screen, setScreen] = useState(() => {
    const key = loadKey();
    const goal = loadGoal();
    return key && goal ? 'home' : 'setup';
  });
  const [apiKey, setApiKeyState] = useState(loadKey);
  const [goal, setGoalState] = useState(loadGoal);
  const [entries, setEntriesState] = useState(loadEntries);
  const [scanned, setScanned] = useState(null);
  const [servings, setServings] = useState(1);
  const [trackMode, setTrackMode] = useState('servings');
  const [grams, setGrams] = useState('');
  const [editIdx, setEditIdx] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState(new Set());
  const [meals, setMealsState] = useState(loadMeals);
  const [describeText, setDescribeText] = useState('');
  const [describeResult, setDescribeResult] = useState(null);
  const [describeLoading, setDescribeLoading] = useState(false);
  const [capturedImg, setCapturedImg] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [barcodeData, setBarcodeData] = useState(null);
  const cameraStreamRef = useRef(null);

  const toastRef = useRef(null);

  const toast = useCallback((msg, type = 'success') => {
    if (toastRef.current) {
      toastRef.current.show(msg, type);
    }
  }, []);

  const setApiKey = useCallback((key) => {
    setApiKeyState(key);
    saveKey(key);
  }, []);

  const setGoal = useCallback((g) => {
    setGoalState(g);
    saveGoal(g);
  }, []);

  const setEntries = useCallback((e) => {
    const next = typeof e === 'function' ? e : e;
    setEntriesState(next);
    saveEntries(typeof next === 'function' ? next([]) : next);
  }, []);

  const updateEntries = useCallback((updater) => {
    setEntriesState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveEntries(next);
      return next;
    });
  }, []);

  const setMeals = useCallback((m) => {
    const next = typeof m === 'function' ? m([]) : m;
    setMealsState(next);
    saveMeals(next);
  }, []);

  const updateMeals = useCallback((updater) => {
    setMealsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveMeals(next);
      return next;
    });
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
  }, []);

  const goTo = useCallback((s) => {
    if (s !== 'scan') stopCamera();
    setScreen(s);
  }, [stopCamera]);

  return (
    <AppContext.Provider value={{
      screen, goTo,
      apiKey, setApiKey,
      goal, setGoal,
      entries, updateEntries,
      scanned, setScanned,
      servings, setServings,
      trackMode, setTrackMode,
      grams, setGrams,
      editIdx, setEditIdx,
      selectMode, setSelectMode,
      selectedIdxs, setSelectedIdxs,
      meals, updateMeals,
      describeText, setDescribeText,
      describeResult, setDescribeResult,
      describeLoading, setDescribeLoading,
      capturedImg, setCapturedImg,
      processing, setProcessing,
      barcodeData, setBarcodeData,
      cameraStreamRef,
      stopCamera,
      toast, toastRef,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

import { useEffect, useRef } from 'react';
import { useApp } from './context/AppContext';
import { Toast } from './components/Toast';

import SetupScreen    from './screens/SetupScreen';
import HomeScreen     from './screens/HomeScreen';
import ScanScreen,    { stopCamera } from './screens/ScanScreen';
import ReviewScreen   from './screens/ReviewScreen';
import ManualScreen   from './screens/ManualScreen';
import DescribeScreen from './screens/DescribeScreen';
import HistoryScreen  from './screens/HistoryScreen';
import MealsScreen    from './screens/MealsScreen';
import SettingsScreen from './screens/SettingsScreen';

const SCREENS = {
  setup:    SetupScreen,
  home:     HomeScreen,
  scan:     ScanScreen,
  review:   ReviewScreen,
  manual:   ManualScreen,
  describe: DescribeScreen,
  history:  HistoryScreen,
  meals:    MealsScreen,
  settings: SettingsScreen,
};

export default function App() {
  const { state } = useApp();
  const prevScreen = useRef(state.screen);

  // Stop camera whenever we leave the scan screen
  useEffect(() => {
    if (prevScreen.current === 'scan' && state.screen !== 'scan') {
      stopCamera();
    }
    prevScreen.current = state.screen;
  }, [state.screen]);

  const Screen = SCREENS[state.screen] || HomeScreen;

  return (
    <div className="app">
      <Screen />
      <Toast />
    </div>
  );
}

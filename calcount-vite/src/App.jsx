import { lazy, Suspense, useRef } from 'react';
import { useApp } from './context/AppContext';
import Toast from './components/Toast';
import SetupScreen from './screens/SetupScreen';
import HomeScreen from './screens/HomeScreen';
import ScanScreen from './screens/ScanScreen';
import ReviewScreen from './screens/ReviewScreen';
import ManualScreen from './screens/ManualScreen';
import DescribeScreen from './screens/DescribeScreen';
import HistoryScreen from './screens/HistoryScreen';
import MealsScreen from './screens/MealsScreen';
import SettingsScreen from './screens/SettingsScreen';
const BarcodeScreen = lazy(() => import('./screens/BarcodeScreen'));
const BarcodeReviewScreen = lazy(() => import('./screens/BarcodeReviewScreen'));

function AppInner() {
  const { screen, toastRef } = useApp();

  return (
    <>
      {screen === 'setup' && <SetupScreen />}
      {screen === 'home' && <HomeScreen />}
      {screen === 'scan' && <ScanScreen />}
      {screen === 'review' && <ReviewScreen />}
      {screen === 'manual' && <ManualScreen />}
      {screen === 'describe' && <DescribeScreen />}
      {screen === 'history' && <HistoryScreen />}
      {screen === 'meals' && <MealsScreen />}
      {screen === 'settings' && <SettingsScreen />}
      {screen === 'barcode' && <Suspense fallback={null}><BarcodeScreen /></Suspense>}
      {screen === 'barcode-review' && <Suspense fallback={null}><BarcodeReviewScreen /></Suspense>}
      <Toast ref={toastRef} />
    </>
  );
}

export default AppInner;

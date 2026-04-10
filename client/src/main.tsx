import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import 'maplibre-gl/dist/maplibre-gl.css';
import './index.css'
import CustomCursor from './components/custom-cursor.tsx'
import App from './app.tsx'
import LandingPage from './LandingPage.tsx'

type ThemeMode = 'light' | 'dark'

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.localStorage.getItem('routeiq-theme') === 'dark' ? 'dark' : 'light'
}

function RoutedApp() {
  const location = useLocation();
  const [appTheme, setAppTheme] = useState<ThemeMode>(getStoredTheme);

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<ThemeMode>;
      if (customEvent.detail === 'dark' || customEvent.detail === 'light') {
        setAppTheme(customEvent.detail);
        return;
      }
      setAppTheme(getStoredTheme());
    };

    window.addEventListener('routeiq-theme-change', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('routeiq-theme-change', handleThemeChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (location.pathname !== '/app') {
      return;
    }
    setAppTheme(getStoredTheme());
  }, [location.pathname]);

  const cursorColor = location.pathname === '/app'
    ? (appTheme === 'dark' ? '#ffffff' : '#000000')
    : '#9ca3af';

  return (
    <>
      <CustomCursor color={cursorColor} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<App />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <RoutedApp />
  </BrowserRouter>
)

import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import 'maplibre-gl/dist/maplibre-gl.css';
import './index.css'
import App from './app.tsx'
import LandingPage from './LandingPage.tsx'
import CustomCursor from './components/custom-cursor.tsx'

function RoutedApp() {
  const location = useLocation();
  const cursorColor = location.pathname === '/app' ? '#000000' : '#9ca3af';

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

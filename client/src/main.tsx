import { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import 'maplibre-gl/dist/maplibre-gl.css';
import './index.css'
import CustomCursor from './components/custom-cursor.tsx'

const App = lazy(() => import('./app.tsx'))
const LandingPage = lazy(() => import('./LandingPage.tsx'))

function RouteLoadingFallback() {
  return (
    <div className="route-loading" role="status" aria-live="polite" aria-label="Loading page">
      <div className="route-loading-spinner" />
    </div>
  )
}

function RoutedApp() {
  const location = useLocation();
  const cursorColor = location.pathname === '/app' ? '#000000' : '#9ca3af';

  return (
    <>
      <CustomCursor color={cursorColor} />
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<App />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <RoutedApp />
  </BrowserRouter>
)

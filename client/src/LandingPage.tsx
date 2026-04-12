import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import App from "./app";

export default function LandingPage() {
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statsRoutes, setStatsRoutes] = useState(0);
  const [statsMs, setStatsMs] = useState(0);
  const [statsGuarantee, setStatsGuarantee] = useState(0);
  const [algorithmCounter, setAlgorithmCounter] = useState(0);
  const tickerText = "MATHEMATICALLY OPTIMAL • Every second on the road costs money • REAL ROAD ROUTING • Tested on Delhi Mumbai and Chennai • 24 ROUTES TESTED IN LESS THAN 1MS • Built with FastAPI and MapLibre • ZERO GUESSWORK • Brute force means guaranteed shortest path • TSP SOLVED IN REAL TIME • Free to use no signup required • OPEN SOURCE •";

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    revealElements.forEach((element) => {
      element.style.opacity = "0";
      element.style.transform = "translateY(30px)";
      element.style.transition = "none";
    });

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          if (!entry.isIntersecting) return;

          element.style.transition = "opacity 0.4s ease-out, transform 0.4s ease-out";
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
          currentObserver.unobserve(element);
        });
      },
      {
        rootMargin: "0px 0px -50px 0px",
        threshold: 0.05,
      }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 24;
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      setStatsRoutes(Math.round(24 * progress));
      setStatsMs(Math.round(120 * progress));
      setStatsGuarantee(Math.round(100 * progress));
      setAlgorithmCounter(Math.round(24 * progress));

      if (progress >= 1) {
        window.clearInterval(timer);
      }
    }, 50);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  function goToApp() {
    navigate("/app");
  }

  function scrollToId(id: string) {
    const node = document.getElementById(id);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="rqlp-page" id="top">
      <style>{`
        * {
          font-family: 'Space Grotesk', sans-serif;
        }

        .rqlp-page {
          background: radial-gradient(circle at 15% 10%, rgba(124, 58, 237, 0.12), transparent 35%), #0a0a1a;
          color: #ffffff;
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          font-family: "Space Grotesk", "Inter", "Segoe UI", sans-serif;
        }

        .rqlp-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 60;
          width: 100%;
          padding: 18px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid transparent;
          transition: background 220ms ease-out, border-color 220ms ease-out, backdrop-filter 220ms ease-out;
        }

        .rqlp-nav.is-scrolled {
          background: rgba(10, 10, 26, 0.82);
          border-bottom-color: rgba(148, 163, 184, 0.22);
          backdrop-filter: blur(12px);
        }

        .rqlp-brand {
          border: none;
          background: transparent;
          font-family: 'Space Grotesk', sans-serif;
          color: #ffffff;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: -0.02em;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .rqlp-links {
          display: flex;
          align-items: center;
          gap: 26px;
        }

        .rqlp-link {
          border: none;
          background: transparent;
          color: #d1d5db;
          font-size: 17px;
          font-weight: 500;
        }

        .rqlp-link:hover {
          color: #ffffff;
        }

        .rqlp-btn {
          border: 1px solid transparent;
          border-radius: 10px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .rqlp-btn-primary {
          background: #7c3aed;
          color: #ffffff;
          box-shadow: 0 8px 26px rgba(124, 58, 237, 0.35);
        }

        .rqlp-btn-primary:hover {
          background: #6d28d9;
        }

        .rqlp-btn-outline {
          background: transparent;
          color: #ffffff;
          border-color: rgba(167, 139, 250, 0.65);
        }

        .rqlp-btn-outline:hover {
          border-color: #7c3aed;
          color: #ddd6fe;
        }

        .rqlp-section {
          width: 100%;
          padding: 112px 32px 46px;
        }

        .rqlp-section-inner {
          width: min(1220px, 100%);
          max-width: 100%;
          margin: 0 auto;
        }

        .rqlp-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 16px;
          padding-top: 56px;
        }

        .rqlp-kicker {
          font-size: 14px;
          color: #c4b5fd;
          text-transform: uppercase;
          letter-spacing: 0.13em;
          font-weight: 500;
        }

        .rqlp-title {
          font-size: clamp(52px, 9vw, 104px);
          line-height: 0.98;
          letter-spacing: -0.04em;
          font-weight: 700;
          max-width: 920px;
        }

        .rqlp-subtext {
          max-width: 850px;
          color: #cbd5e1;
          font-size: clamp(20px, 2.2vw, 30px);
          line-height: 1.45;
          font-weight: 400;
        }

        .rqlp-actions {
          margin-top: 8px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .rqlp-browser {
          margin-top: 24px;
          border: 1px solid rgba(124, 58, 237, 0.34);
          border-radius: 18px;
          overflow: hidden;
          background: #0f172a;
          width: 100%;
        }

        .rqlp-browser-top {
          height: 36px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.22);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 16px;
          background: #111827;
        }

        .rqlp-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          display: inline-block;
        }

        .rqlp-dot.red { background: #ef4444; }
        .rqlp-dot.yellow { background: #f59e0b; }
        .rqlp-dot.green { background: #22c55e; }

        .rqlp-browser-view {
          width: 100%;
          height: 600px;
          background: #0f172a;
          overflow: hidden;
          position: relative;
          margin: 0;
          padding: 0;
        }

        .rqlp-live-app-embed {
          width: 100%;
          height: 100%;
          min-height: 600px;
          overflow: hidden;
          pointer-events: auto;
        }

        .rqlp-live-app-embed > .app-root {
          width: 100%;
          height: 100%;
          min-height: 600px;
        }

        .rqlp-live-app-embed > .app-root .app-container {
          width: 100%;
          height: 100%;
          min-height: 600px;
        }

        .rqlp-live-app-embed > .app-root .map-wrapper {
          width: 100%;
          height: 100%;
        }

        .rqlp-map-placeholder {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background:
            radial-gradient(circle at 22% 24%, rgba(56, 189, 248, 0.18), transparent 42%),
            radial-gradient(circle at 78% 68%, rgba(124, 58, 237, 0.2), transparent 40%),
            linear-gradient(140deg, #0b1126 0%, #0b1022 55%, #0a0f1e 100%);
          color: #e5e7eb;
        }

        .rqlp-map-placeholder-title {
          font-size: clamp(26px, 3.5vw, 40px);
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .rqlp-map-placeholder-sub {
          font-size: clamp(12px, 1.4vw, 16px);
          color: #94a3b8;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .rqlp-preview {
          height: 100%;
          width: 100%;
          display: grid;
          grid-template-columns: minmax(170px, 28%) 1fr;
          background: linear-gradient(150deg, #0b1023 0%, #0f172a 100%);
        }

        .rqlp-preview-sidebar {
          border-right: 1px solid rgba(148, 163, 184, 0.22);
          background: rgba(2, 6, 23, 0.84);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rqlp-preview-brand {
          font-size: 18px;
          font-weight: 700;
          color: #f5f3ff;
          letter-spacing: -0.01em;
        }

        .rqlp-preview-panel {
          border: 1px solid rgba(148, 163, 184, 0.28);
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.7);
          padding: 10px;
        }

        .rqlp-preview-panel p {
          margin: 0;
          font-size: 12px;
          color: #e2e8f0;
          font-weight: 600;
        }

        .rqlp-preview-panel span {
          margin-top: 4px;
          display: block;
          font-size: 11px;
          color: #94a3b8;
        }

        .rqlp-preview-map {
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.2), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(56, 189, 248, 0.16), transparent 36%),
            linear-gradient(135deg, #111827 0%, #0f172a 100%);
        }

        .rqlp-preview-route {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .rqlp-preview-route path {
          fill: none;
          stroke: #22d3ee;
          stroke-width: 1.2;
          stroke-linejoin: round;
          stroke-linecap: round;
          stroke-dasharray: 1.8 1.8;
        }

        .rqlp-preview-pin {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.24);
          background: rgba(59, 130, 246, 0.82);
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transform: translate(-50%, -50%);
          z-index: 2;
        }

        .rqlp-preview-pin.is-hub {
          background: rgba(249, 115, 22, 0.88);
        }

        .rqlp-stats {
          padding-top: 16px;
        }

        .rqlp-stats-grid {
          border: 1px solid rgba(124, 58, 237, 0.26);
          border-radius: 14px;
          background: rgba(15, 23, 42, 0.66);
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          padding: 14px;
        }

        .rqlp-stat {
          border: 1px solid rgba(167, 139, 250, 0.28);
          border-radius: 12px;
          padding: 20px 12px;
          text-align: center;
          background: rgba(17, 24, 39, 0.84);
        }

        .rqlp-stat-value {
          display: block;
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 700;
          color: #f5f3ff;
          line-height: 1;
        }

        .rqlp-stat-label {
          margin-top: 8px;
          color: #cbd5e1;
          font-size: clamp(16px, 1.8vw, 24px);
          line-height: 1.35;
          font-weight: 400;
        }

        .rqlp-section-title {
          font-size: clamp(38px, 5vw, 64px);
          line-height: 1.08;
          font-weight: 700;
          letter-spacing: -0.03em;
        }

        .rqlp-section-sub {
          margin-top: 12px;
          max-width: 900px;
          font-size: clamp(19px, 2vw, 28px);
          line-height: 1.5;
          font-weight: 400;
          color: #cbd5e1;
        }

        .rqlp-cards {
          margin-top: 24px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .rqlp-card {
          border: 1px solid rgba(124, 58, 237, 0.32);
          border-radius: 14px;
          background: rgba(15, 23, 42, 0.84);
          padding: 22px;
        }

        .rqlp-card h3 {
          font-size: clamp(22px, 2.3vw, 32px);
          line-height: 1.2;
          font-weight: 500;
        }

        .rqlp-card p {
          margin-top: 10px;
          color: #cbd5e1;
          line-height: 1.55;
          font-size: clamp(16px, 1.6vw, 22px);
          font-weight: 400;
        }

        .rqlp-algo-grid {
          margin-top: 26px;
          border: 1px solid rgba(124, 58, 237, 0.32);
          border-radius: 16px;
          background: rgba(15, 23, 42, 0.76);
          padding: 22px;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 18px;
          align-items: center;
        }

        .rqlp-factorial {
          font-size: clamp(54px, 8vw, 110px);
          font-weight: 700;
          color: #ddd6fe;
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .rqlp-factorial-copy {
          color: #cbd5e1;
          font-size: clamp(18px, 2vw, 26px);
          line-height: 1.55;
          font-weight: 400;
        }

        .rqlp-demo-copy {
          margin-top: 16px;
        }

        .rqlp-demo-image {
          width: 100%;
          height: auto;
          display: block;
          margin-top: 20px;
          border-radius: 16px;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.32);
        }

        .rqlp-laptop {
          margin-top: 20px;
        }

        .rqlp-laptop-screen {
          border: 1px solid rgba(124, 58, 237, 0.34);
          border-radius: 16px;
          overflow: hidden;
          background: #0f172a;
          width: 100%;
        }

        .rqlp-laptop-view {
          height: 480px;
          background: #0f172a;
        }

        .rqlp-laptop-base {
          width: min(90%, 980px);
          height: 14px;
          margin: 0 auto;
          border-radius: 0 0 12px 12px;
          background: #374151;
        }

        .rqlp-closing {
          margin-top: 20px;
          border: 1px solid rgba(124, 58, 237, 0.34);
          border-radius: 18px;
          background: rgba(17, 24, 39, 0.84);
          padding: 46px 28px;
          text-align: center;
        }

        .rqlp-closing h2 {
          font-size: clamp(40px, 6vw, 80px);
          line-height: 1.05;
          font-weight: 700;
        }

        .rqlp-closing p {
          margin: 14px auto 0;
          max-width: 900px;
          color: #cbd5e1;
          font-size: clamp(18px, 2vw, 30px);
          line-height: 1.45;
          font-weight: 400;
        }

        .rqlp-footer {
          width: 100%;
          border-top: 1px solid rgba(148, 163, 184, 0.22);
          padding: 20px 32px 28px;
          color: #94a3b8;
          font-size: clamp(16px, 1.4vw, 20px);
          font-weight: 400;
        }

        .rqlp-ticker {
          width: 100%;
          background: #7c3aed;
          overflow: hidden;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .rqlp-ticker-track {
          width: max-content;
          display: flex;
          align-items: center;
          animation: rqlp-ticker-scroll 30s linear infinite;
        }

        .rqlp-ticker-text {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          padding: 12px 28px;
          font-family: "Space Grotesk", sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        @keyframes rqlp-ticker-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-33.333%);
          }
        }

        .rqlp-menu-toggle {
          display: none;
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 24px;
          cursor: pointer;
          padding: 8px;
          z-index: 65;
        }

        .rqlp-menu-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 61;
          backdrop-filter: blur(8px);
        }

        .rqlp-menu-overlay.is-open {
          display: flex;
        }

        .rqlp-mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 62;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 32px;
          padding: 80px 20px 20px;
        }

        .rqlp-mobile-menu-item {
          border: none;
          background: transparent;
          color: #ffffff;
          font-size: 28px;
          font-weight: 600;
          cursor: pointer;
          padding: 10px;
        }

        .rqlp-mobile-menu-item:active {
          opacity: 0.7;
        }

        @media (max-width: 1100px) {
          .rqlp-nav {
            padding: 16px 20px;
          }

          .rqlp-links {
            gap: 16px;
          }

          .rqlp-section {
            padding: 104px 18px 34px;
          }

          .rqlp-stats-grid,
          .rqlp-cards {
            grid-template-columns: 1fr;
          }

          .rqlp-algo-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .rqlp-nav {
            padding: 14px 16px;
            gap: 0;
          }

          .rqlp-menu-toggle {
            display: block;
          }

          .rqlp-brand {
            flex: 1;
            font-size: 28px;
          }

          .rqlp-links {
            display: none;
          }

          .rqlp-nav .rqlp-btn {
            display: none;
          }

          .rqlp-section {
            padding: 96px 16px 32px;
          }

          .rqlp-hero {
            padding-top: 48px;
            gap: 12px;
            min-height: auto;
          }

          .rqlp-title {
            font-size: clamp(32px, 8vw, 52px);
          }

          .rqlp-subtext {
            font-size: clamp(16px, 4vw, 20px);
          }

          .rqlp-actions {
            flex-direction: column;
            gap: 10px;
            margin-top: 6px;
          }

          .rqlp-btn {
            width: 100%;
            padding: 14px 20px;
            font-size: 14px;
          }

          .rqlp-browser-view {
            height: 480px;
          }

          .rqlp-laptop-view {
            height: 300px;
          }

          .rqlp-preview {
            grid-template-columns: 1fr;
          }

          .rqlp-preview-sidebar {
            border-right: none;
            border-bottom: 1px solid rgba(148, 163, 184, 0.22);
            padding: 10px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .rqlp-preview-brand {
            grid-column: span 2;
            font-size: 16px;
          }

          .rqlp-preview-panel {
            padding: 8px;
          }

          .rqlp-preview-panel p {
            font-size: 11px;
          }

          .rqlp-preview-panel span {
            font-size: 10px;
          }

          .rqlp-browser {
            margin-top: 20px;
            border-radius: 12px;
          }

          .rqlp-stats-grid,
          .rqlp-cards {
            grid-template-columns: 1fr;
            gap: 10px;
            padding: 10px;
          }

          .rqlp-stat {
            padding: 16px 12px;
          }

          .rqlp-stat-value {
            font-size: clamp(28px, 6vw, 36px);
          }

          .rqlp-stat-label {
            font-size: clamp(12px, 3vw, 14px);
            margin-top: 6px;
          }

          .rqlp-section-title {
            font-size: clamp(28px, 7vw, 38px);
          }

          .rqlp-section-sub {
            font-size: clamp(14px, 3.5vw, 18px);
            margin-top: 8px;
          }

          .rqlp-card {
            padding: 18px;
          }

          .rqlp-card h3 {
            font-size: clamp(18px, 4vw, 22px);
          }

          .rqlp-card p {
            font-size: clamp(14px, 3vw, 16px);
            margin-top: 8px;
          }

          .rqlp-algo-grid {
            padding: 18px;
            gap: 12px;
          }

          .rqlp-factorial {
            font-size: clamp(42px, 10vw, 54px);
          }

          .rqlp-factorial-copy {
            font-size: clamp(14px, 3vw, 18px);
          }

          .rqlp-laptop {
            margin-top: 16px;
          }

          .rqlp-laptop-base {
            height: 12px;
          }

          .rqlp-closing {
            padding: 32px 20px;
          }

          .rqlp-closing h2 {
            font-size: clamp(28px, 7vw, 40px);
          }

          .rqlp-closing p {
            font-size: clamp(14px, 3.5vw, 18px);
            margin-top: 10px;
          }

          .rqlp-footer {
            padding: 16px 20px 20px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .rqlp-nav {
            padding: 12px 12px;
          }

          .rqlp-brand {
            font-size: 24px;
          }

          .rqlp-menu-toggle {
            font-size: 20px;
            padding: 6px;
          }

          .rqlp-section {
            padding: 80px 12px 24px;
          }

          .rqlp-hero {
            padding-top: 40px;
            min-height: auto;
          }

          .rqlp-title {
            font-size: clamp(28px, 7.5vw, 36px);
            line-height: 1;
          }

          .rqlp-subtext {
            font-size: clamp(14px, 3.5vw, 16px);
          }

          .rqlp-actions {
            margin-top: 12px;
          }

          .rqlp-btn {
            padding: 12px 16px;
            font-size: 13px;
            border-radius: 8px;
          }

          .rqlp-browser {
            margin-top: 16px;
          }

          .rqlp-browser-view {
            height: 480px;
          }

          .rqlp-laptop-view {
            height: 280px;
          }

          .rqlp-browser-top {
            height: 32px;
            padding: 0 12px;
            gap: 6px;
          }

          .rqlp-dot {
            width: 7px;
            height: 7px;
          }

          .rqlp-stats-grid {
            padding: 8px;
            gap: 8px;
          }

          .rqlp-stat {
            padding: 14px 10px;
            border-radius: 10px;
          }

          .rqlp-stat-value {
            font-size: clamp(24px, 5vw, 28px);
          }

          .rqlp-stat-label {
            font-size: 11px;
            margin-top: 4px;
          }

          .rqlp-section-title {
            font-size: clamp(24px, 6vw, 32px);
          }

          .rqlp-section-sub {
            font-size: clamp(13px, 3vw, 15px);
          }

          .rqlp-cards {
            gap: 8px;
            padding: 8px;
          }

          .rqlp-card {
            padding: 16px;
            border-radius: 12px;
          }

          .rqlp-card h3 {
            font-size: clamp(16px, 3.5vw, 18px);
          }

          .rqlp-card p {
            font-size: clamp(13px, 2.5vw, 14px);
            margin-top: 6px;
          }

          .rqlp-algo-grid {
            padding: 16px;
            gap: 10px;
            border-radius: 12px;
          }

          .rqlp-factorial {
            font-size: clamp(36px, 9vw, 42px);
          }

          .rqlp-factorial-copy {
            font-size: clamp(13px, 2.8vw, 15px);
          }

          .rqlp-preview-pin {
            width: 20px;
            height: 20px;
            font-size: 10px;
          }

          .rqlp-closing {
            padding: 28px 16px;
            border-radius: 14px;
          }

          .rqlp-closing h2 {
            font-size: clamp(24px, 6vw, 32px);
          }

          .rqlp-closing p {
            font-size: clamp(13px, 3vw, 16px);
            margin-top: 8px;
          }

          .rqlp-footer {
            padding: 14px 16px 18px;
            font-size: 11px;
          }
        }
      `}</style>

      <header className={`rqlp-nav${navScrolled ? " is-scrolled" : ""}`}>
        <button className="rqlp-brand" onClick={() => scrollToId("top")}>Route IQ</button>
        <nav className="rqlp-links">
          <button className="rqlp-link" onClick={() => scrollToId("how-it-works")}>How it works</button>
          <button className="rqlp-link" onClick={() => scrollToId("algorithm")}>Algorithm</button>
          <button className="rqlp-link" onClick={() => scrollToId("demo")}>Demo</button>
        </nav>
        <button className="rqlp-btn rqlp-btn-primary" onClick={goToApp}>Launch App</button>
        <button className="rqlp-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </header>

      {mobileMenuOpen && (
        <>
          <div className={`rqlp-menu-overlay${mobileMenuOpen ? " is-open" : ""}`} onClick={() => setMobileMenuOpen(false)} />
          <div className="rqlp-mobile-menu">
            <button 
              className="rqlp-mobile-menu-item" 
              onClick={() => { scrollToId("how-it-works"); setMobileMenuOpen(false); }}
            >
              How it works
            </button>
            <button 
              className="rqlp-mobile-menu-item" 
              onClick={() => { scrollToId("algorithm"); setMobileMenuOpen(false); }}
            >
              Algorithm
            </button>
            <button 
              className="rqlp-mobile-menu-item" 
              onClick={() => { scrollToId("demo"); setMobileMenuOpen(false); }}
            >
              Demo
            </button>
            <button 
              className="rqlp-btn rqlp-btn-primary" 
              onClick={() => { goToApp(); setMobileMenuOpen(false); }}
            >
              Launch App
            </button>
          </div>
        </>
      )}

      <main>
        <section className="rqlp-section">
          <div className="rqlp-section-inner rqlp-hero">
            <p className="rqlp-kicker reveal">TSP Route Optimization Engine</p>
            <h1 className="rqlp-title reveal">Deliver smarter. Not harder.</h1>
            <p className="rqlp-subtext reveal">
              RouteIQ finds the mathematically shortest delivery route across all your stops. Real roads.
              Real time. Zero guesswork.
            </p>
            <div className="rqlp-actions">
              <button className="rqlp-btn rqlp-btn-primary reveal" onClick={goToApp}>Start Optimizing</button>
              <button className="rqlp-btn rqlp-btn-outline reveal" onClick={goToApp}>See how it works</button>
            </div>
            <div className="rqlp-browser reveal">
              <div className="rqlp-browser-top">
                <span className="rqlp-dot red" />
                <span className="rqlp-dot yellow" />
                <span className="rqlp-dot green" />
              </div>
              <div className="rqlp-browser-view">
                <div className="rqlp-live-app-embed">
                  <App isEmbeddedPreview />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rqlp-section rqlp-stats">
          <div className="rqlp-section-inner rqlp-stats-grid">
            <article className="rqlp-stat reveal">
              <span className="rqlp-stat-value">{statsRoutes}!</span>
              <span className="rqlp-stat-label">Maximum permutations tested</span>
            </article>
            <article className="rqlp-stat reveal">
              <span className="rqlp-stat-value">&lt;{statsMs}ms</span>
              <span className="rqlp-stat-label">Time to find optimal route</span>
            </article>
            <article className="rqlp-stat reveal">
              <span className="rqlp-stat-value">{statsGuarantee}%</span>
              <span className="rqlp-stat-label">Mathematically guaranteed</span>
            </article>
          </div>
        </section>

        <section id="how-it-works" className="rqlp-section">
          <div className="rqlp-section-inner">
            <h2 className="rqlp-section-title reveal">How it works</h2>
            <div className="rqlp-cards">
              <article className="rqlp-card reveal">
                <h3>Search any location</h3>
                <p>Find hubs and stops instantly with autocomplete across real map data.</p>
              </article>
              <article className="rqlp-card reveal">
                <h3>AI tests every route</h3>
                <p>Brute force evaluates each permutation, then selects the shortest possible path.</p>
              </article>
              <article className="rqlp-card reveal">
                <h3>Drive the optimal path</h3>
                <p>See the winning route drawn on real roads and compare it against worse alternatives.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="algorithm" className="rqlp-section">
          <div className="rqlp-section-inner">
            <h2 className="rqlp-section-title reveal">Why brute force wins at this scale</h2>
            <p className="rqlp-section-sub reveal">
              With 4 stops there are exactly 4! = 24 possible permutations. That search space is small enough
              for RouteIQ to evaluate every route in full.
            </p>
            <p className="rqlp-section-sub reveal">
              We test every single one. No heuristic, no approximation. The answer you get is provably the
              shortest route that exists.
            </p>
            <div className="rqlp-algo-grid reveal">
              <span className="rqlp-factorial">4! = {algorithmCounter}</span>
              <p className="rqlp-factorial-copy">
                Exhaustive enumeration guarantees correctness: compute all 24, compare totals, pick minimum.
              </p>
            </div>
          </div>
        </section>

        <section id="demo" className="rqlp-section rqlp-live-demo">
          <div className="rqlp-section-inner">
            <h2 className="rqlp-section-title reveal">See it solve a real route</h2>
            <p className="rqlp-section-sub rqlp-demo-copy reveal">
              Try it yourself. Add any locations in Delhi, Mumbai or Chennai and watch RouteIQ trace the
              perfect path in real time.
            </p>
            <img
              className="rqlp-demo-image reveal"
              src="/map-preview.png"
              alt="RouteIQ map preview"
            />
          </div>
        </section>

        <section className="rqlp-section">
          <div className="rqlp-section-inner rqlp-closing">
            <h2 className="reveal">Stop guessing. Start optimizing.</h2>
            <p className="reveal">Built for delivery teams who believe every route can be better than the last.</p>
            <button className="rqlp-btn rqlp-btn-primary reveal" onClick={goToApp}>Launch RouteIQ -&gt;</button>
          </div>
        </section>
      </main>

      <div className="rqlp-ticker" aria-label="RouteIQ highlights ticker">
        <div className="rqlp-ticker-track">
          <span className="rqlp-ticker-text">{tickerText}</span>
          <span className="rqlp-ticker-text">{tickerText}</span>
          <span className="rqlp-ticker-text">{tickerText}</span>
        </div>
      </div>

      <footer className="rqlp-footer reveal">
        RouteIQ
      </footer>
    </div>
  );
}

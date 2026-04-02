import { useEffect, useRef, useState } from "react";

const EXCLUDED_SELECTOR = "button,a,[role='button']";
const TEXT_SELECTOR = "h1,h2,h3,h4,p,span,label";
const HOVER_SELECTOR = "button,[role='button']";

type CustomCursorProps = {
  color: string;
};

export default function CustomCursor({ color }: CustomCursorProps) {
  const [visible, setVisible] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [isHoverTarget, setIsHoverTarget] = useState(false);
  const [textHeight, setTextHeight] = useState(16);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Detect if device supports touch
    const touchSupported = () => {
      return (
        typeof window !== "undefined" &&
        (window.matchMedia("(pointer: coarse)").matches ||
              navigator.maxTouchPoints > 0 ||
              ((navigator as Navigator & { msMaxTouchPoints?: number }).msMaxTouchPoints ?? 0) > 0 ||
          "ontouchstart" in window)
      );
    };

    if (touchSupported()) {
      setIsTouchDevice(true);
      // Hide default cursor on touch devices
      if (document.documentElement) {
        document.documentElement.style.cursor = "auto";
      }
      return;
    }
  }, []);

  const spawnRipple = (x: number, y: number, rippleColor: string) => {
    const ripple = document.createElement("div");
    ripple.style.position = "fixed";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = "0px";
    ripple.style.height = "0px";
    ripple.style.transform = "translate(-50%, -50%)";
    ripple.style.borderRadius = "999px";
    ripple.style.pointerEvents = "none";
    ripple.style.zIndex = "2200";
    ripple.style.background = rippleColor;
    ripple.style.opacity = "0.3";
    document.body.appendChild(ripple);

    ripple.animate(
      [
        { width: "0px", height: "0px", opacity: 0.3 },
        { width: "80px", height: "80px", opacity: 0 },
      ],
      { duration: 400, easing: "ease-out", fill: "forwards" }
    );

    window.setTimeout(() => {
      ripple.remove();
    }, 420);
  };

  const isPurpleButton = (node: HTMLElement) => {
    const style = window.getComputedStyle(node);
    const rgb = style.backgroundColor.match(/\d+/g);
    if (!rgb || rgb.length < 3) {
      return false;
    }

    const r = Number(rgb[0]);
    const g = Number(rgb[1]);
    const b = Number(rgb[2]);

    return Math.abs(r - 124) <= 30 && Math.abs(g - 58) <= 30 && Math.abs(b - 237) <= 30;
  };

  useEffect(() => {
    if (isTouchDevice) return;

    let frameId = 0;

    const animate = () => {
      const current = currentRef.current;
      const target = targetRef.current;

      current.x += (target.x - current.x) * 0.22;
      current.y += (target.y - current.y) * 0.22;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    const onMouseMove = (event: MouseEvent) => {
      if (!visible) {
        currentRef.current = { x: event.clientX, y: event.clientY };
        setVisible(true);
      }
      targetRef.current = { x: event.clientX, y: event.clientY };

      const target = event.target as HTMLElement | null;
      const isOverExcluded = Boolean(target?.closest(EXCLUDED_SELECTOR));
      const hoverTarget = target?.closest(HOVER_SELECTOR) as HTMLElement | null;
      setIsHoverTarget(Boolean(hoverTarget));

      if (isOverExcluded) {
        setIsTextMode(false);
        setTextHeight(16);
        return;
      }

      const textElement = target?.closest(TEXT_SELECTOR) as HTMLElement | null;
      if (textElement) {
        const computedFontSize = window.getComputedStyle(textElement).fontSize;
        const parsedSize = Number.parseFloat(computedFontSize);
        setTextHeight(Number.isFinite(parsedSize) ? Math.max(parsedSize, 10) : 16);
        setIsTextMode(true);
        return;
      }

      setIsTextMode(false);
      setTextHeight(16);
    };

    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const clickedButton = target?.closest("button,a,[role='button']") as HTMLElement | null;
      if (!clickedButton) {
        return;
      }

      const rippleColor = isPurpleButton(clickedButton)
        ? "rgba(124, 58, 237, 0.3)"
        : "rgba(0, 0, 0, 0.15)";

      spawnRipple(event.clientX, event.clientY, rippleColor);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mouseenter", onMouseEnter);
    window.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("click", onClick);
    };
  }, [visible, isTouchDevice]);

  return isTouchDevice ? null : (
    <div
      ref={cursorRef}
      className={`circle-cursor${isTextMode ? " is-text" : ""}${isHoverTarget ? " is-hover-target" : ""}${visible ? " is-visible" : ""}`}
      style={{
        ["--ibeam-height" as string]: `${textHeight}px`,
        ["--cursor-color" as string]: color,
      }}
      aria-hidden="true"
    />
  );
}

interface TaglineBoxProps {
  text: string;
}

export default function TaglineBox({ text }: TaglineBoxProps) {
  return (
    <>
      <style>{`
        .tagline-box-isolated {
          width: min(920px, 100%);
          margin: 0 auto;
          border-radius: 12px;
          border: 1px solid rgba(167, 139, 250, 0.35);
          background: linear-gradient(145deg, rgba(24, 26, 57, 0.74), rgba(13, 20, 49, 0.58));
          padding: 30px 24px;
          overflow: hidden;
        }

        .tagline-box-isolated__content {
          position: relative;
          min-height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tagline-box-isolated__text {
          text-align: center;
          color: #f5f3ff;
          font-size: clamp(20px, 3.2vw, 30px);
          line-height: 1.35;
          letter-spacing: -0.02em;
          max-width: 780px;
          white-space: pre-line;
          transition: opacity 0.45s ease-out;
        }

        .tagline-box-isolated__line {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 0%;
          height: 2px;
          opacity: 0;
          background: #a855f7;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.7), 0 0 22px rgba(168, 85, 247, 0.5);
          transition: width 0.55s ease-out, opacity 0.45s ease-out;
          animation: tagline-line-pulse 2.1s ease-in-out infinite;
        }

        .tagline-box-isolated:hover .tagline-box-isolated__text {
          opacity: 0.1;
        }

        .tagline-box-isolated:hover .tagline-box-isolated__line {
          width: 100%;
          opacity: 1;
        }

        @keyframes tagline-line-pulse {
          0%, 100% {
            box-shadow: 0 0 8px rgba(168, 85, 247, 0.55), 0 0 16px rgba(168, 85, 247, 0.35);
          }
          50% {
            box-shadow: 0 0 12px rgba(192, 132, 252, 0.85), 0 0 26px rgba(168, 85, 247, 0.55);
          }
        }
      `}</style>

      <div className="tagline-box-isolated">
        <div className="tagline-box-isolated__content">
          <p className="tagline-box-isolated__text">{text}</p>
          <div className="tagline-box-isolated__line" aria-hidden="true" />
        </div>
      </div>
    </>
  );
}

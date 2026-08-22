import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/* -------------------------------------------------------------------- */
/*  TriagoMark (Reused from your brand identity)                        */
/* -------------------------------------------------------------------- */
function TriagoMarkLarge() {
  return (
    <svg width="64" height="64" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="28" height="28" rx="8" fill="url(#triagoIntroGrad)" />
      <path d="M9 19.5L15 9l6 10.5" stroke="#F7F5FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15" cy="9" r="1.6" fill="#F7F5FF" />
      <defs>
        <linearGradient id="triagoIntroGrad" x1="1" y1="1" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B6BF2" />
          <stop offset="1" stopColor="#4C3196" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function TriagoIntro({ onComplete }) {
  const prefersReducedMotion = useReducedMotion();
  const [isExiting, setIsExiting] = useState(false);

  // Total duration control (~2.4 seconds normal flow)
  useEffect(() => {
    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 400);
      }, 800);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setIsExiting(true);
      const finishTimer = setTimeout(onComplete, 600);
      return () => clearTimeout(finishTimer);
    }, 2400);

    return () => clearTimeout(timer);
  }, [onComplete, prefersReducedMotion]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(onComplete, 300);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="triago-intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Atmospheric background elements */}
          <div className="intro-bg-glow" />
          <div className="intro-bg-grid" />

          {/* Skip button for accessibility */}
          <button type="button" className="intro-skip-btn" onClick={handleSkip}>
            Skip intro
          </button>

          <div className="intro-center-stage">
            {/* Converging data nodes / energy rings */}
            {!prefersReducedMotion && (
              <div className="intro-convergence-field">
                <motion.div
                  className="convergence-ring ring-outer"
                  initial={{ scale: 1.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: [0, 0.4, 0.8, 0] }}
                  transition={{ duration: 1.8, ease: "easeOut" }}
                />
                <motion.div
                  className="convergence-ring ring-inner"
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: [0, 0.6, 1, 0] }}
                  transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
                />
                {/* Micro nodes floating inward */}
                {[...Array(6)].map((_, i) => (
                  <motion.span
                    key={i}
                    className={`convergence-node node-${i + 1}`}
                    initial={{
                      x: (i % 2 === 0 ? 1 : -1) * (60 + i * 20),
                      y: (i > 2 ? 1 : -1) * (40 + i * 15),
                      opacity: 0,
                      scale: 0.5,
                    }}
                    animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: [0.5, 1.2, 0.2] }}
                    transition={{ duration: 1.2, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] }}
                  />
                ))}
              </div>
            )}

            {/* Central Logo Mark */}
            <motion.div
              className="intro-logo-wrapper"
              initial={{ scale: 0.7, opacity: 0, filter: "blur(12px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="intro-logo-glow" />
              <TriagoMarkLarge />
            </motion.div>

            {/* Wordmark and Tagline */}
            <motion.div
              className="intro-text-block"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="intro-wordmark">TRIAGO</h1>
              <p className="intro-tagline">Intelligence for what&rsquo;s next.</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
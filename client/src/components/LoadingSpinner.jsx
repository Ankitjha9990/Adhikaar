import React, { useState, useEffect } from 'react';
import './LoadingSpinner.css';

/**
 * Animated spinner with optional cycling status messages.
 * Pass `steps` (array of strings) to cycle through processing stages.
 * Pass `fullPage` to center it in the workspace panel.
 */
function LoadingSpinner({ fullPage = false, label = 'Processing...', steps = null }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!steps || steps.length <= 1) return;
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [steps]);

  const displayLabel = steps ? steps[stepIndex] : label;

  return (
    <div
      className={`spinner-wrapper ${fullPage ? 'spinner-wrapper--fullpage' : ''}`}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="spinner-track" aria-hidden="true">
        <div className="spinner-ring" />
        <div className="spinner-dot" />
      </div>
      {displayLabel && (
        <div className="spinner-text">
          <p className="spinner-label">{displayLabel}</p>
          <span className="spinner-dots-anim" aria-hidden="true">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </div>
      )}
    </div>
  );
}

export default LoadingSpinner;

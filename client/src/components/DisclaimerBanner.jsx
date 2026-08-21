import React from 'react';
import './DisclaimerBanner.css';

/**
 * Persistent disclaimer banner required by PRD/TRD for both RTI and
 * Rights Navigator pages. Always visible — not dismissible.
 */
function DisclaimerBanner({ featureName = 'this tool' }) {
  return (
    <aside className="disclaimer-banner" role="note" aria-label="Legal disclaimer">
      <svg
        className="disclaimer-banner__icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="disclaimer-banner__text">
        <strong>Important:</strong> The information provided by {featureName} is for educational
        purposes only and does not constitute formal legal advice. Consult a qualified legal
        professional for your specific situation.
      </p>
    </aside>
  );
}

export default DisclaimerBanner;

import React, { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('smartcrm-cookie-consent');
    if (!consent) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (choice) => {
    localStorage.setItem('smartcrm-cookie-consent', choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent banner">
      <div className="cookie-banner-content">
        <span className="cookie-icon" style={{ fontSize: '1.4rem' }}>🍪</span>
        <div className="cookie-text">
          <strong>SmartCRM Privacy & Workshop Telemetry</strong>
          <p>
            We use essential local storage & cookies to maintain your role session, dark theme preferences, and shop floor bay telemetry under the Malaysian PDPA (2010).
          </p>
        </div>
      </div>
      <div className="cookie-actions">
        <button
          className="btn btn-secondary btn-xs"
          onClick={() => handleConsent('essential')}
          title="Accept essential telemetry only"
        >
          Essential Only
        </button>
        <button
          className="btn btn-primary btn-xs"
          onClick={() => handleConsent('all')}
          title="Accept all cookies"
        >
          Accept All
        </button>
      </div>
    </div>
  );
}

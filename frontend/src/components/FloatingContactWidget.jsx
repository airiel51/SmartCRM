import React, { useState } from 'react';
import CopyButton from './CopyButton';

export default function FloatingContactWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="floating-contact-wrapper" id="floating-contact-dock">
      {/* Expanded Quick Contact Drawer */}
      {isOpen && (
        <div className="floating-contact-card animate-scale-up" role="dialog" aria-label="Quick Contact Menu">
          <div className="floating-contact-header">
            <div className="floating-contact-title">
              <span className="live-pulse-dot"></span>
              <div>
                <strong>Workshop Concierge</strong>
                <span className="floating-contact-subtitle">Apex AutoWorks Desk • Online</span>
              </div>
            </div>
            <button
              type="button"
              className="floating-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Contact Menu"
            >
              ✕
            </button>
          </div>

          <div className="floating-contact-body">
            {/* WhatsApp Direct Option */}
            <a
              href="https://wa.me/60123456789?text=Hi%20Apex%20AutoWorks%2C%20I%20would%20like%20to%20inquire%20about%20vehicle%20service."
              target="_blank"
              rel="noopener noreferrer"
              className="contact-channel-item whatsapp-channel"
            >
              <div className="channel-icon-wrap" style={{ background: '#25D366' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#ffffff">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                </svg>
              </div>
              <div className="channel-info">
                <span className="channel-name">WhatsApp Service Desk</span>
                <span className="channel-desc">Live response & quote dispatch (Avg &lt; 3m)</span>
              </div>
              <span className="channel-arrow">→</span>
            </a>

            {/* Direct Phone Call */}
            <a href="tel:+60123456789" className="contact-channel-item phone-channel">
              <div className="channel-icon-wrap" style={{ background: '#3b82f6' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div className="channel-info">
                <span className="channel-name">Call Hotline</span>
                <span className="channel-desc">+60 12-345 6789 (Workshop floor direct)</span>
              </div>
              <span className="channel-arrow">→</span>
            </a>

            {/* Emergency Towing Assistance */}
            <a href="tel:+60123456789" className="contact-channel-item towing-channel">
              <div className="channel-icon-wrap" style={{ background: '#ef4444' }}>
                <span style={{ fontSize: '1.1rem' }}>🚨</span>
              </div>
              <div className="channel-info">
                <span className="channel-name">Emergency Towing</span>
                <span className="channel-desc">24/7 Penang island & mainland carrier</span>
              </div>
              <span className="channel-badge-sos">24/7 SOS</span>
            </a>

            {/* Quick Copy Info Card */}
            <div className="floating-copy-card">
              <div className="floating-copy-row">
                <span className="copy-label">📍 Bayan Lepas, Penang</span>
                <CopyButton text="Apex AutoWorks, Jalan Sultan Azlan Shah, Bayan Lepas, 11900 Penang, Malaysia" label="Address" />
              </div>
              <div className="floating-copy-row" style={{ marginTop: 6 }}>
                <span className="copy-label">✉️ support@apexautoworks.my</span>
                <CopyButton text="support@apexautoworks.my" label="Email" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger FAB Button */}
      <button
        type="button"
        className={`floating-contact-fab ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Quick Contact & Emergency Desk"
        aria-label="Quick Contact & Emergency Desk"
      >
        <span className="floating-fab-icon">
          {isOpen ? '✕' : '📞'}
        </span>
        <span className="floating-fab-text">Contact Desk</span>
        <span className="floating-fab-ping"></span>
      </button>
    </div>
  );
}

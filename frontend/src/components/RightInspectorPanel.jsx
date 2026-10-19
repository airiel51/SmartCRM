import React, { useState, useEffect } from 'react';

export default function RightInspectorPanel({ activeCustomer, currentView, isOpen = true, onToggle }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(32); // 32 seconds (matches 00:32 in Dribbble shot)
  const [speed, setSpeed] = useState('1x');
  const [isFavorited, setIsFavorited] = useState(false);

  // Default automotive customer (Priya Subramaniam / Proton X50)
  const customer = activeCustomer || {
    name: 'Priya Subramaniam',
    subtitle: 'Proton X50 1.5 TGDi (VAB 2020) • Bay 2',
    avatar: null,
    online: true,
    phone: '+60 16-554 2190',
    plateNumber: 'VAB 2020',
    vehicleMake: 'Proton',
    vehicleModel: 'X50 1.5 TGDi Flagship',
    mileage: 41800,
    healthScore: 76,
    churnRisk: 'Medium',
    messages: [
      { time: '10:14 AM', role: 'Priya', text: 'Salam Airiel, my Proton X50 plate VAB 2020 has a high pitched squeak when I step on the brakes near Bayan Lepas. Can I drop by tomorrow at 2:30pm?' },
      { time: '10:15 AM', role: 'SmartCRM AI', text: 'NLP Extracted: Plate VAB 2020. Symptom: Brake System Friction. Recommended: Ceramic Brake Pads & Rotor Skimming (Est. RM 280.00). Priority Bay 2 reserved.', isInitials: true, initials: 'AI' },
      { time: '10:16 AM', role: 'Airiel (PIC)', text: 'Waalaikumsalam Priya! Bay 2 is reserved for you tomorrow at 2:30 PM. See you then!', isInitials: true, initials: 'PIC' }
    ],
    callTime: '00:32',
    audioTitle: 'WhatsApp Audio: Customer brake squeak recording while braking near Penang Bridge.'
  };

  // Waveform bars from exact Dribbble screenshot
  const waveformHeights = [
    12, 18, 24, 15, 30, 22, 16, 28, 34, 20,
    14, 26, 32, 18, 22, 29, 36, 24, 16, 28,
    35, 20, 15, 28, 32, 18, 24, 30, 14, 20,
    26, 32, 18, 25, 30, 16, 22, 28, 14, 18,
    24, 12, 20, 16, 22, 14, 18
  ];

  // Playback timer animation
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayProgress((prev) => (prev >= 60 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSkip = (seconds) => {
    setPlayProgress((prev) => Math.max(0, Math.min(60, prev + seconds)));
  };

  const handleCycleSpeed = () => {
    if (speed === '1x') setSpeed('1.5x');
    else if (speed === '1.5x') setSpeed('2x');
    else setSpeed('1x');
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="inspector-collapsed-btn"
        title="Open Right Inspector Panel"
        style={{
          width: 32,
          background: '#f8fafc',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          border: 'none',
          borderLeft: '1px solid var(--border-subtle)',
          outline: 'none'
        }}
      >
        <span>◨</span>
      </button>
    );
  }

  return (
    <div className="right-detail-panel">
      <div>
        {/* Top Options Menu + Toggle */}
        <div className="right-panel-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {onToggle ? (
            <button
              onClick={onToggle}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Collapse Inspector"
            >
              <span>◧</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Inspector</span>
            </button>
          ) : (
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              CONTEXT INSPECTOR
            </span>
          )}

          <button className="more-options-btn" title="More Options">•••</button>
        </div>

        {/* User Profile Card */}
        <div className="profile-card-center">
          <div className="avatar-container">
            {customer.avatar ? (
              <img
                src={customer.avatar}
                alt={customer.name}
                className="avatar-img"
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#1c1e22',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.2rem'
                }}
              >
                {customer.name ? customer.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'PS'}
              </div>
            )}
            {customer.online !== false && <span className="online-dot" />}
          </div>
          <h3 className="profile-name">{customer.name}</h3>
          <div className="profile-call-type">
            <span>🚘</span>
            <span>{customer.subtitle || 'Proton X50 1.5 TGDi (VAB 2020)'}</span>
          </div>

          {/* 3 Action Buttons */}
          <div className="profile-action-row">
            <button
              className={`action-star-pill ${isFavorited ? 'active' : ''}`}
              title="Favorite"
              onClick={() => setIsFavorited(!isFavorited)}
              style={{
                background: isFavorited ? '#f59e0b' : '#fdf0d5',
                color: isFavorited ? '#ffffff' : '#7a6234'
              }}
            >
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </button>

            <button
              className="action-round-btn phone"
              title={`Call ${customer.phone || customer.name}`}
              onClick={() => alert(`Initiating direct VoIP call to ${customer.phone || customer.name}...`)}
            >
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </button>

            <button
              className="action-round-btn message"
              title="Send WhatsApp Message"
              onClick={() => alert(`Opening WhatsApp quick conversation with ${customer.name}...`)}
            >
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Summarize Section */}
        <div className="summarize-section">
          <div className="summarize-header">
            <span className="summarize-title">Summarize</span>
            <div className="summarize-actions">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 14, height: 14, cursor: 'pointer' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span style={{ fontSize: '1rem', cursor: 'pointer', lineHeight: 0.5 }}>•••</span>
            </div>
          </div>

          {/* Conversation Messages */}
          <div className="conversation-flow">
            {customer.messages && customer.messages.map((msg, idx) => (
              <div key={idx} className="conversation-item">
                <span className="msg-time">{msg.time}</span>
                <div
                  className="msg-avatar"
                  style={msg.isInitials ? {
                    background: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 700
                  } : {}}
                >
                  {msg.isInitials ? (
                    <span>{msg.initials}</span>
                  ) : msg.avatar ? (
                    <img
                      src={msg.avatar}
                      alt={msg.role}
                    />
                  ) : (
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#1c1e22' }}>
                      {msg.role ? msg.role.slice(0, 2).toUpperCase() : 'PS'}
                    </span>
                  )}
                </div>
                <div className="msg-content">
                  <span className="msg-role">{msg.role}:</span>
                  <span>{msg.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diagnostic Voice Note / Audio Recording Section */}
      <div className="recording-section">
        <div className="recording-header">
          <span className="recording-title">Diagnostic Voice Note</span>
          <span
            className="recording-next-link"
            style={{ cursor: 'pointer' }}
            onClick={() => setPlayProgress(0)}
          >
            Restart
          </span>
        </div>
        {customer.audioTitle && (
          <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 8, lineHeight: 1.3 }}>
            {customer.audioTitle}
          </p>
        )}

        {/* Audio Waveform with Red Scrubber */}
        <div className="waveform-container" style={{ position: 'relative' }}>
          {waveformHeights.map((h, idx) => {
            const isPlayed = (idx / waveformHeights.length) * 60 <= playProgress;
            return (
              <div
                key={idx}
                className="waveform-bar"
                style={{
                  height: `${h}px`,
                  background: isPlayed ? '#1c1e22' : '#cbd5e1',
                  transition: 'background 0.15s ease'
                }}
              />
            );
          })}
          
          {/* Active playhead line and time */}
          <div
            className="waveform-scrubber-line"
            style={{ left: `${(playProgress / 60) * 100}%` }}
          />
          <div
            className="waveform-time-label"
            style={{ left: `${(playProgress / 60) * 100}%` }}
          >
            {formatSeconds(playProgress)}
          </div>
        </div>

        {/* Player Controls */}
        <div className="audio-controls-row">
          <span
            className="speed-tag"
            onClick={handleCycleSpeed}
            style={{ cursor: 'pointer', userSelect: 'none' }}
            title="Click to toggle playback speed"
          >
            {speed}
          </span>

          <button
            className="audio-btn skip-btn"
            title="Rewind 10s"
            onClick={() => handleSkip(-10)}
          >
            <span style={{ fontSize: '0.8rem' }}>↺ 10</span>
          </button>

          <button
            className="play-pause-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            className="audio-btn skip-btn"
            title="Forward 10s"
            onClick={() => handleSkip(10)}
          >
            <span style={{ fontSize: '0.8rem' }}>↻ 10</span>
          </button>

          <button className="audio-btn speaker-btn" title="Volume">
            <svg fill="currentColor" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

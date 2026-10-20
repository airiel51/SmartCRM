import React, { useState, useEffect } from 'react';

export default function Dashboard({ onSelectCustomer, onNavigateView }) {
  // Active selected row in table
  const [selectedRowId, setSelectedRowId] = useState(2);
  const [hoveredDot, setHoveredDot] = useState(null);
  const [tickerIndex, setTickerIndex] = useState(0);

  const liveTickerEvents = [
    '⚡ SmartCRM AI scheduled Michael Wong (Toyota Vios) for Bay 3',
    '🔧 Bay 2: Proton X50 brake pads replaced & rotors skimmed',
    '💬 WhatsApp: Priya Subramaniam confirmed quote RM 280.00',
    '📅 Tan Wei Ming (Honda Civic RS) booked for Saturday 10:00 AM',
    '🛡️ Autonomous scan: 2 overdue service reminders queued for dispatch'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % liveTickerEvents.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Automotive Workshop Inbound Streams & Inquiries
  const tableRows = [
    {
      id: 1,
      type: 'WhatsApp',
      typeClass: 'sms',
      callerId: '+60 19-411 9832',
      destination: 'Apex AutoWorks PIC',
      status: 'In Bay 3',
      statusClass: 'pending',
      date: 'Today, 2:34 PM',
      checked: false,
      customerData: {
        name: 'Michael Wong',
        subtitle: 'Toyota Vios 1.5G (JRS 7731) • Bay 3 (AC & Electrical)',
        phone: '+60 19-411 9832',
        online: true,
        messages: [
          { time: '2:15 PM', role: 'Michael', text: 'Hi Airiel, Toyota Vios plate JRS 7731 aircond suddenly not cold at all, only blowing hot air! Need urgent inspection please.' },
          { time: '2:20 PM', role: 'SmartCRM AI', text: 'NLP Extracted: Plate JRS 7731. Symptom: AC lukewarm/compressor. Recommended: Aircond Flush & R134a Regas (Est. RM 210.00).', isInitials: true, initials: 'AI' },
          { time: '2:34 PM', role: 'Airiel (PIC)', text: 'Assigned to Bay 3. Tech has vacuumed system and found cabin filter clogged. Regas underway.', isInitials: true, initials: 'PIC' }
        ],
        callTime: '00:18'
      }
    },
    {
      id: 2,
      type: 'WhatsApp',
      typeClass: 'call',
      callerId: '+60 16-554 2190',
      destination: 'Apex AutoWorks PIC',
      status: 'In Bay 2',
      statusClass: 'completed',
      date: 'Today, 2:02 PM',
      checked: true,
      customerData: {
        name: 'Priya Subramaniam',
        subtitle: 'Proton X50 1.5 TGDi (VAB 2020) • Bay 2 (Brakes)',
        phone: '+60 16-554 2190',
        online: true,
        messages: [
          { time: '1:12 PM', role: 'Priya', text: 'Salam Airiel, my Proton X50 plate VAB 2020 has high pitched squeak when I step on brakes near Bayan Lepas. Can I drop by?' },
          { time: '1:15 PM', role: 'SmartCRM AI', text: 'Extracted Plate VAB 2020. Symptom: Brake System Friction. Recommended: Ceramic Brake Pads & Rotor Skimming (Est RM 280.00).', isInitials: true, initials: 'AI' },
          { time: '2:02 PM', role: 'Airiel (PIC)', text: 'Front pads worn to 2.5mm. Rotors skimmed on lathe. Ready by 4:30 PM!', isInitials: true, initials: 'PIC' }
        ],
        callTime: '00:32'
      }
    },
    {
      id: 3,
      type: 'Retention',
      typeClass: 'failed',
      callerId: '+60 12-345 6789',
      destination: 'Autonomous Retention AI',
      status: 'Overdue Alert',
      statusClass: 'failed',
      date: 'Today, 1:50 PM',
      checked: false,
      customerData: {
        name: 'Ahmad Razali',
        subtitle: 'Perodua Myvi 1.5 AV (WXY 8821) • Overdue 3,400km',
        phone: '+60 12-345 6789',
        online: false,
        messages: [
          { time: '1:45 PM', role: 'AI Scanner', text: 'Odometer 58,400km is 3,400km (30 days) past 55,000km service threshold. Churn risk: High (83.9%).', isInitials: true, initials: 'AI' },
          { time: '1:50 PM', role: 'Airiel (PIC)', text: 'Automated WhatsApp retention reminder drafted with Bay 1 priority hold.', isInitials: true, initials: 'PIC' }
        ],
        callTime: '00:00'
      }
    },
    {
      id: 4,
      type: 'WhatsApp',
      typeClass: 'sms',
      callerId: '+60 17-882 1902',
      destination: 'Apex AutoWorks PIC',
      status: 'Confirmed',
      statusClass: 'completed',
      date: 'Today, 7:54 AM',
      checked: false,
      customerData: {
        name: 'Tan Wei Ming',
        subtitle: 'Honda Civic RS 1.5 VTEC (PNG 4419) • Bay 1 Scheduled',
        phone: '+60 17-882 1902',
        online: true,
        messages: [
          { time: '7:50 AM', role: 'Wei Ming', text: 'Hello Airiel, I want to book next regular 10k service for my Civic PNG 4419 this Saturday 10am. Liqui Moly synthetic oil ready?' },
          { time: '7:54 AM', role: 'Airiel (PIC)', text: 'Bay 1 reserved for Saturday 10 AM! 4L Liqui Moly 5W-30 & Honda OEM filter staged.', isInitials: true, initials: 'PIC' }
        ],
        callTime: '01:14'
      }
    },
    {
      id: 5,
      type: 'Retention',
      typeClass: 'pending',
      callerId: '+60 11-2345 9918',
      destination: 'Autonomous Retention AI',
      status: 'Due Soon',
      statusClass: 'pending',
      date: 'Today, 7:12 AM',
      checked: false,
      customerData: {
        name: 'Nurul Huda',
        subtitle: 'Perodua Bezza 1.3X (KV 5502) • Due in 10 Days',
        phone: '+60 11-2345 9918',
        online: true,
        messages: [
          { time: '7:08 AM', role: 'AI Scanner', text: 'Scheduled mileage 45,000km approaching (currently 44,500km). Recommended: Engine Oil & 25-Point Safety Check.', isInitials: true, initials: 'AI' },
          { time: '7:12 AM', role: 'Airiel (PIC)', text: 'Retention notification ready for WhatsApp dispatch.', isInitials: true, initials: 'PIC' }
        ],
        callTime: '00:45'
      }
    }
  ];

  const handleRowClick = (row) => {
    setSelectedRowId(row.id);
    if (onSelectCustomer && row.customerData) {
      onSelectCustomer(row.customerData);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 3 Automotive Workshop Metric Cards */}
      <div className="metric-cards-row">
        {/* Card 1: Lavender / Fleet Under Care */}
        <div className="metric-card-pastel lilac">
          <div className="metric-card-header">
            <span className="metric-card-title">Fleet Under Care</span>
            <button className="check-pill-btn" onClick={() => onNavigateView && onNavigateView('customers')}>Fleet</button>
          </div>
          <div className="metric-card-value">186 <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b7280' }}>Vehicles</span></div>
        </div>

        {/* Card 2: Sky Blue / Overdue Retention Scans */}
        <div className="metric-card-pastel blue">
          <div className="metric-card-header">
            <span className="metric-card-title">Overdue Retention Scans</span>
            <button className="check-pill-btn" onClick={() => onNavigateView && onNavigateView('agentic_ai')}>Scan</button>
          </div>
          <div className="metric-card-value">2 <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#dc2626' }}>Overdue Alerts</span></div>
        </div>

        {/* Card 3: Warm Honey / Repeat-Service Rate */}
        <div className="metric-card-pastel honey">
          <div className="metric-card-header">
            <span className="metric-card-title">Repeat-Service Rate (CAT405)</span>
            <button className="check-pill-btn" onClick={() => onNavigateView && onNavigateView('pipeline')}>Bays</button>
          </div>
          <div className="metric-card-value">74.2% <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#16a34a' }}>Loyalty Benchmark</span></div>
        </div>
      </div>

      {/* Campaign Overview Card (Stream Curves + Dot Matrix) */}
      <div className="overview-chart-card">
        <div className="overview-card-header">
          <h2 className="overview-title">Workshop Service & Campaign Demand (Penang)</h2>

          <div className="overview-tools">
            <button className="filter-btn">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filter</span>
            </button>

            <button className="month-dropdown-btn">
              <span>Month</span>
              <span style={{ fontSize: '0.7rem' }}>∨</span>
            </button>

            <div className="indicator-x10">
              <span className="indicator-x10-dot" />
              <span>x 10</span>
            </div>
          </div>
        </div>

        {/* Stats Sub-Row: Aug 422 | +127 | Sep 549 */}
        <div className="chart-stats-row">
          <div className="stat-col-left">
            <div className="stat-month-label">Aug, 2026</div>
            <div className="stat-main-num">422</div>
          </div>

          <div className="stat-center-badge">+127</div>

          <div className="stat-col-right">
            <div className="stat-month-label">Sep, 2026</div>
            <div className="stat-main-num">549</div>
          </div>
        </div>

        {/* Stream Curves & Dot Matrix Visualization */}
        <div className="sankey-flow-wrapper">
          <svg width="100%" height="145" viewBox="0 0 760 145" preserveAspectRatio="none">
            <defs>
              {/* Yellow/Gold Ribbon Gradient */}
              <linearGradient id="yellowRibbon" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f7d47a" />
                <stop offset="60%" stopColor="#f5b838" />
                <stop offset="100%" stopColor="#f4b228" />
              </linearGradient>

              {/* Soft Blue Ribbon */}
              <linearGradient id="blueRibbon" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#d2e7f7" />
                <stop offset="100%" stopColor="#b4d7f3" />
              </linearGradient>

              {/* Soft Purple/Pink Ribbon */}
              <linearGradient id="purpleRibbon" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e9def5" />
                <stop offset="100%" stopColor="#ddcaee" />
              </linearGradient>

              {/* Light Lavender Ribbon */}
              <linearGradient id="lavenderRibbon" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f4ecfa" />
                <stop offset="100%" stopColor="#ebdff5" />
              </linearGradient>
            </defs>

            {/* Left Column Labels & Thin Guides */}
            <text x="25" y="24" fill="#8c94a4" fontSize="10.5" fontWeight="500">Notice</text>
            <text x="25" y="38" fill="#1a1d23" fontSize="11" fontWeight="700">540</text>
            <line x1="85" y1="30" x2="155" y2="30" stroke="#f0f2f6" strokeWidth="1" />

            <text x="25" y="64" fill="#8c94a4" fontSize="10.5" fontWeight="500">Receipts</text>
            <text x="25" y="78" fill="#1a1d23" fontSize="11" fontWeight="700">138</text>
            <line x1="85" y1="70" x2="155" y2="70" stroke="#f0f2f6" strokeWidth="1" />

            <text x="25" y="104" fill="#8c94a4" fontSize="10.5" fontWeight="500">Newsletter</text>
            <text x="25" y="118" fill="#1a1d23" fontSize="11" fontWeight="700">549</text>
            <line x1="85" y1="110" x2="155" y2="110" stroke="#f0f2f6" strokeWidth="1" />

            <text x="25" y="136" fill="#8c94a4" fontSize="10" fontWeight="500">Reminders</text>
            <text x="25" y="148" fill="#1a1d23" fontSize="10.5" fontWeight="700">371</text>

            {/* Sankey Flowing Stream Curves */}
            <path
              d="M 155 95 C 230 95, 270 24, 385 24 L 385 46 C 270 46, 230 108, 155 108 Z"
              fill="url(#yellowRibbon)"
            />
            <path
              d="M 155 102 C 220 102, 280 62, 385 62 L 385 78 C 280 78, 220 114, 155 114 Z"
              fill="url(#blueRibbon)"
            />
            <path
              d="M 155 110 C 220 110, 290 98, 385 98 L 385 110 C 290 110, 220 118, 155 118 Z"
              fill="url(#purpleRibbon)"
            />
            <path
              d="M 155 116 C 220 116, 290 128, 385 128 L 385 138 C 290 138, 220 124, 155 124 Z"
              fill="url(#lavenderRibbon)"
            />

            {/* Middle Labels */}
            <text x="405" y="32" fill="#8c94a4" fontSize="10.5" fontWeight="500">Email alerts</text>
            <text x="405" y="46" fill="#1a1d23" fontSize="11" fontWeight="700">279</text>
            <line x1="385" y1="36" x2="385" y2="48" stroke="#f0f2f6" strokeWidth="1" />

            <text x="405" y="68" fill="#8c94a4" fontSize="10.5" fontWeight="500">Messaging</text>
            <text x="405" y="82" fill="#1a1d23" fontSize="11" fontWeight="700">107</text>

            <text x="405" y="104" fill="#8c94a4" fontSize="10.5" fontWeight="500">Surveys</text>
            <text x="405" y="118" fill="#1a1d23" fontSize="11" fontWeight="700">65</text>

            <text x="405" y="132" fill="#8c94a4" fontSize="10" fontWeight="500">Voice-call</text>
            <text x="405" y="144" fill="#1a1d23" fontSize="10.5" fontWeight="700">98</text>

            {/* Right Side: Organic Yellow/Golden Dot Matrix with Interactive Micro-Telemetry */}
            {[
              { cx: 485, cy: 30, r: 4.5, c: '#f4b228', plate: 'VAB 2020', bay: 'Bay 2', turn: '2.1h' },
              { cx: 505, cy: 22, r: 6, c: '#f7d47a', plate: 'JRS 7731', bay: 'Bay 3', turn: '3.4h' },
              { cx: 518, cy: 45, r: 3.5, c: '#f5b838', plate: 'PNG 4419', bay: 'Bay 1', turn: '1.2h' },
              { cx: 535, cy: 32, r: 5, c: '#fcd36a', plate: 'WXY 8821', bay: 'Scan', turn: 'Pending' },
              { cx: 550, cy: 25, r: 7, c: '#f4b228', plate: 'KV 5502', bay: 'Due', turn: '10 Days' },
              { cx: 568, cy: 40, r: 4, c: '#f7d47a', plate: 'BEM 9901', bay: 'Bay 4', turn: '4.0h' },
              { cx: 585, cy: 28, r: 5.5, c: '#f5b838', plate: 'PKG 1204', bay: 'Bay 1', turn: '1.5h' },
              { cx: 605, cy: 35, r: 7.5, c: '#fcd36a', plate: 'WWQ 3320', bay: 'Bay 2', turn: '2.6h' },
              { cx: 622, cy: 22, r: 4, c: '#f4b228', plate: 'ALB 7741', bay: 'Bay 3', turn: '3.1h' },
              { cx: 640, cy: 38, r: 5, c: '#f7d47a', plate: 'VDE 8021', bay: 'Bay 4', turn: '1.8h' },
              { cx: 660, cy: 30, r: 6, c: '#f5b838', plate: 'PPA 9011', bay: 'Bay 2', turn: '2.4h' },
              { cx: 495, cy: 65, r: 5, c: '#f7d47a', plate: 'WVA 6123', bay: 'Bay 1', turn: '1.1h' },
              { cx: 520, cy: 75, r: 6.5, c: '#f4b228', plate: 'JMT 4022', bay: 'Bay 3', turn: '3.6h' },
              { cx: 545, cy: 60, r: 4, c: '#fcd36a', plate: 'KDC 7119', bay: 'Bay 2', turn: '2.2h' },
              { cx: 570, cy: 80, r: 7, c: '#f5b838', plate: 'VCD 3004', bay: 'Bay 4', turn: '4.2h' },
              { cx: 595, cy: 68, r: 4.5, c: '#f7d47a', plate: 'BKP 5510', bay: 'Bay 1', turn: '1.3h' },
              { cx: 620, cy: 85, r: 6, c: '#f4b228', plate: 'PEN 8820', bay: 'Bay 3', turn: '2.9h' },
              { cx: 645, cy: 70, r: 5, c: '#f5b838', plate: 'MC 4410', bay: 'Bay 2', turn: '2.0h' },
              { cx: 665, cy: 80, r: 4, c: '#fcd36a', plate: 'WLL 9122', bay: 'Scan', turn: 'Hold' },
              { cx: 505, cy: 110, r: 4, c: '#f7d47a', plate: 'JHB 3381', bay: 'Bay 1', turn: '1.0h' },
              { cx: 530, cy: 118, r: 5.5, c: '#f5b838', plate: 'PL 7720', bay: 'Bay 3', turn: '3.8h' },
              { cx: 555, cy: 105, r: 6, c: '#f4b228', plate: 'VRT 5011', bay: 'Bay 4', turn: '4.5h' },
              { cx: 580, cy: 120, r: 4.5, c: '#fcd36a', plate: 'KAE 6620', bay: 'Bay 2', turn: '2.3h' },
              { cx: 605, cy: 112, r: 7, c: '#f5b838', plate: 'BMW 3201', bay: 'Bay 1', turn: '1.7h' },
              { cx: 630, cy: 125, r: 5, c: '#f7d47a', plate: 'PRP 8109', bay: 'Bay 3', turn: '3.0h' },
              { cx: 655, cy: 115, r: 4.5, c: '#f4b228', plate: 'VDG 4490', bay: 'Bay 2', turn: '2.5h' }
            ].map((dot, idx) => (
              <circle
                key={idx}
                cx={dot.cx}
                cy={dot.cy}
                r={dot.r}
                fill={dot.c}
                opacity={0.88}
                className="animated-scatter-dot"
                onMouseEnter={() => setHoveredDot(dot)}
                onMouseLeave={() => setHoveredDot(null)}
                style={{
                  animationDelay: `${(idx % 8) * 0.35}s`,
                  animationDuration: `${2.4 + (idx % 4) * 0.4}s`
                }}
              />
            ))}

            {/* Interactive SVG Hover Tooltip for Scatter Dot */}
            {hoveredDot && (
              <g transform={`translate(${Math.min(580, Math.max(480, hoveredDot.cx - 50))}, ${Math.max(12, hoveredDot.cy - 30)})`}>
                <rect width="118" height="24" rx="6" fill="#1c1e22" opacity="0.95" />
                <text x="59" y="15" fill="#ffffff" fontSize="9.5" fontWeight="700" textAnchor="middle">
                  {hoveredDot.plate} • {hoveredDot.turn}
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Inquiries & Interactions Table */}
      <div className="interactions-table-wrapper">
        <table className="interactions-table">
          <thead>
            <tr>
              <th style={{ width: 34 }}>
                <div className="table-checkbox checked">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M5 12h14" />
                  </svg>
                </div>
              </th>
              <th>Type</th>
              <th>Caller ID</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ width: 24 }}></th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr
                key={row.id}
                className={selectedRowId === row.id ? 'selected-row' : ''}
                onClick={() => handleRowClick(row)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <div className={`table-checkbox ${selectedRowId === row.id ? 'checked' : ''}`}>
                    {selectedRowId === row.id && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`type-badge-pill ${row.typeClass}`}>
                    {row.type === 'SMS' && (
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                      </svg>
                    )}
                    {row.type === 'Call' && (
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                    )}
                    {row.type === 'Email' && (
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    )}
                    <span>{row.type}</span>
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#1a1d23' }}>{row.callerId}</td>
                <td>{row.destination}</td>
                <td>
                  <span className={`status-cell ${row.statusClass}`}>
                    <span className="status-icon-dot" />
                    <span>{row.status}</span>
                  </span>
                </td>
                <td>{row.date}</td>
                <td>
                  <button className="action-dots-btn">⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating Live Autonomous Workshop Activity Ticker */}
      <div
        style={{
          position: 'fixed',
          bottom: 22,
          right: 336,
          background: '#1c1e22',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          fontSize: '0.78rem',
          fontWeight: 600,
          zIndex: 100,
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s ease'
        }}
      >
        <span className="live-pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
        <span style={{ color: '#10b981', fontWeight: 800, letterSpacing: 0.5, fontSize: '0.72rem' }}>LIVE PIC FEED</span>
        <span style={{ color: '#64748b' }}>•</span>
        <span style={{ animation: 'smoothTickerSlide 4.5s ease-in-out infinite' }}>
          {liveTickerEvents[tickerIndex]}
        </span>
      </div>
    </div>
  );
}

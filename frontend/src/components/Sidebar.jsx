import React from 'react';

export default function Sidebar({ currentView, setCurrentView }) {
  const navItems = [
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
        </svg>
      )
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Communications & NLP',
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      )
    },
    {
      id: 'pipeline',
      title: 'Calendar & Work Order Pipeline',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'customers',
      title: 'Customer & Vehicle Fleet Directory',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'supabase',
      title: 'Supabase Cloud Sync & Settings',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'agentic_ai',
      title: 'Agentic AI Support & Intelligence',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
      )
    }
  ];

  return (
    <nav className="nav-rail">
      <div className="nav-rail-top">
        {/* Brand Circular Logo with Curved "S" */}
        <div
          className="brand-circle-logo"
          onClick={() => setCurrentView('dashboard')}
          title="SmartCRM Dashboard"
        >
          <svg viewBox="0 0 32 32" fill="none">
            <path
              d="M19 8C19 8 13.5 7.5 11 11C8.5 14.5 12 17 15 18C18 19 21.5 20.5 21 24C20.5 27.5 15 28 12 26"
              stroke="#1c1e22"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Menu Items */}
        <div className="nav-rail-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`rail-btn ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
              title={item.title}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Exit / Logout Icon */}
      <div className="nav-rail-bottom">
        <button
          className="rail-btn"
          title="Exit Session"
          onClick={() => setCurrentView('dashboard')}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

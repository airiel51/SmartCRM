import React from 'react';

export default function Sidebar({ currentView, setCurrentView, currentRole = 'owner', isMobileOpen = false, onCloseMobile }) {
  const navSections = [
    {
      title: 'OPERATIONS',
      items: [
        {
          id: 'overview',
          label: 'Overview',
          icon: (
            <svg fill="currentColor" viewBox="0 0 24 24" width="18" height="18">
              <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
            </svg>
          )
        },
        {
          id: 'customers',
          label: 'Customers',
          icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )
        },
        {
          id: 'vehicles',
          label: 'Vehicles Fleet',
          icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h2" />
            </svg>
          )
        },
        {
          id: 'appointments',
          label: 'Appointments',
          icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )
        },
        {
          id: 'pipeline',
          label: 'Service Jobs & Bays',
          icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'COMMUNICATIONS',
      items: [
        {
          id: 'inquiries',
          label: 'Inquiries & Leads',
          badge: 'New',
          icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          )
        },
        {
          id: 'reminders',
          label: 'Service Reminders',
          badge: 'Alert',
          icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          )
        },
        {
          id: 'whatsapp',
          label: 'WhatsApp Live & Outbox',
          icon: (
            <svg fill="currentColor" viewBox="0 0 24 24" width="18" height="18">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        {
          id: 'analytics',
          label: 'Analytics & BI',
          icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        },
        {
          id: 'ai_insights',
          label: 'AI Insights & Strategy',
          badge: 'AI',
          icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        {
          id: 'faq',
          label: 'Workshop FAQ & Policies',
          icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          id: 'settings',
          label: 'Settings & Cloud Sync',
          icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )
        }
      ]
    }
  ];

  return (
    <aside className={`app-sidebar ${isMobileOpen ? 'mobile-drawer-open' : ''}`}>
      {/* Brand Header with Clickable Logo & Mobile Close */}
      <div className="sidebar-brand-row">
        <div
          className="sidebar-brand clickable-brand"
          onClick={() => {
            setCurrentView('overview');
            if (onCloseMobile) onCloseMobile();
          }}
          role="button"
          tabIndex={0}
          title="Return to Workshop Overview"
        >
          <div className="brand-badge-icon">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="brand-name">SmartCRM</h1>
            <span className="brand-sub">Apex AutoWorks • Bayan Lepas</span>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            className="sidebar-mobile-close-btn"
            onClick={onCloseMobile}
            aria-label="Close Navigation"
            title="Close Menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* Role Pill */}
      <div className="sidebar-role-indicator">
        <span className="role-dot"></span>
        <span className="role-text">
          {currentRole === 'owner' ? 'Owner / Admin' : currentRole === 'pic' ? 'PIC / Staff' : 'Technician'}
        </span>
      </div>

      {/* Nav Menu */}
      <div className="sidebar-nav">
        {navSections.map((sec, idx) => (
          <div key={idx} className="nav-section">
            <span className="nav-section-label">{sec.title}</span>
            <div className="nav-section-items">
              {sec.items.map((item) => {
                const isActive = currentView === item.id || (currentView === 'dashboard' && item.id === 'overview');
                return (
                  <button
                    key={item.id}
                    className={`nav-item-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentView(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    {item.badge && <span className={`nav-badge nav-badge-${item.badge.toLowerCase()}`}>{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="avatar-circle">AH</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>Airiel Hazim</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              <a href="tel:+60123456789" style={{ color: 'inherit', textDecoration: 'none' }} title="Call Workshop">
                Penang, Malaysia
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

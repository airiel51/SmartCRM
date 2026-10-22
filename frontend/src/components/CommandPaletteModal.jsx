import React, { useState, useEffect, useRef } from 'react';

const SEARCHABLE_ITEMS = [
  // Modules
  { id: 'overview', title: 'Workshop Overview Dashboard', type: 'PAGE', subtitle: 'Live bays, daily appointments, overdue follow-ups', view: 'overview' },
  { id: 'customers', title: 'Customer & Vehicle Directory', type: 'PAGE', subtitle: '360° client profiles, telemetry & spend history', view: 'customers' },
  { id: 'vehicles', title: 'Registered Vehicle Fleet', type: 'PAGE', subtitle: 'Malaysian plates, odometer telemetry, service schedules', view: 'vehicles' },
  { id: 'appointments', title: 'Appointments & Scheduling', type: 'PAGE', subtitle: 'Bay reservation calendar & slot dispatching', view: 'appointments' },
  { id: 'pipeline', title: 'Service Jobs & Active Bays', type: 'PAGE', subtitle: 'Shop floor Kanban: Intake, Mechanical, QC, Invoiced', view: 'pipeline' },
  { id: 'inquiries', title: 'Inquiries & Leads Queue', type: 'PAGE', subtitle: 'Inbound leads, entity extraction, 1-click booking', view: 'inquiries' },
  { id: 'reminders', title: 'Service Interval Reminders', type: 'PAGE', subtitle: 'Dual odometer-calendar threshold alerts', view: 'reminders' },
  { id: 'whatsapp', title: 'WhatsApp Live Center', type: 'PAGE', subtitle: 'NLP chat symptom extraction & automated replies', view: 'whatsapp' },
  { id: 'analytics', title: 'Analytics & BI Insights', type: 'PAGE', subtitle: 'Repeat retention rate, ARO, revenue splits', view: 'analytics' },
  { id: 'ai_insights', title: 'AI Strategic Recommendations', type: 'PAGE', subtitle: 'Factual evidence-backed shop floor guidance', view: 'ai_insights' },
  { id: 'faq', title: 'Workshop FAQ & Service Policies', type: 'PAGE', subtitle: 'Warranty, oil grades, operating hours, Bay policies', view: 'faq' },
  { id: 'settings', title: 'Workshop Settings & Staff Roles', type: 'PAGE', subtitle: 'Identity, SSM reg, intervals, WhatsApp & Gemini keys', view: 'settings' },

  // Customers & Vehicles
  { id: 'c1', title: 'Ahmad Razali • Perodua Myvi (WXY 8821)', type: 'CUSTOMER', subtitle: 'Phone: +60 12-345 6789 • Bayan Lepas', view: 'customers' },
  { id: 'c2', title: 'Tan Wei Ming • Honda Civic (PNG 4419)', type: 'CUSTOMER', subtitle: 'Phone: +60 17-882 1902 • George Town', view: 'customers' },
  { id: 'c3', title: 'Priya Subramaniam • Proton X50 (VAB 2020)', type: 'CUSTOMER', subtitle: 'Phone: +60 16-554 2190 • Relau, Penang', view: 'customers' },
  { id: 'c4', title: 'Michael Wong • Toyota Vios (JRS 7731)', type: 'CUSTOMER', subtitle: 'Phone: +60 19-411 9832 • Sungai Nibong', view: 'customers' },
  { id: 'c5', title: 'Siti Nurhaliza • Perodua Myvi (VDF 4509)', type: 'CUSTOMER', subtitle: 'Phone: +60 19-332 1104 • Gelugor, Penang', view: 'customers' },
  { id: 'c6', title: 'Muthu Raman • Proton X50 (PKW 1290)', type: 'CUSTOMER', subtitle: 'Phone: +60 17-229 4811 • Batu Maung', view: 'customers' },

  // Action Shortcuts
  { id: 'a1', title: '+ Intake New Vehicle Profile', type: 'ACTION', subtitle: 'Enroll vehicle specs, plate, and odometer', action: 'intake' },
  { id: 'a2', title: '+ Dispatch Work Order to Bay', type: 'ACTION', subtitle: 'Assign customer to shop floor bay with estimate', action: 'service' }
];

export default function CommandPaletteModal({ isOpen, onClose, onNavigate, onTriggerAction }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else if (onNavigate) onNavigate('OPEN_SEARCH');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = SEARCHABLE_ITEMS.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item) => {
    if (item.action && onTriggerAction) {
      onTriggerAction(item.action);
    } else if (item.view && onNavigate) {
      onNavigate(item.view);
    }
    onClose();
  };

  return (
    <div className="modal-overlay command-palette-overlay" onClick={onClose} style={{ zIndex: 10002 }}>
      <div
        className="command-palette-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Site search and navigation"
      >
        {/* Search Input Bar */}
        <div className="command-search-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder="Type a module, car plate (e.g. WXY 8821), customer name, or action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="command-esc-key" onClick={onClose}>ESC</kbd>
        </div>

        {/* Results List */}
        <div className="command-results-list">
          {filtered.length === 0 ? (
            <div className="command-empty-state">
              <span>No results matching "{query}"</span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Try searching for a Malaysian license plate, customer name, or module.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="command-item-row"
                onClick={() => handleSelect(item)}
              >
                <div className="command-item-main">
                  <div className="command-item-title">{item.title}</div>
                  <div className="command-item-subtitle">{item.subtitle}</div>
                </div>
                <span className={`command-badge command-badge-${item.type.toLowerCase()}`}>
                  {item.type}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="command-palette-footer">
          <span>Navigate with <strong>↑</strong> <strong>↓</strong></span>
          <span>Select with <strong>↵</strong></span>
          <span>Close with <strong>ESC</strong></span>
        </div>
      </div>
    </div>
  );
}

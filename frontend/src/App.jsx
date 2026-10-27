import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import FloatingContactWidget from './components/FloatingContactWidget';
import CookieBanner from './components/CookieBanner';
import ConfirmModal from './components/ConfirmModal';
import CopyButton from './components/CopyButton';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

// Route-Level Code Splitting with React.lazy
const Dashboard = lazy(() => import('./components/Dashboard'));
const CustomerDirectory = lazy(() => import('./components/CustomerDirectory'));
const VehiclesView = lazy(() => import('./components/VehiclesView'));
const AppointmentsView = lazy(() => import('./components/AppointmentsView'));
const PipelineBoard = lazy(() => import('./components/PipelineBoard'));
const InquiriesView = lazy(() => import('./components/InquiriesView'));
const RemindersView = lazy(() => import('./components/RemindersView'));
const AnalyticsView = lazy(() => import('./components/AnalyticsView'));
const AIInsightsView = lazy(() => import('./components/AIInsightsView'));
const WhatsAppLiveHub = lazy(() => import('./components/WhatsAppLiveHub'));
const FAQView = lazy(() => import('./components/FAQView'));
const SettingsView = lazy(() => import('./components/SettingsView'));

// Lazy load dialog modals and widgets
const AgenticAIChatbotWidget = lazy(() => import('./components/AgenticAIChatbotWidget'));
const CommandPaletteModal = lazy(() => import('./components/CommandPaletteModal'));
const AddCustomerModal = lazy(() => import('./components/Modals').then(m => ({ default: m.AddCustomerModal })));
const AddServiceModal = lazy(() => import('./components/Modals').then(m => ({ default: m.AddServiceModal })));

function ViewLoadingSkeleton() {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div className="skeleton-line lg" style={{ width: 240, height: 28, marginBottom: 8 }} />
          <div className="skeleton-line sm" style={{ width: 380, height: 16 }} />
        </div>
        <div className="skeleton-line sm" style={{ width: 120, height: 36, borderRadius: 6 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[1, 2, 3, 4].map(n => (
          <div key={n} style={{ background: 'var(--bg-card)', padding: 18, borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <div className="skeleton-line xs" style={{ width: '60%', marginBottom: 10 }} />
            <div className="skeleton-line md" style={{ width: '40%', height: 24, marginBottom: 6 }} />
            <div className="skeleton-line xs" style={{ width: '80%' }} />
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 10, border: '1px solid var(--border-color)', minHeight: 280 }}>
        <div className="skeleton-line sm" style={{ width: '30%', marginBottom: 16 }} />
        <div className="skeleton-line sm" style={{ width: '90%', marginBottom: 10 }} />
        <div className="skeleton-line sm" style={{ width: '75%', marginBottom: 10 }} />
        <div className="skeleton-line sm" style={{ width: '85%' }} />
      </div>
    </div>
  );
}

const VIEW_TITLES = {
  overview: 'Workshop Overview',
  dashboard: 'Workshop Overview',
  customers: 'Customer & Vehicle Directory',
  vehicles: 'Registered Vehicle Fleet',
  appointments: 'Appointments & Scheduling',
  pipeline: 'Service Jobs & Active Bays',
  inquiries: 'Inquiries & Leads Queue',
  reminders: 'Service Interval Reminders',
  analytics: 'Analytics & Financials',
  ai_insights: 'AI Strategic Recommendations',
  whatsapp: 'WhatsApp Communications',
  faq: 'Workshop FAQ & Policies',
  settings: 'Workshop Settings & Staff Roles'
};

const VALID_VIEWS = Object.keys(VIEW_TITLES);

const getViewFromPath = () => {
  try {
    if (typeof window === 'undefined') return 'overview';
    if (window.location.hash) {
      const hashView = window.location.hash.replace(/^#\/?/, '').split('?')[0].split('/')[0];
      if (VALID_VIEWS.includes(hashView)) return hashView;
    }
    const path = window.location.pathname
      .replace(/^\/SmartCRM\/?/i, '')
      .replace(/^\//, '')
      .split('/')[0];
    if (path && VALID_VIEWS.includes(path)) {
      return path;
    }
  } catch (err) {
    console.warn('Path resolution error:', err);
  }
  return 'overview';
};

const formatTimestamp = () => {
  const d = new Date();
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export default function App() {
  const [currentView, setCurrentView] = useState(getViewFromPath);
  const [currentRole, setCurrentRole] = useState('owner'); // 'owner', 'pic', 'technician'
  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isSearchPaletteOpen, setIsSearchPaletteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Hideable Menu State (Desktop & Mobile)
  const [isMenuHidden, setIsMenuHidden] = useState(() => {
    return localStorage.getItem('smartcrm-menu-hidden') === 'true';
  });

  const handleToggleMenu = () => {
    if (window.innerWidth <= 1024) {
      setIsMobileMenuOpen(prev => !prev);
    } else {
      setIsMenuHidden(prev => {
        const next = !prev;
        localStorage.setItem('smartcrm-menu-hidden', String(next));
        return next;
      });
    }
  };

  // Global Ctrl+B shortcut to toggle sidebar menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Theme State (Dark Mode Toggle)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('smartcrm-theme') ||
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  // Scroll Progress & Back-to-Top State
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const contentAreaRef = useRef(null);

  // Dynamic Last Updated Timestamp
  const [lastUpdated, setLastUpdated] = useState(formatTimestamp());

  // UTM Attribution Tracking
  const [utmData, setUtmData] = useState(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger',
    onConfirm: () => {}
  });

  // Apply data-theme to HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('smartcrm-theme', theme);
  }, [theme]);

  // Dynamic Page Titles for SEO & Browser Tabs
  useEffect(() => {
    const titleText = VIEW_TITLES[currentView] || 'Workshop';
    document.title = `${titleText} — SmartCRM Apex AutoWorks`;
  }, [currentView]);

  // Ingest UTM Marketing Tracking from URL query params
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const source = params.get('utm_source');
      const medium = params.get('utm_medium');
      const campaign = params.get('utm_campaign');

      if (source || medium || campaign) {
        const data = {
          source: source || 'direct',
          medium: medium || 'referral',
          campaign: campaign || 'workshop_2026'
        };
        setUtmData(data);
        sessionStorage.setItem('smartcrm-utm', JSON.stringify(data));
      } else {
        const stored = sessionStorage.getItem('smartcrm-utm');
        if (stored) {
          setUtmData(JSON.parse(stored));
        }
      }
    } catch (err) {
      console.warn('UTM parsing warning:', err);
    }
  }, []);

  // Scroll Progress listener on viewport container
  const handleScroll = (e) => {
    const target = e.target;
    const totalHeight = target.scrollHeight - target.clientHeight;
    if (totalHeight > 0) {
      const progress = Math.min(100, Math.max(0, (target.scrollTop / totalHeight) * 100));
      setScrollProgress(progress);
    }
    setShowBackToTop(target.scrollTop > 220);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Listen to browser Back/Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getViewFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (view) => {
    if (view === 'OPEN_SEARCH') {
      setIsSearchPaletteOpen(true);
      return;
    }
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const targetPath = view === 'overview' ? cleanBase : `${cleanBase}${view}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view }, '', targetPath);
      }
    } catch (e) {
      console.warn('History pushState error:', e);
    }
    // Scroll view back to top on navigation
    if (contentAreaRef.current) {
      contentAreaRef.current.scrollTop = 0;
    }
  };

  const handleRefreshData = () => {
    setLastUpdated(formatTimestamp());
  };

  return (
    <ToastProvider>
      <div className="smartcrm-app-root">
        {/* Skip to Content Accessibility Bypass Link */}
        <a href="#smartcrm-main-content" className="skip-to-content">
          Skip to main content
        </a>

        {/* Mobile Drawer Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="sidebar-mobile-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            title="Close Navigation"
          />
        )}

        {/* 1. Left SaaS Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          setCurrentView={handleNavigate}
          currentRole={currentRole}
          isMobileOpen={isMobileMenuOpen}
          isMenuHidden={isMenuHidden}
          onToggleHide={handleToggleMenu}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* 2. Main Application Viewport */}
        <main className="smartcrm-main-viewport">
          {/* Top Horizontal Scroll Progress Bar */}
          <div className="scroll-progress-bar-track">
            <div
              className="scroll-progress-bar"
              style={{ width: `${scrollProgress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(scrollProgress)}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>

          {/* Universal SaaS Top Bar */}
          <header className="smartcrm-topbar">
            <div className="topbar-left">
              {/* Menu Hide / Show Toggle Button (Desktop & Mobile) */}
              <button
                className={`menu-toggle-btn mobile-menu-toggle-btn ${isMenuHidden ? 'menu-hidden-active' : ''}`}
                onClick={handleToggleMenu}
                aria-label={isMenuHidden ? "Show Navigation Menu (Ctrl+B)" : "Hide Navigation Menu (Ctrl+B)"}
                title={isMenuHidden ? "Show Menu (Ctrl+B)" : "Hide Menu (Ctrl+B)"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  {isMenuHidden ? (
                    <polyline points="13 9 16 12 13 15"></polyline>
                  ) : (
                    <polyline points="16 9 13 12 16 15"></polyline>
                  )}
                </svg>
              </button>

              {/* Clickable Brand Breadcrumb */}
              <div className="breadcrumb-trail">
                <span
                  className="breadcrumb-org clickable-org"
                  onClick={() => handleNavigate('overview')}
                  title="Return to Workshop Overview"
                >
                  Apex AutoWorks
                </span>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">{VIEW_TITLES[currentView] || 'Overview'}</span>
              </div>

              {/* UTM Campaign Tracking Chip */}
              {utmData && (
                <div className="utm-tracking-pill" title={`UTM Source: ${utmData.source} | Medium: ${utmData.medium} | Campaign: ${utmData.campaign}`}>
                  <span>🎯 {utmData.source}/{utmData.medium}</span>
                  <CopyButton
                    text={`utm_source=${utmData.source}&utm_medium=${utmData.medium}&utm_campaign=${utmData.campaign}`}
                    title="Copy active UTM query string"
                  />
                </div>
              )}
            </div>

            <div className="topbar-right">
              {/* Site Search & Command Palette Trigger */}
              <div
                className="topbar-search"
                onClick={() => setIsSearchPaletteOpen(true)}
                title="Global Search & Quick Actions (Press Ctrl+K)"
                style={{ cursor: 'pointer' }}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search plates, bays, FAQ (Ctrl+K)..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  readOnly
                  style={{ cursor: 'pointer' }}
                />
                <kbd style={{ fontSize: '0.68rem', padding: '2px 5px', borderRadius: 4, background: 'var(--border-subtle)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  ⌘K
                </kbd>
              </div>

              {/* Persistent Demo Data Badge */}
              <div className="demo-data-badge" title="Workshop simulation active: all telemetry, work orders, and chats are demo data">
                <span className="demo-data-pulse" aria-hidden="true"></span>
                <span>Demo Data</span>
              </div>

              {/* Dynamic Last Updated Badge */}
              <div className="last-updated-badge" title="Live telemetry sync timestamp">
                <span className="last-updated-dot"></span>
                <span>{lastUpdated}</span>
                <button
                  type="button"
                  className="refresh-sync-btn"
                  onClick={handleRefreshData}
                  title="Sync workshop telemetry"
                  aria-label="Sync workshop telemetry"
                >
                  ↻
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <button
                type="button"
                className="theme-toggle-btn"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              {/* Quick Action Buttons */}
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsIntakeModalOpen(true)}
                title="Register a new customer vehicle"
              >
                + Intake Vehicle
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsServiceModalOpen(true)}
                title="Create a new bay work order"
              >
                + Work Order
              </button>

              {/* Role Switcher Pill */}
              <div className="role-selector-wrap">
                <select
                  className="role-select-dropdown"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  title="Simulate Role Permissions"
                >
                  <option value="owner">👑 Owner / Admin</option>
                  <option value="pic">📋 PIC / Staff</option>
                  <option value="technician">🔧 Technician</option>
                </select>
              </div>
            </div>
          </header>

          {/* Dynamic Route Workspace */}
          <div
            id="smartcrm-main-content"
            className="smartcrm-content-area"
            ref={contentAreaRef}
            onScroll={handleScroll}
            tabIndex="-1"
          >
            <ErrorBoundary fallbackTitle="Workshop Module Intercepted" onReset={() => handleNavigate('overview')}>
              <Suspense fallback={<ViewLoadingSkeleton />}>
                {(currentView === 'overview' || currentView === 'dashboard') && (
                  <Dashboard
                    onNavigateView={handleNavigate}
                    onSelectCustomer={setSelectedCustomer}
                  />
                )}

              {currentView === 'customers' && (
                <CustomerDirectory
                  globalSearch={globalSearch}
                  searchQuery={globalSearch}
                  onSelectCustomer={setSelectedCustomer}
                  onOpenNewCustomer={() => setIsIntakeModalOpen(true)}
                  onAddCustomer={() => setIsIntakeModalOpen(true)}
                />
              )}

              {currentView === 'vehicles' && (
                <VehiclesView
                  onIntakeVehicle={() => setIsIntakeModalOpen(true)}
                />
              )}

              {currentView === 'appointments' && (
                <AppointmentsView
                  onOpenBookingModal={() => setIsServiceModalOpen(true)}
                />
              )}

              {currentView === 'pipeline' && (
                <PipelineBoard
                  onOpenNewDeal={() => setIsServiceModalOpen(true)}
                  onOpenServiceModal={() => setIsServiceModalOpen(true)}
                  onSelectCustomer={setSelectedCustomer}
                />
              )}

              {currentView === 'inquiries' && (
                <InquiriesView />
              )}

              {currentView === 'reminders' && (
                <RemindersView
                  onScheduleService={() => setIsServiceModalOpen(true)}
                />
              )}

              {currentView === 'analytics' && (
                <AnalyticsView />
              )}

              {currentView === 'ai_insights' && (
                <AIInsightsView />
              )}

              {currentView === 'whatsapp' && (
                <WhatsAppLiveHub
                  onSelectCustomer={setSelectedCustomer}
                />
              )}

              {currentView === 'faq' && (
                <FAQView />
              )}

              {currentView === 'settings' && (
                <SettingsView
                  currentRole={currentRole}
                  onChangeRole={setCurrentRole}
                />
              )}
            </Suspense>

              {/* Custom 404 Fallback Page */}
              {!VALID_VIEWS.includes(currentView) && (
                <div className="view-container">
                  <div className="empty-state custom-404-card">
                    <div style={{ fontSize: '3.2rem', marginBottom: 12 }}>🔧</div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0' }}>
                      404 — Workshop Page Not Found
                    </h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 20px auto', fontSize: '0.88rem', lineHeight: 1.55 }}>
                      The requested workshop module <code>"{currentView}"</code> does not exist or may have been relocated.
                    </p>
                    <button className="btn btn-primary btn-sm" onClick={() => handleNavigate('overview')}>
                      ← Return to Workshop Overview
                    </button>
                  </div>
                </div>
              )}
            </ErrorBoundary>
          </div>

          {/* Floating Back to Top Button */}
          {showBackToTop && (
            <button
              type="button"
              className="back-to-top-btn animate-fade-in"
              onClick={() => contentAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              title="Scroll back to top"
              aria-label="Back to top"
            >
              ↑ Top
            </button>
          )}

          {/* Global Production Footer with Copyright & Clickable Contacts */}
          <footer className="smartcrm-app-footer">
            <div className="footer-left">
              <span>© {new Date().getFullYear()} SmartCRM Workshop OS • Apex AutoWorks (Bayan Lepas, Penang) • All rights reserved.</span>
              <span className="footer-demo-badge">Demo Data Active</span>
            </div>
            <div className="footer-right">
              <a href="tel:+60123456789" className="footer-contact-link" title="Call Workshop Support">
                📞 +60 12-345 6789
              </a>
              <span className="footer-sep">•</span>
              <a href="mailto:support@apexautoworks.my" className="footer-contact-link" title="Email Workshop Desk">
                ✉️ support@apexautoworks.my
              </a>
            </div>
          </footer>
        </main>

        {/* Floating Concierge & Quick Contact FAB Widget */}
        <FloatingContactWidget />

        {/* Floating Agentic AI Copilot Chatbot */}
        <Suspense fallback={null}>
          <AgenticAIChatbotWidget onNavigateTab={handleNavigate} />
        </Suspense>

        {/* GDPR / Malaysian PDPA Cookie Consent Banner */}
        <CookieBanner />

        {/* Mobile Persistent Bottom Navigation Bar (< 640px) */}
        <nav className="smartcrm-mobile-bottom-nav" aria-label="Mobile Navigation">
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'pipeline', icon: '🚘', label: 'Bays' },
            { id: 'appointments', icon: '📅', label: 'Bookings' },
            { id: 'reminders', icon: '💬', label: 'Alerts' },
            { id: 'customers', icon: '👥', label: 'Fleet' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`mobile-bottom-nav-item ${currentView === tab.id ? 'active' : ''}`}
              onClick={() => handleNavigate(tab.id)}
              aria-label={tab.label}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Global Command Palette / Site Search Modal (Ctrl+K) */}
        {isSearchPaletteOpen && (
          <Suspense fallback={null}>
            <CommandPaletteModal
              isOpen={isSearchPaletteOpen}
              onClose={() => setIsSearchPaletteOpen(false)}
              onNavigate={(view) => {
                handleNavigate(view);
                setIsSearchPaletteOpen(false);
              }}
              onTriggerAction={(action) => {
                setIsSearchPaletteOpen(false);
                if (action === 'intake') setIsIntakeModalOpen(true);
                if (action === 'service') setIsServiceModalOpen(true);
                if (action === 'toggle_menu') handleToggleMenu();
              }}
            />
          </Suspense>
        )}

        {/* Action Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          confirmVariant={confirmModal.variant}
          onConfirm={() => {
            if (confirmModal.onConfirm) confirmModal.onConfirm();
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }}
          onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        />

        {/* Global Modals */}
        {isIntakeModalOpen && (
          <Suspense fallback={null}>
            <AddCustomerModal
              isOpen={isIntakeModalOpen}
              onClose={() => setIsIntakeModalOpen(false)}
            />
          </Suspense>
        )}

        {isServiceModalOpen && (
          <Suspense fallback={null}>
            <AddServiceModal
              isOpen={isServiceModalOpen}
              onClose={() => setIsServiceModalOpen(false)}
            />
          </Suspense>
        )}
      </div>
    </ToastProvider>
  );
}

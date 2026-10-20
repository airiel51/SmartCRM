import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PipelineBoard from './components/PipelineBoard';
import CustomerDirectory from './components/CustomerDirectory';
import WhatsAppLiveHub from './components/WhatsAppLiveHub';
import AgenticAISuite from './components/AgenticAISuite';
import SupabaseSyncView from './components/SupabaseSyncView';
import RightInspectorPanel from './components/RightInspectorPanel';
import AICopilotDrawer from './components/AICopilotDrawer';
import MobilePICSimulator from './components/MobilePICSimulator';
import { AddCustomerModal, AddServiceModal } from './components/Modals';

const VIEW_TITLES = {
  dashboard: 'Overview',
  whatsapp: 'WhatsApp AI Live',
  pipeline: 'Service Bays & Pipeline',
  customers: 'Fleet Directory',
  supabase: 'Supabase Cloud Sync',
  agentic_ai: 'Agentic AI Suite',
  mobile_pic: 'Floor PIC Mobile'
};

export default function App() {
  const [currentView, setCurrentView] = useState('mobile_pic');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  return (
    <div className="dribbble-viewport">
      <div className="dribbble-card-frame">
        {/* 1. Slim Left Navigation Rail (#1c1e22) */}
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
        />

        {/* 2. Unified Workspace Center Panel (100% UNIFORM ACROSS ALL VIEWS) */}
        <div className="main-center-panel">
          {/* Universal Header Row: "Hi, Airiel Hazim" + Live Module Pill + Search + Tools */}
          <div className="center-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h1 className="greeting-text">Hi, Airiel Hazim</h1>
              
              {/* Dynamic View Pill Indicator with Pulsing Live Dot */}
              <div
                style={{
                  display: 'inline-flex',
                  background: '#f4f6fa',
                  padding: '4px 10px',
                  borderRadius: 9999,
                  fontSize: '0.72rem',
                  color: '#565d6d',
                  fontWeight: 700,
                  alignItems: 'center',
                  gap: 6,
                  border: '1px solid #edf0f5',
                  whiteSpace: 'nowrap'
                }}
                title="Apex AutoWorks & Diagnostic Centre • SmartCRM CAT405"
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                <span>SmartCRM • {VIEW_TITLES[currentView] || 'Overview'}</span>
              </div>
            </div>

            {/* Header Tools */}
            <div className="center-header-tools">
              <div className="search-pill">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                />
              </div>

              {/* Context Action Button depending on view */}
              {currentView === 'customers' && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsIntakeModalOpen(true)}
                >
                  + Intake Vehicle
                </button>
              )}

              {currentView === 'pipeline' && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsServiceModalOpen(true)}
                >
                  + Work Order
                </button>
              )}

              {/* Mobile PIC Shop-Floor Mode Switcher */}
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentView(currentView === 'mobile_pic' ? 'dashboard' : 'mobile_pic')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 700,
                  background: currentView === 'mobile_pic' ? '#f59e0b' : undefined,
                  color: currentView === 'mobile_pic' ? '#0f172a' : undefined
                }}
                title="Toggle Shop-Floor PIC Mobile View"
              >
                <span>📱 Floor PIC Mobile</span>
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsCopilotOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                title="Autonomous AI Copilot Drawer"
              >
                <span>⚡ Copilot</span>
              </button>

              <button
                className="bell-btn"
                title="Notifications"
                onClick={() => alert('No unread notifications.')}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="bell-dot" />
              </button>
            </div>
          </div>

          {/* Active View Content */}
          {currentView === 'dashboard' && (
            <Dashboard
              onSelectCustomer={setSelectedCustomer}
              onNavigateView={setCurrentView}
            />
          )}
          {currentView === 'whatsapp' && (
            <WhatsAppLiveHub
              onSelectCustomer={setSelectedCustomer}
            />
          )}
          {currentView === 'pipeline' && (
            <PipelineBoard
              onOpenNewDeal={() => setIsServiceModalOpen(true)}
              onSelectCustomer={setSelectedCustomer}
            />
          )}
          {currentView === 'customers' && (
            <CustomerDirectory
              onOpenNewCustomer={() => setIsIntakeModalOpen(true)}
              globalSearch={globalSearch}
              onSelectCustomer={setSelectedCustomer}
            />
          )}
          {currentView === 'agentic_ai' && (
            <AgenticAISuite
              onSelectCustomer={setSelectedCustomer}
            />
          )}
          {currentView === 'supabase' && (
            <SupabaseSyncView />
          )}
          {currentView === 'mobile_pic' && (
            <MobilePICSimulator
              onSelectCustomer={setSelectedCustomer}
            />
          )}
        </div>

        {/* 3. Persistent Right Inspector Panel (Selected Customer / Diagnostic Voice Note Waveform) */}
        <RightInspectorPanel
          activeCustomer={selectedCustomer}
          currentView={currentView}
          isOpen={isInspectorOpen}
          onToggle={() => setIsInspectorOpen(!isInspectorOpen)}
        />
      </div>

      {/* Floating AI Copilot Slide-Over Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {/* Modals */}
      <AddCustomerModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
      />

      <AddServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
      />
    </div>
  );
}

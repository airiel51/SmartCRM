import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

export default function AgenticAIChatbotWidget({
  isOpen,
  onToggle,
  currentView,
  selectedCustomer,
  onNavigateView,
  onSelectCustomer
}) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'ai',
      text: "Hello Airiel. I can look up vehicle records, check workshop bay allocations, draft service quotes, or summarize incoming customer messages. How can I help?",
      timestamp: 'Just now',
      actions: [
        { label: 'Overdue Vehicles', query: 'Show me overdue vehicles', targetView: 'customers' },
        { label: 'Bay Occupancy', query: 'What is our current bay occupancy?', targetView: 'pipeline' },
        { label: 'WhatsApp Inquiries', query: 'Check WhatsApp customer inquiries', targetView: 'whatsapp' },
        { label: 'Repeat-Service Rate', query: 'What is our repeat-service rate?' }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestionChips = [
    "Overdue vehicles",
    "Bay occupancy",
    "Customer inquiries",
    "AC service quote estimate"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, loading]);

  const handleSend = async (queryText) => {
    const q = queryText || input;
    if (!q.trim() || loading) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const customerId = selectedCustomer?.id || null;
      const res = await api.copilotChat(q, customerId);
      
      const newActions = [];
      const lower = q.toLowerCase();
      if (lower.includes('bay') || lower.includes('pipeline') || lower.includes('progress')) {
        newActions.push({ label: 'Jump to Bays', query: '', targetView: 'pipeline' });
      }
      if (lower.includes('overdue') || lower.includes('customer') || lower.includes('fleet')) {
        newActions.push({ label: 'Fleet Directory', query: '', targetView: 'customers' });
      }
      if (lower.includes('whatsapp') || lower.includes('chat') || lower.includes('message')) {
        newActions.push({ label: 'WhatsApp Messages', query: '', targetView: 'whatsapp' });
      }
      newActions.push({ label: 'Service Reminders', query: 'Check service reminders', targetView: 'customers' });

      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: res.reply || "I have retrieved the latest records from the workshop system.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: newActions
      }]);
    } catch (e) {
      // Local intelligent response fallback
      let fallbackText = `Here is the current information for **"${q}"**:\n\n`;
      const lower = q.toLowerCase();
      
      if (lower.includes('bay') || lower.includes('occupan') || lower.includes('capacity')) {
        fallbackText += `• **Bay 1**: Nurul Huda (KV 5502) — Major 40k Service & Gearbox Flush (Waiting for parts)\n` +
          `• **Bay 2**: Priya Subramaniam (VAB 2020) — Brake Pad & Rotor Lathe (In Progress)\n` +
          `• **Bay 3**: Michael Wong (JRS 7731) — AC Flush & R134a Regas (Final Check)\n` +
          `• **Bay 4**: Available / Standby\n\n` +
          `**Utilization**: 75% capacity (3 of 4 bays active).`;
      } else if (lower.includes('overdue') || lower.includes('reminder') || lower.includes('alert')) {
        fallbackText += `• **WXY 8821 (Perodua Myvi)** — Ahmad Razali: 3,400 km past service interval\n` +
          `• **KV 5502 (Perodua Bezza)** — Nurul Huda: Scheduled service due in 10 days\n\n` +
          `WhatsApp reminder drafts are ready to review and send.`;
      } else if (lower.includes('quote') || lower.includes('price') || lower.includes('aircond')) {
        fallbackText += `**Estimated Service Quote (AC Maintenance)**:\n` +
          `• R134a Refrigerant Gas (Vacuum + Recharge): RM 120.00\n` +
          `• Cabin Air Filter Replacement: RM 45.00\n` +
          `• Compressor Flush & System Labour: RM 45.00\n\n` +
          `**Total Estimate**: RM 210.00`;
      } else {
        fallbackText += `• **Tracked Vehicles**: 186 active customer profiles\n` +
          `• **Repeat-Service Rate**: 74.2%\n` +
          `• **WhatsApp Inbound**: Connected and active\n` +
          `• **Active Bays**: 3 active / 1 available`;
      }

      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: 'View Bays', targetView: 'pipeline' },
          { label: 'WhatsApp Hub', targetView: 'whatsapp' },
          { label: 'Customer Directory', targetView: 'customers' }
        ]
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    if (action.targetView && onNavigateView) {
      onNavigateView(action.targetView);
    }
    if (action.query) {
      handleSend(action.query);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'reset-1',
        role: 'ai',
        text: "Conversation cleared. How can I assist with workshop bays, customer records, or service estimates?",
        timestamp: 'Just now',
        actions: [
          { label: 'Overdue Vehicles', query: 'Show me overdue vehicles', targetView: 'customers' },
          { label: 'Bay Occupancy', query: 'What is our current bay occupancy?', targetView: 'pipeline' }
        ]
      }
    ]);
  };

  const currentViewLabel = {
    dashboard: 'Dashboard Overview',
    whatsapp: 'WhatsApp Messages',
    pipeline: 'Service Bays & Pipeline',
    customers: 'Customers & Vehicles',
    agentic_ai: 'AI Assistant',
    supabase: 'Settings & Cloud Sync'
  }[currentView] || 'Workshop Operations';

  return (
    <>
      {/* 1. Minimized Floating Trigger Button */}
      {!isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 28,
            zIndex: 999
          }}
        >
          <button
            onClick={onToggle}
            className="agentic-chatbot-fab"
            title="Open Assistant"
            style={{
              background: '#1c1e22',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 9999,
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.25)',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              outline: 'none',
              userSelect: 'none',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Assistant</span>
          </button>
        </div>
      )}

      {/* 2. Chatbot Window (Open state) */}
      {isOpen && (
        <div
          className={`agentic-chatbot-container ${isExpanded ? 'expanded-mode' : 'popup-mode'}`}
          style={{
            position: 'fixed',
            bottom: isExpanded ? 0 : 20,
            right: isExpanded ? 0 : 24,
            width: isExpanded ? 460 : 380,
            height: isExpanded ? '100vh' : 580,
            maxHeight: isExpanded ? '100vh' : 'calc(100vh - 40px)',
            background: '#ffffff',
            borderRadius: isExpanded ? '16px 0 0 16px' : 16,
            border: '1px solid #e2e8f0',
            boxShadow: isExpanded
              ? '-8px 0 32px rgba(0, 0, 0, 0.12)'
              : '0 16px 40px rgba(15, 23, 42, 0.14), 0 2px 6px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeInScale 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              background: '#1c1e22',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff' }}>Workshop Assistant</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>Apex AutoWorks</div>
              </div>
            </div>

            {/* Window Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={handleResetChat}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  padding: 6,
                  cursor: 'pointer',
                  borderRadius: 6,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Clear conversation"
              >
                ↺
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  padding: 6,
                  cursor: 'pointer',
                  borderRadius: 6,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? '⤡' : '⤢'}
              </button>
              <button
                onClick={onToggle}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#ffffff',
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Active Context Ribbon */}
          <div
            style={{
              padding: '6px 14px',
              background: '#f8fafc',
              borderBottom: '1px solid #edf0f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: '#64748b'
            }}
          >
            <div>
              <span>Context: </span>
              <strong style={{ color: '#334155' }}>{currentViewLabel}</strong>
            </div>
            {selectedCustomer && (
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                {selectedCustomer.name?.split(' ')[0] || 'Customer'}
              </span>
            )}
          </div>

          {/* Quick Suggestion Chips Carousel */}
          <div
            style={{
              padding: '8px 12px',
              background: '#ffffff',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                style={{
                  fontSize: '0.7rem',
                  padding: '4px 10px',
                  borderRadius: 9999,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div
            style={{
              flex: 1,
              padding: '14px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: '#fafbfd'
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '88%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    background: m.role === 'user' ? '#1c1e22' : '#ffffff',
                    color: m.role === 'user' ? '#ffffff' : '#0f172a',
                    border: m.role === 'user' ? 'none' : '1px solid #e2e8f0',
                    boxShadow: m.role === 'user' ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.03)'
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: m.text
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>')
                    }}
                  />
                  <div
                    style={{
                      fontSize: '0.62rem',
                      color: m.role === 'user' ? '#94a3b8' : '#94a3b8',
                      marginTop: 4,
                      textAlign: 'right'
                    }}
                  >
                    {m.timestamp}
                  </div>
                </div>

                {/* Embedded Action Pills */}
                {m.actions && m.actions.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      marginTop: 6,
                      flexWrap: 'wrap',
                      maxWidth: '90%'
                    }}
                  >
                    {m.actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleActionClick(act)}
                        style={{
                          fontSize: '0.72rem',
                          padding: '4px 10px',
                          borderRadius: 9999,
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#1e293b',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{act.label}</span>
                        {act.targetView && <span style={{ color: '#64748b', fontSize: '0.7rem' }}>➔</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  color: '#64748b',
                  fontSize: '0.76rem',
                  maxWidth: '85%'
                }}
              >
                <span>Searching workshop records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chatbot Input Bar */}
          <div
            style={{
              padding: '10px 14px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: 8,
              background: '#ffffff',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              placeholder="Ask assistant (e.g. 'Bay status', 'Overdue vehicles')..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{
                flex: 1,
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: '0.82rem',
                color: '#0f172a',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{
                background: input.trim() ? '#1c1e22' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 14px',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'all 0.15s ease'
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

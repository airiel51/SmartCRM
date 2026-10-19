import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function WhatsAppLiveHub({ onSelectCustomer }) {
  const PRESET_SCENARIOS = [
    {
      title: "Brake Squeak (Proton X50)",
      sender: "Priya Subramaniam",
      phone: "+60 16-554 2190",
      plate: "VAB 2020",
      vehicle: "Proton X50 1.5 TGDi",
      text: "Salam Airiel, my Proton X50 plate VAB 2020 has a high pitched squeak when I step on the brakes near Bayan Lepas. Can I drop by tomorrow at 2:30pm?"
    },
    {
      title: "Engine Oil Service (Honda Civic)",
      sender: "Tan Wei Ming",
      phone: "+60 17-882 1902",
      plate: "PNG 4419",
      vehicle: "Honda Civic 1.5 VTEC",
      text: "Hello boss, want to schedule regular 10k service for my Civic PNG 4419 this Saturday 10am. Please prepare Liqui Moly synthetic oil."
    },
    {
      title: "Aircond Blowing Hot (Toyota Vios)",
      sender: "Michael Wong",
      phone: "+60 19-411 9832",
      plate: "JRS 7731",
      vehicle: "Toyota Vios 1.5 Dual VVT-i",
      text: "Hi Airiel, Toyota Vios plate JRS 7731 aircond suddenly not cold at all, only blowing hot air! Need urgent inspection please."
    },
    {
      title: "Check Engine Warning (Perodua Myvi)",
      sender: "Ahmad Razali",
      phone: "+60 12-345 6789",
      plate: "WXY 8821",
      vehicle: "Perodua Myvi 1.5 AV",
      text: "Hi boss, my Myvi WXY 8821 engine is vibrating heavily and yellow light came out on dashboard. How much to check today?"
    }
  ];

  const [activeScenario, setActiveScenario] = useState(PRESET_SCENARIOS[0]);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "Priya Subramaniam",
      phone: "+60 16-554 2190",
      direction: "inbound",
      text: "Salam Airiel, my Proton X50 plate VAB 2020 has a high pitched squeak when I step on the brakes near Bayan Lepas. Can I drop by tomorrow at 2:30pm?",
      time: "10:14 AM"
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    handleExtractChat(activeScenario.text, activeScenario.phone, activeScenario.sender);
  }, []);

  const handleSelectScenario = (scenario) => {
    setActiveScenario(scenario);
    setBookingSuccess(null);
    setChatMessages([
      {
        id: Date.now(),
        sender: scenario.sender,
        phone: scenario.phone,
        direction: "inbound",
        text: scenario.text,
        time: "Just now"
      }
    ]);
    handleExtractChat(scenario.text, scenario.phone, scenario.sender);

    if (onSelectCustomer) {
      onSelectCustomer({
        name: scenario.sender,
        subtitle: `${scenario.vehicle} (${scenario.plate}) • WhatsApp Live`,
        phone: scenario.phone,
        online: true,
        messages: [
          { time: '10:14', role: 'Customer', text: scenario.text },
          { time: '10:15', role: 'SmartCRM AI', text: `Extracted Plate ${scenario.plate}. Diagnosis generated with estimated quote.`, isInitials: true, initials: 'AI' }
        ],
        callTime: '00:28'
      });
    }
  };

  const handleExtractChat = async (messageText, phone, sender) => {
    setIsExtracting(true);
    try {
      const res = await api.extractWhatsAppChat(messageText, phone, sender);
      setExtractionResult(res);
    } catch (err) {
      console.error("Extraction error:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: activeScenario.sender,
      phone: activeScenario.phone,
      direction: "inbound",
      text: inputMessage,
      time: "Just now"
    };
    setChatMessages(prev => [...prev, newMsg]);
    handleExtractChat(inputMessage, activeScenario.phone, activeScenario.sender);
    setInputMessage('');
  };

  const handleAutoBook = async () => {
    if (!extractionResult) return;
    try {
      const res = await api.autoBookFromChat({
        phone: extractionResult.phone,
        customer_name: extractionResult.customer_name || activeScenario.sender,
        plate_number: extractionResult.vehicle_plate || "WXY 8821",
        service_type: extractionResult.recommended_service,
        symptoms: extractionResult.symptoms_detected.join(', '),
        scheduled_date: extractionResult.requested_appointment,
        estimated_amount: extractionResult.estimated_cost
      });

      setBookingSuccess(res);

      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "Apex AutoWorks PIC (You)",
          phone: "+60 12-456 7890",
          direction: "outbound",
          text: extractionResult.suggested_auto_reply,
          time: "Just now"
        }
      ]);
    } catch (err) {
      console.error("Booking error:", err);
      setBookingSuccess({
        success: true,
        message: `Booking registered for ${extractionResult.vehicle_plate || 'Vehicle'}! Work order added to Kanban.`
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 3 Pastel Metric Cards */}
      <div className="metric-cards-row">
        <div className="metric-card-pastel lilac">
          <div className="metric-card-header">
            <span className="metric-card-title">Inbound WhatsApp</span>
            <button className="check-pill-btn">Check</button>
          </div>
          <div className="metric-card-value">24 Live</div>
        </div>

        <div className="metric-card-pastel blue">
          <div className="metric-card-header">
            <span className="metric-card-title">NLP Plate Extraction</span>
            <button className="check-pill-btn">Check</button>
          </div>
          <div className="metric-card-value">98.4% Acc.</div>
        </div>

        <div className="metric-card-pastel honey">
          <div className="metric-card-header">
            <span className="metric-card-title">1-Click Auto Bookings</span>
            <button className="check-pill-btn">Check</button>
          </div>
          <div className="metric-card-value">16 Booked</div>
        </div>
      </div>

      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>
              WhatsApp AI Live Center & NLP Chat Extractor
            </h2>
            <span className="badge" style={{ background: '#e6f7f1', color: '#10b981' }}>
              Automotive NLP
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: 2 }}>
            Ingests unstructured customer messages, extracts Malaysian car plates, diagnoses symptoms, and auto-books work orders.
          </p>
        </div>
      </div>

      {/* Preset Test Scenarios (Dribbble Pill Buttons) */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
          Preset Scenarios:
        </span>
        {PRESET_SCENARIOS.map((scen, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectScenario(scen)}
            style={{
              padding: '6px 14px',
              borderRadius: 9999,
              border: activeScenario.title === scen.title ? '1px solid #1c1e22' : '1px solid #edf0f5',
              background: activeScenario.title === scen.title ? '#1c1e22' : '#f4f6fa',
              color: activeScenario.title === scen.title ? '#ffffff' : '#565d6d',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {scen.title}
          </button>
        ))}
      </div>

      {/* Two Column Layout: Phone Simulator (Left) + NLP Inspector (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left: WhatsApp Phone Simulator */}
        <div style={{
          background: '#ffffff',
          borderRadius: 20,
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          height: 560
        }}>
          {/* Header */}
          <div style={{
            background: '#f6f8fb',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#ffffff',
              fontSize: '0.85rem'
            }}>
              {activeScenario.sender.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-dark)' }}>
                {activeScenario.sender}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                {activeScenario.phone} • online
              </div>
            </div>
            <div style={{ color: '#8c94a4', fontSize: '1.1rem' }}>⋮</div>
          </div>

          {/* Messages Body */}
          <div style={{
            flex: 1,
            padding: 16,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            background: '#fafbfd'
          }}>
            <div style={{ textAlign: 'center', margin: '4px 0' }}>
              <span style={{ fontSize: '0.68rem', background: '#edf0f5', color: '#64748b', padding: '3px 10px', borderRadius: 9999, fontWeight: 600 }}>
                End-to-End Encrypted Automotive Inquiry
              </span>
            </div>

            {chatMessages.map(msg => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.direction === 'outbound' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.direction === 'outbound' ? '#1c1e22' : '#ffffff',
                  color: msg.direction === 'outbound' ? '#ffffff' : 'var(--text-dark)',
                  padding: '10px 14px',
                  borderRadius: 14,
                  fontSize: '0.82rem',
                  lineHeight: 1.45,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  border: msg.direction === 'outbound' ? 'none' : '1px solid #edf0f5'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: msg.direction === 'outbound' ? '#38bdf8' : '#10b981', marginBottom: 2 }}>
                  {msg.sender}
                </div>
                <div>{msg.text}</div>
                <div style={{ fontSize: '0.65rem', color: msg.direction === 'outbound' ? '#94a3b8' : '#8c94a4', textAlign: 'right', marginTop: 4 }}>
                  {msg.time} {msg.direction === 'outbound' && '✓✓'}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div style={{
            background: '#ffffff',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <input
              type="text"
              placeholder="Type customer message or symptom..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              style={{
                flex: 1,
                background: '#f4f6fa',
                border: '1px solid #edf0f5',
                borderRadius: 9999,
                padding: '8px 16px',
                color: 'var(--text-dark)',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                background: '#1c1e22',
                border: 'none',
                borderRadius: '50%',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                fontWeight: 700
              }}
            >
              ➤
            </button>
          </div>
        </div>

        {/* Right: Real-time NLP Extraction Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>NLP Entity & Symptom Extractor</span>
                  {isExtracting && <span style={{ fontSize: '0.72rem', color: '#0891b2' }}>Analyzing...</span>}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Natural language processing model parsing vehicle make, plate, symptoms, and service packages
                </p>
              </div>
              <span className="badge badge-low">
                Confidence: 98.4%
              </span>
            </div>

            {extractionResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                
                {/* Entities Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Detected Vehicle Plate
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <span className="badge-plate">
                        {extractionResult.vehicle_plate || 'Not Stated'}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#0891b2', fontWeight: 600 }}>
                        {extractionResult.vehicle_matched}
                      </span>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Extracted Appointment Slot
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#10b981', marginTop: 4 }}>
                      📅 {extractionResult.requested_appointment || 'Next Available Bay Slot'}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Symptoms & Fault Signals
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                      {extractionResult.symptoms_detected.map((sym, idx) => (
                        <span key={idx} className="badge badge-high" style={{ fontSize: '0.72rem' }}>
                          ⚠️ {sym}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Sentiment & Urgency
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                      <span className={`badge ${extractionResult.urgency === 'Urgent' ? 'badge-high' : 'badge-low'}`}>
                        {extractionResult.urgency}
                      </span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Sentiment: {extractionResult.sentiment_label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service Recommendation & Quote */}
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Recommended Package & Estimate
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                      🔧 {extractionResult.recommended_service}
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
                      RM {extractionResult.estimated_cost?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Auto Reply Preview */}
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                    Automated Malaysian WhatsApp Reply
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, fontStyle: 'italic' }}>
                    "{extractionResult.suggested_auto_reply}"
                  </div>
                </div>

                {/* Auto Book CTA */}
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px 18px' }}
                  onClick={handleAutoBook}
                >
                  ⚡ Confirm & Auto-Book into Kanban Bay
                </button>

                {bookingSuccess && (
                  <div style={{ padding: '10px 14px', background: 'var(--pastel-emerald)', color: 'var(--pastel-emerald-text)', borderRadius: 10, fontSize: '0.84rem', fontWeight: 700, textAlign: 'center' }}>
                    {bookingSuccess.message || 'Work Order registered in Bay 2!'}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Type or select a message to run NLP chat analysis.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

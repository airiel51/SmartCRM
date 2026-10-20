import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function MobilePICSimulator({ onSelectCustomer }) {
  const [activeTab, setActiveTab] = useState('bays'); // 'bays', 'intake', 'retention', 'fleet'
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [retentionAlerts, setRetentionAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  // Intake Form State
  const [intakeName, setIntakeName] = useState('');
  const [intakePhone, setIntakePhone] = useState('');
  const [intakePlate, setIntakePlate] = useState('');
  const [intakeService, setIntakeService] = useState('Regular Oil Service');
  const [intakeBay, setIntakeBay] = useState('Bay 1');
  const [intakeNotes, setIntakeNotes] = useState('');

  // 5-Point Walkaround Check (all default to true for speed)
  const [checkPaint, setCheckPaint] = useState(true);
  const [checkTires, setCheckTires] = useState(true);
  const [checkOil, setCheckOil] = useState(true);
  const [checkBrakes, setCheckBrakes] = useState(true);
  const [checkBattery, setCheckBattery] = useState(true);

  // Search in customer directory
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cData, sData, rData] = await Promise.all([
        api.getCustomers(),
        api.getServices(),
        api.runRetentionScan()
      ]);
      if (Array.isArray(cData)) setCustomers(cData);
      if (Array.isArray(sData)) setServices(sData);
      if (rData && rData.overdue_vehicles) setRetentionAlerts(rData.overdue_vehicles);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3500);
  };

  const STAGES = ['Scheduled', 'In Progress', 'Quality Inspection', 'Ready for Pickup', 'Invoiced'];

  const handleAdvanceStage = async (s) => {
    const curIdx = STAGES.indexOf(s.stage);
    if (curIdx < STAGES.length - 1) {
      const nextStage = STAGES[curIdx + 1];
      setServices(prev => prev.map(item => item.id === s.id ? { ...item, stage: nextStage } : item));
      try {
        await api.updateServiceStage(s.id, nextStage);
      } catch (_) {}
      showToast(`✓ ${s.vehicle_plate || 'Vehicle'} updated to ${nextStage}`);
    }
  };

  const handleWhatsAppCustomer = (phone, plate, name, messageText) => {
    let cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '60' + cleanPhone.substring(1);
    if (!cleanPhone.startsWith('60') && cleanPhone.length <= 10) cleanPhone = '60' + cleanPhone;

    const defaultMsg = messageText || `Hello ${name || 'Customer'}! Contacting you from Apex AutoWorks regarding your car (${plate || ''}).`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultMsg)}`;
    window.open(waUrl, '_blank');
    showToast(`Opening WhatsApp for ${name || 'Customer'}...`);
  };

  const handleSubmitIntake = async (e) => {
    e.preventDefault();
    if (!intakePlate.trim() || !intakeName.trim() || !intakePhone.trim()) {
      showToast('Please fill in plate number, customer name, and phone.');
      return;
    }

    const checklist = [
      checkPaint ? 'Paint: OK' : 'Paint: Scratched',
      checkTires ? 'Tires: OK' : 'Tires: Worn',
      checkOil ? 'Oil: OK' : 'Oil: Low',
      checkBrakes ? 'Brakes: OK' : 'Brakes: Low',
      checkBattery ? 'Battery: OK' : 'Battery: Weak'
    ].join(', ');

    const newService = {
      id: `s-${Date.now()}`,
      customer_name: intakeName,
      phone: intakePhone,
      vehicle_plate: intakePlate.toUpperCase(),
      service_type: intakeService,
      stage: 'Scheduled',
      service_bay: intakeBay,
      symptoms_reported: intakeNotes ? `${intakeNotes} (${checklist})` : checklist,
      total_amount: 250.00
    };

    setServices(prev => [newService, ...prev]);
    showToast(`✓ ${intakePlate.toUpperCase()} checked in to ${intakeBay}!`);

    // Reset form & return to Bays
    setIntakePlate('');
    setIntakeName('');
    setIntakePhone('');
    setIntakeNotes('');
    setActiveTab('bays');
  };

  const allBays = ['Bay 1', 'Bay 2', 'Bay 3', 'Bay 4'];
  const activeOrders = services.filter(s => s.stage !== 'Invoiced');
  const occupiedCount = new Set(activeOrders.map(s => s.service_bay)).size;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        border: '1px solid #334155',
        borderRadius: 14,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem'
          }}>
            📱
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Workshop Floor Mobile View
              </h2>
              <span style={{
                background: '#047857',
                color: '#ecfdf5',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 9999
              }}>
                FLUTTER & WEB UNIFORM
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              Designed for quick shop floor use on mobile phones. Synchronized with the native app on your phone.
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          style={{
            background: '#334155',
            border: '1px solid #475569',
            color: '#f8fafc',
            padding: '6px 14px',
            borderRadius: 8,
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Main Container: Interactive Smartphone Frame */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 30px' }}>
        <div style={{
          width: 390,
          height: 740,
          background: '#020617',
          borderRadius: 48,
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5), 0 0 0 10px #1e293b, 0 0 0 12px #334155',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          {/* Phone Status Bar */}
          <div style={{
            height: 38,
            background: '#020617',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 22px',
            color: '#cbd5e1',
            fontSize: '0.75rem',
            fontWeight: 700,
            zIndex: 10
          }}>
            <span>9:41</span>
            <div style={{
              width: 90,
              height: 18,
              background: '#000',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '0.62rem', color: '#10b981' }}>CONNECTED</span>
            </div>
            <span>5G 100%</span>
          </div>

          {/* Toast Notification */}
          {actionNotice && (
            <div style={{
              position: 'absolute',
              top: 44,
              left: 16,
              right: 16,
              background: '#10b981',
              color: '#022c22',
              padding: '8px 12px',
              borderRadius: 10,
              fontSize: '0.75rem',
              fontWeight: 700,
              zIndex: 30,
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
              textAlign: 'center'
            }}>
              {actionNotice}
            </div>
          )}

          {/* App Header Inside Phone */}
          <div style={{
            background: '#0f172a',
            padding: '12px 16px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                background: '#f59e0b',
                color: '#020617',
                padding: '6px 8px',
                borderRadius: 8,
                fontWeight: 900,
                fontSize: '0.9rem'
              }}>
                🛠
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                  Apex AutoWorks
                </div>
                <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>
                  {occupiedCount} of 4 bays in use
                </div>
              </div>
            </div>

            <button
              onClick={loadData}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}
              title="Refresh"
            >
              ↻
            </button>
          </div>

          {/* Scrollable Screen Content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            background: '#020617',
            padding: '14px',
            color: '#f8fafc'
          }}>
            {/* TAB 1: BAYS */}
            {activeTab === 'bays' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {allBays.map(bayName => {
                  const s = activeOrders.find(o => (o.service_bay || '').toLowerCase().includes(bayName.toLowerCase()));
                  const isOccupied = !!s;

                  let badgeBg = 'rgba(16, 185, 129, 0.15)';
                  let badgeText = '#34d399';
                  let statusLabel = 'Available';

                  if (isOccupied) {
                    if (s.stage === 'In Progress') {
                      badgeBg = 'rgba(245, 158, 11, 0.2)';
                      badgeText = '#f59e0b';
                      statusLabel = 'In Service';
                    } else if (s.stage === 'Quality Inspection') {
                      badgeBg = 'rgba(59, 130, 246, 0.2)';
                      badgeText = '#60a5fa';
                      statusLabel = 'Final Check';
                    } else if (s.stage === 'Ready for Pickup') {
                      badgeBg = 'rgba(16, 185, 129, 0.2)';
                      badgeText = '#34d399';
                      statusLabel = 'Ready';
                    } else {
                      badgeBg = 'rgba(168, 85, 247, 0.2)';
                      badgeText = '#c084fc';
                      statusLabel = 'Waiting';
                    }
                  }

                  return (
                    <div
                      key={bayName}
                      style={{
                        background: '#0f172a',
                        borderRadius: 14,
                        border: isOccupied ? '1.2px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
                        padding: 14
                      }}
                    >
                      {/* Bay Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '1rem' }}>🚘</span>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>{bayName}</span>
                        </div>
                        <span style={{
                          background: badgeBg,
                          color: badgeText,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 20
                        }}>
                          {statusLabel}
                        </span>
                      </div>

                      {!isOccupied ? (
                        <div
                          onClick={() => {
                            setIntakeBay(bayName);
                            setActiveTab('intake');
                          }}
                          style={{
                            border: '1px dashed #334155',
                            borderRadius: 10,
                            padding: '12px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            color: '#f59e0b',
                            fontSize: '0.8rem',
                            fontWeight: 700
                          }}
                        >
                          + Assign Car to {bayName}
                        </div>
                      ) : (
                        <div>
                          {/* Occupied Car Info */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <div style={{
                              background: '#000',
                              border: '1px solid #334155',
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontWeight: 900,
                              color: '#fff',
                              fontSize: '0.95rem',
                              letterSpacing: 1
                            }}>
                              {s.vehicle_plate || 'WXY 8821'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {s.customer_name}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {s.service_type}
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          {s.stage === 'Ready for Pickup' ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                onClick={() => handleWhatsAppCustomer(s.phone, s.vehicle_plate, s.customer_name, `Hello ${s.customer_name}! Your car (${s.vehicle_plate}) is ready for collection at Apex AutoWorks.`)}
                                style={{
                                  flex: 2,
                                  background: '#10b981',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '8px 12px',
                                  borderRadius: 8,
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 6
                                }}
                              >
                                <span>💬</span>
                                <span>WhatsApp Customer</span>
                              </button>
                              <button
                                onClick={() => handleAdvanceStage(s)}
                                style={{
                                  flex: 1,
                                  background: 'transparent',
                                  border: '1px solid #475569',
                                  color: '#cbd5e1',
                                  padding: '8px 10px',
                                  borderRadius: 8,
                                  fontSize: '0.72rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Clear Bay
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAdvanceStage(s)}
                              style={{
                                width: '100%',
                                background: s.stage === 'In Progress' ? '#3b82f6' : '#f59e0b',
                                color: s.stage === 'In Progress' ? '#fff' : '#020617',
                                border: 'none',
                                padding: '9px 12px',
                                borderRadius: 8,
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                              }}
                            >
                              {s.stage === 'Scheduled' ? `Start Work in ${bayName} ➔` : s.stage === 'In Progress' ? 'Move to Final Check ➔' : 'Mark Ready for Pickup ➔'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: INTAKE */}
            {activeTab === 'intake' && (
              <form onSubmit={handleSubmitIntake} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
                  Vehicle Check-In
                </div>

                {/* Car & Customer Card */}
                <div style={{ background: '#0f172a', padding: 14, borderRadius: 12, border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: 800, marginBottom: 8, letterSpacing: 0.5 }}>CAR & CUSTOMER</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Car Plate (e.g. VAB 2020)"
                      value={intakePlate}
                      onChange={e => setIntakePlate(e.target.value.toUpperCase())}
                      style={{
                        background: '#020617',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        padding: '10px 12px',
                        color: '#fff',
                        fontSize: '1rem',
                        fontWeight: 800,
                        letterSpacing: 1
                      }}
                      required
                    />

                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={intakeName}
                      onChange={e => setIntakeName(e.target.value)}
                      style={{
                        background: '#020617',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        padding: '9px 12px',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                      required
                    />

                    <input
                      type="text"
                      placeholder="Contact Phone (e.g. 012-345 6789)"
                      value={intakePhone}
                      onChange={e => setIntakePhone(e.target.value)}
                      style={{
                        background: '#020617',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        padding: '9px 12px',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Select Bay Card */}
                <div style={{ background: '#0f172a', padding: 14, borderRadius: 12, border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: 800, marginBottom: 8, letterSpacing: 0.5 }}>SELECT BAY</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {allBays.map(b => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setIntakeBay(b)}
                        style={{
                          background: intakeBay === b ? '#f59e0b' : '#020617',
                          color: intakeBay === b ? '#020617' : '#94a3b8',
                          border: intakeBay === b ? '1.5px solid #f59e0b' : '1px solid #334155',
                          borderRadius: 8,
                          padding: '8px 0',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 12, marginBottom: 6, fontWeight: 700 }}>SERVICE TYPE</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {['Regular Oil Service', 'Brake Service', 'Aircond Service', 'General Inspection'].map(svc => (
                      <button
                        type="button"
                        key={svc}
                        onClick={() => setIntakeService(svc)}
                        style={{
                          background: intakeService === svc ? '#f59e0b' : '#020617',
                          color: intakeService === svc ? '#020617' : '#cbd5e1',
                          border: '1px solid #334155',
                          borderRadius: 20,
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          fontWeight: intakeService === svc ? 800 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {svc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5-Point Quick Check */}
                <div style={{ background: '#0f172a', padding: 14, borderRadius: 12, border: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: 800, letterSpacing: 0.5 }}>VEHICLE CONDITION CHECK</div>
                    <span
                      onClick={() => {
                        setCheckPaint(true);
                        setCheckTires(true);
                        setCheckOil(true);
                        setCheckBrakes(true);
                        setCheckBattery(true);
                      }}
                      style={{ fontSize: '0.68rem', color: '#34d399', cursor: 'pointer', fontWeight: 700 }}
                    >
                      All OK
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[
                      { label: 'Paint OK', state: checkPaint, toggle: () => setCheckPaint(!checkPaint) },
                      { label: 'Tires OK', state: checkTires, toggle: () => setCheckTires(!checkTires) },
                      { label: 'Oil Level OK', state: checkOil, toggle: () => setCheckOil(!checkOil) },
                      { label: 'Brakes OK', state: checkBrakes, toggle: () => setCheckBrakes(!checkBrakes) },
                      { label: 'Battery OK', state: checkBattery, toggle: () => setCheckBattery(!checkBattery) }
                    ].map(chk => (
                      <button
                        type="button"
                        key={chk.label}
                        onClick={chk.toggle}
                        style={{
                          background: chk.state ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: chk.state ? '#34d399' : '#f87171',
                          border: `1px solid ${chk.state ? '#059669' : '#dc2626'}`,
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {chk.state ? '✓ ' : '✕ '} {chk.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    background: '#f59e0b',
                    color: '#020617',
                    border: 'none',
                    padding: '12px',
                    borderRadius: 10,
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    marginTop: 4
                  }}
                >
                  Check In to {intakeBay}
                </button>
              </form>
            )}

            {/* TAB 3: REMINDERS */}
            {activeTab === 'retention' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
                  Service Reminders
                </div>
                <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 600, marginTop: -4 }}>
                  {retentionAlerts.length} vehicles due for service
                </div>

                {retentionAlerts.map((a, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#0f172a',
                      borderRadius: 12,
                      padding: 12,
                      border: '1px solid #1e293b'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          background: '#000',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: '0.8rem',
                          fontWeight: 900,
                          color: '#fff'
                        }}>
                          {a.plate_number}
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1' }}>
                          {a.vehicle_name}
                        </span>
                      </div>
                      <span style={{
                        background: 'rgba(245, 158, 11, 0.2)',
                        color: '#f59e0b',
                        padding: '2px 6px',
                        borderRadius: 10,
                        fontSize: '0.65rem',
                        fontWeight: 700
                      }}>
                        {a.days_overdue}d overdue
                      </span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 6 }}>
                      {a.customer_name} • {a.phone}
                    </div>

                    <div style={{
                      background: '#020617',
                      padding: 8,
                      borderRadius: 6,
                      fontSize: '0.7rem',
                      color: '#cbd5e1',
                      marginBottom: 8,
                      lineHeight: 1.3
                    }}>
                      {a.reminder_draft}
                    </div>

                    <button
                      onClick={() => handleWhatsAppCustomer(a.phone, a.plate_number, a.customer_name, a.reminder_draft)}
                      style={{
                        width: '100%',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        padding: '7px 10px',
                        borderRadius: 8,
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <span>💬</span>
                      <span>Send WhatsApp Reminder</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: CUSTOMERS */}
            {activeTab === 'fleet' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
                  Customers & Vehicles
                </div>

                <input
                  type="text"
                  placeholder="Search by plate, customer, or phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.8rem'
                  }}
                />

                {customers
                  .filter(c => {
                    const q = searchQuery.toLowerCase().trim();
                    if (!q) return true;
                    return (
                      (c.full_name || '').toLowerCase().includes(q) ||
                      (c.phone || '').includes(q) ||
                      (c.vehicles || []).some(v => (v.plate_number || '').toLowerCase().includes(q))
                    );
                  })
                  .map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#0f172a',
                        borderRadius: 12,
                        padding: 12,
                        border: '1px solid #1e293b'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#f8fafc' }}>
                          {c.full_name}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {c.phone}
                        </span>
                      </div>

                      {/* Cars */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '6px 0 10px' }}>
                        {(c.vehicles || []).map((v, vIdx) => (
                          <span
                            key={vIdx}
                            style={{
                              background: '#020617',
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: '#f59e0b'
                            }}
                          >
                            {v.plate_number} ({v.make} {v.model})
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <a
                          href={`tel:${c.phone}`}
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            background: 'transparent',
                            border: '1px solid #475569',
                            color: '#cbd5e1',
                            padding: '6px 8px',
                            borderRadius: 6,
                            fontSize: '0.72rem',
                            textDecoration: 'none',
                            fontWeight: 700
                          }}
                        >
                          📞 Call
                        </a>
                        <button
                          onClick={() => handleWhatsAppCustomer(c.phone, '', c.full_name, `Hello ${c.full_name}! Contacting you from Apex AutoWorks.`)}
                          style={{
                            flex: 1,
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 8px',
                            borderRadius: 6,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          💬 WhatsApp
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Bottom Navigation Bar */}
          <div style={{
            height: 58,
            background: '#0f172a',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 4px',
            zIndex: 10
          }}>
            {[
              { id: 'bays', icon: '🚘', label: 'Bays' },
              { id: 'intake', icon: '➕', label: 'Check-In' },
              { id: 'retention', icon: '💬', label: 'Reminders' },
              { id: 'fleet', icon: '👥', label: 'Customers' }
            ].map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    color: active ? '#f59e0b' : '#64748b'
                  }}
                >
                  <span style={{ fontSize: '1.05rem' }}>{tab.icon}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: active ? 800 : 500 }}>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Home Indicator */}
          <div style={{
            height: 14,
            background: '#0f172a',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{ width: 120, height: 4, background: '#475569', borderRadius: 4 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

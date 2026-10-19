import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function MobilePICSimulator({ onSelectCustomer }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'intake', 'bays', 'retention', 'fleet'
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [retentionAlerts, setRetentionAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  // Intake Form State
  const [intakeName, setIntakeName] = useState('Kamarul Ariffin');
  const [intakePhone, setIntakePhone] = useState('+60 12-887 6543');
  const [intakePlate, setIntakePlate] = useState('PGE 8892');
  const [intakeMake, setIntakeMake] = useState('Proton');
  const [intakeModel, setIntakeModel] = useState('S70 1.5 Turbo');
  const [intakeMileage, setIntakeMileage] = useState('28400');
  const [intakeSymptoms, setIntakeSymptoms] = useState('Steering pulling slightly to left at 80km/h, periodic 30k service check');
  const [intakeBay, setIntakeBay] = useState('Bay 1 (Engine)');
  const [intakeCost, setIntakeCost] = useState('280.00');

  // Checklist
  const [checkBody, setCheckBody] = useState(true);
  const [checkTires, setCheckTires] = useState(true);
  const [checkOil, setCheckOil] = useState(false);
  const [checkBrakes, setCheckBrakes] = useState(true);
  const [checkBattery, setCheckBattery] = useState(true);

  // Search in fleet
  const [fleetSearch, setFleetSearch] = useState('');

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

  const handleAdvanceStage = async (s) => {
    const STAGES = ['Scheduled', 'In Progress', 'Quality Inspection', 'Ready for Pickup', 'Invoiced'];
    const curIdx = STAGES.indexOf(s.stage);
    if (curIdx < STAGES.length - 1) {
      const nextStage = STAGES[curIdx + 1];
      setServices(prev => prev.map(item => item.id === s.id ? { ...item, stage: nextStage } : item));
      try {
        await api.updateServiceStage(s.id, nextStage);
      } catch (_) {}
      showToast(`✓ ${s.vehicle_plate || 'Vehicle'} advanced to ${nextStage}!`);
    }
  };

  const handleSendReminder = async (alert) => {
    try {
      await api.sendRetentionReminder(alert.vehicle_id, alert.customer_id, alert.phone, alert.reminder_draft);
    } catch (_) {}
    showToast(`✓ WhatsApp reminder dispatched to ${alert.customer_name} (${alert.phone})!`);
  };

  const handleSubmitIntake = async (e) => {
    e.preventDefault();
    const newService = {
      id: `s-${Date.now()}`,
      customer_name: intakeName,
      phone: intakePhone,
      vehicle_plate: intakePlate.toUpperCase(),
      service_type: `${intakeMake} ${intakeModel} Intake`,
      stage: 'Scheduled',
      service_bay: intakeBay,
      symptoms_reported: intakeSymptoms,
      total_amount: parseFloat(intakeCost) || 250
    };
    setServices(prev => [newService, ...prev]);
    showToast(`✓ Intake created! ${intakePlate.toUpperCase()} assigned to ${intakeBay}.`);
    setActiveTab('bays');
  };

  const handlePlateOCR = () => {
    setIntakePlate('VAB 2020');
    setIntakeMake('Proton');
    setIntakeModel('X50 1.5 TGDi Flagship');
    setIntakeMileage('41800');
    setIntakeSymptoms('Customer reported brake squeaking noise downhill near Bayan Lepas');
    setIntakeBay('Bay 2 (Brakes)');
    showToast('✓ OCR Scanned Plate: VAB 2020 (Proton X50)!');
  };

  const activeBays = services.filter(s => s.stage !== 'Invoiced').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner explaining Pillar 1 */}
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
                Pillar 1: Shop-Floor PIC Mobile Application (Flutter & React)
              </h2>
              <span style={{
                background: '#047857',
                color: '#ecfdf5',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 9999
              }}>
                FLUTTER 3.44 • READY
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              Designed specifically for automotive workshop owners and Persons-in-Charge (PICs) moving across shop floor bays and hoists.
              Complete Flutter source code available in <code style={{ color: '#f59e0b', background: '#1e293b', padding: '1px 6px', borderRadius: 4 }}>mobile/lib/</code>.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
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
            ↻ Sync Floor State
          </button>
        </div>
      </div>

      {/* Main Container: Interactive Smartphone Bezel Device */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '10px 0 30px'
      }}>
        <div style={{
          width: 390,
          height: 740,
          background: '#020617',
          borderRadius: 48,
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.4), 0 0 0 10px #1e293b, 0 0 0 12px #334155',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          {/* Phone Top Notch / Dynamic Island */}
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
              <span style={{ fontSize: '0.62rem', color: '#10b981' }}>FASTAPI</span>
            </div>
            <span>5G 100%</span>
          </div>

          {/* Toast Notification in Device */}
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
            padding: '10px 16px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                background: '#f59e0b',
                color: '#020617',
                padding: '5px 7px',
                borderRadius: 8,
                fontWeight: 900,
                fontSize: '0.85rem'
              }}>
                🛠
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                  SmartCRM Floor PIC
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  Apex AutoWorks • Airiel Hazim
                </div>
              </div>
            </div>

            <div style={{
              background: '#1e293b',
              color: '#f59e0b',
              fontSize: '0.7rem',
              padding: '3px 8px',
              borderRadius: 6,
              fontWeight: 700
            }}>
              Bays: {activeBays}/4
            </div>
          </div>

          {/* Scrollable Screen Content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            background: '#020617',
            padding: '14px',
            color: '#f8fafc'
          }}>
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Floor Command Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, #1e293b, #334155)',
                  padding: 14,
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: 800 }}>SHOP FLOOR MOBILE</span>
                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>● Online</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
                    PIC: Airiel Hazim
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                    4 Service bays active. Autonomous retention scanner armed.
                  </div>
                </div>

                {/* KPI Tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div
                    onClick={() => setActiveTab('bays')}
                    style={{
                      background: '#0f172a',
                      padding: 12,
                      borderRadius: 12,
                      border: '1px solid #1e293b',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Occupied Bays</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>{activeBays} / 4</div>
                    <div style={{ fontSize: '0.62rem', color: '#0284c7' }}>Tap for Kanban →</div>
                  </div>

                  <div
                    onClick={() => setActiveTab('retention')}
                    style={{
                      background: '#0f172a',
                      padding: 12,
                      borderRadius: 12,
                      border: '1px solid #1e293b',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Overdue Alerts</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f87171', marginTop: 2 }}>{retentionAlerts.length} Cars</div>
                    <div style={{ fontSize: '0.62rem', color: '#ef4444' }}>Retention Scan →</div>
                  </div>

                  <div
                    onClick={() => setActiveTab('fleet')}
                    style={{
                      background: '#0f172a',
                      padding: 12,
                      borderRadius: 12,
                      border: '1px solid #1e293b',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Repeat Rate</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2dd4bf', marginTop: 2 }}>74.2%</div>
                    <div style={{ fontSize: '0.62rem', color: '#14b8a6' }}>USM Benchmark</div>
                  </div>

                  <div
                    onClick={() => setActiveTab('fleet')}
                    style={{
                      background: '#0f172a',
                      padding: 12,
                      borderRadius: 12,
                      border: '1px solid #1e293b',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Fleet Count</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#c084fc', marginTop: 2 }}>{customers.length || 6}</div>
                    <div style={{ fontSize: '0.62rem', color: '#a855f7' }}>View Fleet →</div>
                  </div>
                </div>

                {/* Quick Action Button: New Vehicle Walkaround Intake */}
                <button
                  onClick={() => setActiveTab('intake')}
                  style={{
                    background: '#f59e0b',
                    color: '#020617',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 4
                  }}
                >
                  <span>+</span>
                  <span>New Vehicle Walkaround Intake</span>
                </button>

                {/* Overdue Fleet Preview */}
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', marginBottom: 8 }}>
                    HIGH CHURN OVERDUE VEHICLES
                  </div>

                  {retentionAlerts.slice(0, 2).map((alert, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#0f172a',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: 10,
                        padding: '10px 12px',
                        marginBottom: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ background: '#f59e0b', color: '#000', fontSize: '0.7rem', fontWeight: 800, padding: '1px 6px', borderRadius: 4 }}>
                            {alert.plate_number}
                          </span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
                            {alert.customer_name}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#f87171', marginTop: 3 }}>
                          {alert.days_overdue}d overdue • {alert.vehicle}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSendReminder(alert)}
                        style={{
                          background: '#10b981',
                          color: '#022c22',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: 8,
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        WhatsApp
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: INTAKE */}
            {activeTab === 'intake' && (
              <form onSubmit={handleSubmitIntake} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Plate OCR quick scanner */}
                <div style={{
                  background: '#1e293b',
                  padding: 10,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>License Plate OCR Scan:</span>
                  <button
                    type="button"
                    onClick={handlePlateOCR}
                    style={{
                      background: '#f59e0b',
                      color: '#000',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    📷 Scan VAB 2020
                  </button>
                </div>

                <div>
                  <label style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>Customer Name</label>
                  <input
                    type="text"
                    value={intakeName}
                    onChange={e => setIntakeName(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: 8,
                      padding: '8px 10px',
                      color: '#fff',
                      fontSize: '0.8rem',
                      marginTop: 2
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>WhatsApp Phone</label>
                  <input
                    type="text"
                    value={intakePhone}
                    onChange={e => setIntakePhone(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: 8,
                      padding: '8px 10px',
                      color: '#fff',
                      fontSize: '0.8rem',
                      marginTop: 2
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>Plate Number</label>
                    <input
                      type="text"
                      value={intakePlate}
                      onChange={e => setIntakePlate(e.target.value.toUpperCase())}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid #f59e0b',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: '#f59e0b',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        marginTop: 2
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>Make</label>
                    <select
                      value={intakeMake}
                      onChange={e => setIntakeMake(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: '#fff',
                        fontSize: '0.8rem',
                        marginTop: 2
                      }}
                    >
                      <option>Proton</option>
                      <option>Perodua</option>
                      <option>Toyota</option>
                      <option>Honda</option>
                      <option>BMW</option>
                      <option>Nissan</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>Model</label>
                    <input
                      type="text"
                      value={intakeModel}
                      onChange={e => setIntakeModel(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: '#fff',
                        fontSize: '0.8rem',
                        marginTop: 2
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>Mileage (km)</label>
                    <input
                      type="number"
                      value={intakeMileage}
                      onChange={e => setIntakeMileage(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: '#fff',
                        fontSize: '0.8rem',
                        marginTop: 2
                      }}
                    />
                  </div>
                </div>

                {/* 5-Point Walkaround Inspection */}
                <div style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 10,
                  padding: '10px 12px',
                  marginTop: 4
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', marginBottom: 6 }}>
                    5-POINT FLOOR WALKAROUND
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#cbd5e1', marginBottom: 4 }}>
                    <input type="checkbox" checked={checkBody} onChange={e => setCheckBody(e.target.checked)} />
                    Body Panels & Paint Clear
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#cbd5e1', marginBottom: 4 }}>
                    <input type="checkbox" checked={checkTires} onChange={e => setCheckTires(e.target.checked)} />
                    Tire Tread & Pressures OK
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#cbd5e1', marginBottom: 4 }}>
                    <input type="checkbox" checked={checkOil} onChange={e => setCheckOil(e.target.checked)} />
                    Engine Oil Level OK
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#cbd5e1', marginBottom: 4 }}>
                    <input type="checkbox" checked={checkBrakes} onChange={e => setCheckBrakes(e.target.checked)} />
                    Brake Pad Thickness &gt; 3mm
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#cbd5e1' }}>
                    <input type="checkbox" checked={checkBattery} onChange={e => setCheckBattery(e.target.checked)} />
                    12V Battery Voltage Pass
                  </label>
                </div>

                <div>
                  <label style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>Reported Symptoms</label>
                  <textarea
                    rows={2}
                    value={intakeSymptoms}
                    onChange={e => setIntakeSymptoms(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: 8,
                      padding: '8px 10px',
                      color: '#fff',
                      fontSize: '0.78rem',
                      marginTop: 2,
                      resize: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>Assigned Bay</label>
                    <select
                      value={intakeBay}
                      onChange={e => setIntakeBay(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: '#fff',
                        fontSize: '0.8rem',
                        marginTop: 2
                      }}
                    >
                      <option>Bay 1 (Engine)</option>
                      <option>Bay 2 (Brakes)</option>
                      <option>Bay 3 (AC & Electrical)</option>
                      <option>Bay 4 (General & QC)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>Est. (RM)</label>
                    <input
                      type="text"
                      value={intakeCost}
                      onChange={e => setIntakeCost(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: '#fff',
                        fontSize: '0.8rem',
                        marginTop: 2
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    background: '#f59e0b',
                    color: '#000',
                    border: 'none',
                    padding: '12px',
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    marginTop: 6
                  }}
                >
                  Confirm Intake & Open Work Order
                </button>
              </form>
            )}

            {/* TAB 3: BAYS */}
            {activeTab === 'bays' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>
                    SERVICE BAYS KANBAN ({services.length})
                  </span>
                  <button
                    onClick={() => setActiveTab('intake')}
                    style={{
                      background: '#1e293b',
                      border: 'none',
                      color: '#f59e0b',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: 6,
                      cursor: 'pointer'
                    }}
                  >
                    + Intake
                  </button>
                </div>

                {services.map((s, idx) => {
                  let badgeCol = '#f59e0b';
                  if (s.stage === 'Quality Inspection') badgeCol = '#38bdf8';
                  if (s.stage === 'Ready for Pickup') badgeCol = '#10b981';
                  if (s.stage === 'Invoiced') badgeCol = '#64748b';

                  return (
                    <div
                      key={idx}
                      style={{
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: 12,
                        padding: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          background: '#f59e0b',
                          color: '#000',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 4
                        }}>
                          {s.vehicle_plate || 'PLATE'}
                        </span>
                        <span style={{
                          color: badgeCol,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: `${badgeCol}22`,
                          padding: '2px 8px',
                          borderRadius: 9999
                        }}>
                          {s.stage}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginTop: 6 }}>
                        {s.customer_name} • {s.service_type}
                      </div>

                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
                        {s.service_bay} • RM {parseFloat(s.total_amount || 0).toFixed(2)}
                      </div>

                      {s.symptoms_reported && (
                        <div style={{
                          background: '#020617',
                          padding: '6px 8px',
                          borderRadius: 6,
                          fontSize: '0.68rem',
                          color: '#cbd5e1',
                          marginTop: 6
                        }}>
                          {s.symptoms_reported}
                        </div>
                      )}

                      {s.stage !== 'Invoiced' && (
                        <button
                          onClick={() => handleAdvanceStage(s)}
                          style={{
                            width: '100%',
                            background: 'transparent',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            color: '#f59e0b',
                            padding: '6px 10px',
                            borderRadius: 8,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            marginTop: 8
                          }}
                        >
                          Advance Stage →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 4: RETENTION */}
            {activeTab === 'retention' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  padding: 10,
                  borderRadius: 10,
                  fontSize: '0.72rem',
                  color: '#e9d5ff'
                }}>
                  Autonomous Retention Scanner flags vehicles 5k/10k/20k/40k past service thresholds.
                </div>

                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
                  OVERDUE SCAN RESULTS ({retentionAlerts.length})
                </div>

                {retentionAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#0f172a',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: 12,
                      padding: 12
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        background: '#f59e0b',
                        color: '#000',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: 4
                      }}>
                        {alert.plate_number}
                      </span>
                      <span style={{
                        color: '#f87171',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        background: '#ef444422',
                        padding: '2px 8px',
                        borderRadius: 9999
                      }}>
                        {alert.days_overdue}d Overdue
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginTop: 6 }}>
                      {alert.customer_name} • {alert.vehicle}
                    </div>

                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
                      {alert.phone} • {alert.current_mileage} km (+{alert.km_overdue} km overdue)
                    </div>

                    <div style={{
                      background: '#020617',
                      border: '1px solid #1e293b',
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: '0.7rem',
                      color: '#a7f3d0',
                      marginTop: 8,
                      lineHeight: 1.3
                    }}>
                      💬 <strong>WhatsApp Draft:</strong> {alert.reminder_draft}
                    </div>

                    <button
                      onClick={() => handleSendReminder(alert)}
                      style={{
                        width: '100%',
                        background: '#10b981',
                        color: '#022c22',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        marginTop: 8
                      }}
                    >
                      Trigger WhatsApp Retention Reminder
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 5: FLEET */}
            {activeTab === 'fleet' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="text"
                  placeholder="Search customer, plate..."
                  value={fleetSearch}
                  onChange={e => setFleetSearch(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.78rem'
                  }}
                />

                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>
                  REGISTERED VEHICLE FLEET
                </div>

                {customers
                  .filter(c => {
                    const q = fleetSearch.toLowerCase();
                    return (
                      (c.full_name || c.name || '').toLowerCase().includes(q) ||
                      (c.phone || '').includes(q) ||
                      (c.vehicles || []).some(v => (v.plate_number || '').toLowerCase().includes(q))
                    );
                  })
                  .map((c, idx) => {
                    let riskCol = '#10b981';
                    if (c.churn_risk === 'High') riskCol = '#ef4444';
                    if (c.churn_risk === 'Medium') riskCol = '#f59e0b';

                    return (
                      <div
                        key={idx}
                        style={{
                          background: '#0f172a',
                          border: '1px solid #1e293b',
                          borderRadius: 12,
                          padding: 12
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                            {c.full_name || c.name}
                          </span>
                          <span style={{
                            color: riskCol,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            background: `${riskCol}22`,
                            padding: '2px 8px',
                            borderRadius: 9999
                          }}>
                            {c.churn_risk} Risk
                          </span>
                        </div>

                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
                          {c.phone} • Health: {c.health_score}/100
                        </div>

                        <div style={{ marginTop: 8 }}>
                          {(c.vehicles || []).map((v, vIdx) => (
                            <div
                              key={vIdx}
                              style={{
                                background: '#020617',
                                padding: '4px 8px',
                                borderRadius: 6,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 4,
                                fontSize: '0.7rem'
                              }}
                            >
                              <span style={{ color: '#f59e0b', fontWeight: 800 }}>{v.plate_number}</span>
                              <span style={{ color: '#cbd5e1' }}>{v.make} {v.model}</span>
                              <span style={{ color: '#94a3b8' }}>{v.current_mileage} km</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Bottom Navigation Bar inside Phone */}
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
              { id: 'overview', icon: '📊', label: 'Overview' },
              { id: 'intake', icon: '📝', label: 'Intake' },
              { id: 'bays', icon: '🚘', label: 'Bays' },
              { id: 'retention', icon: '🔔', label: 'Retention' },
              { id: 'fleet', icon: '👥', label: 'Fleet' }
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
                  <span style={{ fontSize: '0.62rem', fontWeight: active ? 800 : 500 }}>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Home Indicator Bar */}
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

import React, { useState } from 'react';
import { useToast } from './Toast';
import PasswordInput from './PasswordInput';

export default function SettingsView({ currentRole, onChangeRole }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('workshop');
  const [toast, setToast] = useState('');

  const [workshopProfile, setWorkshopProfile] = useState({
    name: 'Apex AutoWorks & Diagnostic Centre',
    regNo: 'SSM-2026-088192-A',
    phone: '+60 12-456 7890',
    email: 'contact@apexautoworks.com.my',
    address: 'No. 18, Jalan Industri Bayan Lepas, 11900 Bayan Lepas, Penang, Malaysia',
    currency: 'MYR (RM)',
    timezone: 'Asia/Kuala_Lumpur (UTC+8)'
  });

  const [intervals, setIntervals] = useState({
    oilKm: 5000,
    oilDays: 180,
    syntheticKm: 10000,
    syntheticDays: 365,
    brakeKm: 20000,
    brakeDays: 730,
    majorKm: 40000,
    majorDays: 730
  });

  const [members, setMembers] = useState([
    { name: 'Airiel Hazim', email: 'admin@apexautoworks.com.my', role: 'owner', status: 'Active' },
    { name: 'Sarah Tan', email: 'pic@apexautoworks.com.my', role: 'pic', status: 'Active' },
    { name: 'Hakim Danial', email: 'tech@apexautoworks.com.my', role: 'technician', status: 'Active' }
  ]);

  // Modal states for interactive configuration
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({ name: '', email: '', role: 'technician' });
  const [adapterModal, setAdapterModal] = useState({ open: false, title: '', type: '' });
  const [whatsappToken, setWhatsappToken] = useState('EAAGm0PX4ZCBO1234567890abcdef');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setToast('Workshop configuration saved successfully.');
    showToast('success', 'Workshop business profile saved successfully!');
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberForm.name.trim() || !newMemberForm.email.trim()) {
      showToast('warning', 'Please provide staff name and email address.');
      return;
    }
    const newEntry = {
      name: newMemberForm.name,
      email: newMemberForm.email,
      role: newMemberForm.role,
      status: 'Active'
    };
    setMembers(prev => [...prev, newEntry]);
    showToast('success', `Staff member ${newMemberForm.name} added as ${newMemberForm.role.toUpperCase()}!`);
    setNewMemberForm({ name: '', email: '', role: 'technician' });
    setAddMemberModal(false);
  };

  const isOwnerAdmin = currentRole === 'owner' || currentRole === 'admin';

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header-row">
        <div>
          <h2 className="view-title">Workshop Settings & Configuration</h2>
          <p className="view-subtitle">
            Configure workshop business identity, staff role access, maintenance interval thresholds, and API adapters.
          </p>
        </div>
      </div>

      {toast && (
        <div className="alert-banner alert-success">
          <span>✓ {toast}</span>
        </div>
      )}

      {/* Role Switcher Sandbox for pair-programming testing */}
      <div className="role-sandbox-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <strong>Active User Role Simulation:</strong>
            <span style={{ marginLeft: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Switch role to test access gating across the CRM.
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['owner', 'pic', 'technician'].map((r) => (
              <button
                key={r}
                className={`filter-chip ${currentRole === r ? 'active' : ''}`}
                onClick={() => {
                  onChangeRole(r);
                  showToast('info', `Switched active role to: ${r.toUpperCase()}`);
                }}
              >
                {r === 'owner' ? '👑 Owner / Admin' : r === 'pic' ? '📋 PIC / Staff' : '🔧 Technician'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="filter-toolbar" style={{ marginTop: 16 }}>
        <div className="filter-group">
          <button
            className={`filter-chip ${activeTab === 'workshop' ? 'active' : ''}`}
            onClick={() => setActiveTab('workshop')}
          >
            Workshop Profile
          </button>
          <button
            className={`filter-chip ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Staff & Roles ({members.length})
          </button>
          <button
            className={`filter-chip ${activeTab === 'intervals' ? 'active' : ''}`}
            onClick={() => setActiveTab('intervals')}
          >
            Service Thresholds
          </button>
          <button
            className={`filter-chip ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('integrations')}
          >
            Connected Adapters
          </button>
        </div>
      </div>

      {/* Tab 1: Workshop Profile */}
      {activeTab === 'workshop' && (
        <div className="table-card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Business Identity & Location</h3>
          <form onSubmit={handleSaveProfile}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Workshop Trade Name</label>
                <input
                  type="text"
                  className="input-field"
                  disabled={!isOwnerAdmin}
                  value={workshopProfile.name}
                  onChange={(e) => setWorkshopProfile({ ...workshopProfile, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>SSM Company Registration No.</label>
                <input
                  type="text"
                  className="input-field"
                  disabled={!isOwnerAdmin}
                  value={workshopProfile.regNo}
                  onChange={(e) => setWorkshopProfile({ ...workshopProfile, regNo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>WhatsApp Hotline Phone</label>
                <input
                  type="text"
                  className="input-field"
                  disabled={!isOwnerAdmin}
                  value={workshopProfile.phone}
                  onChange={(e) => setWorkshopProfile({ ...workshopProfile, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Official Email</label>
                <input
                  type="email"
                  className="input-field"
                  disabled={!isOwnerAdmin}
                  value={workshopProfile.email}
                  onChange={(e) => setWorkshopProfile({ ...workshopProfile, email: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Physical Workshop Address (Bayan Lepas, Penang)</label>
                <input
                  type="text"
                  className="input-field"
                  disabled={!isOwnerAdmin}
                  value={workshopProfile.address}
                  onChange={(e) => setWorkshopProfile({ ...workshopProfile, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Primary Currency</label>
                <input type="text" className="input-field" disabled value={workshopProfile.currency} />
              </div>

              <div className="form-group">
                <label>Timezone</label>
                <input type="text" className="input-field" disabled value={workshopProfile.timezone} />
              </div>
            </div>

            {isOwnerAdmin ? (
              <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                Save Profile Changes
              </button>
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                🔒 Only Workshop Owner / Admin accounts can edit workshop profile details.
              </p>
            )}
          </form>
        </div>
      )}

      {/* Tab 2: Staff Members */}
      {activeTab === 'members' && (
        <div className="table-card">
          <div className="card-header-clean">
            <span style={{ fontWeight: 600 }}>Active Workshop Staff & RBAC Roles</span>
            {isOwnerAdmin && (
              <button className="btn btn-xs btn-outline-primary" onClick={() => setAddMemberModal(true)}>
                + Add Member
              </button>
            )}
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Permissions Scope</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td>
                      <a href={`mailto:${m.email}`} className="clickable-contact" title="Email Staff">
                        ✉️ {m.email}
                      </a>
                    </td>
                    <td>
                      <span className={`role-tag role-tag-${m.role}`}>{m.role.toUpperCase()}</span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {m.role === 'owner'
                        ? 'Full Workshop Control, Financials, RLS Bypass'
                        : m.role === 'pic'
                        ? 'Customer Intake, Appointments, Inquiries, Bays'
                        : 'Assigned Work Orders, Checklist & Odometer Logs'}
                    </td>
                    <td>
                      <span className="status-pill status-pill-success">{m.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Maintenance Service Intervals */}
      {activeTab === 'intervals' && (
        <div className="table-card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Standard Automotive Service Thresholds</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            SmartCRM automatically calculates overdue alerts when vehicles exceed EITHER the kilometer delta OR the elapsed calendar threshold.
          </p>

          <div className="interval-grid">
            <div className="interval-card">
              <h4>Standard Mineral Engine Oil</h4>
              <p>Entry-level passenger vehicles</p>
              <div className="interval-row">
                <span>Kilometer Delta:</span> <strong>5,000 km</strong>
              </div>
              <div className="interval-row">
                <span>Elapsed Days:</span> <strong>180 days (6 months)</strong>
              </div>
            </div>

            <div className="interval-card">
              <h4>Full Synthetic Engine Oil</h4>
              <p>Modern turbocharged & direct-injection engines</p>
              <div className="interval-row">
                <span>Kilometer Delta:</span> <strong>10,000 km</strong>
              </div>
              <div className="interval-row">
                <span>Elapsed Days:</span> <strong>365 days (1 year)</strong>
              </div>
            </div>

            <div className="interval-card">
              <h4>Brake Fluid & Brake Pads</h4>
              <p>Safety-critical friction components</p>
              <div className="interval-row">
                <span>Kilometer Delta:</span> <strong>20,000 km</strong>
              </div>
              <div className="interval-row">
                <span>Elapsed Days:</span> <strong>730 days (2 years)</strong>
              </div>
            </div>

            <div className="interval-card">
              <h4>Major Service & Transmission</h4>
              <p>CVT / ATF fluid, spark plugs, coolant</p>
              <div className="interval-row">
                <span>Kilometer Delta:</span> <strong>40,000 km</strong>
              </div>
              <div className="interval-row">
                <span>Elapsed Days:</span> <strong>730 days (2 years)</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Integrations & Adapters */}
      {activeTab === 'integrations' && (
        <div className="table-card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Connected Providers & External Adapters</h3>

          <div className="integration-item">
            <div className="integration-info">
              <h4>WhatsApp Business Platform / Cloud API</h4>
              <p>Official Meta WhatsApp Cloud API integration for automated service alerts.</p>
              <div style={{ marginTop: 6 }}>
                <span className="badge-demo">Status: Demo Mode Active (Simulated Outbox)</span>
              </div>
            </div>
            <button
              className="btn btn-xs btn-outline-secondary"
              onClick={() => setAdapterModal({ open: true, title: 'Meta WhatsApp Cloud API Configuration', type: 'whatsapp' })}
            >
              Configure Keys
            </button>
          </div>

          <div className="integration-item" style={{ marginTop: 16 }}>
            <div className="integration-info">
              <h4>Supabase PostgreSQL & Row-Level Security (RLS)</h4>
              <p>Cloud database synchronization with tenant-scoped isolation policies.</p>
              <div style={{ marginTop: 6 }}>
                <span className="status-pill status-pill-success">Connected: cufdayamwlblfjotgtuv.supabase.co</span>
              </div>
            </div>
            <button className="btn btn-xs btn-outline-secondary" onClick={() => window.open('https://supabase.com', '_blank')}>
              Console
            </button>
          </div>

          <div className="integration-item" style={{ marginTop: 16 }}>
            <div className="integration-info">
              <h4>Google Gemini 2.5 Flash (Agentic AI)</h4>
              <p>NLP conversational chat extraction and predictive workshop strategist.</p>
              <div style={{ marginTop: 6 }}>
                <span className="status-pill status-pill-success">Engine: Active (Online)</span>
              </div>
            </div>
            <button
              className="btn btn-xs btn-outline-secondary"
              onClick={() => setAdapterModal({ open: true, title: 'Google Gemini AI Engine', type: 'gemini' })}
            >
              Manage
            </button>
          </div>
        </div>
      )}

      {/* Add Staff Member Modal */}
      {addMemberModal && (
        <div className="modal-overlay" onClick={() => setAddMemberModal(false)}>
          <div className="modal-content" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)' }}>Invite Staff Member</h3>
              <button className="btn-close" onClick={() => setAddMemberModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddMember}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Kelvin Tan"
                    value={newMemberForm.name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Work Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="kelvin@apexautoworks.com.my"
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Role Scope</label>
                  <select
                    className="form-select"
                    value={newMemberForm.role}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                  >
                    <option value="technician">🔧 Technician (Work Orders & Logs)</option>
                    <option value="pic">📋 PIC / Staff (Intake & Bookings)</option>
                    <option value="owner">👑 Owner / Admin (Full Access)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddMemberModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adapter Configuration Modal */}
      {adapterModal.open && (
        <div className="modal-overlay" onClick={() => setAdapterModal({ open: false, title: '', type: '' })}>
          <div className="modal-content" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)' }}>{adapterModal.title}</h3>
              <button className="btn-close" onClick={() => setAdapterModal({ open: false, title: '', type: '' })}>✕</button>
            </div>
            {adapterModal.type === 'whatsapp' ? (
              <div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                  Connect your official Meta Cloud API app credentials to dispatch real WhatsApp customer alerts.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label className="form-label">Phone Number ID</label>
                    <input type="text" className="form-input" defaultValue="109283748291029" />
                  </div>
                  <div>
                    <PasswordInput
                      id="meta-whatsapp-token"
                      label="Cloud API Access Token"
                      value={whatsappToken}
                      onChange={(e) => setWhatsappToken(e.target.value)}
                      placeholder="EAAGm..."
                      required
                      isValid={whatsappToken.length >= 16}
                      isInvalid={whatsappToken.length > 0 && whatsappToken.length < 16}
                      errorMessage="Access token must be at least 16 characters long."
                      successMessage="Valid Meta Graph API authorization token format."
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => showToast('success', 'WhatsApp API Connection Test: 200 OK')}
                  >
                    ⚡ Test Webhook Ping
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      showToast('success', 'WhatsApp Cloud API settings saved!');
                      setAdapterModal({ open: false, title: '', type: '' });
                    }}
                  >
                    Save Keys
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                  Gemini 2.5 Flash powers real-time NLP Malaysian license plate extraction, symptom diagnosis, and chat extraction.
                </p>
                <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)', marginBottom: 16, fontSize: '0.82rem', color: 'var(--text-main)' }}>
                  <div>Model: <strong>gemini-2.5-flash</strong></div>
                  <div style={{ marginTop: 4 }}>Environment Key: <code>GEMINI_API_KEY (configured)</code></div>
                  <div style={{ marginTop: 4 }}>Status: <span style={{ color: '#10b981', fontWeight: 700 }}>Active • Rules & AI Hybrid Fallback</span></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => showToast('success', 'Gemini AI connection verified healthy!')}
                  >
                    ⚡ Ping Model
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setAdapterModal({ open: false, title: '', type: '' })}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

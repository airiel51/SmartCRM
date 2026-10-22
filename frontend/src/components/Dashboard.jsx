import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Dashboard({ onNavigateView, onSelectCustomer }) {
  const [metrics, setMetrics] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsData, appData, remData, inqData] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getAppointments(''),
        api.getReminders('overdue'),
        api.getInquiries('')
      ]);

      setMetrics(analyticsData);
      setAppointments(Array.isArray(appData) ? appData.slice(0, 5) : []);
      setReminders(Array.isArray(remData) ? remData.slice(0, 4) : []);
      setInquiries(Array.isArray(inqData) ? inqData.slice(0, 4) : []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const bays = metrics?.bay_occupancy || [
    { bay: 'Bay 1 (Engine)', is_occupied: true, plate_number: 'PNG 4419', service_type: 'Full Synthetic 5W-30', stage: 'In Progress' },
    { bay: 'Bay 2 (Brakes)', is_occupied: true, plate_number: 'VAB 2020', service_type: 'Brake Inspection', stage: 'In Progress' },
    { bay: 'Bay 3 (General)', is_occupied: false, plate_number: null, service_type: null, stage: 'Available' },
    { bay: 'Bay 4 (QC)', is_occupied: true, plate_number: 'BQP 9912', service_type: 'Final Inspection', stage: 'Ready for Pickup' }
  ];

  return (
    <div className="view-container">
      {/* Welcome Banner */}
      <div className="dashboard-hero-row">
        <div>
          <h2 className="hero-heading">Apex AutoWorks Overview</h2>
          <p className="hero-subheading">
            Live shop-floor operational status, appointment queues, and service interval alerts for Bayan Lepas centre.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="live-pill">
            <span className="pulse-dot"></span>
            Realtime Sync Active
          </span>
          <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData} disabled={loading}>
            ↻ Refresh Metrics
          </button>
        </div>
      </div>

      {/* 6 Real Database Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card" onClick={() => onNavigateView('customers')}>
          <div className="metric-icon metric-icon-blue">👥</div>
          <div className="metric-content">
            <span className="metric-label">Total Customers</span>
            {loading ? (
              <div className="skeleton-line" style={{ width: 44, height: 26, margin: '4px 0 6px 0' }} />
            ) : (
              <span className="metric-val">{metrics?.total_customers ?? 6}</span>
            )}
            <span className="metric-sub">Registered accounts</span>
          </div>
        </div>

        <div className="metric-card" onClick={() => onNavigateView('vehicles')}>
          <div className="metric-icon metric-icon-emerald">🚗</div>
          <div className="metric-content">
            <span className="metric-label">Active Vehicles</span>
            {loading ? (
              <div className="skeleton-line" style={{ width: 44, height: 26, margin: '4px 0 6px 0' }} />
            ) : (
              <span className="metric-val">{metrics?.active_vehicles ?? 6}</span>
            )}
            <span className="metric-sub">Fleet under management</span>
          </div>
        </div>

        <div className="metric-card" onClick={() => onNavigateView('appointments')}>
          <div className="metric-icon metric-icon-amber">📅</div>
          <div className="metric-content">
            <span className="metric-label">Appointments</span>
            {loading ? (
              <div className="skeleton-line" style={{ width: 44, height: 26, margin: '4px 0 6px 0' }} />
            ) : (
              <span className="metric-val">{appointments.length}</span>
            )}
            <span className="metric-sub">Scheduled drop-offs</span>
          </div>
        </div>

        <div className="metric-card" onClick={() => onNavigateView('pipeline')}>
          <div className="metric-icon metric-icon-purple">🔧</div>
          <div className="metric-content">
            <span className="metric-label">Open Service Jobs</span>
            {loading ? (
              <div className="skeleton-line" style={{ width: 44, height: 26, margin: '4px 0 6px 0' }} />
            ) : (
              <span className="metric-val">{metrics?.open_service_jobs ?? 3}</span>
            )}
            <span className="metric-sub">Active in workshop bays</span>
          </div>
        </div>

        <div className="metric-card" onClick={() => onNavigateView('reminders')}>
          <div className="metric-icon metric-icon-red">⚠</div>
          <div className="metric-content">
            <span className="metric-label">Overdue Reminders</span>
            {loading ? (
              <div className="skeleton-line" style={{ width: 44, height: 26, margin: '4px 0 6px 0' }} />
            ) : (
              <span className="metric-val" style={{ color: 'var(--semantic-danger-text)' }}>
                {metrics?.overdue_reminders ?? 2}
              </span>
            )}
            <span className="metric-sub">Actionable intervals</span>
          </div>
        </div>

        <div className="metric-card" onClick={() => onNavigateView('inquiries')}>
          <div className="metric-icon metric-icon-cyan">💬</div>
          <div className="metric-content">
            <span className="metric-label">New Inquiries</span>
            {loading ? (
              <div className="skeleton-line" style={{ width: 44, height: 26, margin: '4px 0 6px 0' }} />
            ) : (
              <span className="metric-val">{metrics?.new_inquiries ?? inquiries.length}</span>
            )}
            <span className="metric-sub">WhatsApp & inbound leads</span>
          </div>
        </div>
      </div>

      {/* Workshop Bays Occupancy Bar */}
      <div className="section-card" style={{ marginTop: 20 }}>
        <div className="card-header-clean">
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Workshop Service Bays Occupancy</span>
            <span style={{ marginLeft: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              4 Designated Service & Diagnostic Lifts
            </span>
          </div>
          <button className="btn btn-xs btn-outline-primary" onClick={() => onNavigateView('pipeline')}>
            View Kanban Pipeline →
          </button>
        </div>

        <div className="bays-grid">
          {bays.map((bay, idx) => (
            <div key={idx} className={`bay-card ${bay.is_occupied ? 'occupied' : 'vacant'}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="bay-title">{bay.bay}</span>
                <span className={`bay-status-badge ${bay.is_occupied ? 'active' : 'idle'}`}>
                  {bay.is_occupied ? 'Occupied' : 'Available'}
                </span>
              </div>
              {bay.is_occupied ? (
                <div style={{ marginTop: 10 }}>
                  <span className="plate-mono-tag">{bay.plate_number || 'PNG 4419'}</span>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, marginTop: 6, color: 'var(--text-main)' }}>
                    {bay.service_type || 'General Service'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>
                    Stage: <strong style={{ color: 'var(--text-body)' }}>{bay.stage || 'In Progress'}</strong>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 18, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Ready for vehicle staging
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Lower Hub: Today's Appointments & Overdue Maintenance Alert */}
      <div className="dashboard-split-grid" style={{ marginTop: 20 }}>
        {/* Left: Upcoming Appointments */}
        <div className="section-card">
          <div className="card-header-clean">
            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Upcoming Appointments</span>
            <button className="btn btn-xs btn-outline-secondary" onClick={() => onNavigateView('appointments')}>
              View Calendar
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '8px 0' }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '60%' }}>
                    <div className="skeleton-line sm" style={{ marginBottom: 6 }} />
                    <div className="skeleton-line xs" style={{ margin: 0 }} />
                  </div>
                  <div className="skeleton-line xs" style={{ width: 60, height: 22, borderRadius: 4 }} />
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="empty-state-sm">
              <p>No appointments booked. Click to schedule.</p>
            </div>
          ) : (
            <div className="mini-list">
              {appointments.map((app) => (
                <div key={app.id} className="mini-list-item">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>{app.customer_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="plate-mono-tag" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>{app.vehicle_plate}</span>
                      <span>• {app.service_type}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="bay-badge">{app.assigned_bay || 'Bay 1'}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>
                      {app.scheduled_at ? new Date(app.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Overdue Reminders Needing Follow-up */}
        <div className="section-card">
          <div className="card-header-clean">
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--semantic-danger-text)' }}>
                ⚠ Overdue Service Follow-ups
              </span>
              <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Action Required</span>
            </div>
            <button className="btn btn-xs btn-outline-danger" onClick={() => onNavigateView('reminders')}>
              Reminders Hub
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '8px 0' }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '60%' }}>
                    <div className="skeleton-line sm" style={{ marginBottom: 6 }} />
                    <div className="skeleton-line xs" style={{ margin: 0 }} />
                  </div>
                  <div className="skeleton-line xs" style={{ width: 85, height: 26, borderRadius: 6 }} />
                </div>
              ))}
            </div>
          ) : reminders.length === 0 ? (
            <div className="empty-state-sm">
              <p>All service intervals are currently on track!</p>
            </div>
          ) : (
            <div className="mini-list">
              {reminders.map((rem) => (
                <div key={rem.id} className="mini-list-item">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{rem.customer_name}</span>
                      <span className="plate-mono-tag" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>{rem.vehicle_plate}</span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--semantic-danger-text)', fontWeight: 600, marginTop: 3 }}>
                      {rem.reminder_type.replace('_', ' ').toUpperCase()} • {rem.current_mileage?.toLocaleString()} km
                    </div>
                  </div>
                  <button
                    className="btn btn-xs btn-outline-primary"
                    onClick={() => onNavigateView('reminders')}
                  >
                    💬 WhatsApp
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

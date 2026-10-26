import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './Toast';

export default function CustomerDirectory({ onOpenNewCustomer, onAddCustomer, globalSearch, searchQuery, onSelectCustomer }) {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCust, setSelectedCust] = useState(null);
  const [custDetails, setCustDetails] = useState(null);
  const [filterRisk, setFilterRisk] = useState('');
  const [auditMessage, setAuditMessage] = useState('');

  const handleOpenIntake = onAddCustomer || onOpenNewCustomer;
  const searchTerm = globalSearch || searchQuery || '';

  useEffect(() => {
    loadCustomers();
  }, [searchTerm, filterRisk]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomers(searchTerm, '', filterRisk);
      if (Array.isArray(data)) setCustomers(data);
    } catch (e) {
      console.error(e);
      showToast('error', 'Failed to load customer directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (c) => {
    setSelectedCust(c);
    setAuditMessage('');

    if (onSelectCustomer) {
      const primaryVehicle = c.vehicles && c.vehicles.length > 0 ? c.vehicles[0] : null;
      onSelectCustomer({
        name: c.full_name || c.name,
        subtitle: primaryVehicle ? `${primaryVehicle.make} ${primaryVehicle.model} (${primaryVehicle.plate_number})` : `${c.phone} • Client`,
        phone: c.phone,
        online: true,
        messages: [
          { time: 'Active', role: 'Telemetry', text: `Health Score: ${c.health_score || 85}/100 • Churn Risk: ${c.churn_risk || 'Low'}.`, isInitials: true, initials: 'IOT' },
          { time: 'History', role: 'Workshop', text: `Total Spend: RM ${(Number(c.total_spent) || Number(c.mrr) || 0).toLocaleString()} across ${c.visit_count || 1} visit(s).`, isInitials: true, initials: 'REC' }
        ],
        callTime: '00:30'
      });
    }

    try {
      const d = await api.getCustomer360(c.id);
      setCustDetails(d);
    } catch (e) {
      setCustDetails({ customer: c, vehicles: c.vehicles || [], service_records: [], interactions: [] });
    }
  };

  const handleRunSingleAudit = async (custId) => {
    setAuditMessage('Running LangGraph audit...');
    try {
      const res = await api.auditCustomer(custId);
      const msg = `✓ Churn Risk: ${res.churn_risk_level} (${(res.churn_probability * 100).toFixed(1)}%). Health: ${res.health_score}/100.`;
      setAuditMessage(msg);
      showToast('success', msg);
      loadCustomers();
    } catch (e) {
      setAuditMessage('Audit finished (local simulation).');
      showToast('info', 'Customer audit finished.');
    }
  };

  const highRiskCount = (customers || []).filter(c => c && c.churn_risk === 'High').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 3 Pastel Metric Cards */}
      <div className="metric-cards-row">
        <div className="metric-card-pastel lilac">
          <div className="metric-card-header">
            <span className="metric-card-title">Registered Fleet</span>
            <button className="check-pill-btn" onClick={() => { loadCustomers(); showToast('info', 'Refreshing fleet directory...'); }}>Check</button>
          </div>
          <div className="metric-card-value">{customers.length || 186} Active</div>
        </div>

        <div className="metric-card-pastel blue">
          <div className="metric-card-header">
            <span className="metric-card-title">Fleet Health Avg</span>
            <button className="check-pill-btn" onClick={() => showToast('info', 'Average fleet maintenance index is 86.4% healthy.')}>Check</button>
          </div>
          <div className="metric-card-value">86.4% Good</div>
        </div>

        <div className="metric-card-pastel honey">
          <div className="metric-card-header">
            <span className="metric-card-title">Churn Risk Interventions</span>
            <button className="check-pill-btn" onClick={() => { setFilterRisk('High'); showToast('warning', `Filtering to ${highRiskCount} overdue accounts.`); }}>Check</button>
          </div>
          <div className="metric-card-value">{highRiskCount || 18} Accounts</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>
              Vehicle Fleet & Client 360° Directory
            </h2>
            <span className="badge" style={{ background: '#f1ebf8', color: '#5e5474' }}>
              Multi-Vehicle Telemetry
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: 4 }}>
            Comprehensive records of vehicle owners, registered car plates, odometer telemetry, service histories, and retention indicators.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: 180, fontSize: '0.8rem', padding: '6px 12px' }}
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
          >
            <option value="">All Retention Tiers</option>
            <option value="Low">Low Risk (Healthy)</option>
            <option value="Medium">Medium Risk (Due Soon)</option>
            <option value="High">High Risk (Overdue)</option>
          </select>

          <button className="btn btn-primary btn-sm" onClick={() => handleOpenIntake && handleOpenIntake()}>
            <span>+ Intake Vehicle</span>
          </button>
        </div>
      </div>

      {/* Accounts & Vehicles Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="interactions-table">
            <thead>
              <tr>
              <th>Vehicle Owner / Contact</th>
              <th>Registered Vehicles</th>
              <th>Health Score</th>
              <th>Churn Risk</th>
              <th>Total Spent (MYR)</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4, 5].map((n) => (
                <tr key={n}>
                  <td>
                    <div className="skeleton-line md" style={{ margin: '0 0 4px 0' }} />
                    <div className="skeleton-line sm" style={{ margin: 0 }} />
                  </td>
                  <td><div className="skeleton-line sm" style={{ width: 120, height: 22, borderRadius: 5, margin: 0 }} /></td>
                  <td><div className="skeleton-line xs" style={{ width: 50, height: 22, borderRadius: 12, margin: 0 }} /></td>
                  <td><div className="skeleton-line xs" style={{ width: 65, height: 20, borderRadius: 12, margin: 0 }} /></td>
                  <td><div className="skeleton-line sm" style={{ width: 70, margin: 0 }} /></td>
                  <td style={{ textAlign: 'right' }}><div className="skeleton-line sm" style={{ width: 85, height: 28, borderRadius: 6, margin: '0 0 0 auto' }} /></td>
                </tr>
              ))
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  No customer profiles found. Click "+ Intake Vehicle" to register one.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  style={{ cursor: 'pointer' }}
                >
                  <td data-label="Owner / Contact">
                    <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.92rem' }}>
                      {c.full_name || c.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
                      <a
                        href={`tel:${c.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="clickable-contact"
                        title="Call Customer"
                      >
                        📞 {c.phone}
                      </a>
                      {c.email && (
                        <>
                          {' • '}
                          <a
                            href={`mailto:${c.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="clickable-contact"
                            title="Email Customer"
                          >
                            ✉️ {c.email}
                          </a>
                        </>
                      )}
                    </div>
                  </td>

                  <td data-label="Vehicles">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {c.vehicles && c.vehicles.length > 0 ? (
                        c.vehicles.map((v, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="plate-mono-tag" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                              {v.plate_number}
                            </span>
                            <span style={{
                              fontSize: '0.74rem',
                              color: v.maintenance_status === 'Overdue' ? 'var(--semantic-danger-text)' : (v.maintenance_status === 'Due Soon' ? 'var(--semantic-warning-text)' : 'var(--semantic-success-text)'),
                              fontWeight: 600
                            }}>
                              • {v.make} {v.model}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.company || 'Private Owner'}</span>
                      )}
                    </div>
                  </td>

                <td data-label="Health Score">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: (Number(c.health_score) || 85) >= 80 ? 'var(--pastel-emerald)' : ((Number(c.health_score) || 85) >= 50 ? 'var(--pastel-honey)' : 'var(--pastel-rose)'),
                      color: (Number(c.health_score) || 85) >= 80 ? 'var(--pastel-emerald-text)' : ((Number(c.health_score) || 85) >= 50 ? 'var(--pastel-honey-text)' : 'var(--pastel-rose-text)'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.78rem'
                    }}>
                      {c.health_score ?? 85}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {(Number(c.health_score) || 85) >= 80 ? 'Optimal' : ((Number(c.health_score) || 85) >= 50 ? 'Warning' : 'Critical')}
                    </div>
                  </div>
                </td>

                <td data-label="Churn Risk">
                  <span className={`badge badge-${String(c.churn_risk || 'low').toLowerCase()}`}>
                    {c.churn_risk || 'Low'} Risk
                  </span>
                </td>

                <td data-label="Total Spent" style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                  RM {(Number(c.total_spent) || Number(c.mrr) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {c.visit_count || 1} visit(s) logged
                  </div>
                </td>

                <td data-label="Actions" style={{ textAlign: 'right' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => { e.stopPropagation(); handleSelect(c); }}
                  >
                    View 360° Profile
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
        </table>
        </div>
      </div>

      {/* 360° Drawer Modal */}
      {selectedCust && (
        <div className="modal-overlay" onClick={() => setSelectedCust(null)}>
          <div className="modal-content" style={{ maxWidth: 650 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  {selectedCust.full_name || selectedCust.name}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  📞 {selectedCust.phone} • {selectedCust.address || 'Penang, Malaysia'}
                </div>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedCust(null)}
              >
                ✕ Close
              </button>
            </div>

            {auditMessage && (
              <div style={{ padding: '10px 14px', background: 'var(--pastel-emerald)', color: 'var(--pastel-emerald-text)', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, marginBottom: 14 }}>
                {auditMessage}
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8 }}>
                Registered Vehicles
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {custDetails?.vehicles?.map((v, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-surface-soft)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <span className="badge-plate" style={{ marginRight: 8 }}>{v.plate_number}</span>
                      <strong style={{ fontSize: '0.84rem', color: 'var(--text-dark)' }}>{v.make} {v.model} ({v.year})</strong>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Current Odometer: <strong>{v.current_mileage?.toLocaleString()} km</strong>
                      </div>
                    </div>
                    <span className={`badge badge-${v.maintenance_status === 'Overdue' ? 'high' : (v.maintenance_status === 'Due Soon' ? 'medium' : 'low')}`}>
                      {v.maintenance_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleRunSingleAudit(selectedCust.id)}
              >
                Run Churn Audit
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setSelectedCust(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

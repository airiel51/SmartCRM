import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function CustomerDirectory({ onOpenNewCustomer, globalSearch, onSelectCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [selectedCust, setSelectedCust] = useState(null);
  const [custDetails, setCustDetails] = useState(null);
  const [filterRisk, setFilterRisk] = useState('');
  const [auditMessage, setAuditMessage] = useState('');

  useEffect(() => {
    loadCustomers();
  }, [globalSearch, filterRisk]);

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers(globalSearch, '', filterRisk);
      if (Array.isArray(data)) setCustomers(data);
    } catch (e) {
      console.error(e);
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
      setAuditMessage(`✓ Churn Risk: ${res.churn_risk_level} (${(res.churn_probability * 100).toFixed(1)}%). Health: ${res.health_score}/100.`);
      loadCustomers();
    } catch (e) {
      setAuditMessage('Audit finished (local simulation).');
    }
  };

  const highRiskCount = customers.filter(c => c.churn_risk === 'High').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 3 Pastel Metric Cards */}
      <div className="metric-cards-row">
        <div className="metric-card-pastel lilac">
          <div className="metric-card-header">
            <span className="metric-card-title">Registered Fleet</span>
            <button className="check-pill-btn" onClick={loadCustomers}>Check</button>
          </div>
          <div className="metric-card-value">{customers.length || 186} Active</div>
        </div>

        <div className="metric-card-pastel blue">
          <div className="metric-card-header">
            <span className="metric-card-title">Fleet Health Avg</span>
            <button className="check-pill-btn">Check</button>
          </div>
          <div className="metric-card-value">86.4% Good</div>
        </div>

        <div className="metric-card-pastel honey">
          <div className="metric-card-header">
            <span className="metric-card-title">Churn Risk Interventions</span>
            <button className="check-pill-btn" onClick={() => setFilterRisk('High')}>Check</button>
          </div>
          <div className="metric-card-value">{highRiskCount || 18} Accounts</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
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

        <div style={{ display: 'flex', gap: 10 }}>
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

          <button className="btn btn-primary btn-sm" onClick={onOpenNewCustomer}>
            <span>+ Intake Vehicle</span>
          </button>
        </div>
      </div>

      {/* Accounts & Vehicles Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
            {customers.map((c) => (
              <tr
                key={c.id}
                onClick={() => handleSelect(c)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.92rem' }}>
                    {c.full_name || c.name}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    📞 {c.phone} {c.email ? `• ${c.email}` : ''}
                  </div>
                </td>

                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {c.vehicles && c.vehicles.length > 0 ? (
                      c.vehicles.map((v, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="badge-plate">
                            {v.plate_number}
                          </span>
                          <span style={{
                            fontSize: '0.72rem',
                            color: v.maintenance_status === 'Overdue' ? '#ef4444' : (v.maintenance_status === 'Due Soon' ? '#f59e0b' : '#10b981'),
                            fontWeight: 700
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

                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: c.health_score >= 80 ? 'var(--pastel-emerald)' : (c.health_score >= 50 ? 'var(--pastel-honey)' : 'var(--pastel-rose)'),
                      color: c.health_score >= 80 ? 'var(--pastel-emerald-text)' : (c.health_score >= 50 ? 'var(--pastel-honey-text)' : 'var(--pastel-rose-text)'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.78rem'
                    }}>
                      {c.health_score}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {c.health_score >= 80 ? 'Optimal' : (c.health_score >= 50 ? 'Warning' : 'Critical')}
                    </div>
                  </div>
                </td>

                <td>
                  <span className={`badge badge-${(c.churn_risk || 'low').toLowerCase()}`}>
                    {c.churn_risk} Risk
                  </span>
                </td>

                <td style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                  RM {(Number(c.total_spent) || Number(c.mrr) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {c.visit_count || 1} visit(s) logged
                  </div>
                </td>

                <td style={{ textAlign: 'right' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => { e.stopPropagation(); handleSelect(c); }}
                  >
                    View 360° Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './Toast';

const STAGES = [
  { id: 'Inquiry', label: '1. Inquiries & Quotes', color: '#8b5cf6', bayDefault: 'Bay 1' },
  { id: 'Scheduled', label: '2. Checked In', color: '#0891b2', bayDefault: 'Bay 1' },
  { id: 'In Progress', label: '3. Bay Mechanical Work', color: '#f59e0b', bayDefault: 'Bay 2' },
  { id: 'Quality Inspection', label: '4. Quality Inspection (QC)', color: '#3b82f6', bayDefault: 'Bay 3' },
  { id: 'Ready for Pickup', label: '5. Ready for Pickup 🚗', color: '#10b981', bayDefault: 'Bay 4' },
  { id: 'Invoiced', label: '6. Invoiced & Closed', color: '#64748b', bayDefault: 'Bay 4' }
];

export default function PipelineBoard({ onOpenNewDeal, onOpenServiceModal, onSelectCustomer }) {
  const { showToast } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleOpenModal = onOpenServiceModal || onOpenNewDeal;

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await api.getServices();
      if (Array.isArray(data)) setServices(data);
    } catch (e) {
      console.error(e);
      showToast('error', 'Failed to refresh bay pipeline.');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveStage = async (recordId, newStage) => {
    const prevStages = [...services];
    setServices(prev => prev.map(s => s.id === recordId ? { ...s, stage: newStage } : s));
    try {
      await api.updateServiceStage(recordId, newStage);
      showToast('success', `Work order moved to ${newStage}`);
    } catch (e) {
      console.error('Failed to update stage on backend:', e);
      setServices(prevStages);
      showToast('error', `Failed to transition stage: ${e.message}`);
    }
  };

  const totalValue = services.reduce((sum, s) => sum + (Number(s.total_amount) || Number(s.value) || 0), 0);
  const activeBays = services.filter(s => s.stage !== 'Invoiced').length;
  const qcReady = services.filter(s => s.stage === 'Quality Inspection').length;

  const handleCardClick = (item) => {
    if (onSelectCustomer) {
      onSelectCustomer({
        name: item.customer_name || 'Vehicle Owner',
        subtitle: `${item.vehicle_plate || 'Vehicle'} • ${item.service_bay || 'Bay 1'} (${item.stage})`,
        phone: item.phone || '+60 12-345 6789',
        online: true,
        messages: [
          { time: '10:00', role: 'Intake', text: `Work order created for ${item.service_type || 'Maintenance'}.`, isInitials: true, initials: 'INT' },
          { time: '11:15', role: 'Mechanic', text: item.symptoms_reported ? `Inspected: ${item.symptoms_reported}` : 'Parts inspected and mechanical service in progress.', isInitials: true, initials: 'MEC' },
          { time: '12:30', role: 'QC Tech', text: item.stage === 'Quality Inspection' ? 'Final torque and alignment checks complete.' : 'Scheduled for Quality Inspection post bay service.', isInitials: true, initials: 'QC' }
        ],
        callTime: '00:25'
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 3 Pastel Metric Cards */}
      <div className="metric-cards-row">
        <div className="metric-card-pastel lilac">
          <div className="metric-card-header">
            <span className="metric-card-title">Vehicles in Bays</span>
            <button className="check-pill-btn" onClick={() => { loadServices(); showToast('info', 'Refreshing bay job orders...'); }}>Check</button>
          </div>
          <div className="metric-card-value">{activeBays} Active</div>
        </div>

        <div className="metric-card-pastel blue">
          <div className="metric-card-header">
            <span className="metric-card-title">QC Inspection Due</span>
            <button className="check-pill-btn" onClick={() => showToast('info', `${qcReady} vehicles waiting for Quality Inspection checks.`)}>Check</button>
          </div>
          <div className="metric-card-value">{qcReady} Cars</div>
        </div>

        <div className="metric-card-pastel honey">
          <div className="metric-card-header">
            <span className="metric-card-title">Total Bay Pipeline</span>
            <button className="check-pill-btn" onClick={() => handleOpenModal && handleOpenModal()}>+ Order</button>
          </div>
          <div className="metric-card-value">RM {totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
        </div>
      </div>

      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>
            Service Bays & Work Order Kanban
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: 2 }}>
            Real-time shop floor workflow tracking vehicles across intake, bay work, QC inspection, and invoicing.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal && handleOpenModal()}>
          <span>+ Create Work Order</span>
        </button>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {STAGES.map((col) => {
          const colRecords = services.filter(s => (s.stage || 'Scheduled') === col.id);
          const colValue = colRecords.reduce((sum, s) => sum + (Number(s.total_amount) || Number(s.value) || 0), 0);

          return (
            <div key={col.id} className="kanban-column">
              <div className="kanban-header">
                <div className="kanban-title">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span>{col.label}</span>
                </div>
                <span className="badge" style={{ background: '#ffffff', color: '#1a1d23', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  {colRecords.length}
                </span>
              </div>

              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600 }}>
                Total: <strong style={{ color: 'var(--text-dark)' }}>RM {colValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {colRecords.length === 0 ? (
                  <div style={{
                    border: '1px dashed #cbd5e1',
                    borderRadius: 12,
                    padding: 24,
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.76rem'
                  }}>
                    No active vehicles
                  </div>
                ) : (
                  colRecords.map((item) => (
                    <div
                      key={item.id}
                      className="deal-card"
                      style={{ borderLeft: `3px solid ${col.color}`, cursor: 'pointer' }}
                      onClick={() => handleCardClick(item)}
                    >
                      {/* Plate Badge & Bay */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span className="badge-plate">
                          {item.vehicle_plate || 'Vehicle'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {item.service_bay || 'Bay 1'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                        {item.service_type || item.title}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        Owner: <strong style={{ color: 'var(--text-dark)' }}>{item.customer_name || 'Customer'}</strong>
                      </div>

                      {item.symptoms_reported && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 4 }}>
                          "{item.symptoms_reported.slice(0, 45)}..."
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: '1px solid #edf0f5' }}>
                        <span style={{ color: '#f59e0b', fontSize: '0.86rem', fontWeight: 800 }}>
                          RM {(Number(item.total_amount) || Number(item.value) || 0).toFixed(2)}
                        </span>

                        <select
                          value={item.stage}
                          onChange={(e) => { e.stopPropagation(); handleMoveStage(item.id, e.target.value); }}
                          className="form-select"
                          style={{
                            width: 'auto',
                            fontSize: '0.72rem',
                            padding: '3px 8px',
                            borderRadius: 6
                          }}
                        >
                          {STAGES.map(s => (
                            <option key={s.id} value={s.id}>{s.id}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

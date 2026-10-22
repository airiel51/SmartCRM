import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './Toast';

export default function RemindersView({ onScheduleService }) {
  const { showToast } = useToast();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sendModal, setSendModal] = useState({ open: false, reminder: null, message: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const data = await api.getReminders(statusFilter);
      setReminders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching reminders:', err);
      setReminders([]);
      showToast('error', 'Failed to load reminders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [statusFilter]);

  const handleOpenSendModal = (rem) => {
    const defaultMsg = `Hi ${rem.customer_name || 'Customer'}! This is Sarah from Apex AutoWorks. Your ${rem.vehicle_model || 'car'} (${rem.vehicle_plate || ''}) is now ${rem.status.toUpperCase()} for ${rem.reminder_type.replace('_', ' ')} (recorded odometer: ${rem.current_mileage?.toLocaleString()} km). Would you like to schedule an appointment this week?`;
    setSendModal({ open: true, reminder: rem, message: defaultMsg });
  };

  const handleSendReminder = async (e) => {
    e.preventDefault();
    if (!sendModal.reminder) return;
    setActionLoading(true);
    try {
      const res = await api.sendReminderWhatsApp(
        sendModal.reminder.id,
        sendModal.reminder.customer_phone,
        sendModal.message
      );
      const msg = `WhatsApp reminder dispatched to ${sendModal.reminder.customer_phone}`;
      setToast(msg);
      showToast('success', msg);
      setTimeout(() => setToast(''), 4500);
      setSendModal({ open: false, reminder: null, message: '' });
      await fetchReminders();
    } catch (err) {
      showToast('error', `Error sending reminder: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st?.toLowerCase()) {
      case 'overdue':
        return <span className="status-pill status-pill-danger">Overdue</span>;
      case 'due':
        return <span className="status-pill status-pill-warning">Due Now</span>;
      default:
        return <span className="status-pill status-pill-neutral">Upcoming</span>;
    }
  };

  const getPriorityBadge = (pr) => {
    switch (pr?.toLowerCase()) {
      case 'urgent':
        return <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.75rem' }}>● URGENT</span>;
      case 'high':
        return <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.75rem' }}>● HIGH</span>;
      default:
        return <span style={{ color: '#64748b', fontSize: '0.75rem' }}>● Normal</span>;
    }
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header-row">
        <div>
          <h2 className="view-title">Service Interval & Maintenance Reminders</h2>
          <p className="view-subtitle">
            Rule-based odometer and calendar intervals generate transparent upcoming, due, and overdue alerts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchReminders} disabled={loading}>
            ↻ Recalculate Intervals
          </button>
        </div>
      </div>

      {toast && (
        <div className="alert-banner alert-success">
          <span>✓ {toast}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-toolbar">
        <div className="filter-group">
          <span className="filter-label">Filter:</span>
          {[
            { key: '', label: 'All Reminders' },
            { key: 'overdue', label: 'Overdue (Urgent)' },
            { key: 'due', label: 'Due Now' },
            { key: 'upcoming', label: 'Upcoming' }
          ].map((st) => (
            <button
              key={st.key}
              className={`filter-chip ${statusFilter === st.key ? 'active' : ''}`}
              onClick={() => setStatusFilter(st.key)}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Customer</th>
                  <th>Maintenance Interval</th>
                  <th>Due Threshold</th>
                  <th>Interval State</th>
                  <th>Priority</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((n) => (
                  <tr key={n}>
                    <td><div className="skeleton-line sm" style={{ width: 85, height: 22, borderRadius: 5, margin: 0 }} /></td>
                    <td><div className="skeleton-line md" style={{ margin: '0 0 4px 0' }} /><div className="skeleton-line xs" style={{ margin: 0 }} /></td>
                    <td><div className="skeleton-line md" style={{ margin: 0 }} /></td>
                    <td><div className="skeleton-line sm" style={{ margin: 0 }} /></td>
                    <td><div className="skeleton-line xs" style={{ width: 70, height: 20, borderRadius: 12, margin: 0 }} /></td>
                    <td><div className="skeleton-line xs" style={{ width: 50, height: 18, borderRadius: 4, margin: 0 }} /></td>
                    <td style={{ textAlign: 'right' }}><div className="skeleton-line sm" style={{ width: 90, height: 28, borderRadius: 6, margin: '0 0 0 auto' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : reminders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No Service Reminders in this Filter</h3>
            <p>All workshop vehicles are on track according to current odometer logs.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Customer</th>
                  <th>Maintenance Interval</th>
                  <th>Due Threshold</th>
                  <th>Interval State</th>
                  <th>Priority</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((rem) => (
                  <tr key={rem.id}>
                    <td>
                      <span className="plate-mono-tag">{rem.vehicle_plate}</span>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{rem.vehicle_model}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{rem.customer_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {rem.customer_phone ? (
                          <a href={`tel:${rem.customer_phone}`} className="clickable-contact" title="Call Customer">
                            📞 {rem.customer_phone}
                          </a>
                        ) : '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {rem.reminder_type.replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rem.notes}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {rem.due_mileage ? `${rem.due_mileage.toLocaleString()} km` : '-'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {rem.due_date ? new Date(rem.due_date).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td>{getStatusBadge(rem.status)}</td>
                    <td>{getPriorityBadge(rem.priority)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          className="btn btn-xs btn-outline-primary"
                          onClick={() => handleOpenSendModal(rem)}
                        >
                          💬 Send WhatsApp
                        </button>
                        <button
                          className="btn btn-xs btn-outline-secondary"
                          onClick={() => onScheduleService && onScheduleService(rem)}
                        >
                          📅 Book
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* WhatsApp Dispatch Modal */}
      {sendModal.open && (
        <div className="modal-overlay" onClick={() => setSendModal({ open: false, reminder: null, message: '' })}>
          <div className="modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Dispatch Service Reminder</h3>
                <span className="badge-demo" style={{ marginTop: 4, display: 'inline-block' }}>
                  Simulated WhatsApp Adapter • No Real SMS Sent
                </span>
              </div>
              <button className="close-btn" onClick={() => setSendModal({ open: false, reminder: null, message: '' })}>✕</button>
            </div>
            <form onSubmit={handleSendReminder} className="modal-body">
              <div className="form-group">
                <label>Recipient Phone</label>
                <input
                  type="text"
                  className="input-field"
                  disabled
                  value={`${sendModal.reminder?.customer_name} (${sendModal.reminder?.customer_phone})`}
                />
              </div>
              <div className="form-group">
                <label>Vehicle & Reminder Type</label>
                <input
                  type="text"
                  className="input-field"
                  disabled
                  value={`${sendModal.reminder?.vehicle_plate} • ${sendModal.reminder?.reminder_type.replace('_', ' ').toUpperCase()}`}
                />
              </div>
              <div className="form-group">
                <label>Message Content</label>
                <textarea
                  className="input-field"
                  rows={4}
                  required
                  value={sendModal.message}
                  onChange={(e) => setSendModal({ ...sendModal, message: e.target.value })}
                />
                <span className="form-hint">Staff approval required for all outbound communications.</span>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSendModal({ open: false, reminder: null, message: '' })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={actionLoading}>
                  {actionLoading ? 'Dispatching...' : 'Dispatch Simulated WhatsApp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

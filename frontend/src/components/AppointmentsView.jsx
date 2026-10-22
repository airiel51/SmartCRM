import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './Toast';

export default function AppointmentsView({ onOpenBookingModal }) {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await api.getAppointments(statusFilter);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setAppointments([]);
      showToast('error', 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const handleStatusChange = async (appId, newStatus) => {
    setActionLoading(true);
    try {
      await api.updateAppointmentStatus(appId, newStatus);
      const msg = `Appointment moved to ${newStatus.toUpperCase()}`;
      setSuccessMessage(msg);
      showToast('success', msg);
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchAppointments();
    } catch (err) {
      showToast('error', `Failed to update status: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st?.toLowerCase()) {
      case 'confirmed':
        return <span className="status-pill status-pill-success">Confirmed</span>;
      case 'in_progress':
        return <span className="status-pill status-pill-primary">In Bay</span>;
      case 'completed':
        return <span className="status-pill status-pill-neutral">Completed</span>;
      case 'cancelled':
        return <span className="status-pill status-pill-danger">Cancelled</span>;
      default:
        return <span className="status-pill status-pill-warning">Scheduled</span>;
    }
  };

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="view-header-row">
        <div>
          <h2 className="view-title">Appointments & Booking Schedule</h2>
          <p className="view-subtitle">Manage customer drop-off slots, bay allocations, and confirmed service jobs.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchAppointments} disabled={loading}>
            {loading ? 'Refreshing...' : '↻ Refresh'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onOpenBookingModal && onOpenBookingModal()}>
            + New Appointment
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="alert-banner alert-success">
          <span>✓ {successMessage}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-group">
          <span className="filter-label">Filter:</span>
          {[
            { key: '', label: 'All Appointments' },
            { key: 'scheduled', label: 'Scheduled' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'completed', label: 'Completed' }
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

      {/* Main Table */}
      <div className="table-card">
        {loading ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Service Requested</th>
                  <th>Bay</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((n) => (
                  <tr key={n}>
                    <td><div className="skeleton-line sm" style={{ width: 100, margin: 0 }} /></td>
                    <td><div className="skeleton-line md" style={{ margin: '0 0 4px 0' }} /><div className="skeleton-line xs" style={{ margin: 0 }} /></td>
                    <td><div className="skeleton-line sm" style={{ width: 85, height: 22, borderRadius: 5, margin: 0 }} /></td>
                    <td><div className="skeleton-line md" style={{ margin: 0 }} /></td>
                    <td><div className="skeleton-line xs" style={{ width: 60, height: 20, borderRadius: 12, margin: 0 }} /></td>
                    <td><div className="skeleton-line xs" style={{ width: 75, height: 20, borderRadius: 12, margin: 0 }} /></td>
                    <td style={{ textAlign: 'right' }}><div className="skeleton-line sm" style={{ width: 90, height: 28, borderRadius: 6, margin: '0 0 0 auto' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No Appointments Found</h3>
            <p>There are no bookings matching your selected filter. Click "+ New Appointment" to schedule one.</p>
            <button className="btn btn-primary btn-sm" onClick={() => onOpenBookingModal && onOpenBookingModal()}>
              Create First Appointment
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Service Requested</th>
                  <th>Bay</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => {
                  const dateStr = app.scheduled_at
                    ? new Date(app.scheduled_at).toLocaleDateString('en-MY', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Unscheduled';

                  return (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{dateStr}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{app.customer_name || 'Client'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {app.customer_phone ? (
                            <a href={`tel:${app.customer_phone}`} className="clickable-contact" title="Call Customer">
                              📞 {app.customer_phone}
                            </a>
                          ) : '-'}
                        </div>
                      </td>
                      <td>
                        <span className="plate-mono-tag">{app.vehicle_plate || 'NO PLATE'}</span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{app.vehicle_model || '-'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{app.service_type}</div>
                        {app.customer_notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 220, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {app.customer_notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="bay-badge">{app.assigned_bay || 'Bay 1'}</span>
                      </td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {app.status === 'scheduled' && (
                            <button
                              className="btn btn-xs btn-outline-success"
                              onClick={() => handleStatusChange(app.id, 'confirmed')}
                              disabled={actionLoading}
                            >
                              Confirm
                            </button>
                          )}
                          {(app.status === 'scheduled' || app.status === 'confirmed') && (
                            <button
                              className="btn btn-xs btn-outline-primary"
                              onClick={() => handleStatusChange(app.id, 'in_progress')}
                              disabled={actionLoading}
                            >
                              Move to Bay
                            </button>
                          )}
                          {app.status === 'in_progress' && (
                            <button
                              className="btn btn-xs btn-outline-success"
                              onClick={() => handleStatusChange(app.id, 'completed')}
                              disabled={actionLoading}
                            >
                              Complete
                            </button>
                          )}
                          {app.status !== 'completed' && app.status !== 'cancelled' && (
                            <button
                              className="btn btn-xs btn-outline-danger"
                              onClick={() => handleStatusChange(app.id, 'cancelled')}
                              disabled={actionLoading}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

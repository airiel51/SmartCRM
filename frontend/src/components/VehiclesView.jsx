import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './Toast';

export default function VehiclesView({ onIntakeVehicle }) {
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [odometerModal, setOdometerModal] = useState({ open: false, vehicle: null, mileage: '', notes: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await api.getVehicles(search, statusFilter);
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setVehicles([]);
      showToast('error', 'Failed to fetch vehicles fleet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleUpdateOdometer = async (e) => {
    e.preventDefault();
    if (!odometerModal.vehicle || !odometerModal.mileage) return;
    setActionLoading(true);
    try {
      await api.updateOdometer(
        odometerModal.vehicle.id,
        parseInt(odometerModal.mileage, 10),
        odometerModal.notes
      );
      const msg = `Odometer updated to ${parseInt(odometerModal.mileage, 10).toLocaleString()} km for ${odometerModal.vehicle.plate_number}`;
      setToast(msg);
      showToast('success', msg);
      setTimeout(() => setToast(''), 3000);
      setOdometerModal({ open: false, vehicle: null, mileage: '', notes: '' });
      await fetchVehicles();
    } catch (err) {
      showToast('error', `Error updating mileage: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'overdue':
        return <span className="status-pill status-pill-danger">Overdue</span>;
      case 'due soon':
      case 'due_soon':
        return <span className="status-pill status-pill-warning">Due Soon</span>;
      default:
        return <span className="status-pill status-pill-success">On Track</span>;
    }
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header-row">
        <div>
          <h2 className="view-title">Registered Workshop Vehicles</h2>
          <p className="view-subtitle">Track customer car profiles, odometer logs, and predictive service intervals.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchVehicles} disabled={loading}>
            ↻ Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onIntakeVehicle && onIntakeVehicle()}>
            + Register Vehicle
          </button>
        </div>
      </div>

      {toast && (
        <div className="alert-banner alert-success">
          <span>✓ {toast}</span>
        </div>
      )}

      {/* Filters */}
      <div className="filter-toolbar">
        <div className="search-box-wrap">
          <input
            type="text"
            className="input-field"
            placeholder="Search by plate number, make, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 280 }}
          />
        </div>
        <div className="filter-group">
          <span className="filter-label">Maintenance:</span>
          {['', 'On Track', 'Due Soon', 'Overdue'].map((st) => (
            <button
              key={st}
              className={`filter-chip ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === '' ? 'All Fleet' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="table-card">
        {loading ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plate Number</th>
                  <th>Vehicle Details</th>
                  <th>Owner</th>
                  <th>Current Odometer</th>
                  <th>Next Service Due</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((n) => (
                  <tr key={n}>
                    <td><div className="skeleton-line sm" style={{ width: 85, height: 22, borderRadius: 5, margin: 0 }} /></td>
                    <td><div className="skeleton-line md" style={{ margin: '0 0 4px 0' }} /><div className="skeleton-line xs" style={{ margin: 0 }} /></td>
                    <td><div className="skeleton-line sm" style={{ margin: 0 }} /></td>
                    <td><div className="skeleton-line sm" style={{ width: 70, margin: 0 }} /></td>
                    <td><div className="skeleton-line sm" style={{ width: 70, margin: 0 }} /></td>
                    <td><div className="skeleton-line xs" style={{ width: 65, height: 20, borderRadius: 12, margin: 0 }} /></td>
                    <td style={{ textAlign: 'right' }}><div className="skeleton-line sm" style={{ width: 80, height: 28, borderRadius: 6, margin: '0 0 0 auto' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚗</div>
            <h3>No Vehicles Found</h3>
            <p>No vehicles match your search criteria. Add a vehicle or clear filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plate Number</th>
                  <th>Vehicle Details</th>
                  <th>Owner</th>
                  <th>Current Odometer</th>
                  <th>Next Service Due</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td data-label="Plate Number">
                      <span className="plate-mono-tag">{v.plate_number}</span>
                    </td>
                    <td data-label="Vehicle Details">
                      <div style={{ fontWeight: 600 }}>{v.make} {v.model}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {v.year} • {v.oil_type || 'Synthetic 5W-30'}
                      </div>
                    </td>
                    <td data-label="Owner">
                      <div style={{ fontWeight: 500 }}>{v.customer_name || 'Registered Owner'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {v.customer_phone ? (
                          <a href={`tel:${v.customer_phone}`} className="clickable-contact" title="Call Customer">
                            📞 {v.customer_phone}
                          </a>
                        ) : '-'}
                      </div>
                    </td>
                    <td data-label="Current Odometer">
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{(v.current_mileage || 0).toLocaleString()} km</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ~{v.daily_mileage_rate || 40} km/day
                      </div>
                    </td>
                    <td data-label="Next Service Due">
                      <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        {v.next_service_due_mileage ? `${v.next_service_due_mileage.toLocaleString()} km` : '-'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {v.next_service_due_date ? new Date(v.next_service_due_date).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td data-label="Status">{getStatusBadge(v.maintenance_status)}</td>
                    <td data-label="Actions" style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-xs btn-outline-primary"
                        onClick={() =>
                          setOdometerModal({
                            open: true,
                            vehicle: v,
                            mileage: v.current_mileage || '',
                            notes: ''
                          })
                        }
                      >
                        Log Odometer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Odometer Modal */}
      {odometerModal.open && (
        <div className="modal-overlay" onClick={() => setOdometerModal({ open: false, vehicle: null, mileage: '', notes: '' })}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Log Odometer: {odometerModal.vehicle?.plate_number}</h3>
              <button
                className="close-btn"
                onClick={() => setOdometerModal({ open: false, vehicle: null, mileage: '', notes: '' })}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateOdometer} className="modal-body">
              <div className="form-group">
                <label>Vehicle</label>
                <input
                  type="text"
                  className="input-field"
                  disabled
                  value={`${odometerModal.vehicle?.make} ${odometerModal.vehicle?.model} (${odometerModal.vehicle?.plate_number})`}
                />
              </div>
              <div className="form-group">
                <label>New Odometer Reading (km)</label>
                <input
                  type="number"
                  className="input-field"
                  required
                  min={odometerModal.vehicle?.current_mileage || 0}
                  value={odometerModal.mileage}
                  onChange={(e) => setOdometerModal({ ...odometerModal, mileage: e.target.value })}
                  placeholder="e.g. 62500"
                />
                <span className="form-hint">Must be equal or greater than current: {odometerModal.vehicle?.current_mileage?.toLocaleString()} km</span>
              </div>
              <div className="form-group">
                <label>Inspection Notes / Source</label>
                <input
                  type="text"
                  className="input-field"
                  value={odometerModal.notes}
                  onChange={(e) => setOdometerModal({ ...odometerModal, notes: e.target.value })}
                  placeholder="e.g. Front desk drop-off inspection"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setOdometerModal({ open: false, vehicle: null, mileage: '', notes: '' })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Reading'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function AddCustomerModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '+60 ',
    email: '',
    address: 'Penang, Malaysia',
    vehicle_plate: '',
    vehicle_make: 'Proton',
    vehicle_model: 'X50',
    vehicle_year: 2022,
    vehicle_mileage: 35000
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.phone.trim() || !formData.vehicle_plate.trim()) {
      setError('Please provide Customer Name, Phone Number, and Vehicle Plate Number.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.createCustomer(formData);
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to register vehicle intake.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              New Customer & Vehicle Intake
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Registers client identity, contact channels, and initial vehicle telemetry.
            </p>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--pastel-rose)', color: 'var(--pastel-rose-text)', borderRadius: 10, fontSize: '0.82rem', marginBottom: 14, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Customer Details */}
            <div style={{ fontSize: '0.75rem', color: '#0891b2', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
              1. Customer Profile
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ahmad Razali"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">WhatsApp Mobile Phone</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+60 12-345 6789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Email Address (Optional)</label>
              <input
                type="email"
                className="form-input"
                placeholder="customer@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Vehicle Details */}
            <div style={{ fontSize: '0.75rem', color: '#0891b2', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', marginTop: 6 }}>
              2. Vehicle Registration & Telemetry
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">License Plate Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. WXY 8821"
                  value={formData.vehicle_plate}
                  onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Current Odometer (km)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.vehicle_mileage}
                  onChange={(e) => setFormData({ ...formData, vehicle_mileage: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div>
                <label className="form-label">Make</label>
                <select
                  className="form-select"
                  value={formData.vehicle_make}
                  onChange={(e) => setFormData({ ...formData, vehicle_make: e.target.value })}
                >
                  <option value="Proton">Proton</option>
                  <option value="Perodua">Perodua</option>
                  <option value="Honda">Honda</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Nissan">Nissan</option>
                  <option value="BMW">BMW</option>
                </select>
              </div>

              <div>
                <label className="form-label">Model</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. X50 1.5 TGDi"
                  value={formData.vehicle_model}
                  onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Year</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.vehicle_year}
                  onChange={(e) => setFormData({ ...formData, vehicle_year: parseInt(e.target.value) || 2021 })}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Complete Vehicle Intake'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddServiceModal({ isOpen, onClose, onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_id: '',
    service_type: 'Full Synthetic Engine Oil Service',
    service_bay: 'Bay 1 (Engine)',
    total_amount: 240.0,
    symptoms_reported: '',
    stage: 'Scheduled'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getCustomers().then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCustomers(data);
          const first = data[0];
          setFormData(prev => ({
            ...prev,
            customer_id: first.id,
            vehicle_id: first.vehicles && first.vehicles.length > 0 ? first.vehicles[0].id : ''
          }));
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCustomerChange = (custId) => {
    const cust = customers.find(c => c.id === custId);
    setFormData({
      ...formData,
      customer_id: custId,
      vehicle_id: cust && cust.vehicles && cust.vehicles.length > 0 ? cust.vehicles[0].id : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createService(formData);
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              Create Service Work Order
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Assign a vehicle to shop floor bay with diagnosis and cost estimate.
            </p>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="form-label">Select Customer</label>
              <select
                className="form-select"
                value={formData.customer_id}
                onChange={(e) => handleCustomerChange(e.target.value)}
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name || c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Service Package / Job Description</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Brake Pad Replacement + Rotor Skim"
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Service Bay</label>
                <select
                  className="form-select"
                  value={formData.service_bay}
                  onChange={(e) => setFormData({ ...formData, service_bay: e.target.value })}
                >
                  <option value="Bay 1 (Engine)">Bay 1 (Engine)</option>
                  <option value="Bay 2 (Brakes & Tires)">Bay 2 (Brakes & Tires)</option>
                  <option value="Bay 3 (Suspension & Undercarriage)">Bay 3 (Suspension)</option>
                  <option value="Bay 4 (Aircond & Electrical)">Bay 4 (Aircond & Elect)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Estimated Amount (MYR)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Symptoms Reported by Customer (Optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Describe sounds, vibrations, or dashboard warning lights..."
                value={formData.symptoms_reported}
                onChange={(e) => setFormData({ ...formData, symptoms_reported: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Initial Stage</label>
              <select
                className="form-select"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              >
                <option value="Inquiry">1. Inquiries & Quotes</option>
                <option value="Scheduled">2. Checked In</option>
                <option value="In Progress">3. Bay Mechanical Work</option>
                <option value="Quality Inspection">4. Quality Inspection (QC)</option>
                <option value="Ready for Pickup">5. Ready for Pickup</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Dispatch Work Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

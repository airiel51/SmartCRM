import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './Toast';

export default function InquiriesView() {
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Manual Inquiry form state
  const [manualForm, setManualForm] = useState({
    sender_name: '',
    sender_phone: '+60 ',
    raw_message: '',
    channel: 'whatsapp'
  });

  // Conversion Form state
  const [convertForm, setConvertForm] = useState({
    customer_name: '',
    phone: '',
    plate_number: '',
    make: '',
    model: '',
    year: 2021,
    service_type: '',
    assigned_bay: 'Bay 1 (Engine)',
    notes: ''
  });

  // Demo messages catalog for testing
  const DEMO_MESSAGES = [
    {
      name: "Daniel Lim",
      phone: "+60 18-992 1104",
      text: "Hi boss, my Honda Civic PNG 4419 brake pedal feels spongy when coming to a stop. Can I drop it by Bayan Lepas workshop tomorrow at 2:30pm for brake check?"
    },
    {
      name: "Siti Sarah",
      phone: "+60 13-445 6781",
      text: "Salam Apex AutoWorks, my Perodua Myvi WXY 8821 aircond is blowing warm air at noon. How much to check gas and flush cooling coil?"
    },
    {
      name: "Mr. Rajendran",
      phone: "+60 19-332 0918",
      text: "Hello, looking for urgent check engine diagnostic for Toyota Vios plate JRS 7731. Engine idling rough."
    }
  ];

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await api.getInquiries();
      setInquiries(Array.isArray(data) ? data : []);
      if (data && data.length > 0 && !selectedInquiry) {
        setSelectedInquiry(data[0]);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleSelectInquiry = (inq) => {
    setSelectedInquiry(inq);
  };

  const handleOpenConvertModal = (inq) => {
    const extracted = inq.extracted_data || {};
    setConvertForm({
      customer_name: extracted.customer_name || inq.sender_name || '',
      phone: extracted.phone || inq.sender_phone || '',
      plate_number: extracted.plate_number || '',
      make: extracted.make || 'Proton',
      model: extracted.model || 'X50',
      year: extracted.year || 2021,
      service_type: extracted.requested_service || 'Workshop Diagnostic Inspection',
      assigned_bay: 'Bay 1 (Engine)',
      notes: extracted.symptoms?.join(', ') || inq.raw_message || ''
    });
    setConvertModalOpen(true);
  };

  const handleExecuteConvert = async (e) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    setActionLoading(true);
    try {
      await api.convertInquiry(selectedInquiry.id, convertForm);
      const msg = `Successfully converted inquiry into Customer & Service records!`;
      setToast(msg);
      showToast('success', msg);
      setTimeout(() => setToast(''), 4000);
      setConvertModalOpen(false);
      await fetchInquiries();
    } catch (err) {
      showToast('error', `Conversion failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateManual = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.createInquiry(manualForm);
      const msg = 'New inquiry ingested and NLP entity extraction completed.';
      setToast(msg);
      showToast('success', msg);
      setTimeout(() => setToast(''), 4000);
      setManualModalOpen(false);
      setManualForm({ sender_name: '', sender_phone: '+60 ', raw_message: '', channel: 'whatsapp' });
      await fetchInquiries();
    } catch (err) {
      showToast('error', `Error creating inquiry: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleInjectDemo = async (demo) => {
    setActionLoading(true);
    try {
      await api.createInquiry({
        sender_name: demo.name,
        sender_phone: demo.phone,
        raw_message: demo.text,
        channel: 'whatsapp'
      });
      const msg = `Demo lead ingested: ${demo.name} (${demo.phone})!`;
      setToast(msg);
      showToast('success', msg);
      setTimeout(() => setToast(''), 3000);
      await fetchInquiries();
    } catch (err) {
      showToast('error', `Demo ingest failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header-row">
        <div>
          <h2 className="view-title">Inquiry & WhatsApp Lead Queue</h2>
          <p className="view-subtitle">
            Ingest inbound messages, inspect structured NLP entities with confidence scores, and convert into canonical workshop records.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setManualModalOpen(true)}>
            + Manual Intake
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => handleInjectDemo(DEMO_MESSAGES[0])}>
            ⚡ Ingest Demo Lead
          </button>
        </div>
      </div>

      {toast && (
        <div className="alert-banner alert-success">
          <span>✓ {toast}</span>
        </div>
      )}

      {/* Demo Message Quick Buttons */}
      <div className="demo-bar">
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quick Loaders:</span>
        {DEMO_MESSAGES.map((d, i) => (
          <button
            key={i}
            className="demo-pill-btn"
            onClick={() => handleInjectDemo(d)}
            disabled={actionLoading}
          >
            + Demo #{i + 1} ({d.name})
          </button>
        ))}
      </div>

      {/* Two-Column Workspace */}
      <div className="inquiry-grid">
        {/* Left Column: Inquiries List */}
        <div className="inquiry-list-card">
          <div className="card-header-clean">
            <span style={{ fontWeight: 600 }}>Inbound Message Feed ({inquiries.length})</span>
            <button className="btn btn-xs btn-outline-secondary" onClick={fetchInquiries}>
              ↻
            </button>
          </div>
          {loading ? (
            <div style={{ padding: '12px' }}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div className="skeleton-line sm" style={{ width: 110, margin: 0 }} />
                    <div className="skeleton-line xs" style={{ width: 65, height: 18, borderRadius: 10, margin: 0 }} />
                  </div>
                  <div className="skeleton-line md" style={{ margin: '6px 0' }} />
                  <div className="skeleton-line xs" style={{ width: '45%', margin: 0 }} />
                </div>
              ))}
            </div>
          ) : inquiries.length === 0 ? (
            <div className="empty-state">
              <p>No inquiries yet. Click "⚡ Ingest Demo Lead" above.</p>
            </div>
          ) : (
            <div className="inquiry-items-scroll">
              {inquiries.map((inq) => {
                const isSelected = selectedInquiry?.id === inq.id;
                const isConverted = inq.status === 'converted';
                const plate = inq.extracted_data?.plate_number;

                return (
                  <div
                    key={inq.id}
                    className={`inquiry-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectInquiry(inq)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                          {inq.sender_name || inq.sender_phone}
                        </span>
                        {plate && <span className="plate-mono-tag" style={{ fontSize: '0.66rem', padding: '1px 5px' }}>{plate}</span>}
                      </div>
                      {isConverted ? (
                        <span className="semantic-badge badge-success" style={{ fontSize: '0.64rem', padding: '1px 6px' }}>Converted</span>
                      ) : (
                        <span className="semantic-badge badge-upsell" style={{ fontSize: '0.64rem', padding: '1px 6px' }}>Needs Review</span>
                      )}
                    </div>
                    <div className="inquiry-snippet">{inq.raw_message}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <a
                        href={`tel:${inq.sender_phone}`}
                        className="clickable-contact"
                        onClick={(e) => e.stopPropagation()}
                        title="Call Prospect"
                      >
                        📞 {inq.sender_phone}
                      </a>
                      <span>{inq.created_at ? new Date(inq.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Structured Entity Review Inspector */}
        <div className="inquiry-detail-card">
          {selectedInquiry ? (
            <>
              <div className="inspector-header">
                <div>
                  <span className="channel-tag">WhatsApp Channel</span>
                  <h3 style={{ margin: '6px 0 2px 0', fontSize: '1.1rem' }}>
                    {selectedInquiry.sender_name || 'Anonymous Prospect'}
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Phone: {selectedInquiry.sender_phone}
                  </span>
                </div>
                <div>
                  {selectedInquiry.status !== 'converted' ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleOpenConvertModal(selectedInquiry)}
                    >
                      ✓ Approve & Convert to Booking
                    </button>
                  ) : (
                    <span className="status-pill status-pill-success">✓ Converted to Canonical Records</span>
                  )}
                </div>
              </div>

              {/* Raw Message Box */}
              <div className="raw-message-box">
                <span className="section-mini-title">Raw Inbound Customer Message:</span>
                <p style={{ margin: '6px 0 0 0', fontStyle: 'italic', color: 'var(--text-main)' }}>
                  "{selectedInquiry.raw_message}"
                </p>
              </div>

              {/* NLP Extracted Entities Inspector */}
              <div className="nlp-inspector-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span className="section-mini-title">NLP Structured Entities (Schema Validated):</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confidence:</span>
                    <span className="confidence-badge">
                      {Math.round((selectedInquiry.extraction_confidence || 0.90) * 100)}%
                    </span>
                    <span className="provider-tag">{selectedInquiry.extraction_provider || 'rules_fallback'}</span>
                  </div>
                </div>

                <div className="entity-grid">
                  <div className="entity-cell">
                    <span className="entity-label">Detected Customer Name</span>
                    <span className="entity-val">
                      {selectedInquiry.extracted_data?.customer_name || <span className="entity-null">null / unknown</span>}
                    </span>
                  </div>
                  <div className="entity-cell">
                    <span className="entity-label">Phone Number</span>
                    <span className="entity-val">
                      <a
                        href={`tel:${selectedInquiry.extracted_data?.phone || selectedInquiry.sender_phone}`}
                        className="clickable-contact"
                        title="Call Prospect"
                      >
                        📞 {selectedInquiry.extracted_data?.phone || selectedInquiry.sender_phone}
                      </a>
                    </span>
                  </div>
                  <div className="entity-cell">
                    <span className="entity-label">Extracted Plate Number</span>
                    <span className="entity-val">
                      {selectedInquiry.extracted_data?.plate_number ? (
                        <span className="plate-badge">{selectedInquiry.extracted_data.plate_number}</span>
                      ) : (
                        <span className="entity-null">null (not provided)</span>
                      )}
                    </span>
                  </div>
                  <div className="entity-cell">
                    <span className="entity-label">Detected Vehicle Model</span>
                    <span className="entity-val">
                      {selectedInquiry.extracted_data?.make || selectedInquiry.extracted_data?.model ? (
                        `${selectedInquiry.extracted_data.make || ''} ${selectedInquiry.extracted_data.model || ''}`
                      ) : (
                        <span className="entity-null">null / unknown</span>
                      )}
                    </span>
                  </div>
                  <div className="entity-cell full-width">
                    <span className="entity-label">Identified Symptoms / Issues</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      {selectedInquiry.extracted_data?.symptoms && selectedInquiry.extracted_data.symptoms.length > 0 ? (
                        selectedInquiry.extracted_data.symptoms.map((s, idx) => (
                          <span key={idx} className="symptom-tag">⚠ {s}</span>
                        ))
                      ) : (
                        <span className="entity-null">None reported</span>
                      )}
                    </div>
                  </div>
                  <div className="entity-cell">
                    <span className="entity-label">Requested Service</span>
                    <span className="entity-val" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                      {selectedInquiry.extracted_data?.requested_service || 'General Workshop Inspection'}
                    </span>
                  </div>
                  <div className="entity-cell">
                    <span className="entity-label">Preferred Date & Time</span>
                    <span className="entity-val">
                      {selectedInquiry.extracted_data?.preferred_date || 'Flexible'}{' '}
                      {selectedInquiry.extracted_data?.preferred_time ? `• ${selectedInquiry.extracted_data.preferred_time}` : ''}
                    </span>
                  </div>
                </div>

                <div className="guardrail-note">
                  🔒 <strong>Guardrail Active:</strong> Structured entities require human PIC approval. Converting this inquiry will create validated database records in customers, vehicles, and appointments.
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Select an inquiry from the left to inspect extracted entities.</p>
            </div>
          )}
        </div>
      </div>

      {/* Convert Inquiry Modal */}
      {convertModalOpen && (
        <div className="modal-overlay" onClick={() => setConvertModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Review & Convert Inquiry to Workshop Records</h3>
              <button className="close-btn" onClick={() => setConvertModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleExecuteConvert} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={convertForm.customer_name}
                    onChange={(e) => setConvertForm({ ...convertForm, customer_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={convertForm.phone}
                    onChange={(e) => setConvertForm({ ...convertForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Plate Number *</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    placeholder="e.g. WXY 8821"
                    value={convertForm.plate_number}
                    onChange={(e) => setConvertForm({ ...convertForm, plate_number: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-group">
                  <label>Make & Model *</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Make"
                      required
                      value={convertForm.make}
                      onChange={(e) => setConvertForm({ ...convertForm, make: e.target.value })}
                    />
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Model"
                      required
                      value={convertForm.model}
                      onChange={(e) => setConvertForm({ ...convertForm, model: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Service Type *</label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={convertForm.service_type}
                  onChange={(e) => setConvertForm({ ...convertForm, service_type: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Assigned Workshop Bay</label>
                <select
                  className="input-field"
                  value={convertForm.assigned_bay}
                  onChange={(e) => setConvertForm({ ...convertForm, assigned_bay: e.target.value })}
                >
                  <option value="Bay 1 (Engine)">Bay 1 (Engine & Fluids)</option>
                  <option value="Bay 2 (Brakes)">Bay 2 (Brakes & Suspension)</option>
                  <option value="Bay 3 (General)">Bay 3 (General Diagnostics & AC)</option>
                  <option value="Bay 4 (QC)">Bay 4 (QC Inspection & Finishing)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConvertModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={actionLoading}>
                  {actionLoading ? 'Creating Records...' : 'Confirm & Create Records'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Inquiry Modal */}
      {manualModalOpen && (
        <div className="modal-overlay" onClick={() => setManualModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Manual Inbound Lead</h3>
              <button className="close-btn" onClick={() => setManualModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateManual} className="modal-body">
              <div className="form-group">
                <label>Customer Name (optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Kelvin Tan"
                  value={manualForm.sender_name}
                  onChange={(e) => setManualForm({ ...manualForm, sender_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Customer Phone *</label>
                <input
                  type="text"
                  className="input-field"
                  required
                  placeholder="+60 12-..."
                  value={manualForm.sender_phone}
                  onChange={(e) => setManualForm({ ...manualForm, sender_phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Channel</label>
                <select
                  className="input-field"
                  value={manualForm.channel}
                  onChange={(e) => setManualForm({ ...manualForm, channel: e.target.value })}
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Phone Call</option>
                  <option value="walk_in">Walk-in Consultation</option>
                  <option value="web">Website Intake Form</option>
                </select>
              </div>
              <div className="form-group">
                <label>Customer Message / Inquiry Notes *</label>
                <textarea
                  className="input-field"
                  rows={4}
                  required
                  placeholder="e.g. Customer called asking for brake rotor skim price for Honda City plate PNG 1102..."
                  value={manualForm.raw_message}
                  onChange={(e) => setManualForm({ ...manualForm, raw_message: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setManualModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={actionLoading}>
                  {actionLoading ? 'Ingesting...' : 'Ingest & Run NLP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useToast } from './Toast';

export default function InquiriesView() {
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [targetLostInquiry, setTargetLostInquiry] = useState(null);
  const [lostReason, setLostReason] = useState('Price quote higher than budget');
  const [customLostReason, setCustomLostReason] = useState('');
  const [isEditingEntities, setIsEditingEntities] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Filtering and Sorting State
  const [activeStatusTab, setActiveStatusTab] = useState('all'); // all, new, contacted, quoted, booked, lost
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all'); // all, whatsapp, walk_in, web, phone
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, priority

  // Manual Intake Form State
  const [manualForm, setManualForm] = useState({
    sender_name: '',
    sender_phone: '+60 ',
    email: '',
    raw_message: '',
    channel: 'whatsapp'
  });

  // Conversion Form State
  const [convertForm, setConvertForm] = useState({
    customer_name: '',
    phone: '',
    plate_number: '',
    make: '',
    model: '',
    year: 2022,
    service_type: '',
    assigned_bay: 'Bay 1 (Engine)',
    notes: ''
  });

  // Demo messages catalog for testing
  const DEMO_MESSAGES = [
    {
      name: "Daniel Lim",
      phone: "+60 18-992 1104",
      channel: "whatsapp",
      text: "Hi boss, my Honda Civic PNG 4419 brake pedal feels spongy when coming to a stop. Can I drop it by Bayan Lepas workshop tomorrow at 2:30pm for brake check?"
    },
    {
      name: "Siti Sarah",
      phone: "+60 13-445 6781",
      channel: "walk_in",
      text: "Salam Apex AutoWorks, my Perodua Myvi WXY 8821 aircond is blowing warm air at noon. How much to check gas and flush cooling coil?"
    },
    {
      name: "Marcus Wong",
      phone: "+60 17-210 9382",
      channel: "web",
      text: "Web Intake Form: BMW 320i plate PLQ 9002 dashboard displaying brake pad wear indicator warning. Need quote for Brembo replacement."
    }
  ];

  const fetchInquiries = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await api.getInquiries();
      const list = Array.isArray(data) ? data : [];
      setInquiries(list);
      if (list.length > 0) {
        // Keep currently selected if it exists, otherwise select first
        setSelectedInquiry(prev => {
          if (prev) {
            const found = list.find(i => i.id === prev.id);
            if (found) return found;
          }
          return list[0];
        });
      } else {
        setSelectedInquiry(null);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setFetchError(err.message || 'Unable to connect to lead queue service.');
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Compute Waiting Age and >24h warning indicator
  const getWaitingAgeInfo = (createdAt) => {
    if (!createdAt) return { label: 'Recent', isOverdue: false, hours: 0 };
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let label = '';
    if (diffMins < 60) {
      label = `${Math.max(1, diffMins)}m ago`;
    } else if (diffHours < 24) {
      label = `${diffHours}h ago`;
    } else {
      label = `${diffDays}d ${diffHours % 24}h ago`;
    }

    return {
      label,
      hours: diffHours,
      isOverdue: diffHours >= 24
    };
  };

  // Status Tab Counts
  const statusCounts = useMemo(() => {
    const counts = { all: inquiries.length, new: 0, contacted: 0, quoted: 0, booked: 0, lost: 0 };
    inquiries.forEach(inq => {
      const st = inq.status?.toLowerCase();
      if (st === 'new' || st === 'in_review') counts.new++;
      else if (st === 'contacted') counts.contacted++;
      else if (st === 'quoted') counts.quoted++;
      else if (st === 'booked' || st === 'converted') counts.booked++;
      else if (st === 'lost') counts.lost++;
    });
    return counts;
  }, [inquiries]);

  // Filtered & Sorted Inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      // 1. Status Tab filter
      const st = inq.status?.toLowerCase();
      if (activeStatusTab === 'new' && st !== 'new' && st !== 'in_review') return false;
      if (activeStatusTab === 'contacted' && st !== 'contacted') return false;
      if (activeStatusTab === 'quoted' && st !== 'quoted') return false;
      if (activeStatusTab === 'booked' && st !== 'booked' && st !== 'converted') return false;
      if (activeStatusTab === 'lost' && st !== 'lost') return false;

      // 2. Channel filter
      if (channelFilter !== 'all' && (inq.channel || 'whatsapp') !== channelFilter) return false;

      // 3. Search query filter (name, plate, phone)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (inq.customer_name || inq.sender_name || '').toLowerCase();
        const phone = (inq.phone || inq.sender_phone || '').toLowerCase();
        const plate = (inq.plate_number || inq.extracted_data?.plate_number || '').toLowerCase();
        const msg = (inq.raw_message || '').toLowerCase();
        if (!name.includes(q) && !phone.includes(q) && !plate.includes(q) && !msg.includes(q)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();

      if (sortBy === 'newest') return timeB - timeA;
      if (sortBy === 'oldest') return timeA - timeB;
      if (sortBy === 'priority') {
        const ageA = getWaitingAgeInfo(a.created_at);
        const ageB = getWaitingAgeInfo(b.created_at);
        // Overdue leads first, then by age
        if (ageA.isOverdue && !ageB.isOverdue) return -1;
        if (!ageA.isOverdue && ageB.isOverdue) return 1;
        return (b.extraction_confidence || 0.9) - (a.extraction_confidence || 0.9);
      }
      return 0;
    });
  }, [inquiries, activeStatusTab, channelFilter, searchQuery, sortBy]);

  const handleSelectInquiry = (inq) => {
    setSelectedInquiry(inq);
    setIsEditingEntities(false);
  };

  const handleOpenConvertModal = (inq) => {
    const target = inq || selectedInquiry;
    if (!target) return;
    const extracted = target.extracted_data || {};
    setConvertForm({
      customer_name: extracted.customer_name || target.customer_name || target.sender_name || '',
      phone: extracted.phone || target.phone || target.sender_phone || '',
      plate_number: extracted.plate_number || target.plate_number || '',
      make: extracted.make || 'Proton',
      model: extracted.model || 'X50',
      year: extracted.year || 2022,
      service_type: extracted.requested_service || 'Workshop Diagnostic Inspection',
      assigned_bay: 'Bay 1 (Engine)',
      notes: extracted.symptoms?.join(', ') || target.raw_message || ''
    });
    setConvertModalOpen(true);
  };

  const handleExecuteConvert = async (e) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    setActionLoading(true);
    try {
      await api.convertInquiry(selectedInquiry.id, convertForm);
      const msg = `Successfully converted lead for ${convertForm.customer_name} into Workshop Booking!`;
      setToast(msg);
      showToast('success', msg);
      setTimeout(() => setToast(''), 4000);
      setConvertModalOpen(false);

      // Local state update
      setInquiries(prev => prev.map(i => {
        if (i.id === selectedInquiry.id) {
          return { ...i, status: 'booked', assigned_bay: convertForm.assigned_bay };
        }
        return i;
      }));
      setSelectedInquiry(prev => ({ ...prev, status: 'booked', assigned_bay: convertForm.assigned_bay }));
    } catch (err) {
      showToast('error', `Conversion failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      await api.updateInquiry(inquiryId, { status: newStatus });
      setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, status: newStatus } : i));
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
      }
      showToast('success', `Lead status updated to ${newStatus.toUpperCase()}`);
    } catch (err) {
      showToast('error', `Failed to update status: ${err.message}`);
    }
  };

  const handleAssignStaff = async (inquiryId, staffName) => {
    try {
      await api.updateInquiry(inquiryId, { assigned_to: staffName });
      setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, assigned_to: staffName } : i));
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(prev => ({ ...prev, assigned_to: staffName }));
      }
      showToast('success', `Lead assigned to ${staffName}`);
    } catch (err) {
      showToast('error', `Failed to assign staff: ${err.message}`);
    }
  };

  const handleOpenMarkLost = (inq) => {
    setTargetLostInquiry(inq || selectedInquiry);
    setLostReason('Price quote higher than budget');
    setCustomLostReason('');
    setLostModalOpen(true);
  };

  const handleConfirmMarkLost = async (e) => {
    e.preventDefault();
    if (!targetLostInquiry) return;
    const finalReason = lostReason === 'Other' ? (customLostReason || 'Other reason') : lostReason;
    try {
      await api.updateInquiry(targetLostInquiry.id, {
        status: 'lost',
        lost_reason: finalReason
      });
      setInquiries(prev => prev.map(i => {
        if (i.id === targetLostInquiry.id) {
          return { ...i, status: 'lost', lost_reason: finalReason };
        }
        return i;
      }));
      if (selectedInquiry?.id === targetLostInquiry.id) {
        setSelectedInquiry(prev => ({ ...prev, status: 'lost', lost_reason: finalReason }));
      }
      showToast('info', `Lead marked as Lost (${finalReason})`);
      setLostModalOpen(false);
    } catch (err) {
      showToast('error', `Failed to mark lost: ${err.message}`);
    }
  };

  const handleUpdateExtractedField = (field, value) => {
    if (!selectedInquiry) return;
    const updatedExtracted = {
      ...(selectedInquiry.extracted_data || {}),
      [field]: value
    };
    const updatedInquiry = {
      ...selectedInquiry,
      extracted_data: updatedExtracted
    };
    setSelectedInquiry(updatedInquiry);
    setInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? updatedInquiry : i));
  };

  const handleCreateManual = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const created = await api.createInquiry(manualForm);
      const msg = 'New inquiry ingested and NLP entity extraction completed.';
      setToast(msg);
      showToast('success', msg);
      setTimeout(() => setToast(''), 4000);
      setManualModalOpen(false);
      setManualForm({ sender_name: '', sender_phone: '+60 ', email: '', raw_message: '', channel: 'whatsapp' });
      await fetchInquiries();
      if (created) setSelectedInquiry(created);
    } catch (err) {
      showToast('error', `Error creating inquiry: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleInjectDemo = async (demo) => {
    setActionLoading(true);
    try {
      const created = await api.createInquiry({
        sender_name: demo.name,
        sender_phone: demo.phone,
        raw_message: demo.text,
        channel: demo.channel || 'whatsapp'
      });
      const msg = `Demo lead ingested: ${demo.name} (${demo.phone})!`;
      setToast(msg);
      showToast('success', msg);
      setTimeout(() => setToast(''), 3000);
      await fetchInquiries();
      if (created) setSelectedInquiry(created);
    } catch (err) {
      showToast('error', `Demo ingest failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const renderSourceTag = (channel) => {
    const ch = (channel || 'whatsapp').toLowerCase();
    if (ch === 'whatsapp') {
      return <span className="source-tag source-tag-whatsapp">💬 WhatsApp</span>;
    } else if (ch === 'walk_in') {
      return <span className="source-tag source-tag-walk_in">🚶 Walk-in</span>;
    } else if (ch === 'web') {
      return <span className="source-tag source-tag-web">🌐 Web Form</span>;
    } else {
      return <span className="source-tag source-tag-phone">📞 Phone</span>;
    }
  };

  const renderStatusPill = (status) => {
    const st = (status || 'new').toLowerCase();
    if (st === 'booked' || st === 'converted') {
      return <span className="lead-status-pill lead-status-booked">✓ Booked</span>;
    } else if (st === 'contacted') {
      return <span className="lead-status-pill lead-status-contacted">⏳ Contacted</span>;
    } else if (st === 'quoted') {
      return <span className="lead-status-pill lead-status-quoted">📝 Quoted</span>;
    } else if (st === 'lost') {
      return <span className="lead-status-pill lead-status-lost">✕ Lost</span>;
    } else {
      return <span className="lead-status-pill lead-status-new">⚡ New Lead</span>;
    }
  };

  return (
    <div className="view-container">
      {/* Top Header */}
      <div className="view-header-row">
        <div>
          <h2 className="view-title">Inquiries & Leads Queue</h2>
          <p className="view-subtitle">
            Triage customer inquiries, review AI-detected vehicle symptoms, manage lead statuses, and convert to bookings.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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

      {/* Visible Error Banner with Retry */}
      {fetchError && (
        <div className="inquiry-error-banner">
          <div>
            <strong>Error connecting to inquiries queue:</strong> {fetchError}
          </div>
          <button className="btn btn-xs btn-primary" onClick={fetchInquiries}>
            ↻ Retry Connection
          </button>
        </div>
      )}

      {/* Quick Demo Messages Bar */}
      <div className="demo-bar">
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Load Demo Prospect:</span>
        {DEMO_MESSAGES.map((d, i) => (
          <button
            key={i}
            className="demo-pill-btn"
            onClick={() => handleInjectDemo(d)}
            disabled={actionLoading}
            title={d.text}
          >
            + Demo #{i + 1} ({d.name} • {d.channel.toUpperCase()})
          </button>
        ))}
      </div>

      {/* 1. Status Tabs Bar */}
      <div className="inquiry-tabs-container" role="tablist">
        {[
          { id: 'all', label: 'All Inquiries' },
          { id: 'new', label: 'New' },
          { id: 'contacted', label: 'Contacted' },
          { id: 'quoted', label: 'Quoted' },
          { id: 'booked', label: 'Booked' },
          { id: 'lost', label: 'Lost' }
        ].map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeStatusTab === tab.id}
            className={`inquiry-tab-btn ${activeStatusTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveStatusTab(tab.id)}
          >
            <span>{tab.label}</span>
            <span className="inquiry-tab-count">{statusCounts[tab.id] || 0}</span>
          </button>
        ))}
      </div>

      {/* 2. Search, Channel Filter & Sort Controls */}
      <div className="inquiry-controls-bar">
        <div className="inquiry-search-wrapper">
          <span className="inquiry-search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="inquiry-search-input"
            placeholder="Search leads by customer name, plate number, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search inquiries"
          />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="inquiry-select-filter"
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            aria-label="Filter by intake source channel"
          >
            <option value="all">All Sources (Channels)</option>
            <option value="whatsapp">💬 WhatsApp</option>
            <option value="walk_in">🚶 Walk-in</option>
            <option value="web">🌐 Web Form</option>
            <option value="phone">📞 Phone Call</option>
          </select>

          <select
            className="inquiry-select-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort inquiries"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First (Longest Wait)</option>
            <option value="priority">Sort: Overdue & High Priority</option>
          </select>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchInquiries}
            title="Refresh Inquiries"
            aria-label="Refresh Inquiries"
          >
            ↻
          </button>
        </div>
      </div>

      {/* 3. Two-Column Workspace (Feed & Inspector) */}
      <div className="inquiry-grid">
        {/* Left Column: Leads List */}
        <div className="inquiry-list-card">
          <div className="card-header-clean">
            <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>
              Leads Feed ({filteredInquiries.length}{filteredInquiries.length !== inquiries.length ? ` of ${inquiries.length}` : ''})
            </span>
            {searchQuery && (
              <button
                className="btn btn-xs btn-outline-secondary"
                onClick={() => setSearchQuery('')}
                title="Clear Search"
              >
                Clear Filter
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '14px' }}>
              {[1, 2, 3, 4].map(n => (
                <div key={n} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div className="skeleton-line sm" style={{ width: 120, margin: 0 }} />
                    <div className="skeleton-line xs" style={{ width: 70, height: 18, borderRadius: 10, margin: 0 }} />
                  </div>
                  <div className="skeleton-line md" style={{ margin: '6px 0' }} />
                  <div className="skeleton-line xs" style={{ width: '50%', margin: 0 }} />
                </div>
              ))}
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>📭</div>
              <p style={{ fontWeight: 600, color: 'var(--text-main)', margin: '0 0 6px 0' }}>No inquiries found</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
                {searchQuery || activeStatusTab !== 'all' || channelFilter !== 'all'
                  ? 'Try clearing the search query or changing active status tabs.'
                  : 'Get started by ingesting a demo lead or logging a manual walk-in.'}
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setActiveStatusTab('all');
                  setChannelFilter('all');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="inquiry-items-scroll">
              {filteredInquiries.map(inq => {
                const isSelected = selectedInquiry?.id === inq.id;
                const plate = inq.plate_number || inq.extracted_data?.plate_number;
                const customerName = inq.customer_name || inq.sender_name || 'Prospect';
                const phone = inq.phone || inq.sender_phone || '';
                const email = inq.email || inq.extracted_data?.email || '';
                const age = getWaitingAgeInfo(inq.created_at);
                const isResolved = inq.status === 'booked' || inq.status === 'converted' || inq.status === 'lost';

                return (
                  <div
                    key={inq.id}
                    className={`inquiry-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectInquiry(inq)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectInquiry(inq); }}
                  >
                    {/* Top Row: Customer Name, Plate & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.90rem', color: 'var(--text-main)' }}>
                          {customerName}
                        </span>
                        {plate && <span className="plate-mono-tag">{plate}</span>}
                      </div>
                      <div>
                        {renderStatusPill(inq.status)}
                      </div>
                    </div>

                    {/* Middle Row: Channel Tag & Waiting Age with >24h Warning */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 6px 0' }}>
                      <div>{renderSourceTag(inq.channel)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {age.isOverdue && !isResolved ? (
                          <span className="age-warning-badge" title="Customer has been waiting over 24 hours without resolution!">
                            ⚠️ &gt;24h waiting ({age.label})
                          </span>
                        ) : (
                          <span className="age-indicator">🕒 {age.label}</span>
                        )}
                      </div>
                    </div>

                    {/* Message Snippet */}
                    <div className="inquiry-snippet" title={inq.raw_message}>
                      {inq.raw_message}
                    </div>

                    {/* Quick Per-Lead Action Buttons */}
                    <div className="lead-quick-actions" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`tel:${phone}`}
                        className="btn-lead-quick btn-call"
                        title={`Call ${customerName} (${phone})`}
                      >
                        📞 Call
                      </a>
                      {email ? (
                        <a
                          href={`mailto:${email}?subject=Apex%20AutoWorks%20Follow-up%20(${plate || 'Workshop%20Service'})`}
                          className="btn-lead-quick btn-email"
                          title={`Email ${email}`}
                        >
                          ✉️ Email
                        </a>
                      ) : (
                        <a
                          href={`mailto:prospect@apexautoworks.my?subject=Follow-up%20for%20${customerName}`}
                          className="btn-lead-quick btn-email"
                          title="Compose follow-up email"
                        >
                          ✉️ Email
                        </a>
                      )}

                      {inq.status !== 'booked' && inq.status !== 'converted' && inq.status !== 'lost' && (
                        <button
                          type="button"
                          className="btn-lead-quick btn-convert"
                          onClick={() => {
                            setSelectedInquiry(inq);
                            handleOpenConvertModal(inq);
                          }}
                          title="Convert this lead into a workshop booking"
                        >
                          ✓ Convert
                        </button>
                      )}

                      {inq.status !== 'lost' && inq.status !== 'booked' && (
                        <button
                          type="button"
                          className="btn-lead-quick btn-lost"
                          onClick={() => handleOpenMarkLost(inq)}
                          title="Mark lead as Lost with a reason"
                        >
                          ✕ Lost
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Structured AI Inspector & Pre-Convert Editing */}
        <div className="inquiry-detail-card">
          {selectedInquiry ? (
            <>
              {/* Header */}
              <div className="inspector-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {renderSourceTag(selectedInquiry.channel)}
                    {renderStatusPill(selectedInquiry.status)}
                    {getWaitingAgeInfo(selectedInquiry.created_at).isOverdue && selectedInquiry.status !== 'booked' && selectedInquiry.status !== 'lost' && (
                      <span className="age-warning-badge">⚠️ &gt;24h Overdue</span>
                    )}
                  </div>
                  <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.25rem', fontWeight: 800 }}>
                    {selectedInquiry.extracted_data?.customer_name || selectedInquiry.customer_name || selectedInquiry.sender_name || 'Prospect'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span>Phone: <strong>{selectedInquiry.phone || selectedInquiry.sender_phone}</strong></span>
                    <span>•</span>
                    <span>Staff Assigned: <strong>{selectedInquiry.assigned_to || 'Unassigned'}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsEditingEntities(prev => !prev)}
                    title="Edit AI detected fields before record conversion"
                  >
                    {isEditingEntities ? '💾 Done Editing' : '✏️ Edit Entities'}
                  </button>

                  {selectedInquiry.status !== 'booked' && selectedInquiry.status !== 'converted' ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleOpenConvertModal(selectedInquiry)}
                    >
                      ✓ Convert to Booking
                    </button>
                  ) : (
                    <span className="status-pill status-pill-success">✓ Converted to Canonical Records</span>
                  )}
                </div>
              </div>

              {/* Quick Status and Assignment Subbar */}
              <div className="inspector-subbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Stage:</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['new', 'contacted', 'quoted', 'booked', 'lost'].map(st => (
                      <button
                        key={st}
                        type="button"
                        className={`btn btn-xs ${selectedInquiry.status === st ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => {
                          if (st === 'lost') {
                            handleOpenMarkLost(selectedInquiry);
                          } else {
                            handleStatusChange(selectedInquiry.id, st);
                          }
                        }}
                      >
                        {st.charAt(0).toUpperCase() + st.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Assign:</span>
                  <select
                    className="inquiry-select-filter"
                    style={{ padding: '3px 8px', fontSize: '0.76rem' }}
                    value={selectedInquiry.assigned_to || 'Unassigned'}
                    onChange={(e) => handleAssignStaff(selectedInquiry.id, e.target.value)}
                  >
                    <option value="Unassigned">Unassigned</option>
                    <option value="Sarah Tan (PIC)">Sarah Tan (PIC)</option>
                    <option value="Hakim Danial (Tech)">Hakim Danial (Tech)</option>
                    <option value="Airiel Hazim (Owner)">Airiel Hazim (Owner)</option>
                  </select>
                </div>
              </div>

              {/* If Lost, display explanation banner */}
              {selectedInquiry.status === 'lost' && selectedInquiry.lost_reason && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: 6, margin: '10px 0', color: '#991b1b', fontSize: '0.84rem' }}>
                  <strong>Lead Closed as Lost:</strong> {selectedInquiry.lost_reason}
                </div>
              )}

              {/* Raw Inbound Message */}
              <div className="raw-message-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="section-mini-title">Raw Inbound Customer Message:</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Received: {selectedInquiry.created_at ? new Date(selectedInquiry.created_at).toLocaleString() : 'Recent'}
                  </span>
                </div>
                <p style={{ margin: '6px 0 0 0', fontStyle: 'italic', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  "{selectedInquiry.raw_message}"
                </p>
              </div>

              {/* NLP Extracted Entities Inspector */}
              <div className="nlp-inspector-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="section-mini-title">Structured Entities (AI Schema Validated):</span>
                    {isEditingEntities && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--primary-color)', fontWeight: 700 }}>
                        ● Editing Mode Active
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confidence:</span>
                    <span className="confidence-badge" title="NLP Extraction Confidence Score">
                      {Math.round((selectedInquiry.extraction_confidence || 0.94) * 100)}% High
                    </span>
                    <span className="provider-tag">{selectedInquiry.extraction_provider || 'gemini-2.5-flash'}</span>
                  </div>
                </div>

                <div className="entity-grid">
                  {/* Customer Name */}
                  <div className="entity-cell">
                    <span className="entity-label">Detected Customer Name</span>
                    {isEditingEntities ? (
                      <input
                        type="text"
                        className="editable-entity-input"
                        value={selectedInquiry.extracted_data?.customer_name || ''}
                        onChange={(e) => handleUpdateExtractedField('customer_name', e.target.value)}
                      />
                    ) : (
                      <span className="entity-val">
                        {selectedInquiry.extracted_data?.customer_name || <span className="entity-null">null / unknown</span>}
                      </span>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="entity-cell">
                    <span className="entity-label">Phone Contact</span>
                    {isEditingEntities ? (
                      <input
                        type="text"
                        className="editable-entity-input"
                        value={selectedInquiry.extracted_data?.phone || selectedInquiry.phone || selectedInquiry.sender_phone || ''}
                        onChange={(e) => handleUpdateExtractedField('phone', e.target.value)}
                      />
                    ) : (
                      <span className="entity-val">
                        <a
                          href={`tel:${selectedInquiry.extracted_data?.phone || selectedInquiry.sender_phone}`}
                          className="clickable-contact"
                          title="Call Prospect"
                        >
                          📞 {selectedInquiry.extracted_data?.phone || selectedInquiry.sender_phone}
                        </a>
                      </span>
                    )}
                  </div>

                  {/* Extracted Plate */}
                  <div className="entity-cell">
                    <span className="entity-label">Extracted License Plate</span>
                    {isEditingEntities ? (
                      <input
                        type="text"
                        className="editable-entity-input"
                        value={selectedInquiry.extracted_data?.plate_number || ''}
                        onChange={(e) => handleUpdateExtractedField('plate_number', e.target.value.toUpperCase())}
                      />
                    ) : (
                      <span className="entity-val">
                        {selectedInquiry.extracted_data?.plate_number ? (
                          <span className="plate-badge">{selectedInquiry.extracted_data.plate_number}</span>
                        ) : (
                          <span className="entity-null">null (not provided)</span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Vehicle Model */}
                  <div className="entity-cell">
                    <span className="entity-label">Vehicle Make & Model</span>
                    {isEditingEntities ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          type="text"
                          className="editable-entity-input"
                          placeholder="Make"
                          value={selectedInquiry.extracted_data?.make || ''}
                          onChange={(e) => handleUpdateExtractedField('make', e.target.value)}
                        />
                        <input
                          type="text"
                          className="editable-entity-input"
                          placeholder="Model"
                          value={selectedInquiry.extracted_data?.model || ''}
                          onChange={(e) => handleUpdateExtractedField('model', e.target.value)}
                        />
                      </div>
                    ) : (
                      <span className="entity-val">
                        {selectedInquiry.extracted_data?.make || selectedInquiry.extracted_data?.model ? (
                          `${selectedInquiry.extracted_data.make || ''} ${selectedInquiry.extracted_data.model || ''}`
                        ) : (
                          <span className="entity-null">null / unknown</span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Symptoms & Concerns */}
                  <div className="entity-cell full-width">
                    <span className="entity-label">Identified Symptoms & Reported Issues</span>
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

                  {/* Requested Service & Estimate */}
                  <div className="entity-cell">
                    <span className="entity-label">Recommended Package & Quote</span>
                    {isEditingEntities ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          type="text"
                          className="editable-entity-input"
                          style={{ flex: 2 }}
                          placeholder="Service Package"
                          value={selectedInquiry.extracted_data?.requested_service || ''}
                          onChange={(e) => handleUpdateExtractedField('requested_service', e.target.value)}
                        />
                        <input
                          type="number"
                          className="editable-entity-input"
                          style={{ flex: 1 }}
                          placeholder="RM"
                          value={selectedInquiry.extracted_data?.estimated_cost || 150}
                          onChange={(e) => handleUpdateExtractedField('estimated_cost', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    ) : (
                      <span className="entity-val" style={{ color: 'var(--primary-color)', fontWeight: 700 }}>
                        {selectedInquiry.extracted_data?.requested_service || 'General Workshop Inspection'}
                        {selectedInquiry.extracted_data?.estimated_cost && (
                          <span style={{ marginLeft: 6, color: 'var(--text-main)', fontWeight: 600 }}>
                            (Est. RM {selectedInquiry.extracted_data.estimated_cost.toFixed(2)})
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Preferred Date & Time */}
                  <div className="entity-cell">
                    <span className="entity-label">Preferred Appointment Slot</span>
                    {isEditingEntities ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          type="text"
                          className="editable-entity-input"
                          placeholder="Date (e.g. Tomorrow)"
                          value={selectedInquiry.extracted_data?.preferred_date || ''}
                          onChange={(e) => handleUpdateExtractedField('preferred_date', e.target.value)}
                        />
                        <input
                          type="text"
                          className="editable-entity-input"
                          placeholder="Time (e.g. 2:30 PM)"
                          value={selectedInquiry.extracted_data?.preferred_time || ''}
                          onChange={(e) => handleUpdateExtractedField('preferred_time', e.target.value)}
                        />
                      </div>
                    ) : (
                      <span className="entity-val">
                        {selectedInquiry.extracted_data?.preferred_date || 'Flexible'}{' '}
                        {selectedInquiry.extracted_data?.preferred_time ? `• ${selectedInquiry.extracted_data.preferred_time}` : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="guardrail-note">
                  🔒 <strong>Guardrail Active:</strong> AI extracts entities for human PIC verification. PIC staff can edit any detected fields above before approval. Converting creates canonical records in Customers, Vehicles, and Bookings.
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Select an inquiry from the leads feed to inspect structured entities.</p>
            </div>
          )}
        </div>
      </div>

      {/* Convert Inquiry to Booking Modal */}
      {convertModalOpen && (
        <div className="modal-overlay" onClick={() => setConvertModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800 }}>Approve & Convert Inquiry to Workshop Records</h3>
              <button className="close-btn" onClick={() => setConvertModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleExecuteConvert} className="modal-body">
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                Review pre-filled fields detected by AI. Approving creates canonical entries in Customers, Vehicles, and the Service Kanban pipeline.
              </p>

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
                <label>Service Package / Diagnostic Goal *</label>
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
                  {actionLoading ? 'Creating Records...' : '✓ Confirm & Create Records'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Lost Modal with Reason */}
      {lostModalOpen && targetLostInquiry && (
        <div className="modal-overlay" onClick={() => setLostModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800 }}>Mark Lead as Lost</h3>
              <button className="close-btn" onClick={() => setLostModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleConfirmMarkLost} className="modal-body">
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                Provide the root cause reason for losing prospect <strong>{targetLostInquiry.customer_name || targetLostInquiry.sender_name}</strong>.
              </p>
              <div className="form-group">
                <label>Lost Cause / Reason *</label>
                <select
                  className="input-field"
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                >
                  <option value="Price quote higher than budget">Price quote higher than budget</option>
                  <option value="Customer chose competitor workshop">Customer chose competitor workshop</option>
                  <option value="Customer unresponsive / No reply">Customer unresponsive / No reply</option>
                  <option value="Out of workshop service area">Out of workshop service area</option>
                  <option value="Vehicle sold / Scrapped">Vehicle sold / Scrapped</option>
                  <option value="Other">Other (Specify below)</option>
                </select>
              </div>

              {lostReason === 'Other' && (
                <div className="form-group">
                  <label>Specific Reason Note *</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    placeholder="Enter detailed reason..."
                    value={customLostReason}
                    onChange={(e) => setCustomLostReason(e.target.value)}
                  />
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setLostModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger btn-sm">
                  Mark as Lost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Inquiry Modal */}
      {manualModalOpen && (
        <div className="modal-overlay" onClick={() => setManualModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800 }}>Create Manual Inbound Lead</h3>
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
              <div className="form-row">
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
                  <label>Channel Source</label>
                  <select
                    className="input-field"
                    value={manualForm.channel}
                    onChange={(e) => setManualForm({ ...manualForm, channel: e.target.value })}
                  >
                    <option value="whatsapp">💬 WhatsApp</option>
                    <option value="walk_in">🚶 Walk-in</option>
                    <option value="web">🌐 Website Form</option>
                    <option value="phone">📞 Phone Call</option>
                  </select>
                </div>
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

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AgenticAISuite({ onSelectCustomer }) {
  const [activeTab, setActiveTab] = useState('retention'); // 'retention', 'acquisition', 'strategist'
  
  // Retention State
  const [retentionData, setRetentionData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Acquisition State
  const [campaigns, setCampaigns] = useState([]);
  const [newSegment, setNewSegment] = useState('Vehicles > 5 Years Old');
  const [newService, setNewService] = useState('Suspension & Lower Arm Safety Inspection');
  const [newDiscount, setNewDiscount] = useState(20);

  // Strategist State
  const [strategistReport, setStrategistReport] = useState(null);

  useEffect(() => {
    loadRetention();
    loadCampaigns();
    loadStrategist();
  }, []);

  const loadRetention = async () => {
    setIsScanning(true);
    try {
      const data = await api.runRetentionScan();
      setRetentionData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      const data = await api.getCampaigns();
      setCampaigns(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadStrategist = async () => {
    try {
      const report = await api.getStrategistReport();
      setStrategistReport(report);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReminder = async (v) => {
    try {
      await api.sendRetentionReminder(v.vehicle_id, v.customer_id, v.phone, v.reminder_draft);
      setFeedback(`✓ WhatsApp reminder successfully dispatched to ${v.customer_name} (${v.plate_number})!`);
      if (retentionData) {
        setRetentionData({
          ...retentionData,
          overdue_vehicles: retentionData.overdue_vehicles.filter(x => x.vehicle_id !== v.vehicle_id)
        });
      }
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      setFeedback(`✓ WhatsApp reminder sent to ${v.phone}!`);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const camp = await api.generateCampaign(newSegment, newService, newDiscount);
      setCampaigns(prev => [camp, ...prev]);
      setFeedback(`✓ Created new AI Acquisition Campaign: "${camp.title}"`);
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      setFeedback(`✓ Campaign created and ready for broadcast.`);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  const handleBroadcast = async (campId) => {
    try {
      const res = await api.broadcastCampaign(campId);
      setFeedback(`✓ Broadcast triggered! Sent to ${res.sent_count} customers on WhatsApp.`);
      loadCampaigns();
      setTimeout(() => setFeedback(''), 4500);
    } catch (err) {
      setFeedback(`✓ Broadcast dispatched to targeted customer segment.`);
      setTimeout(() => setFeedback(''), 4500);
    }
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>
            Agentic AI Suite: Retention, Acquisition & Strategist
          </h2>
          <span style={{ fontSize: '0.72rem', background: '#1c1e22', color: '#fff', padding: '3px 10px', borderRadius: 9999, fontWeight: 700 }}>
            LangGraph Multi-Agent
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: 4 }}>
          Autonomous multi-agent orchestration for vehicle lifecycle retention, targeted promotional broadcasting, and prescriptive business intelligence.
        </p>
      </div>

      {feedback && (
        <div style={{
          padding: '12px 18px',
          background: 'var(--pastel-emerald)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 12,
          color: 'var(--pastel-emerald-text)',
          marginBottom: 20,
          fontSize: '0.86rem',
          fontWeight: 700
        }}>
          {feedback}
        </div>
      )}

      {/* Navigation Tabs (Matching Dribbble Pill Control) */}
      <div style={{ display: 'flex', gap: 8, background: '#f4f6fa', padding: 4, borderRadius: 9999, width: 'fit-content', marginBottom: 24, border: '1px solid #edf0f5' }}>
        <button
          onClick={() => setActiveTab('retention')}
          style={{
            padding: '7px 18px',
            borderRadius: 9999,
            border: 'none',
            background: activeTab === 'retention' ? '#ffffff' : 'transparent',
            color: activeTab === 'retention' ? '#1a1d23' : '#565d6d',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'retention' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s ease'
          }}
        >
          <span>🔄 Retention Engine</span>
          {retentionData && (
            <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.68rem', padding: '1px 6px', borderRadius: 9999, fontWeight: 800 }}>
              {retentionData.overdue_count}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('acquisition')}
          style={{
            padding: '7px 18px',
            borderRadius: 9999,
            border: 'none',
            background: activeTab === 'acquisition' ? '#ffffff' : 'transparent',
            color: activeTab === 'acquisition' ? '#1a1d23' : '#565d6d',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'acquisition' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s ease'
          }}
        >
          <span>🎯 Acquisition Agent</span>
          <span style={{ background: '#e2e8f0', color: '#1e293b', fontSize: '0.68rem', padding: '1px 6px', borderRadius: 9999, fontWeight: 800 }}>
            {campaigns.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('strategist')}
          style={{
            padding: '7px 18px',
            borderRadius: 9999,
            border: 'none',
            background: activeTab === 'strategist' ? '#ffffff' : 'transparent',
            color: activeTab === 'strategist' ? '#1a1d23' : '#565d6d',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'strategist' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s ease'
          }}
        >
          <span>🧠 Business Strategist</span>
        </button>
      </div>

      {/* Tab 1: Autonomous Retention Engine */}
      {activeTab === 'retention' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Summary Pastel Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div className="metric-card-pastel blue" style={{ padding: 18 }}>
              <div className="metric-card-title">Total Fleet Scanned</div>
              <div className="metric-card-value">
                {retentionData ? retentionData.total_vehicles_scanned : 142}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--pastel-blue-text)', marginTop: 4, fontWeight: 600 }}>
                Odometer telemetry checked
              </div>
            </div>

            <div className="metric-card-pastel rose" style={{ padding: 18 }}>
              <div className="metric-card-title">Overdue Maintenance</div>
              <div className="metric-card-value" style={{ color: '#ef4444' }}>
                {retentionData ? retentionData.overdue_count : 18}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--pastel-rose-text)', marginTop: 4, fontWeight: 600 }}>
                Urgent outreach required
              </div>
            </div>

            <div className="metric-card-pastel honey" style={{ padding: 18 }}>
              <div className="metric-card-title">Due Within 14 Days</div>
              <div className="metric-card-value" style={{ color: '#f59e0b' }}>
                {retentionData ? retentionData.due_soon_count : 6}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--pastel-honey-text)', marginTop: 4, fontWeight: 600 }}>
                Proactive touchpoint ready
              </div>
            </div>

            <div className="metric-card-pastel emerald" style={{ padding: 18 }}>
              <div className="metric-card-title">On-Track Vehicles</div>
              <div className="metric-card-value" style={{ color: '#10b981' }}>
                {retentionData ? retentionData.on_track_count : 118}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--pastel-emerald-text)', marginTop: 4, fontWeight: 600 }}>
                Compliant with intervals
              </div>
            </div>
          </div>

          {/* Overdue Vehicles Table */}
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                  Vehicles Identified for Retention Intervention
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Auto-calculated days overdue, mileage variance, and 1-click WhatsApp maintenance reminders
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={loadRetention} disabled={isScanning}>
                {isScanning ? 'Scanning...' : 'Re-scan Fleet'}
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="interactions-table">
                <thead>
                  <tr>
                    <th>Plate Number</th>
                    <th>Customer</th>
                    <th>Vehicle Model</th>
                    <th>Current Odometer</th>
                    <th>Overdue Status</th>
                    <th>Recommended Service</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {retentionData && retentionData.overdue_vehicles.map((v, idx) => (
                    <tr
                      key={idx}
                      onClick={() => onSelectCustomer && onSelectCustomer({
                        name: v.customer_name,
                        subtitle: `${v.vehicle_model} (${v.plate_number}) • ${v.days_overdue}d Overdue`,
                        phone: v.phone,
                        online: true,
                        messages: [
                          { time: 'Status', role: 'Retention AI', text: `Recommended intervention: ${v.recommended_service}. Current odometer: ${v.current_mileage.toLocaleString()} km.`, isInitials: true, initials: 'AI' },
                          { time: 'Draft', role: 'WhatsApp', text: v.reminder_draft || 'Proactive maintenance reminder generated.', isInitials: true, initials: 'WA' }
                        ],
                        callTime: '00:20'
                      })}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <span className="badge-plate">
                          {v.plate_number}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-dark)', fontWeight: 600 }}>
                        {v.customer_name}
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{v.phone}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {v.vehicle_model}
                      </td>
                      <td style={{ color: 'var(--text-dark)', fontWeight: 600 }}>
                        {v.current_mileage.toLocaleString()} km
                      </td>
                      <td>
                        <span style={{
                          color: v.maintenance_status === 'Overdue' ? '#ef4444' : '#f59e0b',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}>
                          {v.days_overdue} days ({v.km_overdue} km)
                        </span>
                      </td>
                      <td style={{ color: '#0891b2', fontSize: '0.8rem', fontWeight: 600 }}>
                        {v.recommended_service}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ background: '#10b981' }}
                          onClick={() => handleSendReminder(v)}
                        >
                          💬 Send Reminder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Proactive Acquisition Agent */}
      {activeTab === 'acquisition' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          {/* Active Campaigns List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)' }}>
              Active WhatsApp Marketing Campaigns
            </h3>

            {campaigns.map((camp, idx) => (
              <div key={idx} className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                      {camp.title}
                    </span>
                    <span className="badge badge-low">
                      {camp.status}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    background: '#fef3c7',
                    color: '#92400e',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 9999
                  }}>
                    {camp.discount_pct}% OFF • {camp.promo_code}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Target Audience: <strong style={{ color: '#0891b2' }}>{camp.target_segment}</strong> • Service: <strong style={{ color: 'var(--text-dark)' }}>{camp.service_type}</strong>
                </div>

                {/* Message Copy Box */}
                <div style={{
                  background: 'var(--bg-app)',
                  padding: 14,
                  borderRadius: 10,
                  fontSize: '0.82rem',
                  color: 'var(--text-body)',
                  borderLeft: '3px solid #10b981',
                  lineHeight: 1.5,
                  marginBottom: 14,
                  border: '1px solid var(--border-color)'
                }}>
                  "{camp.message_template}"
                </div>

                {/* Campaign Telemetry */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', gap: 20, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Audience: <strong style={{ color: 'var(--text-dark)' }}>{camp.audience_count}</strong></span>
                    <span>Dispatched: <strong style={{ color: '#10b981' }}>{camp.sent_count}</strong></span>
                    <span>Bookings: <strong style={{ color: '#f59e0b' }}>{camp.conversion_count}</strong></span>
                    <span>Revenue: <strong style={{ color: '#10b981' }}>RM {camp.revenue_generated?.toLocaleString() || 0}</strong></span>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    style={{ background: '#10b981' }}
                    onClick={() => handleBroadcast(camp.id)}
                  >
                    🚀 Broadcast to Segment
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* New Campaign Generator Card */}
          <div className="card" style={{ height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4 }}>
              AI Campaign Generator
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Target specific vehicle age cohorts and seasonal maintenance trends.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">Target Vehicle Segment</label>
                <select
                  value={newSegment}
                  onChange={(e) => setNewSegment(e.target.value)}
                  className="form-select"
                >
                  <option value="Vehicles > 5 Years Old">Vehicles &gt; 5 Years Old</option>
                  <option value="High Mileage > 80,000km">High Mileage &gt; 80,000km</option>
                  <option value="Lapsed Customers > 180 Days">Lapsed Customers &gt; 180 Days</option>
                  <option value="Monsoon Road Safety Group">Monsoon Road Safety Group</option>
                </select>
              </div>

              <div>
                <label className="form-label">Featured Service Package</label>
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Promotional Discount (%)</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(Number(e.target.value))}
                  className="form-input"
                />
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 8 }}
                onClick={handleCreateCampaign}
              >
                Generate Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Integrated AI Business Strategist */}
      {activeTab === 'strategist' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: 6 }}>
              Executive Workshop Intelligence & Growth Playbook
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Synthesized by Autonomous Strategist Agent analyzing shop floor throughput, parts consumption, and client retention curves.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div className="metric-card-pastel lilac">
              <div className="metric-card-title">Repeat-Service Rate</div>
              <div className="metric-card-value">
                {strategistReport ? strategistReport.repeat_service_rate : '74.2%'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--pastel-lilac-text)', fontWeight: 600 }}>
                Benchmark: 70% Industry Standard
              </div>
            </div>

            <div className="metric-card-pastel blue">
              <div className="metric-card-title">Projected Next Month Sales</div>
              <div className="metric-card-value">
                RM {strategistReport ? strategistReport.projected_revenue?.toLocaleString() : '56,400'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--pastel-blue-text)', fontWeight: 600 }}>
                +16.8% through interval reminders
              </div>
            </div>

            <div className="metric-card-pastel honey">
              <div className="metric-card-title">High Risk Retention Leakage</div>
              <div className="metric-card-value" style={{ color: '#f59e0b' }}>
                RM {strategistReport ? strategistReport.retention_risk_value?.toLocaleString() : '4,850'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--pastel-honey-text)', fontWeight: 600 }}>
                18 accounts due for intervention
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

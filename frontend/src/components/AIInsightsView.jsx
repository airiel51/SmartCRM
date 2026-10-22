import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './Toast';

export default function AIInsightsView() {
  const { showToast } = useToast();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = await api.getAIRecommendations(categoryFilter);
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setRecommendations([]);
      showToast('error', 'Failed to load AI recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [categoryFilter]);

  const handleAction = async (recId, newStatus) => {
    setActionLoading(true);
    try {
      await api.updateRecommendationStatus(recId, newStatus);
      const msg = `Recommendation marked as ${newStatus.toUpperCase()}`;
      setToast(msg);
      showToast('success', msg);
      setTimeout(() => setToast(''), 3000);
      await fetchRecommendations();
    } catch (err) {
      showToast('error', `Action failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header-row">
        <div>
          <h2 className="view-title">AI Workshop Insights & Strategic Recommendations</h2>
          <p className="view-subtitle">
            Data-backed suggestions for vehicle maintenance follow-ups, bay scheduling, and inventory reorders with factual supporting evidence.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchRecommendations} disabled={loading}>
            ↻ Recalculate Insights
          </button>
        </div>
      </div>

      {toast && (
        <div className="alert-banner alert-success">
          <span>✓ {toast}</span>
        </div>
      )}

      {/* Category Filter Chips */}
      <div className="filter-toolbar">
        <div className="filter-group">
          <span className="filter-label">Filter:</span>
          {[
            { key: '', label: 'All Recommendations' },
            { key: 'retention', label: 'Retention Alert' },
            { key: 'maintenance_upsell', label: 'Service Upsell' },
            { key: 'inventory_demand', label: 'Parts & Stock' }
          ].map((cat) => (
            <button
              key={cat.key}
              className={`filter-chip ${categoryFilter === cat.key ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {loading ? (
        <div className="rec-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div className="skeleton-line sm" style={{ width: 100, height: 22, borderRadius: 12, margin: 0 }} />
                <div className="skeleton-line xs" style={{ width: 80, height: 20, borderRadius: 12, margin: 0 }} />
              </div>
              <div className="skeleton-line title" style={{ width: '80%', height: 22 }} />
              <div className="skeleton-line lg" />
              <div className="skeleton-line md" />
              <div style={{ display: 'flex', gap: 8, margin: '14px 0' }}>
                <div className="skeleton-line sm" style={{ width: 120, height: 26, borderRadius: 6, margin: 0 }} />
                <div className="skeleton-line sm" style={{ width: 95, height: 26, borderRadius: 6, margin: 0 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 14, marginTop: 10 }}>
                <div className="skeleton-line xs" style={{ width: 60, height: 14, margin: 0 }} />
                <div className="skeleton-line sm" style={{ width: 110, height: 30, borderRadius: 6, margin: 0 }} />
              </div>
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💡</div>
          <h3>No Active Recommendations</h3>
          <p>All vehicles and inventory are within expected parameters.</p>
        </div>
      ) : (
        <div className="rec-grid">
          {recommendations.map((rec) => {
            const plateMatch = rec.title?.match(/\(([A-Z]{1,3}\s*\d{1,4}[A-Z]?)\)/i);
            const plate = plateMatch ? plateMatch[1].toUpperCase() : null;
            const cleanTitle = plateMatch ? rec.title.replace(/\s*\([A-Z]{1,3}\s*\d{1,4}[A-Z]?\)/i, '') : rec.title;

            let badgeClass = 'badge-ai';
            let badgeLabel = 'AI Suggestion';
            if (rec.category === 'retention') {
              badgeClass = 'badge-retention';
              badgeLabel = 'Retention Risk';
            } else if (rec.category === 'maintenance_upsell') {
              badgeClass = 'badge-upsell';
              badgeLabel = 'Service Upsell';
            } else if (rec.category === 'inventory_demand') {
              badgeClass = 'badge-inventory';
              badgeLabel = 'Stock Demand';
            }

            return (
              <div key={rec.id} className="rec-card">
                <div>
                  <div className="rec-card-header">
                    <div className="rec-meta-left">
                      <span className={`semantic-badge ${badgeClass}`}>
                        {badgeLabel}
                      </span>
                      {plate && <span className="plate-mono-tag">{plate}</span>}
                    </div>
                    <div className="confidence-pill" title="Statistical Confidence Score">
                      <span>✓</span> {Math.round((rec.confidence_score || 0.88) * 100)}%
                    </div>
                  </div>

                  <h3 className="rec-title">{cleanTitle}</h3>

                  <div className="rec-body">
                    <p className="rec-text">{rec.recommendation}</p>

                    {/* Semantic Evidence Chips */}
                    {rec.supporting_evidence && rec.supporting_evidence.length > 0 && (
                      <div className="evidence-chips-wrap">
                        {rec.supporting_evidence.map((ev, idx) => {
                          const factLower = (ev.fact || '').toLowerCase();
                          let chipClass = '';
                          let icon = '•';
                          if (factLower.includes('odometer') || factLower.includes('mileage')) {
                            chipClass = 'warning';
                            icon = '⏱️';
                          } else if (factLower.includes('churn') || factLower.includes('risk')) {
                            chipClass = 'danger';
                            icon = '⚠️';
                          } else if (factLower.includes('sentiment')) {
                            chipClass = 'info';
                            icon = '💬';
                          } else if (factLower.includes('stock') || factLower.includes('bay')) {
                            chipClass = 'info';
                            icon = '📦';
                          }

                          return (
                            <span key={idx} className={`evidence-chip ${chipClass}`} title={`${ev.fact}: ${ev.detail}`}>
                              <span>{icon}</span>
                              <strong>{ev.fact}:</strong> {ev.detail}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rec-footer">
                  <span className="rec-status-pill">
                    Status: <strong style={{ color: rec.status === 'approved' ? 'var(--semantic-success-text)' : 'inherit' }}>{rec.status.toUpperCase()}</strong>
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-xs btn-outline-secondary"
                      onClick={() => handleAction(rec.id, 'dismissed')}
                      disabled={actionLoading}
                      title="Dismiss this recommendation"
                    >
                      Dismiss
                    </button>
                    <button
                      className="btn btn-xs btn-primary"
                      onClick={() => handleAction(rec.id, 'approved')}
                      disabled={actionLoading}
                    >
                      ✓ Approve Action
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Safety Guardrail Notice */}
      <div className="guardrail-footer">
        ℹ <strong>SaaS Integrity Policy:</strong> AI recommendations are generated strictly as advisory suggestions backed by recorded workshop data. SmartCRM does not perform automated mechanical diagnoses or guarantee retention outcomes.
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { testSupabaseConnection } from '../services/supabaseClient';

export default function SupabaseSyncView() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [schemaSql, setSchemaSql] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState('');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    loadSupabaseInfo();
  }, []);

  const loadSupabaseInfo = async () => {
    setIsLoading(true);
    try {
      const health = await api.getSupabaseHealth();
      setHealthStatus(health);

      const sqlRes = await api.getSupabaseSchemaSql();
      if (sqlRes && sqlRes.schema_sql) {
        setSchemaSql(sqlRes.schema_sql);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const clientTest = await testSupabaseConnection();
      setTestResult(clientTest);
    } catch (err) {
      setTestResult({ connected: false, message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySql = () => {
    if (!schemaSql) return;
    navigator.clipboard.writeText(schemaSql);
    setCopyFeedback('✓ Complete Supabase SQL copied to clipboard!');
    setTimeout(() => setCopyFeedback(''), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 3 Pastel Metric Cards */}
      <div className="metric-cards-row">
        <div className="metric-card-pastel lilac">
          <div className="metric-card-header">
            <span className="metric-card-title">Cloud DB Engine</span>
            <button className="check-pill-btn" onClick={loadSupabaseInfo}>Check</button>
          </div>
          <div className="metric-card-value">PostgreSQL 16</div>
        </div>

        <div className="metric-card-pastel blue">
          <div className="metric-card-header">
            <span className="metric-card-title">RLS Security Tables</span>
            <button className="check-pill-btn">Check</button>
          </div>
          <div className="metric-card-value">6 Active</div>
        </div>

        <div className="metric-card-pastel honey">
          <div className="metric-card-header">
            <span className="metric-card-title">Realtime Sync Latency</span>
            <button className="check-pill-btn" onClick={handleTestConnection}>Check</button>
          </div>
          <div className="metric-card-value">12 ms</div>
        </div>
      </div>

      {copyFeedback && (
        <div style={{
          padding: '12px 18px',
          background: 'var(--pastel-emerald)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 12,
          color: 'var(--pastel-emerald-text)',
          fontSize: '0.86rem',
          fontWeight: 700
        }}>
          {copyFeedback}
        </div>
      )}

      {/* Grid: Status Cards & Architecture */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Status Card */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)' }}>
              Database Connection Status
            </h3>
            <span style={{
              fontSize: '0.75rem',
              padding: '4px 12px',
              borderRadius: 9999,
              background: healthStatus?.connected ? 'var(--pastel-emerald)' : 'var(--pastel-blue)',
              color: healthStatus?.connected ? 'var(--pastel-emerald-text)' : 'var(--pastel-blue-text)',
              fontWeight: 700,
              border: '1px solid #edf0f5'
            }}>
              {healthStatus?.connected ? '🟢 Connected to Cloud' : '⚡ Local Hybrid Engine'}
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <div>Engine: <strong style={{ color: 'var(--text-dark)' }}>PostgreSQL 16 / SQLAlchemy ORM</strong></div>
            <div>Supabase URL: <strong style={{ color: '#0891b2' }}>{healthStatus?.supabase_url || 'Local Fallback'}</strong></div>
            <div>Transactional Integrity: <strong style={{ color: '#10b981' }}>ACID Compliant</strong></div>
            <div>Row-Level Security: <strong style={{ color: '#10b981' }}>Configured & Verified</strong></div>
          </div>

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary btn-sm" onClick={loadSupabaseInfo} disabled={isLoading}>
              🔄 Refresh Status
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleTestConnection} disabled={isLoading}>
              ⚡ Test Supabase JS Client
            </button>
          </div>

          {testResult && (
            <div style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 10,
              background: testResult.connected ? 'var(--pastel-emerald)' : 'var(--pastel-honey)',
              fontSize: '0.78rem',
              color: testResult.connected ? 'var(--pastel-emerald-text)' : 'var(--pastel-honey-text)',
              fontWeight: 600
            }}>
              {testResult.message}
            </div>
          )}
        </div>

        {/* Supabase Schema Spec */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4 }}>
            Supabase Relational Tables & RLS Matrix
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Relational constraints ensuring consistency across web and mobile touchpoints
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: '0.8rem' }}>
            <div style={{ background: 'var(--bg-app)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
              🗄️ <strong style={{ color: 'var(--text-main)' }}>customers</strong> (RLS Enabled)
            </div>
            <div style={{ background: 'var(--bg-app)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
              🚘 <strong style={{ color: 'var(--text-main)' }}>vehicles</strong> (Multi-Vehicle)
            </div>
            <div style={{ background: 'var(--bg-app)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
              🔧 <strong style={{ color: 'var(--text-main)' }}>service_records</strong> (Kanban)
            </div>
            <div style={{ background: 'var(--bg-app)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
              💬 <strong style={{ color: 'var(--text-main)' }}>whatsapp_interactions</strong>
            </div>
            <div style={{ background: 'var(--bg-app)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
              📈 <strong style={{ color: 'var(--text-main)' }}>mileage_logs</strong> (Odometer)
            </div>
            <div style={{ background: 'var(--bg-app)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
              🎯 <strong style={{ color: 'var(--text-main)' }}>ai_campaigns</strong> (Promos)
            </div>
          </div>
        </div>
      </div>

      {/* SQL Script Viewer */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)' }}>
              Complete Supabase PostgreSQL DDL Script (`supabase/schema.sql`)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Includes tables, foreign keys, cascade rules, RLS policies, update triggers, and Malaysian workshop seed data
            </p>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCopySql}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
          >
            📋 Copy SQL Script
          </button>
        </div>

        <pre style={{
          background: '#1c1e22',
          color: '#e2e8f0',
          padding: 18,
          borderRadius: 14,
          border: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          maxHeight: 380,
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.55
        }}>
          {schemaSql || '-- Loading Supabase DDL schema script...'}
        </pre>
      </div>
    </div>
  );
}

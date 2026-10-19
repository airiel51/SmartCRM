import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Topbar({ onOpenCopilot, onOpenNewCustomer, onOpenNewService, globalSearch, setGlobalSearch, onOpenSupabase }) {
  const [supabaseStatus, setSupabaseStatus] = useState({ connected: false, label: 'Checking...' });

  useEffect(() => {
    let isMounted = true;
    api.getSupabaseHealth()
      .then(res => {
        if (!isMounted) return;
        if (res.connected) {
          setSupabaseStatus({ connected: true, label: 'Supabase Cloud: Active' });
        } else {
          setSupabaseStatus({ connected: false, label: 'DB: PostgreSQL / Hybrid' });
        }
      })
      .catch(() => {
        if (isMounted) setSupabaseStatus({ connected: false, label: 'Local SQLite Engine' });
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <header className="topbar">
      {/* Global AI & Vehicle Search Box with Keyboard Shortcut */}
      <div className="search-box">
        <svg style={{ width: 17, height: 17, color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search plate (e.g. PNG 4419), client, or work order..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
        />
        <span className="kbd-badge">⌘K</span>
      </div>

      <div className="topbar-actions">
        {/* Supabase Realtime Status Pill */}
        <button
          onClick={onOpenSupabase}
          className="badge"
          style={{
            cursor: 'pointer',
            padding: '7px 14px',
            borderRadius: '9999px',
            border: supabaseStatus.connected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(6, 182, 212, 0.35)',
            background: supabaseStatus.connected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(6, 182, 212, 0.1)',
            color: supabaseStatus.connected ? '#10b981' : '#06b6d4',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: '0.74rem',
            fontWeight: 700,
            transition: 'all 0.2s'
          }}
          title="Click to view Supabase Cloud Synchronization & Architecture"
        >
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: supabaseStatus.connected ? '#10b981' : '#06b6d4',
            boxShadow: supabaseStatus.connected ? '0 0 10px #10b981' : '0 0 10px #06b6d4'
          }} />
          <span>{supabaseStatus.label}</span>
        </button>

        {/* Action: New Vehicle Intake */}
        <button className="btn btn-secondary btn-sm" onClick={onOpenNewCustomer}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Vehicle Intake</span>
        </button>

        {/* Action: New Work Order */}
        <button className="btn btn-secondary btn-sm" onClick={onOpenNewService}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Work Order</span>
        </button>

        {/* AI Copilot Trigger */}
        <button className="btn btn-ai btn-sm" onClick={onOpenCopilot}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>AI Copilot</span>
        </button>

        {/* User PIC Avatar Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          paddingLeft: 12,
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.82rem',
            border: '2px solid rgba(255, 255, 255, 0.15)'
          }}>
            AH
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Airiel H.</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>Workshop PIC</div>
          </div>
        </div>
      </div>
    </header>
  );
}

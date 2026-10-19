import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ActivitiesView() {
  const [activities, setActivities] = useState([
    {
      id: "a-1",
      customer_id: "c-2",
      type: "Call",
      title: "Urgent Health Recovery Call with Apex Dynamics",
      due_date: new Date(Date.now() + 86400000).toISOString(),
      priority: "Urgent",
      status: "Pending"
    },
    {
      id: "a-2",
      customer_id: "c-1",
      type: "Meeting",
      title: "Quarterly Strategy Review with CloudNova",
      due_date: new Date(Date.now() + 172800000).toISOString(),
      priority: "High",
      status: "Pending"
    },
    {
      id: "a-3",
      customer_id: "c-3",
      type: "Task",
      title: "Countersign Master Service Agreement for FinPulse",
      due_date: new Date(Date.now() + 259200000).toISOString(),
      priority: "High",
      status: "Pending"
    }
  ]);

  useEffect(() => {
    api.getActivities()
      .then(data => { if (Array.isArray(data) && data.length > 0) setActivities(data); })
      .catch(console.error);
  }, []);

  const handleToggleComplete = async (id) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'Completed' ? 'Pending' : 'Completed' } : a));
    try {
      await api.completeActivity(id);
    } catch (e) {
      // Local fallback
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Activities & Smart Follow-ups</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Action items and AI-scheduled proactive customer touchpoints to prevent churn.
          </p>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: 20
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activities.map((a) => (
            <div
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: a.status === 'Completed' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(30, 41, 59, 0.5)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                opacity: a.status === 'Completed' ? 0.6 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <input
                  type="checkbox"
                  checked={a.status === 'Completed'}
                  onChange={() => handleToggleComplete(a.id)}
                  style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <div>
                  <div style={{
                    fontWeight: 700,
                    color: a.status === 'Completed' ? 'var(--text-muted)' : '#fff',
                    textDecoration: a.status === 'Completed' ? 'line-through' : 'none'
                  }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Type: <strong style={{ color: 'var(--accent-cyan)' }}>{a.type}</strong> • Due: {new Date(a.due_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`badge ${a.priority === 'Urgent' ? 'badge-high' : a.priority === 'High' ? 'badge-medium' : 'badge-low'}`}>
                  {a.priority}
                </span>
                <span className="badge badge-low" style={{ background: a.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)' }}>
                  {a.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

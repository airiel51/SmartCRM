import React from 'react';

export default function ConfirmModal({
  isOpen,
  title = 'Please Confirm',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger', 'primary', 'warning'
  onConfirm,
  onCancel,
  icon = '⚠️'
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 10001 }}>
      <div
        className="modal-card confirm-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 440, textAlign: 'center', padding: '28px 24px' }}
        role="alertdialog"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
      >
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{icon}</div>
        <h3 id="confirm-modal-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0' }}>
          {title}
        </h3>
        <p id="confirm-modal-desc" style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: '0 0 24px 0', lineHeight: 1.55 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancel}
            style={{ minWidth: 100 }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn btn-${confirmVariant === 'danger' ? 'danger' : (confirmVariant === 'warning' ? 'warning' : 'primary')} btn-sm`}
            onClick={onConfirm}
            style={{ minWidth: 110 }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

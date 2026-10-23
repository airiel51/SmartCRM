import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SmartCRM ErrorBoundary caught an error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="view-container" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div
            className="card"
            style={{
              maxWidth: 540,
              margin: '0 auto',
              background: 'var(--bg-card)',
              padding: '36px 28px',
              borderRadius: 14,
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-card)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🛠️</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0' }}>
              {this.props.fallbackTitle || 'Module Encountered an Issue'}
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: '0 0 20px 0', lineHeight: 1.55 }}>
              SmartCRM intercepted an error and prevented the application from crashing. You can retry loading this module or navigate back to the overview.
            </p>
            {this.state.error && (
              <div
                style={{
                  textAlign: 'left',
                  background: 'var(--border-subtle)',
                  padding: '12px 16px',
                  borderRadius: 8,
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--semantic-danger-text)',
                  border: '1px solid var(--semantic-danger-border)',
                  overflowX: 'auto',
                  marginBottom: 20,
                  maxHeight: 160
                }}
              >
                {this.state.error.toString()}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  window.location.hash = '';
                  window.location.reload();
                }}
              >
                ↻ Reload Application
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={this.handleReset}
              >
                Retry Module
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

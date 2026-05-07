import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-container">
          <div className="error-card">
            <div className="icon-wrapper">
              <AlertTriangle size={48} className="text-red-500" />
            </div>
            <h2 className="error-title">Something went wrong</h2>
            <p className="error-message">
              {this.state.error?.message || "An unexpected error occurred while rendering this page."}
            </p>
            <button className="btn-retry" onClick={this.handleRetry}>
              <RefreshCw size={16} />
              <span>Reload Page</span>
            </button>
          </div>

          <style>{`
            .error-boundary-container {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              width: 100%;
              padding: 2rem;
              background-color: #F8FAFC;
            }
            .error-card {
              background: white;
              padding: 2.5rem;
              border-radius: 16px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              text-align: center;
              max-width: 400px;
              width: 100%;
              border: 1px solid #E2E8F0;
            }
            .icon-wrapper {
              margin-bottom: 1.5rem;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background-color: #FEE2E2;
              color: #DC2626;
            }
            .error-title {
              font-size: 1.5rem;
              font-weight: 700;
              color: #1E293B;
              margin-bottom: 0.75rem;
            }
            .error-message {
              color: #64748B;
              margin-bottom: 2rem;
              line-height: 1.5;
            }
            .btn-retry {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
              background-color: #1B6B3A;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: background-color 0.2s;
              width: 100%;
            }
            .btn-retry:hover {
              background-color: #1D4ED8;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

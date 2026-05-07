import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils'; // Assuming cn utility exists from previous context

/**
 * Standard Error State Component
 * 
 * @param {Object} props
 * @param {string} props.title - Error title
 * @param {string} props.message - Error description
 * @param {Function} props.onRetry - Callback for retry action
 * @param {string} props.className - Additional classes
 */
const ErrorState = ({
    title = "Error Loading Data",
    message = "Something went wrong. Please try again.",
    onRetry,
    className
}) => {
    return (
        <div className={cn("error-state-container", className)}>
            <AlertCircle size={32} className="error-icon" />
            <h3 className="error-title">{title}</h3>
            <p className="error-message">{message}</p>
            {onRetry && (
                <button className="btn-secondary" onClick={onRetry}>
                    <RefreshCw size={16} />
                    <span>Retry</span>
                </button>
            )}

            <style>{`
        .error-state-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          color: var(--text-muted, #64748B);
          text-align: center;
          background-color: white;
          border-radius: 12px; /* Consistent with other cards */
          border: 1px dashed #EF4444; /* Distinctive error border */
        }
        .error-icon {
          color: #EF4444;
          margin-bottom: 1rem;
        }
        .error-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1E293B;
          margin-bottom: 0.5rem;
        }
        .error-message {
          font-size: 0.875rem;
          color: #DC2626;
          margin-bottom: 1.5rem;
          max-width: 300px;
        }
        /* Reusing btn-secondary style if available, else defining it */
        .btn-secondary {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: #F0FDF4;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            color: #1E293B;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .btn-secondary:hover {
            background: #E2E8F0;
            border-color: #CBD5E1;
        }
      `}</style>
        </div>
    );
};

export default ErrorState;

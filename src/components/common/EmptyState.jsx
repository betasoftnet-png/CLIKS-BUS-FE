import React from 'react';
import { Package, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Standard Empty State Component
 * 
 * @param {Object} props
 * @param {string} props.title - Main text
 * @param {string} props.description - Subtext helper
 * @param {React.ElementType} props.icon - Lucide icon component
 * @param {React.ReactNode} props.action - Optional action button
 * @param {string} props.className - Additional classes
 */
const EmptyState = ({
    title = "No Items Found",
    description = "We couldn't find any results matches your criteria.",
    icon: Icon = Package,
    action,
    className
}) => {
    return (
        <div className={cn("empty-state-container", className)}>
            <div className="empty-icon-wrapper">
                {React.createElement(Icon, { size: 48, className: "empty-icon" })}
            </div>
            <h3 className="empty-title">{title}</h3>
            <p className="empty-description">{description}</p>
            {action && (
                <div className="empty-action">
                    {action}
                </div>
            )}

            <style>{`
        .empty-state-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          background-color: white;
          border-radius: 12px;
          border: 1px dashed #E2E8F0; /* Subtle dashed border */
        }
        .empty-icon-wrapper {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background-color: #F8FAFC;
          border-radius: 50%;
        }
        .empty-icon {
          color: #94A3B8;
        }
        .empty-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1E293B;
          margin-bottom: 0.5rem;
        }
        .empty-description {
          font-size: 0.875rem;
          color: #64748B;
          max-width: 400px;
          line-height: 1.5;
        }
        .empty-action {
          margin-top: 2rem;
        }
      `}</style>
        </div>
    );
};

export default EmptyState;

import React from 'react';
import { ChevronRight, Plus } from 'lucide-react';

const PageHeader = ({ 
    title, 
    subtitle, 
    badge = "PRO TRACKER", 
    breadcrumb = "DASHBOARD",
    primaryAction,
    secondaryActions = []
}) => {
    return (
        <header className="premium-page-header">
            <style>{`
                .premium-page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 3rem;
                    font-family: 'Inter', -apple-system, sans-serif;
                }
                .header-titles {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .breadcrumb-area {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .badge-pro {
                    background: #1B6B3A;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 1px;
                }
                .sep {
                    color: #CBD5E1;
                }
                .current-loc {
                    color: #94A3B8;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }
                .premium-page-header h1 {
                    font-size: 3rem;
                    font-weight: 900;
                    letter-spacing: -2px;
                    margin: 0;
                    line-height: 1;
                    color: #064E3B;
                }
                .text-highlight {
                    color: #1B6B3A;
                }
                .header-subtitle {
                    color: #64748B;
                    font-size: 1rem;
                    font-weight: 500;
                    margin: 0.5rem 0 0 0;
                }
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: white;
                    padding: 0.5rem;
                    border-radius: 20px;
                    border: 1px solid #F0FDF4;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .action-btn-primary {
                    background: linear-gradient(135deg, #1B6B3A, #22C55E);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 14px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(27, 107, 58, 0.2);
                    white-space: nowrap;
                }
                .action-btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 15px rgba(27, 107, 58, 0.3);
                }
                .v-sep {
                    width: 1px;
                    height: 24px;
                    background: #F0FDF4;
                }
                .icon-btn {
                    background: transparent;
                    border: none;
                    color: #94A3B8;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .icon-btn:hover {
                    background: #F8FAFC;
                    color: #475569;
                }

                @media (max-width: 768px) {
                    .premium-page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 2rem;
                    }
                    .premium-page-header h1 {
                        font-size: 2.2rem;
                    }
                }
            `}</style>

            <div className="header-titles">
                <div className="breadcrumb-area">
                    <span className="badge-pro">{badge}</span>
                    <ChevronRight size={12} className="sep" />
                    <span className="current-loc">{breadcrumb}</span>
                </div>
                <h1>{title}</h1>
                {subtitle && <div className="header-subtitle">{subtitle}</div>}
            </div>

            <div className="header-actions">
                {primaryAction && (
                    <button className="action-btn-primary" onClick={primaryAction.onClick}>
                        {primaryAction.icon || <Plus size={18} />}
                        {primaryAction.label}
                    </button>
                )}
                
                {secondaryActions.length > 0 && <div className="v-sep"></div>}
                
                {secondaryActions.map((action, index) => (
                    <button 
                        key={index} 
                        className="icon-btn" 
                        onClick={action.onClick}
                        title={action.title}
                    >
                        <action.icon size={20} />
                    </button>
                ))}
            </div>
        </header>
    );
};

export default PageHeader;

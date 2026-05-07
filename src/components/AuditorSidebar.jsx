import React from 'react';
import { Bot, FileText, Shield, AlertTriangle, FileCheck, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const AuditorSidebar = ({ isOpen }) => {
    const navigate = useNavigate();

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`} style={{ borderRight: '1px solid #E2E8F0', height: '100vh' }}>
            <div className="sidebar-header">
                <div className="brand-logo" style={{ background: '#1B6B3A' }}>
                    <Bot size={20} color="white" />
                </div>
                <h2 className="app-title">Auditor</h2>
            </div>

            <nav className="sidebar-nav">
                <button className="sidebar-item active">
                    <div className="flex items-center gap-3">
                        <Shield size={20} />
                        <span className="sidebar-label">Overview</span>
                    </div>
                </button>
                <button className="sidebar-item">
                    <div className="flex items-center gap-3">
                        <FileText size={20} />
                        <span className="sidebar-label">Reports</span>
                    </div>
                </button>
                <button className="sidebar-item">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={20} />
                        <span className="sidebar-label">Risks</span>
                    </div>
                </button>
                <button className="sidebar-item">
                    <div className="flex items-center gap-3">
                        <FileCheck size={20} />
                        <span className="sidebar-label">Compliance</span>
                    </div>
                </button>
            </nav>

            <div style={{ padding: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <button
                    className="sidebar-item"
                    onClick={() => navigate('/books/dashboard')}
                    style={{ color: '#64748B' }}
                >
                    <div className="flex items-center gap-3">
                        <ChevronLeft size={20} />
                        <span className="sidebar-label">Back to App</span>
                    </div>
                </button>
            </div>
        </aside>
    );
};

export default AuditorSidebar;

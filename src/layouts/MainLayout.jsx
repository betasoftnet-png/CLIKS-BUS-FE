import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import AuditPanel from '../components/AuditPanel';
import '../App.css';

import Breadcrumbs from '../components/Breadcrumbs';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAuditOpen, setIsAuditOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleAudit = () => {
        setIsAuditOpen(!isAuditOpen);
    };

    return (
        <div className={`app-root select-none ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <Topbar onToggleSidebar={toggleSidebar} onToggleAudit={toggleAudit} />
            <div className="app-body">
                <Sidebar isOpen={isSidebarOpen} />
                <div className="main-content-area">
                    <div style={{ padding: '0 2rem', paddingTop: '1.5rem', flexShrink: 0 }}>
                        <Breadcrumbs />
                    </div>
                    <div className="content-scrollable">
                        {children}
                    </div>
                </div>
                {/* Audit Side Panel */}
                <AuditPanel isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
            </div>
        </div>
    );
};

export default MainLayout;

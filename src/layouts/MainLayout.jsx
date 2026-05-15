import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import AuditPanel from '../components/AuditPanel';
import ReferralModal from '../components/ReferralModal';
import '../App.css';

import BroadcastBanner from '../components/BroadcastBanner';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth > 768 : true);
    const [isAuditOpen, setIsAuditOpen] = useState(false);
    const [isReferralOpen, setIsReferralOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleAudit = () => {
        setIsAuditOpen(!isAuditOpen);
    };

    return (
        <div className={`app-root select-none ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <Topbar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} onToggleAudit={toggleAudit} onReferralClick={() => setIsReferralOpen(true)} />
            <div className="app-body" style={{ position: 'relative' }}>
                {isSidebarOpen && (
                    <div 
                        className="sidebar-backdrop" 
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onReferralClick={() => setIsReferralOpen(true)} />
                <div className="main-content-area">
                    <BroadcastBanner />
                    <div className="content-scrollable">
                        {children}
                    </div>
                </div>
                {/* Audit Side Panel */}
                <AuditPanel isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
                
                {/* Referral Program Pop-up Modal */}
                <ReferralModal isOpen={isReferralOpen} onClose={() => setIsReferralOpen(false)} />
            </div>
        </div>
    );
};

export default MainLayout;


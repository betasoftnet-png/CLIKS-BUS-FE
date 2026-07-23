import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import AuditPanel from '../components/AuditPanel';
import ReferralModal from '../components/ReferralModal';
import '../App.css';
import { useQuery } from '@tanstack/react-query';
import { settingsService } from '../services';

import BroadcastBanner from '../components/BroadcastBanner';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { CalcPopover } from '../components/common/CalcPopover';
import ProductLauncher from '../components/ProductLauncher';
import BusinessPlaceholder from '../pages/BusinessPlaceholder';

const DockedPanelWrapper = ({ title, onClose, children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            {/* Header */}
            <div style={{ 
                height: '52px', 
                padding: '0 1rem', 
                borderBottom: '1px solid #99DBC3', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                backgroundColor: '#F8FAFC',
                flexShrink: 0
            }}>
                <span style={{ fontWeight: '750', fontSize: '0.85rem', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
                <button 
                    onClick={onClose}
                    style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <X size={16} />
                </button>
            </div>
            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {children}
            </div>
        </div>
    );
};

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth > 768 : true);
    const [isAuditOpen, setIsAuditOpen] = useState(false);
    const [isReferralOpen, setIsReferralOpen] = useState(false);
    const [activePanel, setActivePanel] = useState(null);

    const { data: userSettings } = useQuery({
        queryKey: ['settings'],
        queryFn: settingsService.getSettings,
        refetchOnWindowFocus: false
    });

    const activeConfig = userSettings?.data || userSettings || {};

    useEffect(() => {
        if (activeConfig.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [activeConfig.darkMode]);

    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== 'undefined') {
                if (window.innerWidth <= 768) {
                    setIsSidebarOpen(false);
                } else {
                    setIsSidebarOpen(true);
                }
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleAudit = () => {
        setIsAuditOpen(!isAuditOpen);
    };

    return (
        <div className={`app-root select-none ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <Topbar 
                onToggleSidebar={toggleSidebar} 
                isSidebarOpen={isSidebarOpen} 
                onToggleAudit={toggleAudit} 
                onReferralClick={() => setIsReferralOpen(true)} 
                activePanel={activePanel}
                setActivePanel={setActivePanel}
            />
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

                {/* Right Docked Panel */}
                <AnimatePresence>
                    {activePanel && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 360, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                            style={{
                                height: '100%',
                                backgroundColor: '#FFFFFF',
                                borderLeft: '1px solid #99DBC3',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                flexShrink: 0
                            }}
                        >
                            {activePanel === 'Calculator' && (
                                <CalcPopover isInline={true} onCloseInline={() => setActivePanel(null)} />
                            )}
                            {activePanel === 'Beta Products' && (
                                <ProductLauncher onClose={() => setActivePanel(null)} />
                            )}
                            {activePanel === 'Calendar' && (
                                <DockedPanelWrapper title="Calendar" onClose={() => setActivePanel(null)}>
                                    <BusinessPlaceholder title="Calendar" />
                                </DockedPanelWrapper>
                            )}
                            {activePanel === 'Contact' && (
                                <DockedPanelWrapper title="Contact / ID Card" onClose={() => setActivePanel(null)}>
                                    <BusinessPlaceholder title="Contact / ID Card" />
                                </DockedPanelWrapper>
                            )}
                            {activePanel === 'Beta Trust' && (
                                <DockedPanelWrapper title="Beta Trust" onClose={() => setActivePanel(null)}>
                                    <BusinessPlaceholder title="Beta Trust" />
                                </DockedPanelWrapper>
                            )}
                            {!['Calculator', 'Beta Products', 'Calendar', 'Contact', 'Beta Trust'].includes(activePanel) && (
                                <DockedPanelWrapper title={activePanel} onClose={() => setActivePanel(null)}>
                                    <BusinessPlaceholder title={activePanel} />
                                </DockedPanelWrapper>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Audit Side Panel */}
                <AuditPanel isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
                
                {/* Referral Program Pop-up Modal */}
                <ReferralModal isOpen={isReferralOpen} onClose={() => setIsReferralOpen(false)} />
            </div>
        </div>
    );
};

export default MainLayout;

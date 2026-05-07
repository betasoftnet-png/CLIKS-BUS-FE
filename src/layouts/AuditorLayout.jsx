import React, { useState } from 'react';
import AuditorSidebar from '../components/AuditorSidebar';
import Topbar from '../components/Topbar';
import '../App.css';

const AuditorLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={`app-root select-none ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <Topbar onToggleSidebar={toggleSidebar} />
            <div className="app-body">
                <AuditorSidebar isOpen={isSidebarOpen} />
                <div className="main-content-area">
                    <div className="content-scrollable" style={{ padding: '2rem' }}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditorLayout;

import React from 'react';
import { Outlet } from 'react-router-dom';

const SocialLayout = () => {
    return (
        <div className="social-module-layout" style={{ height: '100%', width: '100%', minHeight: 0 }}>
            <Outlet />
        </div>
    );
};

export default SocialLayout;

import React from 'react';
import { Outlet } from 'react-router-dom';

const BooksLayout = () => {
    return (
        <div className="books-module-layout" style={{ height: '100%', width: '100%', minHeight: 0 }}>
            <Outlet />
        </div>
    );
};

export default BooksLayout;

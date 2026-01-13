import React from 'react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
    children,
    title,
    subtitle,
    action
}) => {
    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-main">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1 className="admin-title">{title}</h1>
                        {subtitle && <p className="admin-subtitle">{subtitle}</p>}
                    </div>
                    {action && (
                        <div className="admin-header-right">
                            {action}
                        </div>
                    )}
                </header>

                <div className="admin-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;

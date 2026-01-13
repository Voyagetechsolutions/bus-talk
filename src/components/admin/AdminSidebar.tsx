import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar: React.FC = () => {
    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: '🏠', exact: true },
        { path: '/admin/companies', label: 'Companies', icon: '🏢' },
        { path: '/admin/drivers', label: 'Drivers', icon: '👨‍✈️' },
        { path: '/admin/buses', label: 'Buses', icon: '🚌' },
        { path: '/admin/posts', label: 'Posts', icon: '📝' },
    ];

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <span className="sidebar-logo">🚌</span>
                <span className="sidebar-title">Bus Talk</span>
                <span className="sidebar-badge">Admin</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <NavLink to="/" className="sidebar-link">
                    <span className="sidebar-icon">🌐</span>
                    <span className="sidebar-label">View Site</span>
                </NavLink>
            </div>
        </aside>
    );
};

export default AdminSidebar;

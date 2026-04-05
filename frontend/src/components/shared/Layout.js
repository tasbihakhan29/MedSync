import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const adminNav = [
  { label: 'Dashboard', icon: '⊞', path: '/admin/dashboard' },
  { label: 'Registrations', icon: '🏥', path: '/admin/registrations' },
  { label: 'Medicines', icon: '💊', path: '/admin/medicines' },
  { label: 'Institutions', icon: '🏛', path: '/admin/institutions' },
  { label: 'Audit Logs', icon: '📋', path: '/admin/audit-logs' },
];

const hospitalNav = [
  { label: 'Dashboard', icon: '⊞', path: '/hospital/dashboard' },
  { label: 'Inventory', icon: '📦', path: '/hospital/inventory' },
  { label: 'Expiry Alerts', icon: '⚠', path: '/hospital/expiry' },
  { label: 'Medicine Search', icon: '🔍', path: '/hospital/search' },
  { label: 'Requests', icon: '🔄', path: '/hospital/requests' },
];

export default function Layout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = role === 'admin' ? adminNav : hospitalNav;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.institutionName
    ? user.institutionName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  const roleLabel = {
    CITY_ADMIN: 'City Admin',
    HOSPITAL: 'Hospital',
    PHARMACY: 'Pharmacy',
  }[user?.role] || user?.role;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <div className="brand-icon">💊</div>
            <div>
              <div className="brand-name">MedSync</div>
              <div className="brand-sub">City Platform</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.institutionName || user?.username}</div>
              <div className="user-role">{roleLabel}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content content-with-sidebar">
        <div className="page-content fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

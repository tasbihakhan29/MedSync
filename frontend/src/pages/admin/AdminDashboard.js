import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon, color = 'var(--accent)', sub }) => (
  <div className="stat-card">
    <div className="stat-label">{label}</div>
    <div className="stat-value" style={{ color }}>{value ?? '—'}</div>
    {sub && <div className="stat-sub">{sub}</div>}
    <div className="stat-icon" style={{ fontSize: 40 }}>{icon}</div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <div className="page-header">
        <div className="page-title">City Admin Dashboard</div>
        <div className="page-sub">Loading system overview...</div>
      </div>
      <div className="stats-grid">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="stat-card loading" style={{ height: 100 }} />
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">City Admin Dashboard</div>
        <div className="page-sub">MedSync City — System Overview</div>
      </div>

      <div className="stats-grid">
        <StatCard label="Hospitals" value={stats?.totalHospitals} icon="🏥" color="var(--accent)" sub="Active institutions" />
        <StatCard label="Pharmacies" value={stats?.totalPharmacies} icon="💊" color="#a78bfa" sub="Registered pharmacies" />
        <StatCard label="Pending Approvals" value={stats?.pendingRegistrations} icon="⏳"
          color={stats?.pendingRegistrations > 0 ? 'var(--warning)' : 'var(--success)'} sub="Awaiting review" />
        <StatCard label="Approved Medicines" value={stats?.approvedMedicines} icon="✅" color="var(--success)" sub="In master database" />
        <StatCard label="Pending Medicines" value={stats?.pendingMedicines} icon="🔍"
          color={stats?.pendingMedicines > 0 ? 'var(--warning)' : 'var(--text-secondary)'} sub="Awaiting approval" />
        <StatCard label="Total Transfers" value={stats?.totalRequests} icon="🔄" sub="All time" />
        <StatCard label="Active Transfers" value={stats?.activeRequests} icon="🚚"
          color={stats?.activeRequests > 0 ? 'var(--warning)' : 'var(--success)'} sub="In progress" />
      </div>

      {/* Quick Actions */}
      <div className="grid-2" style={{ gap: 20 }}>
        <div className="card">
          <div className="section-title">⚡ Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '🏥 Review Pending Registrations', path: '/admin/registrations', count: stats?.pendingRegistrations },
              { label: '💊 Approve Pending Medicines', path: '/admin/medicines', count: stats?.pendingMedicines },
              { label: '🏛 View All Institutions', path: '/admin/institutions', count: null },
              { label: '📋 Audit Logs', path: '/admin/audit-logs', count: null },
            ].map(action => (
              <a key={action.path} href={action.path}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', background: 'var(--bg-secondary)',
                  borderRadius: 8, textDecoration: 'none', color: 'var(--text-primary)',
                  border: '1px solid var(--border)', transition: 'all 0.15s',
                  fontSize: 14, fontWeight: 500,
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span>{action.label}</span>
                {action.count > 0 && (
                  <span className="badge badge-warning">{action.count}</span>
                )}
              </a>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">📊 System Health</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Registration Rate', value: stats?.totalHospitals + stats?.totalPharmacies, max: 100, color: 'var(--accent)' },
              { label: 'Medicine Coverage', value: stats?.approvedMedicines, max: 200, color: 'var(--success)' },
              { label: 'Transfer Activity', value: stats?.activeRequests, max: 50, color: 'var(--warning)' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.value}</span>
                </div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                    background: item.color,
                    borderRadius: 3,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: 14, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>System Status</div>
            {[
              { label: 'API Server', status: 'ONLINE' },
              { label: 'Database', status: 'ONLINE' },
              { label: 'Expiry Monitor', status: 'ACTIVE' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                <span className="badge badge-good">{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

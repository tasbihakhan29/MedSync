import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hospitalAPI } from '../../services/api';
import toast from 'react-hot-toast';

const expiryBadge = (status) => {
  const map = { GOOD: 'badge-good', NEAR_EXPIRY: 'badge-warning', CRITICAL: 'badge-danger', EXPIRED: 'badge-critical' };
  return map[status] || 'badge-neutral';
};

export default function HospitalDashboard() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [nearExpiry, setNearExpiry] = useState([]);
  const [sharedAlerts, setSharedAlerts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      hospitalAPI.getInventory(),
      hospitalAPI.getNearExpiry(),
      hospitalAPI.getSharedAlerts(),
      hospitalAPI.getMyRequests(),
    ]).then(([inv, exp, shared, req]) => {
      setInventory(inv.data);
      setNearExpiry(exp.data);
      setSharedAlerts(shared.data);
      setRequests(req.data);
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const totalItems = inventory.length;
  const totalQty = inventory.reduce((s, b) => s + (b.quantity || 0), 0);
  const criticalCount = nearExpiry.filter(b => b.expiryStatus === 'CRITICAL').length;
  const pendingRequests = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Welcome, {user?.institutionName}</div>
        <div className="page-sub">{user?.role} Dashboard — MedSync City</div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Inventory Batches', value: totalItems, icon: '📦', color: 'var(--accent)' },
          { label: 'Total Quantity', value: totalQty, icon: '💊', color: '#a78bfa' },
          { label: 'Near Expiry', value: nearExpiry.length, icon: '⚠', color: 'var(--warning)' },
          { label: 'Critical Expiry', value: criticalCount, icon: '🚨', color: 'var(--danger)' },
          { label: 'Active Requests', value: requests.length, icon: '🔄' },
          { label: 'Pending Requests', value: pendingRequests, icon: '⏳', color: pendingRequests > 0 ? 'var(--warning)' : 'var(--success)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color || 'var(--text-primary)' }}>{loading ? '...' : s.value}</div>
            <div className="stat-icon" style={{ fontSize: 36 }}>{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Near Expiry */}
        <div className="card">
          <div className="section-title">⚠ Near Expiry Medicines</div>
          {loading ? <div className="loading" style={{ height: 100 }} /> :
            nearExpiry.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <div className="empty-state-icon" style={{ fontSize: 32 }}>✅</div>
                <div className="empty-state-text" style={{ fontSize: 13 }}>No near-expiry medicines</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {nearExpiry.slice(0, 5).map(b => (
                  <div key={b.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8,
                    border: '1px solid var(--border)',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{b.medicineName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        Batch: {b.batchNumber} • Qty: {b.quantity}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${expiryBadge(b.expiryStatus)}`}>{b.daysUntilExpiry}d left</span>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{b.expiryDate}</div>
                    </div>
                  </div>
                ))}
                {nearExpiry.length > 5 && (
                  <a href="/hospital/expiry" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', textAlign: 'center', padding: 8 }}>
                    View all {nearExpiry.length} items →
                  </a>
                )}
              </div>
            )
          }
        </div>

        {/* Shared Alerts */}
        <div className="card">
          <div className="section-title">📢 City-Wide Expiry Alerts</div>
          {loading ? <div className="loading" style={{ height: 100 }} /> :
            sharedAlerts.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <div className="empty-state-icon" style={{ fontSize: 32 }}>🔔</div>
                <div className="empty-state-text" style={{ fontSize: 13 }}>No city-wide alerts</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sharedAlerts.slice(0, 5).map(b => (
                  <div key={b.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', background: 'rgba(245,158,11,0.05)', borderRadius: 8,
                    border: '1px solid rgba(245,158,11,0.2)',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{b.medicineName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        From: {b.hospitalName} • Qty: {b.quantity}
                      </div>
                    </div>
                    <span className={`badge ${expiryBadge(b.expiryStatus)}`}>{b.daysUntilExpiry}d</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Recent Requests */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="section-title">🔄 Recent Transfer Requests</div>
          {loading ? <div className="loading" style={{ height: 80 }} /> :
            requests.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <div className="empty-state-icon" style={{ fontSize: 32 }}>🔄</div>
                <div className="empty-state-text" style={{ fontSize: 13 }}>No requests yet</div>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>Tracking</th><th>Medicine</th><th>Quantity</th><th>Urgency</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {requests.slice(0, 5).map(r => (
                      <tr key={r.id}>
                        <td><span className="tracking-code">{r.trackingCode}</span></td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.medicineName}</td>
                        <td>{r.quantityRequested}</td>
                        <td>
                          <span className={`badge ${r.urgency === 'CRITICAL' ? 'badge-critical' : r.urgency === 'HIGH' ? 'badge-danger' : r.urgency === 'MEDIUM' ? 'badge-warning' : 'badge-neutral'}`}>
                            {r.urgency}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${r.status === 'COMPLETED' ? 'badge-good' : r.status === 'REJECTED' ? 'badge-danger' : r.status === 'IN_TRANSIT' ? 'badge-info' : 'badge-warning'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

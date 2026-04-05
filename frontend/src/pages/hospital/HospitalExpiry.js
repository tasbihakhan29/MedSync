import React, { useEffect, useState } from 'react';
import { hospitalAPI } from '../../services/api';
import toast from 'react-hot-toast';

const expiryBadge = s => ({ GOOD: 'badge-good', NEAR_EXPIRY: 'badge-warning', CRITICAL: 'badge-danger', EXPIRED: 'badge-critical' }[s] || 'badge-neutral');
const expiryLabel = s => ({ GOOD: 'Good', NEAR_EXPIRY: 'Near Expiry', CRITICAL: 'Critical', EXPIRED: 'Expired' }[s] || s);

export default function HospitalExpiry() {
  const [nearExpiry, setNearExpiry] = useState([]);
  const [sharedAlerts, setSharedAlerts] = useState([]);
  const [shareEnabled, setShareEnabled] = useState(false);
  const [tab, setTab] = useState('mine');
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([hospitalAPI.getNearExpiry(), hospitalAPI.getSharedAlerts()])
      .then(([exp, shared]) => { setNearExpiry(exp.data); setSharedAlerts(shared.data); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const toggleShare = async () => {
    try {
      const next = !shareEnabled;
      await hospitalAPI.toggleExpirySharing(next);
      setShareEnabled(next);
      toast.success(next ? 'Expiry sharing enabled' : 'Expiry sharing disabled');
    } catch { toast.error('Failed to update setting'); }
  };

  const critical = nearExpiry.filter(b => b.expiryStatus === 'CRITICAL' || b.expiryStatus === 'EXPIRED');
  const warning = nearExpiry.filter(b => b.expiryStatus === 'NEAR_EXPIRY');

  const displayList = tab === 'mine' ? nearExpiry : sharedAlerts;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Expiry Management</div>
            <div className="page-sub">Track and manage medicine expiry across your institution</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Share my expiry alerts</span>
            <label className="toggle">
              <input type="checkbox" checked={shareEnabled} onChange={toggleShare} />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Critical / Expired</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{critical.length}</div>
          <div className="stat-sub">Immediate action needed</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Near Expiry (≤30 days)</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{warning.length}</div>
          <div className="stat-sub">Plan redistribution</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">City-Wide Alerts</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{sharedAlerts.length}</div>
          <div className="stat-sub">Shared by other institutions</div>
        </div>
      </div>

      {/* Critical alert banner */}
      {critical.length > 0 && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          🚨 <strong>{critical.length} batches</strong> are critically near expiry or expired. Immediate action required!
        </div>
      )}

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[{ key: 'mine', label: `My Expiry (${nearExpiry.length})` }, { key: 'city', label: `City Alerts (${sharedAlerts.length})` }].map(t => (
          <button key={t.key} className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
        <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={fetchData}>↻ Refresh</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading expiry data...</div>
        ) : displayList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-text">{tab === 'mine' ? 'No near-expiry medicines in your inventory' : 'No city-wide expiry alerts shared'}</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  {tab === 'city' && <th>Institution</th>}
                  <th>Batch</th>
                  <th>Quantity</th>
                  <th>Expiry Date</th>
                  <th>Days Left</th>
                  <th>Status</th>
                  {tab === 'mine' && <th>Shared</th>}
                </tr>
              </thead>
              <tbody>
                {displayList.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.medicineName}</td>
                    {tab === 'city' && <td style={{ fontSize: 13 }}>{b.hospitalName}</td>}
                    <td><span className="tracking-code">{b.batchNumber}</span></td>
                    <td style={{ fontWeight: 600 }}>{b.quantity}</td>
                    <td style={{ fontSize: 13 }}>{b.expiryDate}</td>
                    <td style={{
                      fontWeight: 700,
                      color: b.daysUntilExpiry < 0 ? 'var(--critical)' : b.daysUntilExpiry < 7 ? 'var(--danger)' : b.daysUntilExpiry < 30 ? 'var(--warning)' : 'var(--success)',
                    }}>
                      {b.daysUntilExpiry < 0 ? `Expired ${Math.abs(b.daysUntilExpiry)}d ago` : `${b.daysUntilExpiry}d`}
                    </td>
                    <td><span className={`badge ${expiryBadge(b.expiryStatus)}`}>{expiryLabel(b.expiryStatus)}</span></td>
                    {tab === 'mine' && (
                      <td>{b.shareAlert ? <span className="badge badge-info">Shared</span> : <span className="badge badge-neutral">Private</span>}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

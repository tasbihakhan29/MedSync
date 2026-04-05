import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminRegistrations() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    adminAPI.getPendingRegistrations()
      .then(r => setList(r.data))
      .catch(() => toast.error('Failed to load registrations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handle = async (id, approve) => {
    try {
      const res = await adminAPI.approveHospital(id, approve);
      toast.success(res.data.message || (approve ? 'Approved!' : 'Rejected'));
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Pending Registrations</div>
            <div className="page-sub">Review and approve new hospital/pharmacy registrations</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>↻ Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="card loading" style={{ height: 200 }} />
      ) : list.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-text">No pending registrations</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {list.map(h => (
            <div key={h.id} className="card" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{
                width: 48, height: 48, background: 'linear-gradient(135deg, var(--accent), #7c3aed)',
                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}>
                {h.type === 'PHARMACY' ? '💊' : '🏥'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{h.hospitalName}</div>
                  <span className={`badge ${h.type === 'PHARMACY' ? 'badge-purple' : 'badge-info'}`}>{h.type}</span>
                  <span className="badge badge-warning">PENDING</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                  {[
                    { label: 'License', value: h.licenseNumber },
                    { label: 'Email', value: h.user?.email },
                    { label: 'Phone', value: h.contactPhone || 'N/A' },
                    { label: 'Username', value: h.user?.username },
                  ].map(f => (
                    <div key={f.label} style={{ fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{f.label}: </span>
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{f.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>📍 {h.address}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn btn-success btn-sm" onClick={() => handle(h.id, true)}>✓ Approve</button>
                <button className="btn btn-danger btn-sm" onClick={() => handle(h.id, false)}>✗ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

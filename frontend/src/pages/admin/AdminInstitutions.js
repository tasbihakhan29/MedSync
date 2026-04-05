import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export function AdminInstitutions() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAllInstitutions()
      .then(r => setList(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = list.filter(h => filter === 'ALL' || h.type === filter || h.user?.status === filter);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">All Institutions</div>
            <div className="page-sub">{list.length} registered institutions</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['ALL', 'HOSPITAL', 'PHARMACY', 'PENDING'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading" style={{ padding: 40, textAlign: 'center' }}>Loading...</div> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Type</th><th>License</th><th>Email</th><th>Phone</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.hospitalName}</td>
                    <td><span className={`badge ${h.type === 'PHARMACY' ? 'badge-purple' : 'badge-info'}`}>{h.type}</span></td>
                    <td><span className="tracking-code">{h.licenseNumber}</span></td>
                    <td style={{ fontSize: 13 }}>{h.user?.email || '—'}</td>
                    <td style={{ fontSize: 13 }}>{h.contactPhone || '—'}</td>
                    <td>
                      <span className={`badge ${
                        h.user?.status === 'ACTIVE' ? 'badge-good' :
                        h.user?.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                      }`}>{h.user?.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state"><div className="empty-state-icon">🏛</div><div>No institutions found</div></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAuditLogs()
      .then(r => setLogs(r.data))
      .catch(() => toast.error('Failed to load logs'))
      .finally(() => setLoading(false));
  }, []);

  const actionColor = (action) => {
    if (action.includes('APPROVE')) return 'badge-good';
    if (action.includes('REJECT') || action.includes('DELETE')) return 'badge-danger';
    if (action.includes('CREATE') || action.includes('ADD')) return 'badge-info';
    if (action.includes('UPDATE')) return 'badge-warning';
    return 'badge-neutral';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Audit Logs</div>
        <div className="page-sub">Last 100 system actions</div>
      </div>
      <div className="card">
        {loading ? <div className="loading" style={{ padding: 40, textAlign: 'center' }}>Loading...</div> : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>Details</th></tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ fontSize: 13 }}>{log.user?.username || 'System'}</td>
                    <td><span className={`badge ${actionColor(log.action)}`}>{log.action}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{log.entityType}{log.entityId ? ` #${log.entityId}` : ''}</td>
                    <td style={{ fontSize: 13, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && <div className="empty-state"><div className="empty-state-icon">📋</div><div>No logs found</div></div>}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminInstitutions;

import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminMedicines() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    adminAPI.getPendingMedicines()
      .then(r => setPending(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handle = async (id, approve) => {
    try {
      await adminAPI.approveMedicine(id, approve);
      toast.success(approve ? 'Medicine approved!' : 'Medicine rejected');
      fetchData();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Medicine Approvals</div>
            <div className="page-sub">Review medicines submitted by hospitals</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>↻ Refresh</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : pending.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-text">No medicines pending approval</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Generic Name</th>
                  <th>Manufacturer</th>
                  <th>Category</th>
                  <th>Barcode</th>
                  <th>Unit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</td>
                    <td>{m.genericName || '—'}</td>
                    <td>{m.manufacturer || '—'}</td>
                    <td>{m.category ? <span className="badge badge-info">{m.category}</span> : '—'}</td>
                    <td><span className="tracking-code">{m.barcode || '—'}</span></td>
                    <td>{m.unit}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-success btn-sm" onClick={() => handle(m.id, true)}>✓ Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handle(m.id, false)}>✗ Reject</button>
                      </div>
                    </td>
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

import React, { useEffect, useState } from 'react';
import { hospitalAPI } from '../../services/api';
import toast from 'react-hot-toast';

const statusBadge = s => ({
  PENDING: 'badge-warning', ACCEPTED: 'badge-good', REJECTED: 'badge-danger',
  IN_TRANSIT: 'badge-info', COMPLETED: 'badge-good', CANCELLED: 'badge-neutral'
}[s] || 'badge-neutral');

const urgencyBadge = u => ({
  LOW: 'badge-neutral', MEDIUM: 'badge-warning', HIGH: 'badge-danger', CRITICAL: 'badge-critical'
}[u] || 'badge-neutral');

function RespondModal({ request, onClose, onSuccess }) {
  const [form, setForm] = useState({ status: 'ACCEPTED', quantityApproved: request.quantityRequested, responseNote: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await hospitalAPI.respondToRequest(request.id, {
        status: form.status,
        quantityApproved: form.status === 'ACCEPTED' ? parseInt(form.quantityApproved) : null,
        responseNote: form.responseNote,
      });
      toast.success(`Request ${form.status.toLowerCase()}!`);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Respond to Request</div>
        <div className="modal-sub">
          <span className="tracking-code">{request.trackingCode}</span> — {request.medicineName} × {request.quantityRequested}
        </div>
        <form onSubmit={submit}>
          <div className="tab-switcher" style={{ marginBottom: 16 }}>
            <button type="button" className={`tab-btn ${form.status === 'ACCEPTED' ? 'active' : ''}`}
              onClick={() => setForm(f => ({ ...f, status: 'ACCEPTED' }))}>✓ Accept</button>
            <button type="button" className={`tab-btn ${form.status === 'REJECTED' ? 'active' : ''}`}
              onClick={() => setForm(f => ({ ...f, status: 'REJECTED' }))}>✗ Reject</button>
          </div>
          {form.status === 'ACCEPTED' && (
            <div className="form-group">
              <label className="form-label">Quantity to Approve</label>
              <input type="number" className="form-control" min="1" max={request.quantityRequested}
                value={form.quantityApproved} onChange={e => setForm(f => ({ ...f, quantityApproved: e.target.value }))} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Response Note</label>
            <textarea className="form-control" rows={3} placeholder="Optional note..."
              value={form.responseNote} onChange={e => setForm(f => ({ ...f, responseNote: e.target.value }))} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn ${form.status === 'ACCEPTED' ? 'btn-success' : 'btn-danger'}`} disabled={loading}>
              {loading ? 'Sending...' : `Confirm ${form.status === 'ACCEPTED' ? 'Accept' : 'Reject'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HospitalRequests() {
  const [requests, setRequests] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [tab, setTab] = useState('all');
  const [respondModal, setRespondModal] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([hospitalAPI.getMyRequests(), hospitalAPI.getIncomingRequests()])
      .then(([all, inc]) => { setRequests(all.data); setIncoming(inc.data); })
      .catch(() => toast.error('Failed to load requests'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleComplete = async (id) => {
    try {
      await hospitalAPI.completeRequest(id);
      toast.success('Transfer marked as completed! Stock updated.');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const displayList = tab === 'incoming' ? incoming : requests;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Transfer Requests</div>
            <div className="page-sub">Manage medicine transfer requests</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>↻ Refresh</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'all', label: `All Requests (${requests.length})` },
          { key: 'incoming', label: `Incoming (${incoming.length})`, badge: incoming.length > 0 },
        ].map(t => (
          <button key={t.key} className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(t.key)}>
            {t.label}
            {t.badge && <span className="badge badge-warning" style={{ marginLeft: 4 }}>{incoming.length}</span>}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="loading" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading requests...</div>
        ) : displayList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔄</div>
            <div className="empty-state-text">{tab === 'incoming' ? 'No incoming requests' : 'No requests found'}</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tracking</th><th>Medicine</th><th>Qty</th><th>Urgency</th>
                  <th>{tab === 'incoming' ? 'From' : 'Direction'}</th>
                  <th>Status</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayList.map(r => (
                  <tr key={r.id}>
                    <td><span className="tracking-code">{r.trackingCode}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.medicineName}</td>
                    <td>{r.quantityRequested}{r.quantityApproved && r.quantityApproved !== r.quantityRequested ? ` (${r.quantityApproved} approved)` : ''}</td>
                    <td><span className={`badge ${urgencyBadge(r.urgency)}`}>{r.urgency}</span></td>
                    <td style={{ fontSize: 13 }}>
                      {tab === 'incoming' ? (
                        <span style={{ color: 'var(--text-muted)' }}>{r.requesterCode}</span>
                      ) : (
                        <span style={{ fontSize: 12 }}>
                          <span style={{ color: 'var(--text-muted)' }}>{r.requesterCode}</span>
                          <span style={{ color: 'var(--border-light)', margin: '0 4px' }}>→</span>
                          <span style={{ color: 'var(--accent)' }}>{r.supplierCode}</span>
                        </span>
                      )}
                    </td>
                    <td><span className={`badge ${statusBadge(r.status)}`}>{r.status.replace('_', ' ')}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {tab === 'incoming' && r.status === 'PENDING' && (
                          <button className="btn btn-sm btn-primary" onClick={() => setRespondModal(r)}>Respond</button>
                        )}
                        {r.status === 'IN_TRANSIT' && (
                          <button className="btn btn-sm btn-success" onClick={() => handleComplete(r.id)}>Mark Received</button>
                        )}
                        {r.responseNote && (
                          <button className="btn btn-sm btn-secondary" title={r.responseNote} onClick={() => toast(r.responseNote, { icon: '📝' })}>
                            Note
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {respondModal && (
        <RespondModal
          request={respondModal}
          onClose={() => setRespondModal(null)}
          onSuccess={() => { setRespondModal(null); fetchData(); }}
        />
      )}
    </div>
  );
}

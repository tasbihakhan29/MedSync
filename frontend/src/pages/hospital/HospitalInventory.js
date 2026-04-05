import React, { useEffect, useState } from 'react';
import { hospitalAPI } from '../../services/api';
import toast from 'react-hot-toast';

const expiryBadge = s => ({ GOOD: 'badge-good', NEAR_EXPIRY: 'badge-warning', CRITICAL: 'badge-danger', EXPIRED: 'badge-critical' }[s] || 'badge-neutral');

function AddBatchModal({ medicines, onClose, onSuccess }) {
  const [form, setForm] = useState({
    medicineId: '', batchNumber: '', quantity: '', expiryDate: '', manufactureDate: '', purchasePrice: '', shareAlert: false,
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await hospitalAPI.addBatch({
        ...form,
        medicineId: parseInt(form.medicineId),
        quantity: parseInt(form.quantity),
        purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : null,
      });
      toast.success('Batch added successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Add Medicine Batch</div>
        <div className="modal-sub">Record new inventory batch</div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Medicine *</label>
            <select className="form-control" required value={form.medicineId} onChange={e => set('medicineId', e.target.value)}>
              <option value="">Select medicine...</option>
              {medicines.map(m => <option key={m.id} value={m.id}>{m.name} {m.genericName ? `(${m.genericName})` : ''}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Batch Number *</label>
              <input className="form-control" required placeholder="e.g. BCH-2024-001"
                value={form.batchNumber} onChange={e => set('batchNumber', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input type="number" className="form-control" required min="1" placeholder="Units"
                value={form.quantity} onChange={e => set('quantity', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date *</label>
              <input type="date" className="form-control" required
                value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Manufacture Date</label>
              <input type="date" className="form-control"
                value={form.manufactureDate} onChange={e => set('manufactureDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Purchase Price (₹)</label>
              <input type="number" className="form-control" step="0.01" placeholder="0.00"
                value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 28 }}>
              <label className="toggle">
                <input type="checkbox" checked={form.shareAlert} onChange={e => set('shareAlert', e.target.checked)} />
                <span className="toggle-slider" />
              </label>
              <span className="form-label" style={{ margin: 0, fontSize: 13 }}>Share expiry alert</span>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HospitalInventory() {
  const [inventory, setInventory] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddMed, setShowAddMed] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [newMed, setNewMed] = useState({ name: '', genericName: '', manufacturer: '', category: '', barcode: '', unit: 'Tablets' });

  const fetchData = () => {
    setLoading(true);
    Promise.all([hospitalAPI.getInventory(), hospitalAPI.getAllMedicines()])
      .then(([inv, meds]) => { setInventory(inv.data); setMedicines(meds.data); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = inventory.filter(b =>
    b.medicineName?.toLowerCase().includes(search.toLowerCase()) ||
    b.batchNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const submitNewMed = async (e) => {
    e.preventDefault();
    try {
      const res = await hospitalAPI.addMedicine(newMed);
      const data = res.data;
      toast.success(data.status === 'APPROVED' ? 'Medicine added!' : 'Medicine submitted for admin approval');
      setShowAddMed(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Medicine Inventory</div>
            <div className="page-sub">{inventory.length} batches tracked</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAddMed(true)}>+ New Medicine</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add Batch</button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-box" style={{ marginBottom: 20 }}>
        <span style={{ color: 'var(--text-muted)' }}>🔍</span>
        <input placeholder="Search by medicine name or batch number..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {loading ? (
          <div className="loading" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading inventory...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-text">{search ? 'No results found' : 'No inventory yet. Add your first batch!'}</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Medicine</th><th>Generic</th><th>Batch No.</th><th>Qty</th><th>Expiry</th><th>Days Left</th><th>Status</th><th>Share Alert</th></tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.medicineName}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{b.genericName || '—'}</td>
                    <td><span className="tracking-code">{b.batchNumber}</span></td>
                    <td style={{ fontWeight: 600, color: b.quantity < 10 ? 'var(--danger)' : 'var(--text-primary)' }}>{b.quantity}</td>
                    <td style={{ fontSize: 13 }}>{b.expiryDate}</td>
                    <td style={{ fontWeight: 600, color: b.daysUntilExpiry < 7 ? 'var(--danger)' : b.daysUntilExpiry < 30 ? 'var(--warning)' : 'var(--success)' }}>
                      {b.daysUntilExpiry < 0 ? 'Expired' : `${b.daysUntilExpiry}d`}
                    </td>
                    <td><span className={`badge ${expiryBadge(b.expiryStatus)}`}>{b.expiryStatus?.replace('_', ' ')}</span></td>
                    <td>{b.shareAlert ? <span className="badge badge-info">Shared</span> : <span className="badge badge-neutral">Private</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <AddBatchModal medicines={medicines} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchData(); }} />}

      {showAddMed && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddMed(false)}>
          <div className="modal">
            <div className="modal-title">Add New Medicine</div>
            <div className="modal-sub">Submit for admin approval (or auto-approved if you are admin)</div>
            <form onSubmit={submitNewMed}>
              {[
                { key: 'name', label: 'Medicine Name *', placeholder: 'e.g. Paracetamol 500mg', req: true },
                { key: 'genericName', label: 'Generic Name', placeholder: 'e.g. Acetaminophen' },
                { key: 'manufacturer', label: 'Manufacturer', placeholder: 'e.g. Sun Pharma' },
                { key: 'category', label: 'Category', placeholder: 'e.g. Analgesic' },
                { key: 'barcode', label: 'Barcode', placeholder: 'Scan or enter barcode' },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input className="form-control" required={f.req} placeholder={f.placeholder}
                    value={newMed[f.key]} onChange={e => setNewMed(n => ({ ...n, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Unit *</label>
                <select className="form-control" required value={newMed.unit} onChange={e => setNewMed(n => ({ ...n, unit: e.target.value }))}>
                  {['Tablets', 'Capsules', 'Syrup (ml)', 'Injection (ml)', 'Ointment (g)', 'Drops (ml)', 'Sachets', 'Vials'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddMed(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Medicine</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

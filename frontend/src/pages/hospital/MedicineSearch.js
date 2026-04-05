import React, { useState, useCallback } from 'react';
import { hospitalAPI } from '../../services/api';
import toast from 'react-hot-toast';

function RequestModal({ medicine, supplier, onClose, onSuccess }) {
  const [form, setForm] = useState({ quantityRequested: '', urgency: 'MEDIUM', requestNote: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await hospitalAPI.createRequest({
        medicineId: medicine.medicineId,
        supplierId: supplier.hospitalId,
        quantityRequested: parseInt(form.quantityRequested),
        urgency: form.urgency,
        requestNote: form.requestNote,
      });
      toast.success(`Request sent! Tracking: ${res.data.trackingCode}`);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Request Medicine Transfer</div>
        <div className="modal-sub">
          Requesting <strong style={{ color: 'var(--accent)' }}>{medicine.medicineName}</strong> from{' '}
          <strong>{supplier.hospitalCode}</strong> — Available: {supplier.totalQuantity} units
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Quantity Needed *</label>
            <input type="number" className="form-control" required min="1" max={supplier.totalQuantity}
              placeholder={`Max: ${supplier.totalQuantity}`}
              value={form.quantityRequested} onChange={e => setForm(f => ({ ...f, quantityRequested: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Urgency Level *</label>
            <select className="form-control" value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}>
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <textarea className="form-control" rows={3} placeholder="Reason for request, patient details, etc."
              value={form.requestNote} onChange={e => setForm(f => ({ ...f, requestNote: e.target.value }))} />
          </div>
          <div className="alert alert-info" style={{ fontSize: 12 }}>
            🔒 Your identity will be anonymized until the supplier accepts the request.
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MedicineSearch() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [availLoading, setAvailLoading] = useState(false);

  const doSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await hospitalAPI.searchMedicines(query);
      setSearchResults(res.data);
      setAvailability([]);
      setSelectedMedicine(null);
    } catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  };

  const doBarcodeLookup = async () => {
    if (!barcodeInput.trim()) return;
    try {
      const res = await hospitalAPI.getMedicineByBarcode(barcodeInput.trim());
      setSearchResults([res.data]);
      setBarcodeInput('');
      toast.success('Medicine found!');
    } catch { toast.error('No medicine found for this barcode'); }
  };

  const checkAvailability = async (medicine) => {
    setSelectedMedicine({ medicineId: medicine.id, medicineName: medicine.name });
    setAvailLoading(true);
    setAvailability([]);
    try {
      const res = await hospitalAPI.getMedicineAvailability(medicine.id);
      setAvailability(res.data);
    } catch { toast.error('Failed to check availability'); }
    finally { setAvailLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Medicine Search</div>
        <div className="page-sub">Find medicines available across the city network</div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Text search */}
        <div className="card">
          <div className="section-title">🔍 Search by Name</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="search-box" style={{ flex: 1 }}>
              <span style={{ color: 'var(--text-muted)' }}>💊</span>
              <input
                placeholder="Medicine name, generic name..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
              />
            </div>
            <button className="btn btn-primary" onClick={doSearch} disabled={loading}>
              {loading ? '...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Barcode lookup */}
        <div className="card">
          <div className="section-title">📷 Barcode Lookup</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="search-box" style={{ flex: 1 }}>
              <span style={{ color: 'var(--text-muted)' }}>🔢</span>
              <input
                placeholder="Scan or enter barcode..."
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doBarcodeLookup()}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <button className="btn btn-secondary" onClick={doBarcodeLookup}>Lookup</button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Use a barcode scanner device or camera to fill this field automatically
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Search Results ({searchResults.length})</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {searchResults.map(m => (
              <div key={m.id} style={{
                padding: 16, background: 'var(--bg-secondary)', borderRadius: 10,
                border: `1px solid ${selectedMedicine?.medicineId === m.id ? 'var(--accent)' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
                onClick={() => checkAvailability(m)}
              >
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>{m.name}</div>
                {m.genericName && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{m.genericName}</div>}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {m.category && <span className="badge badge-info">{m.category}</span>}
                  <span className="badge badge-neutral">{m.unit}</span>
                  {m.barcode && <span className="tracking-code">{m.barcode}</span>}
                </div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                  onClick={e => { e.stopPropagation(); checkAvailability(m); }}>
                  Check Availability →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Availability Results */}
      {selectedMedicine && (
        <div className="card">
          <div className="section-title">
            📍 Availability — {selectedMedicine.medicineName}
          </div>
          {availLoading ? (
            <div className="loading" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Searching nearby sources...</div>
          ) : availability.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-text">No availability found in the city network</div>
            </div>
          ) : (
            <>
              <div className="alert alert-info" style={{ marginBottom: 16, fontSize: 13 }}>
                🔒 Institution identities are anonymized. Full details revealed only after request is accepted.
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>Source</th><th>Available Qty</th><th>Nearest Batch Expiry</th><th>Distance</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {availability.map((a, idx) => (
                      <tr key={a.hospitalId}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {idx === 0 && <span className="badge badge-good">Nearest</span>}
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{a.hospitalCode}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: a.totalQuantity > 50 ? 'var(--success)' : 'var(--warning)' }}>
                          {a.totalQuantity}
                        </td>
                        <td style={{ fontSize: 13 }}>{a.nearestBatchExpiry}</td>
                        <td>
                          <span className="badge badge-neutral">{a.distanceKm} km</span>
                        </td>
                        <td>
                          <button className="btn btn-primary btn-sm"
                            onClick={() => setSelectedSupplier(a)}>
                            Request →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {selectedSupplier && selectedMedicine && (
        <RequestModal
          medicine={selectedMedicine}
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
          onSuccess={() => setSelectedSupplier(null)}
        />
      )}
    </div>
  );
}

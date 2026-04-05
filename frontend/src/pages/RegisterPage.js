import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    hospitalName: '', address: '', licenseNumber: '',
    contactPhone: '', contactEmail: '', type: 'HOSPITAL',
    latitude: '', longitude: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      delete payload.confirmPassword;
      if (payload.latitude) payload.latitude = parseFloat(payload.latitude);
      if (payload.longitude) payload.longitude = parseFloat(payload.longitude);
      await authAPI.register(payload);
      toast.success('Registration submitted! Awaiting city admin approval.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ alignItems: 'flex-start', padding: '40px 24px' }}>
      <div className="login-panel slide-up" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="login-brand" style={{ marginBottom: 24 }}>
          <div className="login-icon" style={{ width: 48, height: 48, fontSize: 22 }}>💊</div>
          <div className="login-title" style={{ fontSize: 22 }}>Register Institution</div>
          <div className="login-sub">Hospital or Pharmacy Registration</div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type */}
          <div className="form-group">
            <label className="form-label">Institution Type</label>
            <div className="tab-switcher">
              <button type="button" className={`tab-btn ${form.type === 'HOSPITAL' ? 'active' : ''}`}
                onClick={() => set('type', 'HOSPITAL')}>🏥 Hospital</button>
              <button type="button" className={`tab-btn ${form.type === 'PHARMACY' ? 'active' : ''}`}
                onClick={() => set('type', 'PHARMACY')}>💊 Pharmacy</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input className="form-control" placeholder="username" required
                value={form.username} onChange={e => set('username', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-control" placeholder="email@domain.com" required
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" className="form-control" placeholder="Min 8 characters" required
                value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input type="password" className="form-control" placeholder="Repeat password" required
                value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
            </div>
          </div>

          <div className="divider" />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            Institution Details
          </div>

          <div className="form-group">
            <label className="form-label">{form.type === 'HOSPITAL' ? 'Hospital' : 'Pharmacy'} Name *</label>
            <input className="form-control" placeholder="Full official name" required
              value={form.hospitalName} onChange={e => set('hospitalName', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Address *</label>
            <textarea className="form-control" placeholder="Full address" required rows={2}
              value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">License Number *</label>
            <input className="form-control" placeholder="Official license/registration number" required
              value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input className="form-control" placeholder="+91 XXXXX XXXXX"
                value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input type="email" className="form-control" placeholder="contact@hospital.com"
                value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Latitude (optional)</label>
              <input className="form-control" placeholder="e.g. 20.9374"
                value={form.latitude} onChange={e => set('latitude', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude (optional)</label>
              <input className="form-control" placeholder="e.g. 77.7796"
                value={form.longitude} onChange={e => set('longitude', e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

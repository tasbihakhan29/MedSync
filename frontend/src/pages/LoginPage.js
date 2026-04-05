import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const data = res.data;
      login(data, data.token);
      toast.success(`Welcome back, ${data.institutionName || data.username}!`);
      if (data.role === 'CITY_ADMIN') navigate('/admin/dashboard');
      else navigate('/hospital/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel slide-up">
        <div className="login-brand">
          <div className="login-icon">💊</div>
          <div className="login-title">MedSync City</div>
          <div className="login-sub">Medicine Coordination Platform</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-control"
              placeholder="Enter your username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="divider" />

        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          New hospital or pharmacy?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Register here
          </Link>
        </div>

        <div style={{ marginTop: 20, padding: 14, background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 12 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Demo Credentials</div>
          <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Admin: admin / Admin@123
          </div>
        </div>
      </div>
    </div>
  );
}

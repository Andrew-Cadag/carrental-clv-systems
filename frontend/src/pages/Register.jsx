import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/register', { ...formData, role: 'customer' });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const inputStyle = { width: '100%', height: '48px', padding: '0 16px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#111827', fontSize: '16px', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontSize: '14px', fontWeight: 600, color: '#374151', marginLeft: '4px' };

  return (
    <div style={{ fontFamily: 'Manrope, system-ui, sans-serif', backgroundColor: '#f6f7f7', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: '440px', backgroundColor: 'white', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(31,56,100,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#1F3864">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                  </svg>
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1F3864', margin: 0, letterSpacing: '-0.025em' }}>DriveEase</h1>
              </div>
              <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1a202c', margin: '0 0 8px 0' }}>Create Account</h2>
              <p style={{ color: '#64748b', margin: 0, textAlign: 'center' }}>Sign up to start booking your next ride</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Full Name</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="John Doe" required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@company.com" required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" required minLength={6} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Phone <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" style={inputStyle} />
              </div>

              <button type="submit" style={{ width: '100%', height: '48px', backgroundColor: '#1F3864', color: 'white', fontWeight: 'bold', fontSize: '16px', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(31,56,100,0.2)' }}>
                Create Account
              </button>

              {error && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#dc2626"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  <p style={{ fontSize: '14px', color: '#b91c1c', margin: 0 }}>{error}</p>
                </div>
              )}
              {success && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#16a34a"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  <p style={{ fontSize: '14px', color: '#166534', margin: 0 }}>{success}</p>
                </div>
              )}
            </form>

            {/* Login Link */}
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
              <p style={{ color: '#4b5563', fontSize: '14px', margin: 0 }}>
                Already have an account?
                <Link to="/login" style={{ color: '#1F3864', fontWeight: 'bold', textDecoration: 'none', marginLeft: '4px' }}>Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

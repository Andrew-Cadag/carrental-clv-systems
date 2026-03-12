import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalCars: 0, totalBookings: 0, totalRevenue: 0 });
  const [clvData, setClvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clvPage, setClvPage] = useState(1);
  const clvPerPage = 8;
  const { logout, token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const [carsRes, bookingsRes, clvRes] = await Promise.all([
        api.get('/cars'),
        api.get('/bookings'),
        api.get('/clv')
      ]);
      
      const cars = carsRes.data.cars;
      const bookings = bookingsRes.data.bookings;
      const revenue = bookings.reduce((sum, b) => sum + (b.status === 'completed' ? parseFloat(b.total_amount) : 0), 0);
      
      setStats({ totalCars: cars.length, totalBookings: bookings.length, totalRevenue: revenue });
      setClvData(clvRes.data.users);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getClvBadgeStyle = (tier) => {
    const styles = {
      high: { backgroundColor: '#d1fae5', color: '#065f46' },
      medium: { backgroundColor: '#fef3c7', color: '#b45309' },
      low: { backgroundColor: '#fee2e2', color: '#991b1b' }
    };
    return styles[tier] || styles.low;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope, system-ui, sans-serif' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Manrope, system-ui, sans-serif', backgroundColor: '#f6f7f7' }}>
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
      </button>
      <div className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />
      {/* Sidebar */}
      <aside className={`app-sidebar${sidebarOpen ? ' open' : ''}`} style={{ width: '256px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 16px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#1f3864', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
              </svg>
            </div>
            <div>
              <h1 style={{ color: '#1f3864', fontSize: '18px', fontWeight: 800, margin: 0, lineHeight: 1 }}>DriveEase</h1>
              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, margin: '2px 0 0 0' }}>Car Rentals</p>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', backgroundColor: '#1f3864', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              Dashboard
            </Link>
            <Link to="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              User Management
            </Link>
            <Link to="/admin/cars" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
              </svg>
              Fleet
            </Link>
            <Link to="/admin/bookings" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
              </svg>
              Reservations
            </Link>
            <Link to="/admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.16 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.04.64.09.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
              </svg>
              Settings
            </Link>
          </nav>
        </div>

        {/* Logout */}
        <div style={{ padding: '0 8px' }}>
          <button onClick={handleLogout} style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="app-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Header */}
        <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>Dashboard</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>{user?.name || 'Admin'}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1f3864', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 700 }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '24px 32px' }}>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
            {/* Total Cars */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1f3864">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
                </svg>
                <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Total Cars</p>
              </div>
              <p style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>{stats.totalCars}</p>
              <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
                Fleet status
              </div>
            </div>

            {/* Total Bookings */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1f3864">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                </svg>
                <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Total Bookings</p>
              </div>
              <p style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>{stats.totalBookings}</p>
              <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
                All time
              </div>
            </div>

            {/* Total Revenue */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1f3864">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                </svg>
                <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Total Revenue</p>
              </div>
              <p style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>{formatCurrency(stats.totalRevenue)}</p>
              <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
                Completed bookings
              </div>
            </div>
          </div>

          {/* CLV Distribution Chart */}
          {(() => {
            const high = clvData.filter(u => u.clv_tier === 'high').length;
            const medium = clvData.filter(u => u.clv_tier === 'medium').length;
            const low = clvData.filter(u => u.clv_tier === 'low').length;
            const total = clvData.length || 1;
            const r = 70, cx = 90, cy = 90, stroke = 20;
            const circ = 2 * Math.PI * r;
            const highPct = high / total, medPct = medium / total, lowPct = low / total;
            const highDash = circ * highPct, medDash = circ * medPct, lowDash = circ * lowPct;
            const highOffset = 0, medOffset = -(highDash), lowOffset = -(highDash + medDash);
            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
                  <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                    <svg width="180" height="180" viewBox="0 0 180 180">
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
                      {highPct > 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="#059669" strokeWidth={stroke} strokeDasharray={`${highDash} ${circ - highDash}`} strokeDashoffset={highOffset} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'stroke-dasharray 0.5s' }} />}
                      {medPct > 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="#d97706" strokeWidth={stroke} strokeDasharray={`${medDash} ${circ - medDash}`} strokeDashoffset={medOffset} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'stroke-dasharray 0.5s' }} />}
                      {lowPct > 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="#dc2626" strokeWidth={stroke} strokeDasharray={`${lowDash} ${circ - lowDash}`} strokeDashoffset={lowOffset} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'stroke-dasharray 0.5s' }} />}
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{clvData.length}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Customers</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#059669' }} />
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>High — {high}</p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{(highPct * 100).toFixed(0)}% of customers</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#d97706' }} />
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Medium — {medium}</p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{(medPct * 100).toFixed(0)}% of customers</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Low — {low}</p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{(lowPct * 100).toFixed(0)}% of customers</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0' }}>CLV Tier Breakdown</h3>
                  {[{ label: 'High Value', count: high, color: '#059669', bg: '#d1fae5' }, { label: 'Medium Value', count: medium, color: '#d97706', bg: '#fef3c7' }, { label: 'Low Value', count: low, color: '#dc2626', bg: '#fee2e2' }].map(tier => (
                    <div key={tier.label} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{tier.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: tier.color }}>{tier.count} ({((tier.count / total) * 100).toFixed(0)}%)</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(tier.count / total) * 100}%`, backgroundColor: tier.color, borderRadius: '4px', transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                      Average Spend: <span style={{ fontWeight: 700, color: '#0f172a' }}>₱{(clvData.reduce((s, u) => s + (u.total_spent || 0), 0) / total).toLocaleString('en-PH', { maximumFractionDigits: 0 })}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* CLV Table */}
          <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Customer CLV Predictions</h2>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1f3864', fontSize: '14px', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>
                Filter
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Customer Name</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Email</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', textAlign: 'center' }}>Total Rentals</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Total Spent</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Last Rental</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', textAlign: 'right' }}>CLV Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {clvData.slice((clvPage - 1) * clvPerPage, clvPage * clvPerPage).map((user, index) => (
                    <tr key={user.id} style={{ borderTop: index === 0 ? 'none' : '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{user.full_name}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{user.email}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b', textAlign: 'center' }}>{user.frequency || 0}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>₱{user.total_spent?.toFixed(2) || '0.00'}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{user.recency ? `${user.recency} days ago` : 'N/A'}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', ...getClvBadgeStyle(user.clv_tier) }}>
                          {user.clv_tier || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(() => {
              const totalPages = Math.ceil(clvData.length / clvPerPage);
              const start = (clvPage - 1) * clvPerPage + 1;
              const end = Math.min(clvPage * clvPerPage, clvData.length);
              return (
                <div style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                    Showing <span style={{ fontWeight: 700, color: '#0f172a' }}>{start}–{end}</span> of <span style={{ fontWeight: 700, color: '#0f172a' }}>{clvData.length}</span> customers
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => setClvPage(p => Math.max(1, p - 1))} disabled={clvPage === 1} style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', color: clvPage === 1 ? '#94a3b8' : '#64748b', cursor: clvPage === 1 ? 'not-allowed' : 'pointer', opacity: clvPage === 1 ? 0.5 : 1 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => setClvPage(page)} style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: page === clvPage ? '#1f3864' : 'white', color: page === clvPage ? 'white' : '#64748b', fontSize: '14px', fontWeight: 700, border: page === clvPage ? 'none' : '1px solid #e2e8f0', cursor: 'pointer' }}>{page}</button>
                    ))}
                    <button onClick={() => setClvPage(p => Math.min(totalPages, p + 1))} disabled={clvPage === totalPages} style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', color: clvPage === totalPages ? '#94a3b8' : '#64748b', cursor: clvPage === totalPages ? 'not-allowed' : 'pointer', opacity: clvPage === totalPages ? 0.5 : 1 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

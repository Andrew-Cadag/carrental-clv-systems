import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const StaffFleet = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) fetchCars();
  }, [token]);

  const fetchCars = async () => {
    try {
      const response = await api.get('/cars');
      setCars(response.data.cars);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const getStatusStyle = (status) => {
    const styles = {
      available: { backgroundColor: '#d1fae5', color: '#065f46' },
      rented: { backgroundColor: '#fef3c7', color: '#92400e' },
      maintenance: { backgroundColor: '#fee2e2', color: '#991b1b' }
    };
    return { padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, ...(styles[status] || styles.available) };
  };

  const formatPrice = (price) => `₱${parseFloat(price).toFixed(0)}/day`;

  const filteredCars = filterStatus === 'all' ? cars : cars.filter(c => c.status === filterStatus);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope, system-ui, sans-serif' }}>Loading...</div>;
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#1f3864', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/></svg>
            </div>
            <div>
              <h1 style={{ color: '#1f3864', fontSize: '18px', fontWeight: 800, margin: 0, lineHeight: 1 }}>DriveEase</h1>
              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, margin: '2px 0 0 0' }}>Staff Portal</p>
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link to="/staff/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
              Dashboard
            </Link>
            <Link to="/staff/bookings" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
              Bookings
            </Link>
            <Link to="/staff/fleet" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', backgroundColor: '#1f3864', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/></svg>
              Fleet
            </Link>
          </nav>
        </div>
        <div style={{ padding: '0 8px' }}>
          <button onClick={handleLogout} style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="app-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.025em' }}>Fleet</h2>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>{cars.length} vehicles in the fleet</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Staff Member</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1f3864', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 700 }}>S</div>
          </div>
        </header>

        <div style={{ padding: '24px 32px' }}>
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {['all', 'available', 'rented', 'maintenance'].map(status => (
              <button key={status} onClick={() => setFilterStatus(status)} style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none',
                backgroundColor: filterStatus === status ? '#1f3864' : 'white',
                color: filterStatus === status ? 'white' : '#64748b',
                ...(filterStatus !== status ? { border: '1px solid #e2e8f0' } : {})
              }}>
                {status.charAt(0).toUpperCase() + status.slice(1)} {status === 'all' ? `(${cars.length})` : `(${cars.filter(c => c.status === status).length})`}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', textAlign: 'left' }}>Brand</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', textAlign: 'left' }}>Model</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', textAlign: 'left' }}>Year</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', textAlign: 'left' }}>Plate</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', textAlign: 'left' }}>Price</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCars.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No cars found</td></tr>
                ) : filteredCars.map((car, index) => (
                  <tr key={car.id} style={{ borderTop: index === 0 ? 'none' : '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>C{String(car.id).padStart(3, '0')}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{car.brand}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{car.model}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{car.year}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b', fontFamily: 'monospace' }}>{car.plate_number}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{formatPrice(car.price_per_day)}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={getStatusStyle(car.status)}>
                        {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '16px 24px' }}>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                Showing <span style={{ fontWeight: 700, color: '#0f172a' }}>{filteredCars.length}</span> of <span style={{ fontWeight: 700, color: '#0f172a' }}>{cars.length}</span> vehicles
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffFleet;

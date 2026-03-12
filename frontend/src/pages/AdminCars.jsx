import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCar, setEditingCar] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    brand: '', model: '', year: '', plate_number: '', price_per_day: '', status: 'available'
  });
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchCars();
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCar) {
        await api.put(`/cars/${editingCar.id}`, formData);
        setMessage('Car updated successfully');
      } else {
        await api.post('/cars', formData);
        setMessage('Car added successfully');
      }
      setEditingCar(null);
      setShowForm(false);
      setFormData({ brand: '', model: '', year: '', plate_number: '', price_per_day: '', status: 'available' });
      fetchCars();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    setFormData({
      brand: car.brand,
      model: car.model,
      year: car.year,
      plate_number: car.plate_number,
      price_per_day: car.price_per_day,
      status: car.status
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingCar(null);
    setFormData({ brand: '', model: '', year: '', plate_number: '', price_per_day: '', status: 'available' });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCar(null);
    setFormData({ brand: '', model: '', year: '', plate_number: '', price_per_day: '', status: 'available' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    try {
      await api.delete(`/cars/${id}`);
      setMessage('Car deleted successfully');
      fetchCars();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusStyle = (status) => {
    if (status === 'available') {
      return { backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500, display: 'inline-flex', alignItems: 'center' };
    } else if (status === 'rented') {
      return { backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500, display: 'inline-flex', alignItems: 'center' };
    }
    return { backgroundColor: '#f3f4f6', color: '#374151', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500, display: 'inline-flex', alignItems: 'center' };
  };

  const formatPrice = (price) => {
    return `₱${parseFloat(price).toFixed(2)}`;
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
            <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s' }}>
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
            <Link to="/admin/cars" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', backgroundColor: '#1f3864', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
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
        <header style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input type="text" placeholder="Search fleet..." style={{ width: '100%', padding: '8px 16px 8px 40px', backgroundColor: '#f8fafc', border: 'none', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#1f3864', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Add New Car
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.025em' }}>Car Management</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Manage your vehicle inventory and rental availability.</p>
          </div>

          {message && (
            <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: '8px', backgroundColor: message.includes('success') ? '#d1fae5' : '#fee2e2', color: message.includes('success') ? '#065f46' : '#991b1b' }}>
              {message}
            </div>
          )}

          {/* Table */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>ID</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Brand</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Model</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Year</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Plate Number</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Price/Day</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Status</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car, index) => (
                    <tr key={car.id} style={{ borderTop: index === 0 ? 'none' : '1px solid #f1f5f9', backgroundColor: index % 2 === 1 ? '#f8fafc' : 'white' }}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>C{String(car.id).padStart(3, '0')}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{car.brand}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b', fontWeight: 500 }}>{car.model}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{car.year}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b', fontFamily: 'monospace' }}>{car.plate_number}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{formatPrice(car.price_per_day)}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={getStatusStyle(car.status)}>
                          {car.status === 'available' ? 'Available' : car.status === 'rented' ? 'Rented' : car.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button onClick={() => handleEdit(car)} style={{ padding: '6px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(car.id)} style={{ padding: '6px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Showing {cars.length} vehicles</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', color: '#64748b', cursor: 'pointer' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </button>
                <button style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', color: '#64748b', cursor: 'pointer' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Side Panel Overlay */}
      {showForm && (
        <>
          <div onClick={handleCloseForm} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 40 }} />
          {/* Side Panel */}
          <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '450px', height: '100vh', backgroundColor: 'white', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', zIndex: 50, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>{editingCar ? 'Edit Car' : 'Add New Car'}</h3>
              <button onClick={handleCloseForm} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>Brand</label>
                  <input type="text" placeholder="e.g. Toyota" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required style={{ width: '100%', padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>Model</label>
                  <input type="text" placeholder="e.g. Camry Hybrid" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required style={{ width: '100%', padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>Year</label>
                    <input type="number" placeholder="2024" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} required style={{ width: '100%', padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>Plate Number</label>
                    <input type="text" placeholder="ABC-1234" value={formData.plate_number} onChange={e => setFormData({...formData, plate_number: e.target.value})} required style={{ width: '100%', padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>Price Per Day ($)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>$</span>
                    <input type="number" step="0.01" placeholder="0.00" value={formData.price_per_day} onChange={e => setFormData({...formData, price_per_day: e.target.value})} required style={{ width: '100%', padding: '10px 16px 10px 32px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}>
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </form>
            </div>
            <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', gap: '12px' }}>
              <button onClick={handleCloseForm} style={{ flex: 1, padding: '10px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSubmit} style={{ flex: 1, padding: '10px 16px', backgroundColor: '#1f3864', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                {editingCar ? 'Update Vehicle' : 'Save Vehicle'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminCars;

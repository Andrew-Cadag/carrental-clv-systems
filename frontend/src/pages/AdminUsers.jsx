import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const USERS_PER_PAGE = 10;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', role: 'customer' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setMessage('User deleted successfully');
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenForm = () => {
    setEditingUser(null);
    setFormData({ full_name: '', email: '', password: '', role: 'customer' });
    setShowForm(true);
  };

  const handleEditUser = (u) => {
    setEditingUser(u);
    setFormData({ full_name: u.name || '', email: u.email || '', password: '', role: u.role || 'customer' });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ full_name: '', email: '', password: '', role: 'customer' });
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, { name: formData.full_name, role: formData.role });
        setMessage('User updated successfully');
      } else {
        await api.post('/auth/register', formData);
        setMessage('User created successfully');
      }
      handleCloseForm();
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || (editingUser ? 'Failed to update user' : 'Failed to create user'));
    }
  };

  const getRoleBadgeStyle = (role) => {
    if (role === 'admin') {
      return { backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center' };
    } else if (role === 'staff') {
      return { backgroundColor: '#fed7aa', color: '#c2410c', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center' };
    }
    return { backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center' };
  };

  const getTierBadgeStyle = (tier) => {
    if (tier === 'high' || tier === 'elite') {
      return { backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center' };
    } else if (tier === 'medium' || tier === 'gold') {
      return { backgroundColor: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center' };
    } else if (tier === 'low' || tier === 'silver') {
      return { backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center' };
    }
    return { backgroundColor: '#f3f4f6', color: '#6b7280', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredUsers = users.filter(u => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      String(u.id).includes(term) ||
      (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
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
            <Link to="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', backgroundColor: '#1f3864', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
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
        <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>User Management</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>{user?.name || 'Admin'}</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1f3864', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 700 }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>

          {/* Search and Add User */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
              <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search by ID, name, or email..." style={{ width: '100%', padding: '12px 16px 12px 48px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleOpenForm} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#1f3864', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              Add User
            </button>
          </div>
        </header>

        {/* Table Container */}
        <div style={{ padding: '24px 32px' }}>
          {message && (
            <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: '8px', backgroundColor: message.includes('success') ? '#d1fae5' : '#fee2e2', color: message.includes('success') ? '#065f46' : '#991b1b' }}>
              {message}
            </div>
          )}

          <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>ID</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Name</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Email</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Role</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', textAlign: 'center' }}>CLV Score</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>CLV Tier</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Joined Date</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user, index) => (
                    <tr key={user.id} style={{ borderTop: index === 0 ? 'none' : '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 500, color: '#64748b' }}>#{String(user.id).padStart(3, '0')}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af', fontSize: '12px', fontWeight: 700 }}>
                            {getInitials(user.name)}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{user.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{user.email}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={getRoleBadgeStyle(user.role)}>
                          {user.role?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>{user.clv_score || 'N/A'}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={getTierBadgeStyle(user.clv_tier)}>
                          {user.clv_tier ? user.clv_tier.charAt(0).toUpperCase() + user.clv_tier.slice(1) : 'New'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{formatDate(user.created_at)}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {user.role !== 'admin' && (
                            <>
                              <button onClick={() => handleEditUser(user)} style={{ padding: '6px 14px', backgroundColor: '#f1f5f9', color: '#1f3864', borderRadius: '6px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Edit</button>
                              <button onClick={() => handleDelete(user.id)} style={{ padding: '6px 14px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Delete</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                Showing <span style={{ fontWeight: 700, color: '#0f172a' }}>{filteredUsers.length === 0 ? 0 : startIndex + 1}</span> to <span style={{ fontWeight: 700, color: '#0f172a' }}>{Math.min(startIndex + USERS_PER_PAGE, filteredUsers.length)}</span> of <span style={{ fontWeight: 700, color: '#0f172a' }}>{filteredUsers.length}</span> users
              </p>
              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', color: safePage === 1 ? '#94a3b8' : '#64748b', cursor: safePage === 1 ? 'not-allowed' : 'pointer', opacity: safePage === 1 ? 0.5 : 1 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)} style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: page === safePage ? '#1f3864' : 'transparent', color: page === safePage ? 'white' : '#64748b', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', color: safePage === totalPages ? '#94a3b8' : '#64748b', cursor: safePage === totalPages ? 'not-allowed' : 'pointer', opacity: safePage === totalPages ? 0.5 : 1 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add User Side Panel */}
      {showForm && (
        <>
          <div onClick={handleCloseForm} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 40 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '450px', height: '100vh', backgroundColor: 'white', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', zIndex: 50, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={handleCloseForm} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
              <form onSubmit={handleSubmitUser} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>Full Name</label>
                  <input type="text" placeholder="e.g. John Doe" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required style={{ width: '100%', padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                {!editingUser && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>Email</label>
                    <input type="email" placeholder="e.g. john@driveease.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={{ width: '100%', padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}
                {!editingUser && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>Password</label>
                    <input type="password" placeholder="Minimum 6 characters" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required minLength={6} style={{ width: '100%', padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}
                {editingUser && (
                  <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', margin: '0 0 4px 0' }}>Email</p>
                    <p style={{ fontSize: '14px', color: '#0f172a', margin: 0 }}>{editingUser.email}</p>
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}>
                    <option value="customer">Customer</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </form>
            </div>
            <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', gap: '12px' }}>
              <button onClick={handleCloseForm} style={{ flex: 1, padding: '10px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSubmitUser} style={{ flex: 1, padding: '10px 16px', backgroundColor: '#1f3864', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                {editingUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUsers;

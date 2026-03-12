import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({ start_date: '', end_date: '', status: '' });
  const [chatBooking, setChatBooking] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef(null);
  const chatPollRef = useRef(null);
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchBookings();
      fetchUnreadCounts();
    }
  }, [token]);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const response = await api.get('/messages/unread-counts');
      setUnreadCounts(response.data.counts);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      setMessage(`Booking ${status} successfully`);
      fetchBookings();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Update failed');
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelBookingId) return;
    try {
      await api.delete(`/bookings/${cancelBookingId}`);
      setMessage('Booking cancelled successfully');
      setCancelBookingId(null);
      fetchBookings();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Cancel failed');
      setCancelBookingId(null);
    }
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    const sd = booking.start_date ? new Date(booking.start_date).toISOString().split('T')[0] : '';
    const ed = booking.end_date ? new Date(booking.end_date).toISOString().split('T')[0] : '';
    setEditForm({ start_date: sd, end_date: ed, status: booking.status });
  };

  const handleCloseEdit = () => {
    setEditingBooking(null);
    setEditForm({ start_date: '', end_date: '', status: '' });
  };

  const handleUpdateBooking = async () => {
    if (!editingBooking) return;
    try {
      if (editForm.status !== editingBooking.status) {
        await api.put(`/bookings/${editingBooking.id}/status`, { status: editForm.status });
      }
      if (editForm.start_date !== new Date(editingBooking.start_date).toISOString().split('T')[0] || editForm.end_date !== new Date(editingBooking.end_date).toISOString().split('T')[0]) {
        await api.put(`/bookings/${editingBooking.id}`, { start_date: editForm.start_date, end_date: editForm.end_date });
      }
      setMessage('Booking updated successfully');
      handleCloseEdit();
      fetchBookings();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Update failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openChat = (booking) => {
    setChatBooking(booking);
    setChatMessages([]);
    fetchChatMessages(booking.id);
    if (chatPollRef.current) clearInterval(chatPollRef.current);
    chatPollRef.current = setInterval(() => fetchChatMessages(booking.id), 5000);
  };

  const closeChat = () => {
    setChatBooking(null);
    setChatMessages([]);
    setChatInput('');
    if (chatPollRef.current) clearInterval(chatPollRef.current);
    fetchUnreadCounts();
  };

  const fetchChatMessages = async (bookingId) => {
    try {
      const response = await api.get(`/messages/${bookingId}`);
      setChatMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !chatBooking) return;
    setChatSending(true);
    try {
      await api.post('/messages', { booking_id: chatBooking.id, content: chatInput.trim() });
      setChatInput('');
      fetchChatMessages(chatBooking.id);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setChatSending(false);
    }
  };

  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
  };

  useEffect(() => {
    if (chatMessages.length > 0) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    return () => { if (chatPollRef.current) clearInterval(chatPollRef.current); };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadgeStyle = (status) => {
    const styles = {
      pending: { backgroundColor: '#fef3c7', color: '#b45309' },
      confirmed: { backgroundColor: '#dbeafe', color: '#1e40af' },
      active: { backgroundColor: '#d1fae5', color: '#065f46' },
      completed: { backgroundColor: '#f3f4f6', color: '#374151' },
      cancelled: { backgroundColor: '#fee2e2', color: '#991b1b' }
    };
    return { padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', ...(styles[status] || styles.pending) };
  };

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => b.status === 'active').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

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
            <Link to="/admin/cars" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
              </svg>
              Fleet
            </Link>
            <Link to="/admin/bookings" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', backgroundColor: '#1f3864', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
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
          <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>Reservations</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>{user?.name || 'Admin'}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1f3864', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 700 }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '24px 32px' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Total</p>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>{totalBookings}</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Pending</p>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#b45309', margin: '4px 0 0 0' }}>{pendingBookings}</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Active</p>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#065f46', margin: '4px 0 0 0' }}>{activeBookings}</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Completed</p>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#374151', margin: '4px 0 0 0' }}>{completedBookings}</p>
            </div>
          </div>

          {message && (
            <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: '8px', backgroundColor: message.includes('success') ? '#d1fae5' : '#fee2e2', color: message.includes('success') ? '#065f46' : '#991b1b' }}>
              {message}
            </div>
          )}

          {/* Table */}
          <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>ID</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Customer</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Vehicle</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Dates</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Total</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Status</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => (
                    <tr key={booking.id} style={{ borderTop: index === 0 ? 'none' : '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 500, color: '#64748b' }}>#{String(booking.id).padStart(3, '0')}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'block' }}>{booking.customer_name || 'Unknown'}</span>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{booking.customer_email || ''}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>{booking.brand} {booking.model}</span>
                        <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', fontFamily: 'monospace' }}>{booking.plate_number}</span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>
                        {formatDate(booking.start_date)} — {formatDate(booking.end_date)}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>₱{parseFloat(booking.total_amount).toFixed(2)}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={getStatusBadgeStyle(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button onClick={() => openChat(booking)} style={{ padding: '6px 12px', backgroundColor: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
                            Message
                            {unreadCounts[booking.id] > 0 && (
                              <span style={{ position: 'absolute', top: '-6px', right: '-6px', minWidth: '18px', height: '18px', borderRadius: '9px', backgroundColor: '#dc2626', color: 'white', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', boxSizing: 'border-box' }}>{unreadCounts[booking.id]}</span>
                            )}
                          </button>
                          {booking.status === 'pending' && (
                            <>
                              <button onClick={() => handleEditBooking(booking)} style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#1f3864', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                              <button onClick={() => handleStatusUpdate(booking.id, 'confirmed')} style={{ padding: '6px 12px', backgroundColor: '#1f3864', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Confirm</button>
                              <button onClick={() => setCancelBookingId(booking.id)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <>
                              <button onClick={() => handleEditBooking(booking)} style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#1f3864', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                              <button onClick={() => handleStatusUpdate(booking.id, 'active')} style={{ padding: '6px 12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Activate</button>
                              <button onClick={() => setCancelBookingId(booking.id)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                            </>
                          )}
                          {booking.status === 'active' && (
                            <>
                              <button onClick={() => handleEditBooking(booking)} style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#1f3864', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                              <button onClick={() => handleStatusUpdate(booking.id, 'completed')} style={{ padding: '6px 12px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Complete</button>
                              <button onClick={() => setCancelBookingId(booking.id)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No reservations found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                Showing <span style={{ fontWeight: 700, color: '#0f172a' }}>{bookings.length}</span> reservations
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button disabled style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', color: '#94a3b8', cursor: 'not-allowed', opacity: 0.5 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                </button>
                <button style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1f3864', color: 'white', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>1</button>
                <button style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', color: '#64748b', cursor: 'pointer' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {cancelBookingId && (
        <>
          <div onClick={() => setCancelBookingId(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 40 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', zIndex: 50, overflow: 'hidden' }}>
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#dc2626"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Cancel Booking</h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>Are you sure you want to cancel this booking? This will return the car to available status. This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setCancelBookingId(null)} style={{ flex: 1, padding: '12px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Go Back</button>
                <button onClick={handleCancelConfirm} style={{ flex: 1, padding: '12px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Yes, Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Booking Side Panel */}
      {/* Chat Side Panel */}
      {chatBooking && (
        <>
          <div onClick={closeChat} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 40 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '720px', height: '100vh', backgroundColor: 'white', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', zIndex: 50, display: 'flex' }}>
            {/* Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0' }}>
              {/* Chat Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={closeChat} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af', fontSize: '12px', fontWeight: 700 }}>
                  {chatBooking.customer_name ? chatBooking.customer_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{chatBooking.customer_name || 'Customer'}</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Booking #{chatBooking.id}</p>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f8fafc' }}>
                {chatMessages.length === 0 && (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>No messages yet. Start the conversation!</p>
                  </div>
                )}
                {chatMessages.map(msg => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '8px', maxWidth: '75%', flexDirection: isMine ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                        {!isMine && (
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                            {msg.sender_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div>
                          {!isMine && <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: '0 0 3px 0' }}>{msg.sender_name}</p>}
                          <div style={{
                            padding: '10px 14px', borderRadius: '16px', fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word',
                            backgroundColor: isMine ? '#1f3864' : 'white', color: isMine ? 'white' : '#0f172a',
                            borderBottomRightRadius: isMine ? '4px' : '16px', borderBottomLeftRadius: isMine ? '16px' : '4px',
                            border: isMine ? 'none' : '1px solid #e2e8f0'
                          }}>
                            {msg.content}
                          </div>
                          <p style={{ fontSize: '10px', color: '#94a3b8', margin: '3px 0 0 0', textAlign: isMine ? 'right' : 'left' }}>
                            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <textarea
                    value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={handleChatKeyPress}
                    placeholder="Write a message..." rows={1}
                    style={{ flex: 1, padding: '10px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'Manrope, system-ui, sans-serif', minHeight: '42px', maxHeight: '100px', boxSizing: 'border-box' }}
                  />
                  <button onClick={sendChatMessage} disabled={!chatInput.trim() || chatSending}
                    style={{ width: '42px', height: '42px', borderRadius: '12px', border: 'none', cursor: !chatInput.trim() || chatSending ? 'not-allowed' : 'pointer', backgroundColor: !chatInput.trim() || chatSending ? '#94a3b8' : '#1f3864', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Reservation Details Sidebar */}
            <div style={{ width: '260px', overflowY: 'auto', padding: '24px 20px', backgroundColor: '#f8fafc', flexShrink: 0 }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reservation</h4>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '16px' }}>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>{chatBooking.brand} {chatBooking.model}</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace', margin: '0 0 12px 0' }}>{chatBooking.plate_number}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 2px 0' }}>Start</p>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: 0 }}>{formatDate(chatBooking.start_date)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 2px 0' }}>End</p>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: 0 }}>{formatDate(chatBooking.end_date)}</p>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={getStatusBadgeStyle(chatBooking.status)}>{chatBooking.status.charAt(0).toUpperCase() + chatBooking.status.slice(1)}</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>₱{parseFloat(chatBooking.total_amount).toFixed(2)}</span>
                </div>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 6px 0' }}>Customer</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>{chatBooking.customer_name || 'Unknown'}</p>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{chatBooking.customer_email || ''}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {editingBooking && (
        <>
          <div onClick={handleCloseEdit} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 40 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '450px', height: '100vh', backgroundColor: 'white', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', zIndex: 50, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Edit Reservation</h3>
              <button onClick={handleCloseEdit} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Booking Info (read-only) */}
                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', margin: '0 0 8px 0' }}>Booking #{editingBooking.id}</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>{editingBooking.customer_name}</p>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{editingBooking.brand} {editingBooking.model} · {editingBooking.plate_number}</p>
                </div>

                {/* Start Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>Start Date</label>
                  <input type="date" value={editForm.start_date} onChange={e => setEditForm({...editForm, start_date: e.target.value})} style={{ width: '100%', padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {/* End Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>End Date</label>
                  <input type="date" value={editForm.end_date} onChange={e => setEditForm({...editForm, end_date: e.target.value})} style={{ width: '100%', padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {/* Status */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>Status</label>
                  <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} style={{ width: '100%', padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Current Total */}
                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', margin: '0 0 4px 0' }}>Current Total</p>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>₱{parseFloat(editingBooking.total_amount).toFixed(2)}</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Total will be recalculated if dates change</p>
                </div>
              </div>
            </div>
            <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', gap: '12px' }}>
              <button onClick={handleCloseEdit} style={{ flex: 1, padding: '10px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleUpdateBooking} style={{ flex: 1, padding: '10px 16px', backgroundColor: '#1f3864', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Save Changes</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminBookings;

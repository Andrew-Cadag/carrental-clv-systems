import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
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
      const response = await api.get('/bookings/my-bookings');
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      setMessage('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

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

  const getStatusBadge = (status) => {
    const map = {
      active: { backgroundColor: '#d1fae5', color: '#065f46' },
      pending: { backgroundColor: '#fef3c7', color: '#b45309' },
      completed: { backgroundColor: '#f3f4f6', color: '#374151' },
      cancelled: { backgroundColor: '#fee2e2', color: '#991b1b' },
      confirmed: { backgroundColor: '#dbeafe', color: '#1e40af' }
    };
    return { padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', ...(map[status] || map.pending) };
  };

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
              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, margin: '2px 0 0 0' }}>Car Rentals</p>
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link to="/customer/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
              Dashboard
            </Link>
            <Link to="/customer/cars" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/></svg>
              Browse Cars
            </Link>
            <Link to="/customer/bookings" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', backgroundColor: '#1f3864', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
              My Bookings
            </Link>
            <Link to="/customer/profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              Profile
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
          <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>My Bookings</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="header-user-name" style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>{user?.full_name || 'Customer'}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1f3864', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 700 }}>
              {user?.full_name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
          </div>
        </header>

        <div className="app-content" style={{ padding: '24px 32px' }}>
          {message && (
            <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: '8px', backgroundColor: message.includes('success') ? '#d1fae5' : '#fee2e2', color: message.includes('success') ? '#065f46' : '#991b1b' }}>
              {message}
            </div>
          )}

          <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div className="table-wrapper" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Vehicle</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Dates</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Total</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Status</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                        No bookings yet. <Link to="/customer/cars" style={{ color: '#1f3864', fontWeight: 700, textDecoration: 'none' }}>Browse cars</Link> to get started.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking, index) => (
                      <tr key={booking.id} style={{ borderTop: index === 0 ? 'none' : '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{booking.brand} {booking.model}</span>
                          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', fontFamily: 'monospace' }}>{booking.plate_number}</span>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{formatDate(booking.start_date)} — {formatDate(booking.end_date)}</td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>₱{parseFloat(booking.total_amount).toFixed(2)}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={getStatusBadge(booking.status)}>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => openChat(booking)} style={{ padding: '6px 12px', backgroundColor: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
                              Message
                              {unreadCounts[booking.id] > 0 && (
                                <span style={{ position: 'absolute', top: '-6px', right: '-6px', minWidth: '18px', height: '18px', borderRadius: '9px', backgroundColor: '#dc2626', color: 'white', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', boxSizing: 'border-box' }}>{unreadCounts[booking.id]}</span>
                              )}
                            </button>
                            {(booking.status === 'pending' || booking.status === 'active') && (
                              <button onClick={() => handleCancel(booking.id)} style={{ padding: '6px 16px', backgroundColor: 'white', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '16px 24px' }}>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                Showing <span style={{ fontWeight: 700, color: '#0f172a' }}>{bookings.length}</span> bookings
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Chat Side Panel */}
      {chatBooking && (
        <>
          <div onClick={closeChat} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 40 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '720px', height: '100vh', backgroundColor: 'white', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', zIndex: 50, display: 'flex' }}>
            {/* Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={closeChat} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1f3864', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 700 }}>DE</div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>DriveEase Support</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Booking #{chatBooking.id}</p>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f8fafc' }}>
                {chatMessages.length === 0 && (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>Send a message about your booking</p>
                  </div>
                )}
                {chatMessages.map(msg => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '8px', maxWidth: '75%', flexDirection: isMine ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                        {!isMine && (
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1f3864', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                            {msg.sender_name?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                        )}
                        <div>
                          {!isMine && <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: '0 0 3px 0' }}>{msg.sender_name} · <span style={{ textTransform: 'capitalize' }}>{msg.sender_role}</span></p>}
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
                  <span style={getStatusBadge(chatBooking.status)}>{chatBooking.status.charAt(0).toUpperCase() + chatBooking.status.slice(1)}</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>₱{parseFloat(chatBooking.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerBookings;

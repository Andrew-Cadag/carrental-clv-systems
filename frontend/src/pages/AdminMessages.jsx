import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [availableBookings, setAvailableBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const autoSelectedRef = useRef(false);

  useEffect(() => {
    if (token) {
      fetchConversations();
      fetchAvailableBookings();
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [token]);

  // Auto-select booking from URL param
  useEffect(() => {
    if (autoSelectedRef.current) return;
    const bookingParam = searchParams.get('booking');
    if (!bookingParam) return;
    const bookingId = parseInt(bookingParam);
    const conv = conversations.find(c => c.booking_id === bookingId);
    if (conv) { setSelectedBooking(conv); autoSelectedRef.current = true; return; }
    const avail = availableBookings.find(b => b.booking_id === bookingId);
    if (avail) { setSelectedBooking(avail); autoSelectedRef.current = true; }
  }, [conversations, availableBookings, searchParams]);

  useEffect(() => {
    if (selectedBooking) {
      fetchMessages(selectedBooking.booking_id);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => fetchMessages(selectedBooking.booking_id), 5000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedBooking]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBookings = async () => {
    try {
      const response = await api.get('/messages/bookings');
      setAvailableBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchMessages = async (bookingId) => {
    try {
      const response = await api.get(`/messages/${bookingId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedBooking) return;
    setSending(true);
    try {
      await api.post('/messages', {
        booking_id: selectedBooking.booking_id,
        content: newMessage.trim()
      });
      setNewMessage('');
      fetchMessages(selectedBooking.booking_id);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedBooking(conv);
  };

  const handleStartConversation = (booking) => {
    setSelectedBooking(booking);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status) => {
    const map = { pending: '#b45309', confirmed: '#1e40af', active: '#065f46', completed: '#374151', cancelled: '#991b1b' };
    return map[status] || '#64748b';
  };

  // Bookings that don't have conversations yet
  const existingBookingIds = conversations.map(c => c.booking_id);
  const newBookings = availableBookings.filter(b => !existingBookingIds.includes(b.booking_id));

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope, system-ui, sans-serif' }}>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Manrope, system-ui, sans-serif', backgroundColor: '#f6f7f7' }}>
      {/* Sidebar */}
      <aside style={{ width: '256px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 16px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0', flexShrink: 0 }}>
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
            <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
              Dashboard
            </Link>
            <Link to="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              User Management
            </Link>
            <Link to="/admin/cars" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/></svg>
              Fleet
            </Link>
            <Link to="/admin/bookings" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
              Reservations
            </Link>
            <Link to="/admin/messages" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', backgroundColor: '#1f3864', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
              Messages
            </Link>
            <Link to="/admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.16 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.04.64.09.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
              Settings
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

      {/* Messages Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Conversation List */}
        <div style={{ width: '340px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '24px 20px 16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Messages</h2>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* Existing Conversations */}
            {conversations.map(conv => (
              <div
                key={conv.booking_id}
                onClick={() => handleSelectConversation(conv)}
                style={{
                  padding: '16px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                  backgroundColor: selectedBooking?.booking_id === conv.booking_id ? '#f8fafc' : 'white',
                  transition: 'background-color 0.15s'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                    {getInitials(conv.customer_name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{conv.customer_name}</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8', flexShrink: 0 }}>{formatTime(conv.last_message_at)}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.last_message || 'No messages yet'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: getStatusColor(conv.booking_status), fontWeight: 700, textTransform: 'uppercase' }}>{conv.booking_status}</span>
                      <span style={{ fontSize: '11px', color: '#cbd5e1' }}>·</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{conv.brand} {conv.model}</span>
                      {conv.unread_count > 0 && (
                        <span style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#1f3864', color: 'white', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{conv.unread_count}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* New Bookings (no conversation yet) */}
            {newBookings.length > 0 && (
              <>
                <div style={{ padding: '12px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', margin: 0 }}>Start a conversation</p>
                </div>
                {newBookings.map(b => (
                  <div
                    key={b.booking_id}
                    onClick={() => handleStartConversation(b)}
                    style={{
                      padding: '14px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                      backgroundColor: selectedBooking?.booking_id === b.booking_id ? '#f8fafc' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: 700 }}>
                        {getInitials(b.customer_name)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{b.customer_name}</span>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>#{b.booking_id} · {b.brand} {b.model}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {conversations.length === 0 && newBookings.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No conversations yet</div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f6f7f7' }}>
          {selectedBooking ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '16px 24px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af', fontSize: '13px', fontWeight: 700 }}>
                    {getInitials(selectedBooking.customer_name)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{selectedBooking.customer_name}</h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Booking #{selectedBooking.booking_id} · {selectedBooking.brand} {selectedBooking.model}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: '#f1f5f9', color: getStatusColor(selectedBooking.booking_status || selectedBooking.status) }}>
                    {selectedBooking.booking_status || selectedBooking.status}
                  </span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{formatDate(selectedBooking.start_date)} – {formatDate(selectedBooking.end_date)}</span>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.length === 0 && (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="#cbd5e1" style={{ marginBottom: '12px' }}><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
                      <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                )}
                {messages.map(msg => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '8px', maxWidth: '65%', flexDirection: isMine ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                        {!isMine && (
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                            {getInitials(msg.sender_name)}
                          </div>
                        )}
                        <div>
                          {!isMine && <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: '0 0 4px 0' }}>{msg.sender_name}</p>}
                          <div style={{
                            padding: '10px 16px', borderRadius: '16px', fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word',
                            backgroundColor: isMine ? '#1f3864' : 'white',
                            color: isMine ? 'white' : '#0f172a',
                            borderBottomRightRadius: isMine ? '4px' : '16px',
                            borderBottomLeftRadius: isMine ? '16px' : '4px',
                            boxShadow: isMine ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                            border: isMine ? 'none' : '1px solid #e2e8f0'
                          }}>
                            {msg.content}
                          </div>
                          <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0', textAlign: isMine ? 'right' : 'left' }}>
                            {formatMessageTime(msg.created_at)}
                            {isMine && msg.is_read && <span style={{ marginLeft: '6px', color: '#1f3864' }}>Read</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div style={{ padding: '16px 24px', backgroundColor: 'white', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Write a message..."
                    rows={1}
                    style={{
                      flex: 1, padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
                      fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'Manrope, system-ui, sans-serif',
                      minHeight: '44px', maxHeight: '120px', boxSizing: 'border-box'
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    style={{
                      width: '44px', height: '44px', borderRadius: '12px', border: 'none', cursor: !newMessage.trim() || sending ? 'not-allowed' : 'pointer',
                      backgroundColor: !newMessage.trim() || sending ? '#94a3b8' : '#1f3864', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="#cbd5e1" style={{ marginBottom: '16px' }}><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#64748b', margin: '0 0 8px 0' }}>Select a conversation</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Choose a booking from the left to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;

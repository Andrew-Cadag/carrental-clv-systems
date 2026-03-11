const db = require('../config/db');

/**
 * Send a message related to a booking
 */
exports.sendMessage = async (req, res) => {
  try {
    const { booking_id, content } = req.body;
    const sender_id = req.user.id;
    const senderRole = req.user.role;

    if (!booking_id || !content) {
      return res.status(400).json({ message: 'Booking ID and content are required' });
    }

    // Verify booking exists
    const [bookings] = await db.execute('SELECT id, customer_id FROM bookings WHERE id = ?', [booking_id]);
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Auto-determine receiver
    let receiver_id;
    if (senderRole === 'customer') {
      // Customer sends to first admin, or first staff
      const [admins] = await db.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
      if (admins.length === 0) {
        const [staff] = await db.execute("SELECT id FROM users WHERE role = 'staff' LIMIT 1");
        if (staff.length === 0) {
          return res.status(400).json({ message: 'No admin or staff available to receive messages' });
        }
        receiver_id = staff[0].id;
      } else {
        receiver_id = admins[0].id;
      }
    } else {
      // Admin/staff sends to booking's customer
      receiver_id = bookings[0].customer_id;
    }

    const [result] = await db.execute(
      'INSERT INTO messages (booking_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)',
      [booking_id, sender_id, receiver_id, content]
    );

    res.status(201).json({
      message: 'Message sent',
      data: { id: result.insertId, booking_id, sender_id, receiver_id, content, is_read: false, created_at: new Date() }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all messages for a specific booking
 */
exports.getMessagesByBooking = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify booking exists and user has access
    const [bookings] = await db.execute('SELECT id, customer_id FROM bookings WHERE id = ?', [booking_id]);
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Customers can only see messages for their own bookings
    if (userRole === 'customer' && bookings[0].customer_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    const [messages] = await db.execute(
      `SELECT m.*, u.name as sender_name, u.role as sender_role
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.booking_id = ?
       ORDER BY m.created_at ASC`,
      [booking_id]
    );

    // Mark messages as read for the current user
    await db.execute(
      'UPDATE messages SET is_read = TRUE WHERE booking_id = ? AND receiver_id = ?',
      [booking_id, userId]
    );

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all conversations for admin/staff (grouped by booking)
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query;
    let params;

    if (userRole === 'customer') {
      // Customer sees only their booking conversations
      query = `
        SELECT 
          b.id as booking_id,
          b.start_date, b.end_date, b.status as booking_status,
          c.brand, c.model,
          u.name as customer_name,
          (SELECT content FROM messages WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM messages WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
          (SELECT COUNT(*) FROM messages WHERE booking_id = b.id AND receiver_id = ? AND is_read = FALSE) as unread_count
        FROM bookings b
        JOIN cars c ON b.car_id = c.id
        JOIN users u ON b.customer_id = u.id
        WHERE b.customer_id = ?
        AND EXISTS (SELECT 1 FROM messages WHERE booking_id = b.id)
        ORDER BY last_message_at DESC
      `;
      params = [userId, userId];
    } else {
      // Admin/staff sees all conversations
      query = `
        SELECT 
          b.id as booking_id,
          b.start_date, b.end_date, b.status as booking_status,
          c.brand, c.model,
          u.name as customer_name, u.id as customer_id,
          (SELECT content FROM messages WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM messages WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
          (SELECT COUNT(*) FROM messages WHERE booking_id = b.id AND receiver_id = ? AND is_read = FALSE) as unread_count
        FROM bookings b
        JOIN cars c ON b.car_id = c.id
        JOIN users u ON b.customer_id = u.id
        WHERE EXISTS (SELECT 1 FROM messages WHERE booking_id = b.id)
        ORDER BY last_message_at DESC
      `;
      params = [userId];
    }

    const [conversations] = await db.execute(query, params);
    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all bookings available for messaging (for starting new conversations)
 */
exports.getBookingsForMessaging = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query;
    let params = [];

    if (userRole === 'customer') {
      query = `
        SELECT b.id as booking_id, b.start_date, b.end_date, b.status,
          c.brand, c.model, b.customer_id
        FROM bookings b
        JOIN cars c ON b.car_id = c.id
        WHERE b.customer_id = ? AND b.status NOT IN ('cancelled')
        ORDER BY b.created_at DESC
      `;
      params = [userId];
    } else {
      query = `
        SELECT b.id as booking_id, b.start_date, b.end_date, b.status,
          c.brand, c.model, b.customer_id, u.name as customer_name
        FROM bookings b
        JOIN cars c ON b.car_id = c.id
        JOIN users u ON b.customer_id = u.id
        WHERE b.status NOT IN ('cancelled')
        ORDER BY b.created_at DESC
      `;
    }

    const [bookings] = await db.execute(query, params);
    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings for messaging error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get unread message counts grouped by booking_id for current user
 */
exports.getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.execute(
      'SELECT booking_id, COUNT(*) as unread_count FROM messages WHERE receiver_id = ? AND is_read = FALSE GROUP BY booking_id',
      [userId]
    );
    const counts = {};
    rows.forEach(r => { counts[r.booking_id] = r.unread_count; });
    res.json({ counts });
  } catch (error) {
    console.error('Get unread counts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

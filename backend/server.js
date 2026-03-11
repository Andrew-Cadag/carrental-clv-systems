require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/cars', require('./routes/car.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/clv', require('./routes/clv.routes'));
app.use('/api/messages', require('./routes/message.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const { protect, isAdmin } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Example protected route (only for logged-in users)
app.get('/api/protected', protect, (req, res) => {
  res.json({ message: `✅ Hello user ${req.user.userId}, you are authenticated!` });
});

// Example admin-only route (only for admin users)
app.get('/api/admin', protect, isAdmin, (req, res) => {
  res.json({ message: '✅ Welcome admin! You have access to admin routes.' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

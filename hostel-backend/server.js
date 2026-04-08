const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ✅ ADD THIS LINE (VERY IMPORTANT)
require('./config/db');

const authRoutes    = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const adminRoutes   = require('./routes/admin.routes');

const app = express();

const allowedOrigins = new Set([
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.has(origin) ||
      /^https:\/\/hostel-allotment.*\.vercel\.app$/.test(origin);

    if (isAllowed) return callback(null, true);

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth',    authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin',   adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Hostel Allotment API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

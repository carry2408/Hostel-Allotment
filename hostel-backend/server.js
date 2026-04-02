const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ✅ ADD THIS LINE (VERY IMPORTANT)
require('./config/db');

const authRoutes    = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const adminRoutes   = require('./routes/admin.routes');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'hostel-allotment-6913ir8aj-veeresh-s-projects.vercel.app'
  ],
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
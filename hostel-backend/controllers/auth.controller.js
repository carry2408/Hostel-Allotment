const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Student register
exports.register = async (req, res) => {
  const { name, usn, email, password } = req.body;

  // ✅ include name validation
  if (!name || !usn || !email || !password)
    return res.status(400).json({
      message: 'Name, USN, email and password are required'
    });

  try {
    const [existing] = await pool.query(
      'SELECT id FROM students WHERE usn = ? OR email = ?',
      [usn, email]
    );

    if (existing.length > 0)
      return res.status(409).json({
        message: 'USN or email already registered'
      });

    const password_hash = await bcrypt.hash(password, 10);

    // ✅ FIXED INSERT (added name)
    const [result] = await pool.query(
      'INSERT INTO students (name, usn, email, password_hash) VALUES (?, ?, ?, ?)',
      [name, usn, email, password_hash]
    );

    const token = generateToken({
      id: result.insertId,
      usn,
      role: 'student',
    });

    res.status(201).json({
      message: 'Registered successfully',
      token
    });

  } catch (err) {
    console.error(err); // 🔥 helpful debug
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};

// Student login
exports.login = async (req, res) => {
  const { usn, password } = req.body;

  if (!usn || !password)
    return res.status(400).json({ message: 'USN and password are required' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM students WHERE usn = ?',
      [usn]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: 'Student not found' });

    const student = rows[0];
    const isMatch = await bcrypt.compare(password, student.password_hash);

    if (!isMatch)
      return res.status(401).json({ message: 'Incorrect password' });

    const token = generateToken({
      id:   student.id,
      usn:  student.usn,
      role: 'student',
    });

    res.json({
      message: 'Login successful',
      token,
      student: {
        id:     student.id,
        usn:    student.usn,
        email:  student.email,
        status: student.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin login
exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'Username and password are required' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: 'Admin not found' });

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch)
      return res.status(401).json({ message: 'Incorrect password' });

    const token = generateToken({
      id:       admin.id,
      username: admin.username,
      role:     'admin',
    });

    res.json({ message: 'Admin login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
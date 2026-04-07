const pool = require('../config/db');
const multer = require('multer');
const path = require('path');

/* ================= HELPER ================= */

const getCurrentYear = async (conn = pool) => {
  const [[row]] = await conn.query(
    "SELECT setting_value FROM system_settings WHERE setting_key='current_year'"
  );
  return row.setting_value;
};

/* ================= UPLOAD ================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `${req.user.usn}_${Date.now()}${path.extname(file.originalname)}`),
});

exports.upload = multer({ storage });

/* ================= PROFILE ================= */

exports.updateProfile = async (req, res) => {
  const { cgpa, name } = req.body;
  const student_id = req.user.id;
  const doc_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!cgpa || !name)
    return res.status(400).json({ message: 'Name and CGPA required' });

  if (cgpa < 0 || cgpa > 10)
    return res.status(400).json({ message: 'Invalid CGPA' });

  const currentYear = await getCurrentYear();

  const [locked] = await pool.query(
    'SELECT is_locked FROM applications WHERE student_id=? AND year=?',
    [student_id, currentYear]
  );

  if (locked.length && locked[0].is_locked)
    return res.status(403).json({ message: 'Application locked' });

  const fields = doc_url
    ? 'name=?, cgpa=?, doc_url=?'
    : 'name=?, cgpa=?';

  const values = doc_url
    ? [name, cgpa, doc_url, student_id]
    : [name, cgpa, student_id];

  await pool.query(
    `UPDATE students SET ${fields} WHERE id=?`,
    values
  );

  res.json({ message: 'Profile updated' });
};

exports.getProfile = async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, usn, email, cgpa, doc_url, status FROM students WHERE id=?',
    [req.user.id]
  );

  res.json(rows[0]);
};

/* ================= PREFERENCES ================= */

exports.submitPreferences = async (req, res) => {
  const { preferences } = req.body;
  const student_id = req.user.id;
  const currentYear = await getCurrentYear();

  if (!preferences || preferences.length === 0)
    return res.status(400).json({ message: 'Preferences required' });

  const [settings] = await pool.query(
    'SELECT setting_value FROM system_settings WHERE setting_key="application_phase"'
  );

  if (settings[0].setting_value !== 'open')
    return res.status(403).json({ message: 'Applications closed' });

  const [student] = await pool.query(
    'SELECT cgpa, doc_url FROM students WHERE id=?',
    [student_id]
  );

  if (!student[0].cgpa || !student[0].doc_url)
    return res.status(400).json({ message: 'Complete profile first' });

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [existing] = await conn.query(
      'SELECT id, is_locked FROM applications WHERE student_id=? AND year=?',
      [student_id, currentYear]
    );

    let app_id;

    if (!existing.length) {
      const [app] = await conn.query(
        'INSERT INTO applications (student_id, year) VALUES (?, ?)',
        [student_id, currentYear]
      );
      app_id = app.insertId;

      await conn.query(
        'UPDATE students SET status="applied" WHERE id=?',
        [student_id]
      );
    } else {
      if (existing[0].is_locked)
        throw new Error('Application locked');

      app_id = existing[0].id;

      await conn.query(
        'DELETE FROM preferences WHERE application_id=?',
        [app_id]
      );
    }

    for (const p of preferences) {
      await conn.query(
        'INSERT INTO preferences (application_id, room_id, priority, year) VALUES (?, ?, ?, ?)',
        [app_id, p.room_id, p.priority, currentYear]
      );
    }

    await conn.commit();
    res.json({ message: 'Preferences saved' });

  } catch (err) {
    await conn.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
};

/* ================= ALLOTMENT ================= */

exports.getAllotment = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.round, a.allotted_at, a.is_on_hold,
              r.block, r.room_number, r.type, r.fee
       FROM allotments a
       JOIN rooms r ON a.room_id = r.id
       WHERE a.student_id = ?`,
      [req.user.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: 'No allotment found' });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ================= ROOMS ================= */

exports.getAllRoomsForPreferences = async (req, res) => {
  const [rooms] = await pool.query(
    `SELECT *, (current_occupancy < capacity) AS is_available FROM rooms`
  );
  res.json(rooms);
};

exports.getAvailableRooms = async (req, res) => {
  const [settings] = await pool.query(
    'SELECT setting_value FROM system_settings WHERE setting_key="round2_open"'
  );

  if (settings[0].setting_value !== 'true')
    return res.status(403).json({ message: 'Round 2 closed' });

  const [rooms] = await pool.query(
    'SELECT * FROM rooms WHERE current_occupancy < capacity'
  );

  res.json(rooms);
};

/* ================= SWAP ================= */

exports.getSwapRequests = async (req, res) => {
  const student_id = req.user.id;
  const currentYear = await getCurrentYear();

  try {
    const [incoming] = await pool.query(
      `SELECT 
          sr.id,
          s.name AS requester_name,
          s.usn AS requester_usn,
          r1.block AS their_block,
          r1.room_number AS their_room,
          r2.block AS your_block,
          r2.room_number AS your_room,
          sr.status,
          sr.created_at
       FROM swap_requests sr
       JOIN students s ON sr.requester_id = s.id
       JOIN rooms r1 ON sr.requester_room_id = r1.id
       JOIN rooms r2 ON sr.target_room_id = r2.id
       WHERE sr.target_id=? AND sr.year=? AND sr.status='pending'`,
      [student_id, currentYear]
    );

    const [outgoing] = await pool.query(
      `SELECT 
          sr.id,
          s.name AS target_name,
          s.usn AS target_usn,
          r1.block AS your_block,
          r1.room_number AS your_room,
          r2.block AS their_block,
          r2.room_number AS their_room,
          sr.status,
          sr.created_at
       FROM swap_requests sr
       JOIN students s ON sr.target_id = s.id
       JOIN rooms r1 ON sr.requester_room_id = r1.id
       JOIN rooms r2 ON sr.target_room_id = r2.id
       WHERE sr.requester_id=? AND sr.year=? AND sr.status='pending'`,
      [student_id, currentYear]
    );

    res.json({ incoming, outgoing });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.requestSwap = async (req, res) => {
  const { target_usn } = req.body;
  const requester_id = req.user.id;
  const currentYear = await getCurrentYear();

  if (!target_usn)
    return res.status(400).json({ message: 'Target USN required' });

  try {
    const [[target]] = await pool.query(
      'SELECT id FROM students WHERE usn=?',
      [target_usn]
    );

    if (!target)
      return res.status(404).json({ message: 'Target student not found' });

    if (target.id === requester_id)
      return res.status(400).json({ message: 'Cannot swap with yourself' });

    const [[r1]] = await pool.query(
      'SELECT room_id FROM allotments WHERE student_id=? AND year=?',
      [requester_id, currentYear]
    );

    const [[r2]] = await pool.query(
      'SELECT room_id FROM allotments WHERE student_id=? AND year=?',
      [target.id, currentYear]
    );

    if (!r1 || !r2)
      return res.status(400).json({ message: 'Both students must have allotment' });

    const [existing] = await pool.query(
      `SELECT * FROM swap_requests 
       WHERE ((requester_id=? AND target_id=?) 
          OR (requester_id=? AND target_id=?))
       AND status='pending' AND year=?`,
      [requester_id, target.id, target.id, requester_id, currentYear]
    );

    if (existing.length)
      return res.status(400).json({ message: 'Swap request already exists' });

    await pool.query(
      `INSERT INTO swap_requests 
       (requester_id, target_id, requester_room_id, target_room_id, year)
       VALUES (?, ?, ?, ?, ?)`,
      [requester_id, target.id, r1.room_id, r2.room_id, currentYear]
    );

    res.json({ message: 'Swap request sent' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.respondSwap = async (req, res) => {
  const { action } = req.body;
  const id = req.params.id;
  const currentYear = await getCurrentYear();

  if (!['accepted', 'rejected'].includes(action))
    return res.status(400).json({ message: 'Invalid action' });

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 🔒 Lock swap row
    const [[swap]] = await conn.query(
      `SELECT * FROM swap_requests 
       WHERE id=? AND status='pending' AND year=? 
       FOR UPDATE`,
      [id, currentYear]
    );

    if (!swap) {
      await conn.rollback();
      return res.status(404).json({ message: 'Request not found' });
    }

    if (swap.target_id !== req.user.id) {
      await conn.rollback();
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (action === 'accepted') {
      // 🔒 Lock both students' allotments
      const [[reqAllot]] = await conn.query(
        `SELECT room_id FROM allotments 
         WHERE student_id=? AND year=? 
         FOR UPDATE`,
        [swap.requester_id, currentYear]
      );

      const [[targetAllot]] = await conn.query(
        `SELECT room_id FROM allotments 
         WHERE student_id=? AND year=? 
         FOR UPDATE`,
        [swap.target_id, currentYear]
      );

      if (!reqAllot || !targetAllot) {
        throw new Error('Both students must have valid allotments');
      }

      const requesterRoom = reqAllot.room_id;
      const targetRoom    = targetAllot.room_id;

      // 🔒 Lock both rooms
      await conn.query(
        `SELECT id FROM rooms WHERE id IN (?, ?) FOR UPDATE`,
        [requesterRoom, targetRoom]
      );

      // ✅ Swap rooms
      await conn.query(
        `UPDATE allotments SET room_id=? 
         WHERE student_id=? AND year=?`,
        [targetRoom, swap.requester_id, currentYear]
      );

      await conn.query(
        `UPDATE allotments SET room_id=? 
         WHERE student_id=? AND year=?`,
        [requesterRoom, swap.target_id, currentYear]
      );

      // ❗ No occupancy change needed because it's a swap (1:1 exchange)

      // ❌ Cancel all other pending swaps for both users
      await conn.query(
        `UPDATE swap_requests 
         SET status='cancelled' 
         WHERE (requester_id IN (?, ?) OR target_id IN (?, ?))
         AND id != ? AND status='pending' AND year=?`,
        [
          swap.requester_id,
          swap.target_id,
          swap.requester_id,
          swap.target_id,
          id,
          currentYear
        ]
      );
    }

    // ✅ Update current request status
    await conn.query(
      `UPDATE swap_requests SET status=? WHERE id=?`,
      [action, id]
    );

    await conn.commit();

    res.json({ message: `Swap ${action}` });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Swap failed', error: err.message });
  } finally {
    conn.release();
  }
};

/* ================= HOLD ================= */

exports.holdRoom = async (req, res) => {
  const student_id = req.user.id;
  const currentYear = await getCurrentYear();

  const [rows] = await pool.query(
    'SELECT * FROM allotments WHERE student_id=? AND year=?',
    [student_id, currentYear]
  );

  if (!rows.length)
    return res.status(404).json({ message: 'No allotment found' });

  await pool.query(
    `UPDATE allotments SET is_on_hold=true WHERE student_id=? AND year=?`,
    [student_id, currentYear]
  );

  res.json({ message: 'Room put on hold' });
};

/* ================= UPGRADE ================= */

exports.upgradeRoom = async (req, res) => {
  const { room_id } = req.body;
  const student_id = req.user.id;
  const currentYear = await getCurrentYear();

  if (!room_id)
    return res.status(400).json({ message: 'Room ID required' });

  const [rows] = await pool.query(
    'SELECT * FROM allotments WHERE student_id=? AND year=?',
    [student_id, currentYear]
  );

  if (!rows.length)
    return res.status(404).json({ message: 'No allotment found' });

  await pool.query(
    `UPDATE allotments 
     SET room_id=?, round='round2', is_on_hold=true
     WHERE student_id=? AND year=?`,
    [room_id, student_id, currentYear]
  );

  res.json({ message: 'Room upgraded' });
};

/* ================= CONFIRM ================= */

exports.confirmAllotment = async (req, res) => {
  const student_id = req.user.id;

  try {
    const [allotment] = await pool.query(
      'SELECT id, is_on_hold FROM allotments WHERE student_id = ?',
      [student_id]
    );

    if (allotment.length === 0)
      return res.status(404).json({ message: 'No allotment found' });

    if (!allotment[0].is_on_hold)
      return res.status(400).json({ message: 'Already confirmed' });

    await pool.query(
      'UPDATE allotments SET is_on_hold = false WHERE student_id = ?',
      [student_id]
    );

    res.json({ message: 'Allotment confirmed successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
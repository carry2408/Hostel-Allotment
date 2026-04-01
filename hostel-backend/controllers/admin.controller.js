const pool = require('../config/db');
const allotmentService = require('../services/allotment.service');

/* ================= HELPER ================= */

const getCurrentYear = async () => {
  const [[row]] = await pool.query(
    "SELECT setting_value FROM system_settings WHERE setting_key='current_year'"
  );
  return row.setting_value;
};

const getYearStatus = async () => {
  const [[row]] = await pool.query(
    "SELECT setting_value FROM system_settings WHERE setting_key='year_status'"
  );
  return row.setting_value;
};

/* ================= ROOMS ================= */

exports.addRoom = async (req, res) => {
  const { block, room_number, type, fee, capacity } = req.body;

  if (!block || !room_number || !type || !fee || !capacity)
    return res.status(400).json({ message: 'All fields are required' });

  if (!['R', 'S', 'N', 'G'].includes(block))
    return res.status(400).json({ message: 'Invalid block' });

  if (!['single', 'double'].includes(type))
    return res.status(400).json({ message: 'Invalid type' });

  const [existing] = await pool.query(
    'SELECT id FROM rooms WHERE block=? AND room_number=?',
    [block, room_number]
  );

  if (existing.length)
    return res.status(409).json({ message: 'Room exists' });

  await pool.query(
    'INSERT INTO rooms (block, room_number, type, fee, capacity) VALUES (?, ?, ?, ?, ?)',
    [block, room_number, type, fee, capacity]
  );

  res.json({ message: 'Room added' });
};

exports.getAllRooms = async (req, res) => {
  const [rooms] = await pool.query(
    'SELECT * FROM rooms ORDER BY block, room_number'
  );
  res.json(rooms);
};

exports.deleteRoom = async (req, res) => {
  const { id } = req.params;

  const [room] = await pool.query(
    'SELECT current_occupancy FROM rooms WHERE id=?',
    [id]
  );

  if (!room.length)
    return res.status(404).json({ message: 'Not found' });

  if (room[0].current_occupancy > 0)
    return res.status(400).json({ message: 'Room occupied' });

  await pool.query('DELETE FROM rooms WHERE id=?', [id]);

  res.json({ message: 'Deleted' });
};

/* ================= STUDENTS ================= */

exports.getAllStudents = async (req, res) => {
  const [students] = await pool.query(
    'SELECT id, name, usn, email, cgpa, status FROM students ORDER BY cgpa DESC'
  );
  res.json(students);
};

/* ================= ALLOTMENTS ================= */

exports.getAllAllotments = async (req, res) => {
  const currentYear = await getCurrentYear();

  const [data] = await pool.query(
    `SELECT a.id, a.round, a.allotted_at, a.is_on_hold,
            s.name, s.usn, s.cgpa,
            r.block, r.room_number, r.type
     FROM allotments a
     JOIN students s ON a.student_id = s.id
     JOIN rooms r ON a.room_id = r.id
     WHERE a.year=?
     ORDER BY s.cgpa DESC`,
    [currentYear]
  );

  res.json(data);
};

/* ================= APPLICATION CONTROL ================= */

exports.openApplications = async (req, res) => {
  await pool.query(
    'UPDATE system_settings SET setting_value="open" WHERE setting_key="application_phase"'
  );

  res.json({ message: 'Applications opened' });
};

exports.closeApplications = async (req, res) => {
  try {
    const currentYear = await getCurrentYear();

    await pool.query(
      'UPDATE system_settings SET setting_value="closed" WHERE setting_key="application_phase"'
    );

    await pool.query(
      'UPDATE applications SET is_locked = true WHERE year = ?',
      [currentYear]
    );

    await allotmentService.runRound1();

    res.json({ message: 'Applications closed & allotment done' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Allotment failed' });
  }
};

/* ================= ROUND 2 ================= */

exports.openRound2 = async (req, res) => {
  await pool.query(
    'UPDATE system_settings SET setting_value="true" WHERE setting_key="round2_open"'
  );

  res.json({ message: 'Round 2 opened' });
};

exports.closeRound2 = async (req, res) => {
  await pool.query(
    'UPDATE system_settings SET setting_value="false" WHERE setting_key="round2_open"'
  );

  await pool.query(
    `UPDATE students SET status='allotted'
     WHERE id IN (SELECT student_id FROM allotments)`
  );

  await pool.query(
    `UPDATE students SET status='not_allotted'
     WHERE status='applied'`
  );

  res.json({ message: 'Round 2 closed' });
};

/* ================= YEAR CONTROL ================= */

// 🔥 START NEW YEAR (ONLY IF PREVIOUS COMPLETED)
exports.startNewYear = async (req, res) => {
  const { year } = req.body;

  if (!year)
    return res.status(400).json({ message: 'Year required' });

  const status = await getYearStatus();

  if (status === 'active') {
    return res.status(400).json({
      message: 'End current allotment before starting new year'
    });
  }

  await pool.query(
    "UPDATE system_settings SET setting_value=? WHERE setting_key='current_year'",
    [year]
  );

  await pool.query(
    "UPDATE system_settings SET setting_value='active' WHERE setting_key='year_status'"
  );

  // reset rooms
  await pool.query(`UPDATE rooms SET current_occupancy = 0`);

  res.json({ message: `New year ${year} started` });
};

// 🔥 END FULL ALLOTMENT
exports.endFullAllotment = async (req, res) => {
  try {
    const currentYear = await getCurrentYear();

    await pool.query(
      "UPDATE system_settings SET setting_value='completed' WHERE setting_key='year_status'"
    );

    await pool.query(
      "UPDATE rooms SET current_occupancy = 0"
    );

    res.json({
      message: `Allotment for ${currentYear} completed`
    });

  } catch (err) {
    res.status(500).json({ message: 'Error ending allotment' });
  }
};

/* ================= OVERRIDE ================= */

exports.overrideAllotment = async (req, res) => {
  const { student_id, room_id } = req.body;
  const currentYear = await getCurrentYear();

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [existing] = await conn.query(
      'SELECT room_id FROM allotments WHERE student_id=? AND year=?',
      [student_id, currentYear]
    );

    if (existing.length) {
      await conn.query(
        'UPDATE rooms SET current_occupancy = current_occupancy - 1 WHERE id=?',
        [existing[0].room_id]
      );
    }

    await conn.query(
      `INSERT INTO allotments (student_id, room_id, round, year)
       VALUES (?, ?, 'round1', ?)
       ON DUPLICATE KEY UPDATE room_id=?, is_on_hold=false`,
      [student_id, room_id, currentYear, room_id]
    );

    await conn.query(
      'UPDATE rooms SET current_occupancy = current_occupancy + 1 WHERE id=?',
      [room_id]
    );

    await conn.query(
      'UPDATE students SET status="allotted" WHERE id=?',
      [student_id]
    );

    await conn.commit();
    res.json({ message: 'Override done' });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Override failed' });
  } finally {
    conn.release();
  }
};

const fs = require('fs');
const path = require('path');

exports.exportAndReset = async (req, res) => {
  try {
    const tables = [
      'students',
      'rooms',
      'applications',
      'preferences',
      'allotments',
      'swap_requests'
    ];

    const backup = {};

    // 🔥 fetch all data
    for (const table of tables) {
      const [rows] = await pool.query(`SELECT * FROM ${table}`);
      backup[table] = rows;
    }

    // 🔥 save JSON file
    const fileName = `backup_${Date.now()}.json`;
    const filePath = path.join(__dirname, '..', 'backups', fileName);

    fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));

    // 🔥 clear tables
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const table of tables.reverse()) {
      await pool.query(`TRUNCATE TABLE ${table}`);
    }

    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    res.json({
      message: 'Backup created & system reset',
      file: fileName
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error exporting data' });
  }
};
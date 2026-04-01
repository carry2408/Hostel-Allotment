const pool = require('../config/db');

const getCurrentYear = async (conn) => {
  const [[row]] = await conn.query(
    "SELECT setting_value FROM system_settings WHERE setting_key='current_year'"
  );
  return row.setting_value;
};

exports.runRound1 = async () => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const currentYear = await getCurrentYear(conn);

    // 🔥 Reset only current year data
    await conn.query(`DELETE FROM allotments WHERE year=?`, [currentYear]);
    await conn.query(`UPDATE rooms SET current_occupancy = 0`);
    await conn.query(`UPDATE students SET status='applied'`);

    // Fetch applications
    const [applications] = await conn.query(
      `SELECT 
         a.id AS application_id,
         a.student_id,
         a.submitted_at,
         s.cgpa
       FROM applications a
       JOIN students s ON a.student_id = s.id
       WHERE a.is_locked = true AND a.year=? AND s.cgpa IS NOT NULL
       ORDER BY s.cgpa DESC, a.submitted_at ASC`,
      [currentYear]
    );

    for (const app of applications) {

      const [preferences] = await conn.query(
        `SELECT room_id
         FROM preferences
         WHERE application_id=? AND year=?
         ORDER BY priority ASC`,
        [app.application_id, currentYear]
      );

      let allotted = false;

      for (const pref of preferences) {

        const [room] = await conn.query(
          `SELECT id FROM rooms
           WHERE id=? AND current_occupancy < capacity
           FOR UPDATE`,
          [pref.room_id]
        );

        if (!room.length) continue;

        await conn.query(
          `INSERT INTO allotments (student_id, room_id, round, year)
           VALUES (?, ?, 'round1', ?)`,
          [app.student_id, room[0].id, currentYear]
        );

        await conn.query(
          `UPDATE rooms SET current_occupancy = current_occupancy + 1 WHERE id=?`,
          [room[0].id]
        );

        await conn.query(
          `UPDATE students SET status='allotted' WHERE id=?`,
          [app.student_id]
        );

        allotted = true;
        break;
      }

      if (!allotted) {
        await conn.query(
          `UPDATE students SET status='not_allotted' WHERE id=?`,
          [app.student_id]
        );
      }
    }

    await conn.commit();
    return { message: 'Round 1 allotment completed' };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
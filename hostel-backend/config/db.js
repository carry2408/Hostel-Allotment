const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,

  // ✅ ADD SSL (VERY IMPORTANT)
  ssl: {
    rejectUnauthorized: false
  }
});

// ✅ TEST CONNECTION (IMPORTANT)
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to DB");
    connection.release();
  } catch (err) {
    console.error("❌ DB ERROR:", err);
  }
})();

module.exports = pool;
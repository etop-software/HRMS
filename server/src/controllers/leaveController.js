const pool = require('../config/Pdb'); // Assuming you have a configured pool for PostgreSQL

// Create a new leave
const createLeave = async (req, res) => {
  const { leaveName, leaveCode } = req.body;

  if (!leaveName || !leaveCode) {
    return res.status(400).json({ message: "leaveName and leaveCode are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO leaves (leave_name, leave_code)
       VALUES ($1, $2) RETURNING *`,
      [leaveName, leaveCode]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all leaves
const getLeaves = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM leaves`);
    res.status(200).json({ leaves: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a leave by ID
const getLeaveById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM leaves WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a leave
const updateLeave = async (req, res) => {
  const { id } = req.params;
  const { leaveName, leaveCode } = req.body;

  try {
    const result = await pool.query(
      `UPDATE leaves
       SET leave_name = $1, leave_code = $2
       WHERE id = $3 RETURNING *`,
      [leaveName, leaveCode, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createLeave,
  getLeaves,
  getLeaveById,
  updateLeave,
};

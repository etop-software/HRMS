const pool = require('../config/Pdb'); // PostgreSQL connectio
// Add a new shift
const addShift = async (req, res) => {
  const { shiftCode, shiftName, inTime, outTime, graceTime, nextday, breakTime, deductBreak, otStartsAfter, minOtTime, halfdayInTime, halfdayOutTime, halfdayGraceTime, halfdayBreakTime, halfdayOtStartsAfter, halfdayMinTimeForOt, selectedWeekOff, selectedHalfday, isActive } = req.body;

  if (!shiftCode || !shiftName || !inTime || !outTime) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO shifts (shift_code, shift_name, in_time, out_time, grace_time, nextday, break_time, deduct_break, ot_starts_after, min_ot_time, halfday_in_time, halfday_out_time, halfday_grace_time, halfday_break_time, halfday_ot_starts_after, halfday_min_time_for_ot, selected_week_off, selected_halfday, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
      [shiftCode, shiftName, inTime, outTime, graceTime, nextday, breakTime, deductBreak, otStartsAfter, minOtTime, halfdayInTime, halfdayOutTime, halfdayGraceTime, halfdayBreakTime, halfdayOtStartsAfter, halfdayMinTimeForOt, selectedWeekOff, selectedHalfday, isActive]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all shifts
const getShifts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shifts');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a shift by ID
const getShiftById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shifts WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Shift not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateShift = async (req, res) => {
  const {
    shiftCode,
    shiftName,
    inTime,
    outTime,
    graceTime,
    nextday,
    breakTime,
    deductBreak,
    otStartsAfter,
    minOtTime,
    halfDayInTime,
    halfDayOutTime,
    halfDayGraceTime,
    halfDayBreakTime,
    halfDayOTStartsAfter,
    halfDayMinOT,
    selectedWeekOff,
    selectedHalfday,
    isActive,
  } = req.body;
  console.log(req.body);

  try {
    const result = await pool.query(
      `UPDATE shifts
       SET 
         shift_code = $1,
         shift_name = $2,
         in_time = $3,
         out_time = $4,
         grace_time = $5,
         nextday = $6,
         break_time = $7,
         deduct_break = $8,
         ot_starts_after = $9,
         min_ot_time = $10,
         halfday_in_time = $11,
         halfday_out_time = $12,
         halfday_grace_time = $13,
         halfday_break_time = $14,
         halfday_ot_starts_after = $15,
         halfday_min_time_for_ot = $16,
         selected_week_off = $17,
         selected_halfday = $18,
         is_active = $19
       WHERE id = $20 RETURNING *`,
      [
        shiftCode,
        shiftName,
        inTime,
        outTime,
        graceTime,
        nextday,
        breakTime,
        deductBreak,
        otStartsAfter,
        minOtTime,
        halfDayInTime,
        halfDayOutTime,
        halfDayGraceTime,
        halfDayBreakTime,
        halfDayOTStartsAfter,
        halfDayMinOT,
        selectedWeekOff ? `{${selectedWeekOff}}` : null, // Convert to array literal or null
        selectedHalfday ? `{${selectedHalfday}}` : null, // Convert to array literal or null
        isActive ?? true, // Default to true if not explicitly set
        req.params.id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error updating shift:', err);
    res.status(400).json({ message: err.message });
  }
};


// Delete a shift by ID
const deleteShift = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM shifts WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Shift not found" });
    }
    res.status(204).json({ message: "Shift deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addShift,
  getShifts,
  getShiftById,
  updateShift,
  deleteShift,
};

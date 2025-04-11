const pool = require('../config/Pdb');
// Assign a new shift to employees
const assignShiftToEmployee = async (req, res) => {
  const { selectedEmployees, shiftId, startDate, endDate } = req.body;

  console.log("Received request to assign shift:", req.body);

  if (!startDate || !endDate || !shiftId || !selectedEmployees || selectedEmployees.length === 0) {
    return res.status(400).json({ message: "Start date, end date, shift ID, and at least one employee are required" });
  }

  const client = await pool.connect();

  try {
    // Fetch employee IDs based on the selected employees list
    const employeeResult = await client.query('SELECT employee_id FROM public.employees WHERE id = ANY($1)', [selectedEmployees]);


    if (employeeResult.rowCount === 0) {
      return res.status(404).json({ message: "No employees found for the given IDs" });
    }

    const employeeIds = employeeResult.rows.map(row => row.employee_id);


    const shiftResult = await client.query(
      'SELECT shift_name FROM public.shifts WHERE id = $1',
      [shiftId]
    );

    if (shiftResult.rowCount === 0) {
      await client.query('ROLLBACK');
      console.log("Shift not found or inactive.");
      return res.status(404).json({ message: "Shift not found or inactive." });
    }

    const shiftName = shiftResult.rows[0].shift_name;
    console.log(`Shift Name: ${shiftName}`);

    const formattedEmployeeIds = employeeIds.join(',');

    const result = await client.query(
      `SELECT public.sp_shiftscheduling(
        _start := $1::TIMESTAMP,
        _end := $2::TIMESTAMP,
        _shift_name := $3,
        _all := FALSE,
        _employee_ids := $4,
        _assign_weekly_off := 1
      )`,
      [startDate, endDate, shiftName, formattedEmployeeIds]
    );

    console.log("Result from stored procedure:", result.rows);

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Shift scheduling failed or no records updated." });
    }

    await client.query('COMMIT');

    res.status(201).json({ 
      message: "Shift scheduling executed successfully", 
      results: result.rows 
    });

  } catch (err) {
    console.error("Error executing shift scheduling:", err);
    await client.query('ROLLBACK');
    res.status(500).json({ message: "Internal server error. Please try again later." });
  } finally {
    client.release();
  }
};

const getShiftsbyemployeid = async (req, res) => {
  const { start, end, empId } = req.query;

  try {
    const values = [];
    let query = `
      SELECT 
        s."ScheduleAutoID",
        s."EMPID",
        s."PDATE",
        s."SHIFT",
        s."INPUNCH",
        s."OUTPUNCH",
        s."HALFDAY",
        sh.shift_name
      FROM public.tbl_shift_schedule s
      LEFT JOIN public.shifts sh ON s."SHIFT" = sh.shift_code
      WHERE 1=1
    `;

    if (start && end) {
      query += ` AND s."PDATE" BETWEEN $1 AND $2`;
      values.push(start, end);
    }

    if (empId) {
      query += values.length ? ` AND s."EMPID" = $${values.length + 1}` : ` AND s."EMPID" = $1`;
      values.push(empId);
    }

    const result = await pool.query(query, values);

    const events = result.rows.map(row => ({
      id: row.ScheduleAutoID,
      title: `${row.shift_name || row.SHIFT}${row.HALFDAY ? ' (Half Day)' : ''}`,
      date: row.PDATE,
      extendedProps: {
        empId: row.EMPID,
        shiftCode: row.SHIFT,
        shiftName: row.shift_name,
        inPunch: row.INPUNCH,
        outPunch: row.OUTPUNCH,
        halfDay: row.HALFDAY,
      }
    }));

    res.json(events);
  } catch (error) {
    console.error('Error fetching shift schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



// Get the current active shift for an employee
const getCurrentShiftForEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT es.*, s.* 
       FROM employee_shifts es
       JOIN shifts s ON es.shift_id = s.id
       WHERE es.employee_id = $1 AND es.active = TRUE`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No active shift found for this employee" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get shift history for an employee
const getShiftHistoryForEmployee = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const result = await pool.query(
      `SELECT es.*, s.*
       FROM employee_shifts es
       JOIN shifts s ON es.shift_id = s.id
       WHERE es.employee_id = $1
       ORDER BY es.assigned_date DESC`,
      [employeeId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No shift history found for this employee" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get employees by shift
const getEmployeesByShift = async (req, res) => {
  const { shiftId } = req.params;

  try {
    const result = await pool.query(
      `SELECT es.employee_id, es.assigned_date, es.active, e.*
       FROM employee_shifts es
       JOIN employees e ON es.employee_id = e.id
       WHERE es.shift_id = $1`,
      [shiftId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No employees found for this shift" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all employee shifts
const getAllEmployeeShifts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT es.*, e.name
       FROM tbl_shift_schedule es
       JOIN employees e ON es."EMPID"::INT = e.employee_id
       `
    );
    

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No shifts found for any employee" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error in getAllEmployeeShifts:", err);
    res.status(500).json({ message: err.message });
  }
};


// Get all employees with their shifts
const getAllEmployeesWithShifts = async (req, res) => {
  try {
    const employees = await pool.query('SELECT * FROM employees');
    const employeeShiftPromises = employees.rows.map(async (employee) => {
      const shifts = await pool.query(
        `SELECT es.*, s.*
         FROM employee_shifts es
         JOIN shifts s ON es.shift_id = s.id
         WHERE es.employee_id = $1 and es.active=true`,
        [employee.id]
      );

      return {
        employee,
        shifts: shifts.rows.length > 0 ? shifts.rows : [],
      };
    });

    const employeesWithShifts = await Promise.all(employeeShiftPromises);
    res.status(200).json(employeesWithShifts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  assignShiftToEmployee,
  getCurrentShiftForEmployee,
  getShiftHistoryForEmployee,
  getEmployeesByShift,
  getAllEmployeeShifts,
  getAllEmployeesWithShifts,
  getShiftsbyemployeid
};

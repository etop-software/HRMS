const pool = require('../config/Pdb');

const assignLeaveToEmployees = async (req, res) => {
  const { selectedEmployees, leaveId, leave_start_date, leave_end_date } = req.body;

  console.log("Received data:", { selectedEmployees, leaveId, leave_start_date, leave_end_date });

  if (!selectedEmployees || !leaveId || selectedEmployees.length === 0) {
    return res.status(400).json({ message: "At least one employee and a Leave ID are required" });
  }

  try {
    // Check if the leave type exists
    const leaveCheck = await pool.query('SELECT * FROM leaves WHERE id = $1', [leaveId]);
    if (leaveCheck.rowCount === 0) {
      return res.status(404).json({ message: "Leave type not found" });
    }

    const leaveAssignments = selectedEmployees.map(async (employeeId) => {
      // Check if the employee exists
      const employeeCheck = await pool.query('SELECT * FROM employees WHERE id = $1', [employeeId]);
      if (employeeCheck.rowCount === 0) {
        return { employeeId, status: "error", message: "Employee not found" };
      }

      // Check for existing overlapping leave
      const overlapCheck = await pool.query(
        `SELECT * FROM employee_leaves
         WHERE employee_id = $1
         AND (leave_start_date, leave_end_date) OVERLAPS ($2::date, $3::date)`,
        [employeeId, leave_start_date, leave_end_date]
      );

      // If an overlapping leave exists, delete it
      if (overlapCheck.rowCount > 0) {
        await pool.query(
          `DELETE FROM employee_leaves
           WHERE employee_id = $1
           AND (leave_start_date, leave_end_date) OVERLAPS ($2::date, $3::date)`,
          [employeeId, leave_start_date, leave_end_date]
        );
      }

      // Assign the new leave entry
      const result = await pool.query(
        `INSERT INTO employee_leaves (employee_id, leave_type_id, leave_start_date, leave_end_date, assigned_date, status)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'approved') RETURNING *`,
        [employeeId, leaveId, leave_start_date, leave_end_date]
      );

      return { employeeId, status: "success", data: result.rows[0] };
    });

    const results = await Promise.all(leaveAssignments);
    const failedAssignments = results.filter(result => result.status === "error");

    if (failedAssignments.length > 0) {
      return res.status(207).json({ message: "Some employees could not be assigned leaves", results });
    }

    res.status(201).json({ message: "Leave assigned successfully to all employees", results });
  } catch (err) {
    console.error("Error assigning leave to employees:", err);
    res.status(500).json({ message: "An error occurred while assigning leaves" });
  }
};

const getEmployeesWithLeaves = async (req, res) => {
  try {
    // Fetch all employees
    const employeesResult = await pool.query(`SELECT id, name,employee_id FROM employees`);

    if (employeesResult.rowCount === 0) {
      return res.status(404).json({ message: "No employees found" });
    }

    const employees = employeesResult.rows;

    // Fetch leave details for each employee
    const employeesWithLeaves = await Promise.all(
      employees.map(async (employee) => {
        const leaveResult = await pool.query(
          `SELECT l.leave_name, el.leave_type_id, el.leave_start_date, el.leave_end_date
           FROM employee_leaves el
           LEFT JOIN leaves l ON el.leave_type_id = l.id
           WHERE el.employee_id = $1`,
          [employee.id]
        );

        return {
          ...employee,
          leaves: leaveResult.rowCount > 0 ? leaveResult.rows : []
        };
      })
    );

    res.status(200).json(employeesWithLeaves);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ message: "An error occurred while fetching employees and leave information." });
  }
};
const updateLeaveAssignment = async (req, res) => {
  // Extract assignment ID from URL parameters
  const { assignmentId } = req.params;

  // Extract fields from request body
  const { leaveId, leave_start_date, leave_end_date } = req.body;

  console.log("Received data:", { assignmentId, leaveId, leave_start_date, leave_end_date });

  // Validate required fields
  if (!leaveId || !leave_start_date || !leave_end_date) {
    return res.status(400).json({
      message: 'Missing required fields: leaveId, leave_start_date, and leave_end_date are required',
    });
  }

  try {
    // Define the SQL UPDATE query with parameterized inputs
    const query = `
      UPDATE public.employee_leaves
      SET leave_type_id = $1, leave_start_date = $2, leave_end_date = $3
      WHERE id = $4
    `;

    // Define the values for the query
    const values = [leaveId, leave_start_date, leave_end_date, assignmentId];

    // Execute the query
    const result = await pool.query(query, values);

    // Check if the assignment was found and updated
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Leave assignment not found',
      });
    }

    // Return success response
    res.status(200).json({
      message: 'Leave assignment updated successfully',
    });
  } catch (error) {
    // Log the error for debugging
    console.error('Error updating leave assignment:', error);

    // Return error response
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const getAllEmployeesWithLeaves = async (req, res) => {
  try {
    // Fetch all employees
    const employeesResult = await pool.query(`SELECT id, employee_id,name FROM employees`);

    if (employeesResult.rowCount === 0) {
      return res.status(404).json({ message: "No employees found" });
    }

    const employees = employeesResult.rows;

    // For each employee, fetch their leave details
    const employeesWithLeaves = await Promise.all(
      employees.map(async (employee) => {
        // Fetch leaves for each employee (if any)
        const leaveResult = await pool.query(
          `SELECT el.id,e.name,l.leave_name, el.leave_type_id, el.leave_start_date, el.leave_end_date
           FROM employee_leaves el
           LEFT Join employees e ON el.employee_id = e.id
           LEFT JOIN leaves l ON el.leave_type_id = l.id
           WHERE el.employee_id = $1`, 
          [employee.id]
        );
        // Only include employees with leaves
        if (leaveResult.rowCount > 0) {
          return {
            ...employee,
            leaves: leaveResult.rows
          };
        }

        return null;  // Return null if no leaves are assigned
      })
    );

    // Filter out employees with no assigned leaves
    const employeesWithAssignedLeaves = employeesWithLeaves.filter(employee => employee !== null);

    if (employeesWithAssignedLeaves.length === 0) {
      return res.status(404).json({ message: "No employees with assigned leaves found" });
    }

    res.status(200).json(employeesWithAssignedLeaves);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ message: "An error occurred while fetching employees and leaves." });
  }
};

const deleteLeaveAssignment = async (req, res) => {

  console.log("Received request to delete leave assignment with ID:", req.params.assignmentId);
  const { assignmentId } = req.params; // Extract assignment ID from URL parameters

  try {
    // SQL query to delete the leave assignment by ID
    const query = `
      DELETE FROM public.employee_leaves
      WHERE id = $1
    `;

    // Execute the query with parameterized input
    const result = await pool.query(query, [assignmentId]);

    // Check if any row was deleted
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Leave assignment not found',
      });
    }

    // Return success response
    res.status(200).json({
      message: 'Leave assignment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting leave assignment:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const getLeavesForEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT el.*, l.leave_name 
       FROM employee_leaves el
       JOIN leaves l ON el.leave_type_id = l.id
       WHERE el.employee_id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No leaves found for this employee." });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateLeaveStatus = async (req, res) => {
  const { id } = req.params; 
  const { status } = req.body; 

  if (!status) {
    return res.status(400).json({ message: "Status is required." });
  }

  try {
    const result = await pool.query(
      `UPDATE employee_leaves 
       SET status = $1 
       WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Leave not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteLeave = async (req, res) => {
  const { id } = req.params; 

  try {
    const result = await pool.query(
      `DELETE FROM employee_leaves 
       WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Leave not found." });
    }

    res.status(204).json({ message: "Leave deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getLeaveById = async (req, res) => {
  const { leaveId } = req.params; // Assuming the leave ID is passed as a route parameter

  // Validate input
  if (!leaveId) {
    return res.status(400).json({ message: "Leave ID is required" });
  }

  try {
    // Query to retrieve leave details by leave ID
    const result = await pool.query(
      `SELECT e.employee_id as Employee_id, e.name
      ,el.id,  el.leave_type_id, l.leave_name, el.leave_start_date, el.leave_end_date, el.assigned_date, el.status
       FROM employee_leaves el
       JOIN leaves l ON el.leave_type_id = l.id
       JOIN employees e ON el.employee_id = e.id
       WHERE el.id = $1`,
      [leaveId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Leave not found" });
    }

    res.status(200).json({ message: "Leave information retrieved successfully", data: result.rows[0] });
  } catch (err) {
    console.error("Error retrieving leave by ID:", err);
    res.status(500).json({ message: "An error occurred while retrieving leave information" });
  }
};




module.exports = {
  assignLeaveToEmployees,
  getLeavesForEmployee,
  updateLeaveStatus,
  deleteLeave,
  getAllEmployeesWithLeaves,
  getEmployeesWithLeaves,
  getLeaveById,
  updateLeaveAssignment,
  deleteLeaveAssignment
};

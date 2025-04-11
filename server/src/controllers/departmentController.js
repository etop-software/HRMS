const pool = require('../config/Pdb'); // Import the PostgreSQL pool

exports.createDepartment = async (req, res) => {
    const { departmentName, departmentHead, email } = req.body;

    // Basic validation
    if (!departmentName || !departmentHead || !email) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const query = `
            INSERT INTO departments (department_name, department_head, email)
            VALUES ($1, $2, $3)
            RETURNING *;  -- Return the newly created department
        `;
        const values = [departmentName, departmentHead, email];
        const result = await pool.query(query, values);

        res.status(201).json(result.rows[0]); // Send the created department back in the response
    } catch (err) {
        console.error('Error creating department:', err);
        res.status(400).json({ message: err.message });
    }
};

// Get all departments
exports.getDepartments = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM departments');
        res.status(200).json(result.rows); // Send all departments as response
    } catch (err) {
        console.error('Error fetching departments:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get a single department by ID
exports.getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params; // Get the department ID from the request parameters
        const result = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Department not found' });

        res.status(200).json(result.rows[0]); // Send the found department back in the response
    } catch (err) {
        console.error('Error fetching department:', err);
        res.status(500).json({ message: err.message });
    }
};

// Update a department by ID
exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params; // Get the department ID from the request parameters
        const { departmentName, departmentHead, email } = req.body;

        const query = `
            UPDATE departments
            SET department_name = $1, department_head = $2, email = $3
            WHERE id = $4
            RETURNING *;  -- Return the updated department
        `;
        const values = [departmentName, departmentHead, email, id];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Department not found' });

        res.status(200).json(result.rows[0]); // Send the updated department back in the response
    } catch (err) {
        console.error('Error updating department:', err);
        res.status(400).json({ message: err.message });
    }
};

// Delete a department by ID
exports.deleteDepartment = async (req, res) => {
    try {
      const { id } = req.params; // Get the department ID from the request parameters
  
      // Check if the department is "Default"
      const checkDefaultQuery = 'SELECT department_name FROM departments WHERE id = $1;';
      const checkResult = await pool.query(checkDefaultQuery, [id]);
  
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: 'Department not found' });
      }
  
      const { department_name } = checkResult.rows[0];
  
      if (department_name === 'Default') {
        return res.status(400).json({ message: 'Cannot delete the Default department' });
      }
  
      // Proceed to delete the department
      const deleteQuery = 'DELETE FROM departments WHERE id = $1 RETURNING *;';
      const deleteResult = await pool.query(deleteQuery, [id]);
  
      if (deleteResult.rows.length === 0) {
        return res.status(404).json({ message: 'Department not found' });
      }
  
      res.status(204).send(); // Successfully deleted, send no content
    } catch (err) {
      console.error('Error deleting department:', err);
      res.status(500).json({ message: err.message });
    }
  };
  
exports.getDepartmentIdByDepartmentName = async (departmentName) => {
    try {
      const result = await pool.query('SELECT * FROM departments WHERE department_name = $1', [departmentName]);
  
      if (result.rows.length === 0) {
        throw new Error('Department not found');
      }
  
      return result.rows[0]; // Return the found department
    } catch (err) {
      console.error('Error fetching department:', err);
      throw err; // Propagate the error to the calling function
    }
  };
  

const pool = require('../config/Pdb'); // Import the PostgreSQL pool

// Create a new designation
exports.createDesignation = async (req, res) => {
    const { title } = req.body;

    // Basic validation
    if (!title) {
        return res.status(400).json({ message: "Designation Title is required." });
    }

    try {
        const query = `
            INSERT INTO designations (title)
            VALUES ($1)
            RETURNING *;  -- Return the newly created designation
        `;
        const values = [title];
        const result = await pool.query(query, values);

        res.status(201).json(result.rows[0]); // Send the created designation back in the response
    } catch (err) {
        console.error('Error creating designation:', err);
        res.status(400).json({ message: err.message });
    }
};

// Get all designations
exports.getDesignations = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM designations');
        res.status(200).json(result.rows); // Send all designations as response
    } catch (err) {
        console.error('Error fetching designations:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get a single designation by ID
exports.getDesignationById = async (req, res) => {
    try {
        const { id } = req.params; // Get the designation ID from the request parameters
        const result = await pool.query('SELECT * FROM designations WHERE id = $1', [id]);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Designation not found' });

        res.status(200).json(result.rows[0]); // Send the found designation back in the response
    } catch (err) {
        console.error('Error fetching designation:', err);
        res.status(500).json({ message: err.message });
    }
};

// Update a designation by ID
exports.updateDesignation = async (req, res) => {
    try {
        const { id } = req.params; // Get the designation ID from the request parameters
        const { title } = req.body;

        const query = `
            UPDATE designations
            SET title = $1
            WHERE id = $2
            RETURNING *;  -- Return the updated designation
        `;
        const values = [title, id];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Designation not found' });

        res.status(200).json(result.rows[0]); // Send the updated designation back in the response
    } catch (err) {
        console.error('Error updating designation:', err);
        res.status(400).json({ message: err.message });
    }
};


exports.deleteDesignation = async (req, res) => {
    try {
      const { id } = req.params; // Get the designation ID from the request parameters
  
      // Check if the designation is "Default"
      const checkDefaultQuery = 'SELECT title FROM designations WHERE id = $1;';
      const checkResult = await pool.query(checkDefaultQuery, [id]);
  
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: 'Designation not found' });
      }
  
      const { title } = checkResult.rows[0];
  
      if (title === 'Default') {
        return res.status(400).json({ message: 'Cannot delete the Default designation' });
      }
  
      // Proceed to delete the designation
      const deleteQuery = 'DELETE FROM designations WHERE id = $1 RETURNING *;';
      const deleteResult = await pool.query(deleteQuery, [id]);
  
      if (deleteResult.rows.length === 0) {
        return res.status(404).json({ message: 'Designation not found' });
      }
  
      res.status(204).send(); // Successfully deleted, send no content
    } catch (err) {
      console.error('Error deleting designation:', err);
      res.status(500).json({ message: err.message });
    }
  };
  

exports.getDesignationIdByDesignationName = async (designationName) => {
    try {
        const result = await pool.query('SELECT id FROM designations WHERE title = $1', [designationName]);
        return result.rows[0];
    } catch (err) {
        console.error('Error fetching designation ID:', err);
        throw err;
    }
};

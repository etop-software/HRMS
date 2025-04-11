const pool = require('../config/Pdb'); // Assuming you have a configured pool for PostgreSQL


const MealTypeController = {

    getAllMealTypes: async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM mealtypes');
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'No meal types found' });
            }

            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching meal types:', error.message);

            // Respond with a 500 status in case of a database query failure
            res.status(500).json({ message: 'Failed to fetch meal types' });
        }
    },
    // Fetch a single meal type by ID
    getMealTypeById: async (req, res) => {
        const { id } = req.params; // Get meal type ID from URL parameters

        try {
            // Query the database to find the meal type by ID
            const result = await pool.query('SELECT * FROM mealtypes WHERE id = $1', [id]);

            // If no meal type is found, return a 404 response
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Meal type not found' });
            }

            // Return the found meal type with a 200 OK status
            res.status(200).json(result.rows[0]);
        } catch (error) {
            // Log the error for debugging purposes
            console.error('Error fetching meal type:', error.message);

            // Respond with a 500 status in case of a database query failure
            res.status(500).json({ message: 'Failed to fetch meal type' });
        }
    },

    // Create a new meal type
    createMealType : async (req, res) => {
        const { mealtype, mealstart, mealend } = req.body;
    
        if (!mealtype || !mealstart || !mealend) {
            return res.status(400).json({ message: "mealtype, mealstart, and mealend are required" });
        }
    
        try {
            const result = await pool.query(
                `INSERT INTO mealtypes (mealtype, mealstart, mealend)
                 VALUES ($1, $2, $3) RETURNING *`,
                [mealtype, mealstart, mealend]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error('Error creating meal type:', err.message); // Simplified logging
            res.status(500).json({ message: 'Failed to create meal type' });
        }
    },
    updateMealType: async (req, res) => {
        const { id } = req.params; // Get ID from the URL parameters
        const { mealtype, mealstart, mealend } = req.body; // Get updated values from the body

        if (!mealtype || !mealstart || !mealend) {
            return res.status(400).json({ message: "mealtype, mealstart, and mealend are required" });
        }

        try {
            // Update the meal type in the database
            const result = await pool.query(
                'UPDATE mealtypes SET mealtype = $1, mealstart = $2, mealend = $3 WHERE id = $4 RETURNING *',
                [mealtype, mealstart, mealend, id]
            );

            // If no rows were affected, that means the ID does not exist
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Meal type not found' });
            }

            // Return the updated meal type
            res.status(200).json(result.rows[0]);
        } catch (err) {
            // Log error details for debugging
            console.error('Error updating meal type:', err.message);

            // Respond with a 500 status if an error occurs during query execution
            res.status(500).json({ message: 'Failed to update meal type' });
        }
    },

    deleteMealType: async (req, res) => {
        const { id } = req.params; // Get meal type ID from URL parameters

        try {
            const result = await pool.query('DELETE FROM mealtypes WHERE id = $1 RETURNING *', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Meal type not found' });
            }

            // Return success message with a 200 OK status
            res.status(200).json({ message: 'Meal type deleted successfully' });
        } catch (error) {
            // Log the error for debugging
            console.error('Error deleting meal type:', error.message);

            // Respond with a 500 status in case of a database query failure
            res.status(500).json({ message: 'Failed to delete meal type' });
        }
    },
};

module.exports = MealTypeController;
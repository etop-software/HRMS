const pool = require('../config/Pdb');
exports.createArea = async (req, res) => {
    const { area_name, area_code } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO area_info (area_name, area_code) VALUES ($1, $2) RETURNING *',
            [area_name, area_code]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error creating area', error: error.message });
    }
};

// READ - Get all areas
exports.getAllAreas = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM area_info');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving areas', error: error.message });
    }
};

// READ - Get a specific area by ID
exports.getAreaById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM area_info WHERE area_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Area not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving area', error: error.message });
    }
};

// UPDATE - Update an existing area
exports.updateArea = async (req, res) => {
    
    const { id } = req.params;
    const { area_name, area_code } = req.body;
    try {
        const result = await pool.query(
            'UPDATE area_info SET area_name = $1, area_code = $2 WHERE area_id = $3 RETURNING *',
            [area_name, area_code, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Area not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating area', error: error.message });
    }
};

// DELETE - Remove an area by ID
exports.deleteArea = async (req, res) => {
    try {
        const { id } = req.params; // Get the area ID from the request parameters
        
        // Check if the area is "Default" and prevent deletion
        const areaCheck = await pool.query('SELECT area_name FROM area_info WHERE area_id = $1', [id]);

        if (areaCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Area not found' });
        }

        const areaName = areaCheck.rows[0].area_name;

        if (areaName === 'Default') {
            return res.status(400).json({ message: 'Cannot delete the Default area' });
        }

        // Proceed with the deletion if the area is not "Default"
        const result = await pool.query('DELETE FROM area_info WHERE area_id = $1 RETURNING *;', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Area not found' });
        }

        res.status(204).send(); // Successfully deleted, send no content
    } catch (err) {
        console.error('Error deleting area:', err);
        res.status(500).json({ message: err.message });
    }
};


exports.getAreaIdByAreaName=  async (areaName)=>{

    console.log('areaName:', areaName);
    try{
        const queryText = 'SELECT area_id FROM area_info WHERE area_name = $1';
        const result =  await pool.query(queryText, [areaName]);
        return result.rows[0].area_id;
    }catch(error){
        console.error('Error fetching area_id:', error);
        throw error;
    }   


};

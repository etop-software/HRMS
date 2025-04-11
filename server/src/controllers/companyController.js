const pool = require('../config/Pdb'); // Import the PostgreSQL pool

// Create a new company
exports.createCompany = async (req, res) => {
    const { name, email, contact, address } = req.body;

    // Basic validation
    if (!name || !email || !contact || !address) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const query = `
            INSERT INTO company (name, email, contact, address)
            VALUES ($1, $2, $3, $4)
            RETURNING *;  -- Return the newly created company
        `;
        const values = [name, email, contact, address];
        const result = await pool.query(query, values);

        res.status(201).json(result.rows[0]); // Send the created company back in the response
    } catch (err) {
        console.error('Error creating company:', err);
        res.status(400).json({ message: err.message });
    }
};

// Get all companies
exports.getCompanies = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM company');
        res.status(200).json(result.rows); // Send all companies as response
    } catch (err) {
        console.error('Error fetching companies:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get a single company by ID
exports.getCompanyById = async (req, res) => {
    try {
        const { id } = req.params; // Get the company ID from the request parameters
        const result = await pool.query('SELECT * FROM company WHERE company_id = $1', [id]);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Company not found' });

        res.status(200).json(result.rows[0]); // Send the found company back in the response
    } catch (err) {
        console.error('Error fetching company:', err);
        res.status(500).json({ message: err.message });
    }
};

// Update a company by ID
exports.updateCompany = async (req, res) => {
    try {
        const { id } = req.params; // Get the company ID from the request parameters
        const { name, email, contact, address } = req.body;

        const query = `
            UPDATE company
            SET name = $1, email = $2, contact = $3, address = $4
            WHERE company_id = $5
            RETURNING *;  -- Return the updated company
        `;
        const values = [name, email, contact, address, id];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Company not found' });

        res.status(200).json(result.rows[0]); // Send the updated company back in the response
    } catch (err) {
        console.error('Error updating company:', err);
        res.status(400).json({ message: err.message });
    }
};

// Delete a company by ID
exports.deleteCompany = async (req, res) => {
    try {
        const { id } = req.params; // Get the company ID from the request parameters
        const result = await pool.query('DELETE FROM company WHERE company_id = $1 RETURNING *;', [id]);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Company not found' });

        res.status(204).send(); // Successfully deleted, send no content
    } catch (err) {
        console.error('Error deleting company:', err);
        res.status(500).json({ message: err.message });
    }
};

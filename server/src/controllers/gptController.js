const axios = require('axios');
const pool = require('../config/Pdb');

exports.askHR = async (req, res) => {
  const { question } = req.body;

  const prompt = `
  You are an assistant that generates PostgreSQL queries for an HR management system.
  
  Table schemas:
  - attendance(id, employee_id, datetime, attendance_state, terminal_id)
  - employees(id, employee_id, name, email, phone, date_of_joining, department_id, designation_id, companyid, privilage)
  
  In the "attendance_state" column, 
  - '0' represents Check-in, and 
  - '1' represents Check-out.
  
  Question: "${question}"
  
  Generate only the SQL query to answer this question. Provide no explanation.
  `;

  try {
    // Call Mistral via Ollama
    const { data } = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral',
      prompt: prompt,
      stream: false,
    });

    // Trim backticks and other unwanted characters
    let sql = data.response.trim();
    console.log('SQL:', sql);

    // Replace backticks with double quotes for PostgreSQL compatibility
    sql = sql.replace(/`/g, '"').replace(/^```|```$/g, '').trim();


    // Query PostgreSQL with the cleaned SQL
    const result = await pool.query(sql);

    // Send the response with the SQL query and result data
    res.status(200).json({
      sql,
      data: result.rows,
    });
  } catch (error) {
    console.error('[askHR Error]', error.message);
    res.status(500).json({
      error: 'Failed to generate or execute SQL.',
      details: error.message,
    });
  }
};

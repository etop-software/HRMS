const axios = require('axios');
const pool = require('../config/Pdb');

const GEMINI_API_KEY = 'AIzaSyBOH4g_3SJgDhGOXDkDOsGqQImrrICLwQI'; // Replace with your actual API key

exports.askHR = async (req, res) => {
  const { question } = req.body;

  const prompt = `
  You are an assistant that generates safe SELECT-only PostgreSQL queries for an HR management system.

  📋 Schema:
  -- attendance(id, employee_id, datetime, attendance_state, terminal_id)
  -- employees(id, employee_id, name, email, phone, date_of_joining, department_id, designation_id, companyid, privilage)
  -- departments(id, department_name, department_head, email)
  -- designations(id, title)
  -- tbl_shift_schedule("ScheduleAutoID", "EMPID", "PDATE", "SHIFT", "INPUNCH", "OUTPUNCH", "HALFDAY")
  -- shifts(id, shift_code, shift_name, in_time, out_time, grace_time, nextday, break_time, deduct_break, ot_starts_after, min_ot_time, ...)

  ⚠️ Notes & Constraints:
  - Only use SELECT queries. Never use INSERT, UPDATE, DELETE, DROP, or any DDL.
  - If joining tables, match types properly. For example:
    - tbl_shift_schedule."EMPID" is a string, so cast employees.employee_id as TEXT if needed.
    - tbl_shift_schedule."SHIFT" should be compared with shifts.shift_code.
  - For name-based filtering, always use ILIKE for case-insensitive matching:
    e.g., e.name ILIKE 'elon'
  - When using aggregation (e.g., COUNT, SUM), make sure all other selected fields are included in GROUP BY.
    ❌ Invalid: SELECT COUNT(id), name FROM employees;
    ✅ Valid: SELECT COUNT(id), name FROM employees GROUP BY name;
  - **PostgreSQL column names are case-sensitive**. Always wrap column names in double quotes if they contain uppercase letters or special characters (e.g., "OUTPUNCH", "INPUNCH", "PDATE").
  - **For time calculations**, ensure that TIME columns (like "INPUNCH", "OUTPUNCH") and TIMESTAMP columns (like in_time, out_time) are handled correctly. You may need to cast TIME to TIMESTAMP by adding a base date (e.g., 'CURRENT_DATE'::TIMESTAMP), or cast TIMESTAMP to TIME if necessary.
    - Example: COALESCE("INPUNCH"::TIMESTAMP, in_time)
    - Example: COALESCE("INPUNCH", in_time::TIME)
  - **For working hours calculation**:
    - If the attendance_state value is '0' for check-in and '1' for check-out, calculate the working hours based on attendance.
    - Use the attendance table to calculate working hours: attendance_state = '0' for check-in and attendance_state = '1' for check-out.
    - When attendance data is missing, use shift timings from the shifts table.
    - **Do not use nested aggregate functions**. To calculate the difference between check-in and check-out times, utilize logical conditions and aggregate values separately, without nesting the aggregate functions.

  ✅ Output:
  - Only return the final PostgreSQL SELECT query with no explanations or comments.
  - Do not include SQL keywords in lowercase.

  Question: "${question}"
  Generate only the SQL query.
`;

  


  try {
    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    let sql = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean SQL: remove triple quotes, markdown tags, backticks
    sql = sql
      .replace(/```sql|```|"""sql|"""/gi, '')
      .replace(/`/g, '"')
      .trim();


      if (!/^\s*(with|select)\s+/i.test(sql)) {
        return res.status(400).json({
          error: 'Only SELECT queries are allowed.',
          queryRejected: sql,
        });
      }
console.log('SQL:', sql);
    const result = await pool.query(sql);

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

const axios = require('axios');
const pool = require('../config/Pdb');
require('dotenv').config({ path: '../.env' });

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY; // Replace with your actual API key

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
   -- tbl_holidays(holiday_auto_id, hdate, reason)
  -- leaves(id, leave_name, leave_code)
  -- employee_leaves(id, employee_id, leave_type_id, leave_start_date, leave_end_date, assigned_date, status)
  
  ⚠️ Notes & Constraints:
  - strict If the user question is not related to HR data or cannot be answered using the database schema provided, respond with: "Please ask a question related to the HR management system data. I can help with queries about employees, attendance, leaves, departments, designations, shifts, holidays, and related HR information."
   - Always use ILIKE with wildcards for name matching
  - Only use SELECT queries. Never use INSERT, UPDATE, DELETE, DROP, or any DDL.
   - When displaying boolean-like results, format as "Yes" or "No" using CASE statements
  - If joining tables, match types properly. For example:
    - tbl_shift_schedule."EMPID" is a string, so cast employees.employee_id as TEXT if needed.
    - tbl_shift_schedule."SHIFT" should be compared with shifts.shift_code.
    - When joining the **attendance** table with other tables, always join using **employee_id**, not id.
  - For name-based filtering, always use ILIKE for case-insensitive matching:
    e.g., e.name ILIKE 'elon'
  - When using aggregation (e.g., COUNT, SUM), make sure all other selected fields are included in GROUP BY.
    ❌ Invalid: SELECT COUNT(id), name FROM employees;
    ✅ Valid: SELECT COUNT(id), name FROM employees GROUP BY name;
  - **PostgreSQL column names are case-sensitive**. Always wrap column names in double quotes if they contain uppercase letters or special characters (e.g., "OUTPUNCH", "INPUNCH", "PDATE").
  - **For time calculations**, ensure that TIME columns (like "INPUNCH", "OUTPUNCH") and TIMESTAMP columns (like in_time, out_time) are handled correctly. You may need to cast TIME to TIMESTAMP by adding a base date (e.g., 'CURRENT_DATE'::TIMESTAMP), or cast TIMESTAMP to TIME if necessary.
    - Example: COALESCE("INPUNCH"::TIMESTAMP, in_time)
    - Example: COALESCE("INPUNCH", in_time::TIME)
  
  📌 Working Hours Calculation Rules:
  - Attendance has two rows per day per employee:
    - attendance_state = '0' → check-in
    - attendance_state = '1' → check-out
  - NEVER calculate total working hours by doing MIN/MAX across the whole date range.
    ❌ WRONG: MAX(datetime) - MIN(datetime) across a month
  - ✅ CORRECT: First group by employee + date, then:
    - Calculate working hours: 
      EXTRACT(EPOCH FROM (MAX(check-out) - MIN(check-in))) / 3600
  - Then, SUM the working hours per day for the total.
  - Use this pattern when needed:
    
    SELECT
        employee_id,
        SUM(total_hours) AS total_hours_in_month
    FROM (
        SELECT
            employee_id,
            DATE(datetime) AS work_day,
            EXTRACT(EPOCH FROM (
                MAX(CASE WHEN attendance_state = '1' THEN datetime END) -
                MIN(CASE WHEN attendance_state = '0' THEN datetime END)
            )) / 3600 AS total_hours
        FROM attendance
        WHERE ...
        GROUP BY employee_id, DATE(datetime)
    ) AS daily_totals
    GROUP BY employee_id;

    📌 Employee-Specific Leave Reports:
  - To retrieve leave information for a specific employee by name:
    - Always use ILIKE with wildcards for name matching
    - Calculate days by adding 1 to the difference between end and start dates (inclusive count)
    - Include only approved leaves in calculations
     - When displaying boolean-like results, format as "Yes" or "No" using CASE statements
    - Use this pattern:
    
    SELECT 
        e.id AS employee_id,
        e.name,
        l.leave_name,
        l.leave_code,
        SUM(el.leave_end_date - el.leave_start_date + 1) AS days_taken
    FROM 
        employees e
    JOIN 
        employee_leaves el ON e.id = el.employee_id
    JOIN 
        leaves l ON el.leave_type_id = l.id
    WHERE 
        e.name ILIKE '%employee_name%'
        AND el.status = 'approved'
    GROUP BY 
        e.id, e.name, l.id, l.leave_name, l.leave_code
    ORDER BY 
        l.leave_name;
  
  📌 Overtime (OT) Calculation Logic:
  - The shifts table contains ot_starts_after (in hours) and min_ot_time (in hours).
  - Overtime = daily_hours - ot_starts_after
  - Overtime is only counted if:
      - shifts.ot_starts_after IS NOT NULL
      - AND daily_hours > ot_starts_after
      - AND (daily_hours - ot_starts_after) >= shifts.min_ot_time
  - If the condition is not met → daily OT = 0
  - Use this logic:
  
    CASE
      WHEN ot_starts_after IS NOT NULL AND
           daily_hours > ot_starts_after AND
           (daily_hours - ot_starts_after) >= min_ot_time
      THEN daily_hours - ot_starts_after
      ELSE 0
    END AS daily_ot
  
  - Then, sum all daily_ot values for the total OT hours in a month
  
  ✅ Late Arrival Detection:
  - Use **attendance_state = '0'** (check-ins only)
  - A check-in is considered **late** if:
    a.datetime > (DATE(a.datetime) + s.in_time + (s.grace_time || ' minutes')::INTERVAL)
  - Join must match:
    - employees.employee_id::TEXT = tbl_shift_schedule."EMPID"
    - DATE(a.datetime) = tbl_shift_schedule."PDATE"
    - tbl_shift_schedule."SHIFT" = shifts.shift_code
  
  ✅ Early Leave Detection:
  - Use **attendance_state = '1'** (check-outs only)
  - A check-out is considered **early** if:
    a.datetime < MAKE_TIMESTAMP(
        EXTRACT(YEAR FROM a.datetime)::INT,
        EXTRACT(MONTH FROM a.datetime)::INT,
        EXTRACT(DAY FROM a.datetime)::INT,
        EXTRACT(HOUR FROM s.out_time)::INT,
        EXTRACT(MINUTE FROM s.out_time)::INT,
        EXTRACT(SECOND FROM s.out_time)::INT
    )
  - To calculate how early:
    MAKE_TIMESTAMP(...) - a.datetime AS early_out_duration
  - Join must match:
    - employees.employee_id::TEXT = tbl_shift_schedule."EMPID"
    - DATE(a.datetime) = tbl_shift_schedule."PDATE"
    - tbl_shift_schedule."SHIFT" = shifts.shift_code
  
  strict ✅ Absent Detection:
  - An employee is considered **absent** on a scheduled day if:
    - The employee exists in tbl_shift_schedule for that date, 
    - BUT there is **no matching attendance record** for that date.
  - Use LEFT JOIN to compare shift schedule with attendance, and filter where attendance is NULL.
  - Must join:
    - employees.employee_id::TEXT = tbl_shift_schedule."EMPID"
    - tbl_shift_schedule."SHIFT" = shifts.shift_code
    - DATE(attendance.datetime) = tbl_shift_schedule."PDATE" (optional, only if attendance exists)
  
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

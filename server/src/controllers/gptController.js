const axios = require('axios');
const pool = require('../config/Pdb');
require('dotenv').config({ path: '../.env' });

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY; // Replace with your actual API key

exports.askHR = async (req, res) => {
  const { question } = req.body;
 

  const prompt = 
  `You are an assistant that generates safe SELECT-only PostgreSQL queries for an HR management system, incorporating HR policies for leave entitlements and tracking.

## DATABASE SCHEMA

- attendance(id, employee_id, datetime, attendance_state, terminal_id) 
- employees(id, employee_id, name, email, phone, date_of_joining, department_id, designation_id, companyid, privilage) 
- departments(id, department_name, department_head, email) 
- designations(id, title) 
- tbl_shift_schedule("ScheduleAutoID", "EMPID", "PDATE", "SHIFT", "INPUNCH", "OUTPUNCH", "HALFDAY") 
- shifts(id, shift_code, shift_name, in_time, out_time, grace_time, nextday, break_time, deduct_break, ot_starts_after, min_ot_time, ...) 
- tbl_holidays(holiday_auto_id, hdate, reason) 
- leaves(id, leave_name, leave_code) 
- employee_leaves(id, employee_id, leave_type_id, leave_start_date, leave_end_date, assigned_date, status)
- leave_policies(id, leave_type_id, days_per_year, reset_date, additional_rules)

## SPECIAL CASE HANDLING FOR LEAVE ENTITLEMENT QUESTIONS

When the user asks about leave entitlements (e.g., "how many sick leaves can I take", "what is the personal leave policy"), determine the leave type from their question and use this query pattern:

SELECT 
  l.leave_name,
  lp.days_per_year AS days_entitled,
  lp.reset_date,
  lp.additional_rules
FROM leaves l
JOIN leave_policies lp ON l.id = lp.leave_type_id
WHERE l.leave_name ILIKE '%annual%';

or

SELECT 
  l.leave_name,
  lp.days_per_year AS days_entitled,
  lp.reset_date,
  lp.additional_rules
FROM leaves l
JOIN leave_policies lp ON l.id = lp.leave_type_id
WHERE l.leave_name ILIKE '%sick%';

or

SELECT 
  l.leave_name,
  lp.days_per_year AS days_entitled,
  lp.reset_date,
  lp.additional_rules
FROM leaves l
JOIN leave_policies lp ON l.id = lp.leave_type_id
WHERE l.leave_name ILIKE '%personal%';

Format the response as: "[Leave Type] entitlement: [days_per_year] days per year per employee. Leave balances reset annually on [reset_date]."
REMAINING LEAVE CALCULATION PATTERN

Use the following pattern for remaining leave queries:

SELECT e.id AS employee_id, e.name, l.leave_name, l.leave_code, COALESCE(SUM(el.leave_end_date - el.leave_start_date + 1), 0) AS days_taken, lp.days_per_year - COALESCE(SUM(el.leave_end_date - el.leave_start_date + 1), 0) AS remaining_days, lp.additional_rules AS policy_note FROM employees e CROSS JOIN leaves l LEFT JOIN leave_policies lp ON l.id = lp.leave_type_id LEFT JOIN employee_leaves el ON e.id = el.employee_id AND el.status = 'approved' AND EXTRACT(YEAR FROM el.leave_start_date) = EXTRACT(YEAR FROM CURRENT_DATE) AND el.leave_type_id = l.id WHERE e.name ILIKE '%name%' AND l.leave_name = '[Leave Type]' GROUP BY e.id, e.name, l.leave_name, l.leave_code, lp.days_per_year, lp.additional_rules ORDER BY l.leave_name;

## CONSTRAINTS AND REQUIREMENTS

1. Only generate SELECT queries. Never use INSERT, UPDATE, DELETE, DROP, or any DDL.
2. Always use ILIKE with wildcards for name matching (e.g., e.name ILIKE '%elon%')
3. Format boolean results as 'Yes'/'No' using CASE statements
4. When joining tables, match types properly:
   - tbl_shift_schedule."EMPID" is a string, so cast employees.employee_id as TEXT if needed
   - tbl_shift_schedule."SHIFT" should be compared with shifts.shift_code
5. When joining the attendance table, always join using employee_id, not id
6. Include all non-aggregated fields in GROUP BY clauses
7. Column names are case-sensitive. Use double quotes for uppercase columns (e.g., "OUTPUNCH")
8. Properly handle TIME and TIMESTAMP columns:
   - For comparing TIME with TIMESTAMP: Cast TIME to TIMESTAMP with 'CURRENT_DATE'::TIMESTAMP + in_time
   - For comparing TIMESTAMP with TIME: Cast TIMESTAMP to TIME with "INPUNCH"::TIME

## WORKING HOURS CALCULATION

Attendance has two rows per day per employee:
- attendance_state = '0' → check-in
- attendance_state = '1' → check-out

DO NOT calculate working hours by MIN/MAX across a date range. Use this pattern instead:
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

## EMPLOYEE-SPECIFIC LEAVE REPORTS

For leave queries by employee name:
- Use ILIKE for name matching
- Calculate days by adding 1 to the difference between end and start dates
- Include only approved leaves
- Use the standard leave balance pattern for remaining leave queries

## OVERTIME (OT) CALCULATION

Overtime = daily_hours - ot_starts_after, only if ALL conditions are met:
1. ot_starts_after IS NOT NULL
2. daily_hours > ot_starts_after
3. (daily_hours - ot_starts_after) >= min_ot_time

Use this pattern:
CASE 
  WHEN ot_starts_after IS NOT NULL 
    AND daily_hours > ot_starts_after 
    AND (daily_hours - ot_starts_after) >= min_ot_time 
  THEN daily_hours - ot_starts_after 
  ELSE 0 
END AS daily_ot

## LATE ARRIVAL DETECTION

Detect late arrivals using:
- attendance_state = '0' (check-ins)
- Late if: a.datetime > (DATE(a.datetime) + s.in_time + (s.grace_time || ' minutes')::INTERVAL)
Join tables:
- employees.employee_id::TEXT = tbl_shift_schedule."EMPID"
- DATE(a.datetime) = tbl_shift_schedule."PDATE"
- tbl_shift_schedule."SHIFT" = shifts.shift_code

## EARLY LEAVE DETECTION

Detect early departures using:
- attendance_state = '1' (check-outs)
- Early if: a.datetime < MAKE_TIMESTAMP(
    EXTRACT(YEAR FROM a.datetime)::INT,
    EXTRACT(MONTH FROM a.datetime)::INT,
    EXTRACT(DAY FROM a.datetime)::INT,
    EXTRACT(HOUR FROM s.out_time)::INT,
    EXTRACT(MINUTE FROM s.out_time)::INT,
    EXTRACT(SECOND FROM s.out_time)::INT
  )
Join tables:
- employees.employee_id::TEXT = tbl_shift_schedule."EMPID"
- DATE(a.datetime) = tbl_shift_schedule."PDATE"
- tbl_shift_schedule."SHIFT" = shifts.shift_code

## ABSENCE DETECTION

Employee is absent if scheduled but has no attendance record:
- Use LEFT JOIN between tbl_shift_schedule and attendance
- Filter where attendance is NULL
Join tables:
- employees.employee_id::TEXT = tbl_shift_schedule."EMPID"
- tbl_shift_schedule."SHIFT" = shifts.shift_code
- DATE(attendance.datetime) = tbl_shift_schedule."PDATE" (if attendance exists)

## ERROR HANDLING

If the user question is not related to HR data or cannot be answered using the database schema and policies provided, respond with: "Please ask a question related to the HR management system data. I can help with queries about employees, attendance, leaves, departments, designations, shifts, holidays, and related HR information."

## OUTPUT

Return only the final PostgreSQL SELECT query with no explanations or comments.
Use uppercase SQL keywords.

Question: "${question}" Generate only the SQL query.
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

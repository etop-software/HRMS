const pool = require('../config/Pdb'); 

const recordAttendance = async (req, res) => {
    const { employee_id, datetime, attendance_state, terminal_id } = req.body;



    try {
        const queryText = `
           INSERT INTO attendance (employee_id, datetime, attendance_state, terminal_id) 
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (employee_id, datetime) 
            DO NOTHING 
            RETURNING *;
        `;
        const values = [employee_id, datetime, attendance_state, terminal_id];
        const result = await pool.query(queryText, values);

        // if (attendance_state == 0) {
        //     const qrytext = `
        //         INSERT INTO Pattendance (employee_id, datetime, punchintime, terminal_id)
        //         VALUES ($1, $2, $3, $4)
        //         ON CONFLICT (employee_id, datetime) 
        //         DO NOTHING;  -- Do nothing if the employee has already punched in at the same time
        //     `;
            
        //     const values = [employee_id, datetime, datetime, terminal_id];
        //     pool.query(qrytext, values, (err, res) => {
        //         if (err) {
        //             console.error('Error executing query:', err);
        //         } else {
        //            // console.log('Punch-in inserted successfully:', res.rows);
        //         }
        //     });
        // }
        
        // if (attendance_state == 1) {  // For Punch-Out
        //     const updateQry = `
        //         UPDATE Pattendance
        //         SET punchouttime = $2
        //         WHERE employee_id = $1
        //           AND punchouttime IS NULL  -- Ensure there's no existing punch-out
        //           AND punchintime = (
        //               SELECT punchintime
        //               FROM Pattendance
        //               WHERE employee_id = $1
        //                 AND punchouttime IS NULL  -- Get the most recent punch-in without punch-out
        //               ORDER BY punchintime DESC
        //               LIMIT 1  -- Only update the most recent punch-in
        //           );
        //     `;
        
        //     const insertQry = `
        //         INSERT INTO Pattendance (employee_id, datetime, punchintime, punchouttime, terminal_id)
        //         SELECT $1, $2, NULL, $2, $3
        //         WHERE NOT EXISTS (
        //             SELECT 1
        //             FROM Pattendance
        //             WHERE employee_id = $1
        //               AND punchouttime IS NULL  -- Ensure no punch-out exists
        //         );
        //     `;
        
        //     // First, try to update
        //     pool.query(updateQry, [employee_id, datetime], (err, res) => {
        //         if (err) {
        //             console.error('Error executing update query:', err);
        //         } else if (res.rowCount === 0) {  // If no rows were updated (no punch-in to update)
        //             // No punch-in found, insert a new row with punch-out time and NULL punch-in
        //             pool.query(insertQry, [employee_id, datetime, terminal_id], (err, res) => {
        //                 if (err) {
        //                     console.error('Error executing insert query:', err);
        //                 } else {
        //                   //  console.log('Punch-out (without punch-in) inserted successfully:', res.rows);
        //                 }
        //             });
        //         } else {
        //           //  console.log('Punch-out updated successfully:', res.rows);
        //         }
        //     });
        // }
        
        return res.status(201).json({  attendanceRecord: result.rows[0] });
    } catch (error) {
        console.error(error);
        console.log({ message: 'Server Error', error: error.message });
    }
};

const getAttendance = async (req, res) => {
    try {
        const queryText = 'SELECT * FROM attendance;';
        const result = await pool.query(queryText);
        return res.status(200).json({ message: 'Attendance retrieved successfully', attendanceRecords: result.rows });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const processAttendance = async (req, res) => {
    const { startDate, endDate } = req.body; 
    let currentDate = new Date(startDate);  
  
    while (currentDate <= new Date(endDate)) {
      const formattedDate = currentDate.toISOString().split('T')[0];  
      await insertAttendanceData(formattedDate); 
      currentDate.setDate(currentDate.getDate() + 1); 
    }
  
    res.send('Attendance data processed for the specified date range.');
};

const insertAttendanceData = async (date) => {
    try {
      await pool.query('Select public.sp_insert_summary($1)', [date]);
    } catch (err) {
      console.error('Error executing stored procedure:', err);
    }
  };

module.exports = {
    recordAttendance,
    getAttendance,
    processAttendance
};

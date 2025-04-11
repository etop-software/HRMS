const pool = require('../config/Pdb'); 

exports.getAttendance = async (req, res) => {
  try {
    let { date } = req.query;

    if (!date) {
      date = new Date().toISOString().split("T")[0];  // Current date in 'YYYY-MM-DD' format
    } else {
      const convertedDate = new Date(date);
      if (isNaN(convertedDate)) {
        return res.status(400).json({ error: 'Invalid date format provided' });
      }
      date = convertedDate.toISOString().split("T")[0]; // Convert it to 'YYYY-MM-DD' format
    }

    const query = `
      SELECT * FROM get_attendance_summary_for_date($1);
    `;
    const result = await pool.query(query, [date]);
    res.status(200).json({
      message: 'Attendance records retrieved successfully',
      data: result.rows,
    });
  } catch (error) {
    console.error('Error retrieving attendance records:', error);
    res.status(500).json({ error: 'Error retrieving attendance records' });
  }
};



exports.getAttendanceById= async(req,res)=>{
    const id = req.params.id;
    try{
        const query = 'SELECT * FROM public.pattendance WHERE id = $1';
        const result = await pool.query(query, [id]);
        if(result.rows.length === 0){
            res.status(404).json({error: 'Attendance record not found'});
        }else{
            res.status(200).json({
                data: result.rows[0]
            });
        }
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Error retrieving attendance record'});
    }
};

// Add a new attendance entry
exports.addAttendance = async (req, res) => {
  const { employee_id, datetime, punchintime, punchouttime, terminal_id, remarks } = req.body;

  // Directly use the input time without converting to UTC
  const validPunchInTime = punchintime ? new Date(punchintime) : null;
  const validPunchOutTime = punchouttime ? new Date(punchouttime) : null;

  let differenceFormatted = null;

  if (validPunchInTime && validPunchOutTime) {
    const differenceInMilliseconds = validPunchOutTime - validPunchInTime;
    const hours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    differenceFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  console.log("Received request to add attendance:", req.body);

  try {
    const query = `
      INSERT INTO public.pattendance 
      (employee_id, datetime, punchintime, punchouttime, terminal_id, remarks, manual, time_difference)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [employee_id, datetime, punchintime, punchouttime, terminal_id, remarks, true, differenceFormatted];
    const result = await pool.query(query, values);

    res.status(201).json({
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error adding attendance record' });
  }
};



exports.updatePunchTimes = async (req, res) => {
  console.log("Received request to update attendance:", req.body);
  
  const id = req.params.id;
  const { punchintime, punchouttime, remarks } = req.body;

  // Directly use the input time without converting to UTC
  const validPunchInTime = punchintime ? new Date(punchintime) : null;
  const validPunchOutTime = punchouttime ? new Date(punchouttime) : null;

  let differenceFormatted = null;

  if (validPunchInTime && validPunchOutTime) {
    const differenceInMilliseconds = validPunchOutTime - validPunchInTime;
    const hours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    differenceFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  console.log("differenceFormatted:", differenceFormatted);

  try {
    const query = `
      UPDATE public.pattendance
      SET punchintime = COALESCE($1, punchintime),
          punchouttime = COALESCE($2, punchouttime),
          time_difference = COALESCE($3, time_difference),
          remarks = COALESCE($4, remarks),
          manual = true
      WHERE id = $5
      RETURNING *;
    `;

    const values = [validPunchInTime, validPunchOutTime, differenceFormatted, remarks, id];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'No matching attendance record found for the given id' });
    }
    
    return res.status(200).json({ data: result.rows[0] });

  } catch (error) {
    console.error("Error updating attendance record:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



exports.deletePunch = async (req, res) => {
  const id = req.params.id;
  try {
    const query = 'DELETE FROM public.pattendance WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);   
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.status(200).json({ data: result.rows[0] });


    console.log("Deleted attendance record:", result.rows[0]);


  }catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ error: 'Internal server error' });
  } 
};



  


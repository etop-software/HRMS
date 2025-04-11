const pool = require('../config/Pdb');

const getTodayAttendanceSummary = async (req, res) => {
    try {
      const query = 'SELECT * FROM get_today_attendance_summary()';
      const { rows } = await pool.query(query);
  
      if (rows.length > 0) {
        res.status(200).json({
          status: 'success',
          data: rows[0],  // Return the first row containing summary data
        });
      } else {
        res.status(404).json({
          status: 'error',
          message: 'No attendance data found for today.',
        });
      }
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error.',
      });
    }
  };

  const getTop10AttendenceRecords = async (req, res) => {
    try {
      const query = `
        SELECT 
          e.employee_id,
          e.name,
          d.device_name,
          a.datetime,
          a.terminal_id
        FROM 
          employees e
        JOIN 
          attendance a ON a.employee_id = e.employee_id
        JOIN 
          device_info d ON d.serial_number = a.terminal_id
        ORDER BY 
          a.datetime DESC
        LIMIT 5;
      `;
      
      const { rows } = await pool.query(query); // Assuming pool is properly initialized
      
      if (rows.length > 0) {
        res.status(200).json({
          status: 'success',
          data: rows,  // Return all rows, not just the first row
        });
      } else {
        res.status(404).json({
          status: 'error',
          message: 'No attendance data found.',
        });
      }
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error.',
      });
    }
  };
  const getDeviceStatus = async (req, res) => {
    try {
      const query = `
        SELECT 
          serial_number,
          device_name,
          CASE 
            WHEN last_seen > NOW() - INTERVAL '2 minutes' THEN true 
            ELSE false 
          END as is_online,
          last_seen
        FROM device_info
        ORDER BY is_online DESC, device_name ASC
      `;
      
      const { rows } = await pool.query(query);

   //2   console.log('Query Result:', rows); 
      
      // Update device status to false if offline
      const updatedRows = rows.map(device => {
        if (!device.is_online) {
          device.status = false;
        }
        return device;
      });
  
      res.status(200).json({
        status: 'success', 
        data: updatedRows
      });
    } catch (error) {
      console.error('Error fetching device status:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  };
  
  
  
  module.exports = {
    getTodayAttendanceSummary,
    getTop10AttendenceRecords,
    getDeviceStatus 
  };
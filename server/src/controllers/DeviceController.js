const pool = require("../config/Pdb");
const employeeData = require("../../employeeData"); 
const { json } = require('body-parser');
const getAllDevices = async (req, res) => {
    try {
      // Query to fetch all device info
      const query = `
      SELECT 
        device_info.device_name,
        device_info.serial_number,
        device_info.firmware_version,
        device_info.enrolled_users,
        device_info.fingerprints,
        device_info.attendance_records,
        device_info.device_ip,
        device_info.fingerprint_version,
        device_info.face_version,
        device_info.face_templates_count,
        device_info.status,
        device_info.dev_support_data,
        area_info.area_name  -- Adding the area name from the area_info table
      FROM device_info
      LEFT JOIN area_info ON device_info.area_id = area_info.area_id ORDER BY device_info.device_name ASC;
    `;
    
      
      // Execute the query
      const result = await pool.query(query);
  
      if (result.rows.length > 0) {
        // If there are devices, return the data
        res.json({
          success: true,
          devices: result.rows, // Returning all devices
        });
      } else {
        // If no devices are found
        res.status(404).json({
          success: false,
          message: 'No devices found',
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error fetching devices information',
        error: error.message,
      });
    }
  };
// Function to insert or update device information
const  updateDeviceInfo = async (SN, deviceInfo,areaId = 1) => {
    const query = `
      INSERT INTO device_info (serial_number, firmware_version, enrolled_users, fingerprints, attendance_records, device_ip, fingerprint_version, face_version, face_templates_count, dev_support_data,area_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (serial_number)
      DO UPDATE SET
        firmware_version = EXCLUDED.firmware_version,
        enrolled_users = EXCLUDED.enrolled_users,
        fingerprints = EXCLUDED.fingerprints,
        attendance_records = EXCLUDED.attendance_records,
        device_ip = EXCLUDED.device_ip,
        fingerprint_version = EXCLUDED.fingerprint_version,
        face_version = EXCLUDED.face_version,
        face_templates_count = EXCLUDED.face_templates_count,
        dev_support_data = EXCLUDED.dev_support_data;
    `;
  
    const values = [
      SN,
      deviceInfo.firmwareVersion,
      deviceInfo.enrolledUsers,
      deviceInfo.fingerprints,
      deviceInfo.attendanceRecords,
      deviceInfo.deviceIP,
      deviceInfo.fingerprintVersion,
      deviceInfo.faceVersion,
      deviceInfo.faceTemplatesCount,
      deviceInfo.devSupportData,
      areaId
    ];
  
    try {
      await pool.query(query, values);
    } catch (error) {
      console.error('Error updating or inserting device information:', error);
      throw error; 
    }
  };
  
  const updateDevice = async (req, res) => {
    console.log(req.body);
    const { serial_number } = req.params;
    const device_name = req.body.device_name; 
    const area_id = req.body.area_id; 
    let attendance_sync = req.body.attendance_sync;
    let user_sync = req.body.user_sync;
    let time_Zone = req.body.Zone_id;
    let reboot;
    let reboot_command_sent;
    if (req.body.reboot)
    {
      reboot=true;
      reboot_command_sent=false;

    }

  
    try {
      const query = `
        UPDATE device_info
        SET device_name = $1, area_id = $2,attendance_sync=$3,user_sync=$4,time_Zone=$6,reboot=$7,reboot_command_sent=$8
        WHERE serial_number = $5
        RETURNING *; 
      `;
      
      const result = await pool.query(query, [device_name, area_id, attendance_sync,user_sync, serial_number,time_Zone,reboot,reboot_command_sent]);
      const savedDevice =result.rows[0];


      employeeData.setLastUpdatedDevice(savedDevice);
      
  
      if (result.rowCount > 0) {
        res.json({ message: 'Device updated successfully', updatedDevice: result.rows[0] });
      } else {
        res.status(404).json({ error: 'Device not found' });
      }
    } catch (error) {
      console.error('Error while updating device:', error.message);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  };
  const getDeviceBySerialNumber = async (req, res) => {
    const { serial_number } = req.params;  
  
    try {
      const query = `
        SELECT 
          serial_number,  
          device_ip, 
          device_name,
          area_id,
          time_zone
        FROM device_info
        WHERE serial_number = $1;
      `;
      
      const result = await pool.query(query, [serial_number]);
  
      if (result.rows.length > 0) {
        res.json({
          success: true,
          device: result.rows[0], 
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Device not found',
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error fetching device information',
        error: error.message,
      });
    }
  };
  const getDeviceBySerialNumber1 = async (serial_number) => {
  
    try {
      const query = `
        SELECT 
         *
        FROM device_info
        WHERE serial_number = $1;
      `;
      const result = await pool.query(query, [serial_number]);
      return result.rows[0];
  
    } catch (error) {
      console.error(error);
    }
  };
  const markAttendanceCommandSent = async (serialNumber)=> {
    console.log(serialNumber);
    const query = `UPDATE device_info SET attendance_command_sent = TRUE WHERE serial_number = $1`;
   const result =   await pool.query(query, [serialNumber]);
   if(result.rowCount>0){
     console.log("Attendance flag set to true");
   }


};
const markUserSyncCommandSent = async (serialNumber)=> {
  console.log(serialNumber);
  const query = `UPDATE device_info SET user_sync = false WHERE serial_number = $1`;
 const result =   await pool.query(query, [serialNumber]);
 if(result.rowCount>0){
   console.log("user_sync flag set to false");
 }
};
const markRebootCommandSent = async (serialNumber)=> {
  console.log(serialNumber);
  const query = `UPDATE device_info SET reboot_command_sent = TRUE WHERE serial_number = $1`;
 const result =   await pool.query(query, [serialNumber]);
 if(result.rowCount>0){
   console.log("Reboot flag set to true");
 }
};


const markUserInfoCommandSent = async(serialNumber) => {
    const query = `UPDATE  device_info SET user_info_command_sent = TRUE WHERE serial_number = $1`;
    const result = await pool.query(query, [serialNumber]);
    if(result.rowCount>0){
      console.log("User info flag set to true");
    }
};

const resetUserSync = async (serialNumber) => {
  const query = `UPDATE device_info SET user_sync = FALSE WHERE serial_number = $1`;
  const result = await pool.query(query, [serialNumber]);
  
  if (result.rowCount > 0) {
      console.log("User sync flag set to false");
  }
};
const deleteDevice = async (req, res) => {
  const { serial_number } = req.params;

  try {
    // SQL query to delete the device based on the serial number
    const query = `
      DELETE FROM device_info
      WHERE serial_number = $1
      RETURNING *;
    `;

    // Assuming you are using a PostgreSQL client (e.g., pg)
    const result = await pool.query(query, [serial_number]);

    // Check if the device was found and deleted
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Device not found or already deleted."
      });
    }

    // Respond with a success message
    res.status(200).json({
      message: "Device deleted successfully",
      deletedDevice: result.rows[0], // Optionally return the deleted device
    });
  } catch (error) {
    console.error("Error deleting device:", error);
    res.status(500).json({
      message: "An error occurred while deleting the device",
      error: error.message,
    });
  }
};


  module.exports = {
    deleteDevice,
    updateDevice,
    getDeviceBySerialNumber,
    updateDeviceInfo,
    getAllDevices,
    markAttendanceCommandSent,
    markUserInfoCommandSent,
    getDeviceBySerialNumber1,
    markUserSyncCommandSent,
    resetUserSync,
    markRebootCommandSent
  };

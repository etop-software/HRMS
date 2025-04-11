const pool = require("../config/Pdb");
const employeeData = require("../../employeeData");
const EmployeeShift = require("./EmployeeShiftController");
const fs = require('fs');
const path = require('path');

exports.createEmployee = async (req, res) => {
console.log("Received request to create employee:", req.body);
  const {
    employee_id,
    
    name,
    email,
    phone,
    password,
    rfid,
    area_id,
    date_of_joining,
    department_id,
    designation_id,
    passport_image,
    selected_areas,
    selectedMealtypes,
    privilage,
    company_id
  } = req.body;

  if (!employee_id || !name) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const joiningDate = date_of_joining || new Date().toISOString().split('T')[0];


  // // Validate that selected_areas is an array and not empty
  // if (!Array.isArray(selected_areas) || selected_areas.length === 0) {
  //   return res.status(400).json({ message: "At least one area must be selected." });
  // }

  const client = await pool.connect(); // Start a new transaction
  try {
    // Insert the employee into the database
    const query = `
      INSERT INTO employees (
        employee_id, name, email, phone, password, rfid, date_of_joining, department_id, designation_id, passport_image, privilage,employee_data_sent,CompanyId,area_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,FALSE,$12,$13)
      ON CONFLICT (employee_id) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        rfid = EXCLUDED.rfid,
        privilage = EXCLUDED.privilage,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, password, employee_id, name, email, phone, department_id, designation_id, privilage;
    `;

    const values = [
      employee_id,
      name,
      email,
      phone,
      password,
      rfid,
      joiningDate,
      department_id,
      designation_id,
      passport_image,
      privilage,
      company_id,
      area_id
    ];

    const result = await client.query(query, values);
    const savedEmployee = result.rows[0];

    const { from_device } = req.body;

    if (!from_device) {  
      for (const areaId of selected_areas) {
        await client.query(
          'INSERT INTO public.employee_areas (employee_id, area_id) VALUES ($1, $2)',
          [employee_id, areaId]
        );
      }
    }
    if(from_device) {
      await client.query(
        'INSERT INTO public.employee_areas (employee_id, area_id) VALUES ($1, $2)',
        [employee_id, area_id]
      );
    }


    if (!from_device) {
      employeeData.setLastCreatedEmployee(savedEmployee);
    }

    // // Handling shifts (instead of mock, directly call the function)
    // const mockReq = {
    //   body: {
    //     selectedEmployees: [savedEmployee.id],
    //     shiftId: 1, // Assuming you want to assign a default shift
    //     startDate: "2025-10-01",
    //     endDate: "2030-11-30",
    //   },
    // };
    // const mockRes = {
    //   status: (statusCode) => ({
    //     json: (data) => {
    //       // Handle response logic here
    //     },
    //   }),
    //   send: (message) => {
    //     // Handle response message here
    //   },
    // };

    // // Assuming the EmployeeShift.assignShiftToEmployee method is already implemented
    // EmployeeShift.assignShiftToEmployee(mockReq, mockRes);

    res.status(201).json(savedEmployee);

  } catch (err) {
    // Rollback transaction if any error occurs
    await client.query('ROLLBACK');
    console.error("Error creating employee:", err);
    res.status(400).json({ message: err.message });
  } finally {
    // Release the client back to the pool
    client.release();
  }
};


exports.UpdateEmployeePhoto = async (req) => {
  const {
    employeeData: { employeeId, passportImage, size, type },
  } = req.body;

  try {
    const base64Data = passportImage.replace(/^data:image\/jpeg;base64,/, "");
    const filePath = path.join(__dirname, '..', 'public', 'biophoto', `${employeeId}.jpg`);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    const imageUrl = `/biophoto/${employeeId}.jpg`;
    const query = `
      UPDATE public.employees
      SET passport_image_temp = $1, size = $2, type = $3
      WHERE employee_id = $4;
    `;
    await pool.query(query, [passportImage, size, type, employeeId]);

    console.log("Passport image updated successfully!");
  } catch (error) {
    console.error("Error updating passport image:", error);
  }
};


exports.getEmployees = async (req, res) => {
  try {
    const query = `
      SELECT 
        employees.id,
        employees.employee_id,
        employees.name,
        employees.email,
        employees.phone,
        employees.password,
        employees.rfid,
        employees.date_of_joining,
        employees.department_id,
        employees.designation_id,
        employees.passport_image,
        employees.created_at,
        employees.updated_at,
        employees.area_id,
        employees.privilage,
        employees.employee_data_sent,
        employees.companyid,
        departments.department_name, 
        departments.department_head, 
        departments.email AS department_email,
        designations.title AS designation_title,
        ARRAY_AGG(DISTINCT employee_areas.area_id) AS area_ids, -- Aggregate area IDs
        ARRAY_AGG(DISTINCT area_info.area_name) AS area_names  -- Aggregate area names
      FROM employees
      LEFT JOIN departments ON employees.department_id = departments.id
      LEFT JOIN designations ON employees.designation_id = designations.id
      LEFT JOIN employee_areas ON employees.employee_id = employee_areas.employee_id
      LEFT JOIN area_info ON employee_areas.area_id = area_info.area_id
      GROUP BY employees.employee_id, departments.department_name, departments.department_head, departments.email, designations.title, employees.id;
    `;

    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(
      "Error fetching employees with department, designation, and area data:",
      err
    );
    res.status(500).json({ message: err.message });
  }
};



exports.getEmployeeById = async (req, res) => {
  const employeeId = req.params.id;

  try {
    const result = await pool.query("SELECT * FROM employees WHERE id = $1", [
      employeeId,
    ]);
    const employee = result.rows[0];

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getEmployeesbyAreaid = async (areaid) => {
  try {
    const result = await pool.query(
      `SELECT e.* 
       FROM employees e
       JOIN public.employee_areas ea ON e.employee_id = ea.employee_id
       WHERE ea.area_id = $1`,
      [areaid]
    );

    return result.rows.length ? result.rows : [];
  } catch (err) {
    console.error("Error fetching employees:", err.message);
    throw new Error("Error fetching employees");
  }
};
exports.getEmployeesbyAreaidDropdown = async (req, res) => {
  const areaid = req.params.areaid;
  
  try {
    // Fix SQL query to ensure WHERE clause comes before ORDER BY
    const result = await pool.query(
      `SELECT e.employee_id, e.name 
       FROM public.employees e
       JOIN public.employee_areas ea ON e.employee_id = ea.employee_id
       WHERE ea.area_id = $1
       ORDER BY e.name`, 
      [areaid]
  );
    if (result.rows.length === 0) {
      return res.status(200).json([]); // Send empty array if no employees found
    }
    
    // Send the list of employees as response
    return res.status(200).json(result.rows);
    
  } catch (err) {
    console.error("Error fetching employees:", err.message);
    return res.status(500).json({ error: "Error fetching employees" });
  }
};


exports.getEmployeesFingerbyAreaid = async (areaid) => {
  
  try {
    const query = `
  SELECT ef.*, e.* 
  FROM employee_areas ea
  JOIN employees e ON ea.employee_id = e.employee_id
  RIGHT JOIN employee_fingerprints ef ON e.employee_id = ef.employee_id
  WHERE ea.area_id = $1
`;
    const result = await pool.query(query, [areaid]);
    if (result.rows.length === 0) {
      return [];
    }
    return result.rows; 

  } catch (err) {
    console.error("Error fetching employees and fingerprints:", err.message);
  }
};




exports.updateEmployee = async (req, res) => {
  const employeeId = req.params.id;

  // Ensure required fields are present, including company_id
  const { name, email, phone, password, rfid, date_of_joining, department_id, designation_id, passport_image, privilage, companyid, area_ids } = req.body;


  const client = await pool.connect();
  try {
    // Start the transaction
    await client.query('BEGIN');

    // Step 1: Update the employee data, including company_id
    const query = `
      UPDATE employees 
      SET name = $1, 
          email = $2, 
          phone = $3, 
          password = $4, 
          rfid = $5, 
          date_of_joining = $6, 
          department_id = $7, 
          designation_id = $8, 
          passport_image = $9,
          privilage = $10,
          CompanyId = $11,  -- Updated this line to include company_id
          employee_data_sent = FALSE
      WHERE employee_id = $12
      RETURNING *;
    `;

    const values = [
      name,
      email,
      phone,
      password,
      rfid,
      date_of_joining,
      department_id,
      designation_id,
      passport_image || null,  // Handle optional field
      privilage,
      companyid,  // Added company_id to values
      employeeId
    ];

    const result = await client.query(query, values);
    const updatedEmployee = result.rows[0];

    // If no employee found, return an error
    if (!updatedEmployee) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Employee not found" });
    }

    // Step 2: Delete previous associations with areas
    await client.query('DELETE FROM public.employee_areas WHERE employee_id = $1', [employeeId]);

    // Step 3: Insert new area associations (only if area_ids is provided)
    if (Array.isArray(area_ids) && area_ids.length > 0) {
      for (const areaId of area_ids) {
        await client.query(
          'INSERT INTO public.employee_areas (employee_id, area_id) VALUES ($1, $2)',
          [employeeId, areaId]
        );
      }
    }

    // Commit the transaction after successful operations
    await client.query('COMMIT');

    const { from_device } = req.body;
    if (!from_device) {
      employeeData.setLastCreatedEmployee(updatedEmployee);
    }

    // Respond with the updated employee data
    res.status(200).json(updatedEmployee);

  } catch (err) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.log("Error updating employee:", err);
    res.status(400).json({ message: err.message });
  } finally {
    // Release the client back to the pool
    client.release();
  }
};




exports.getAllSns = async (a) => {
  const employee_id = a.employee_id;
    try {
      const query = `
        SELECT serial_number 
        FROM public.device_info
        WHERE area_id IN (
            SELECT area_id 
            FROM public.employee_areas 
            WHERE employee_id = $1
        );
      `;
      
      const result = await pool.query(query, [employee_id]);
      return result.rows.map(row => row.serial_number);
    
  } catch (err) {
    console.error("Error fetching devices:", err);
    throw err;
  }
};

exports.deleteEmployee = async (req, res) => {
  const employeeId = req.params.id;

  try {
    const result = await pool.query(
      "DELETE FROM employees WHERE employee_id = $1 RETURNING *",
      [employeeId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(204).send(); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getEmployeeByemployeeId = async (employeeId) => {
  try {
    const query = `SELECT employee_data_sent FROM employees WHERE employee_id = $1`; // Only fetch the employee_data_sent column
    const result = await pool.query(query, [employeeId]);

    if (result.rows.length > 0) {
      return result.rows[0].employee_data_sent; // Access the employee_data_sent value
    } else {
      return null; // Employee not found
    }
  } catch (error) {
    console.error('Error fetching employee by ID:', error);
    throw new Error('Error fetching employee');
  }
};


exports.getEmployeeByParam = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM employees WHERE employeeId = $1",
      [employeeId]
    );
    const employee = result.rows[0];

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEmployeeFinger = async (req, res) => {
  console.log("Received request to update employee fingerprint:", req.body);
  const {
    employee_id,
    fingerprint_id,
    fingerprint_size,
    fingerprint_valid,
    fingerprint_image,
  } = req.body;

  try {
    const query = `
     INSERT INTO public.employee_fingerprints (employee_id, fingerprint_id, fingerprint_size, fingerprint_valid, fingerprint_image)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (employee_id, fingerprint_id) 
     DO UPDATE SET 
       fingerprint_size = EXCLUDED.fingerprint_size,
       fingerprint_valid = EXCLUDED.fingerprint_valid,
       fingerprint_image = EXCLUDED.fingerprint_image,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *;
    `;

    // Execute the query with parameterized values to avoid SQL injection
    const result = await pool.query(query, [
      employee_id,
      fingerprint_id,
      fingerprint_size,
      fingerprint_valid,
      fingerprint_image,
    ]);

    res.status(200).json({
      message: "Employee fingerprint updated successfully",
      employee_fingerprint: result.rows[0], 
    });
  } catch (error) {
    console.error("Error updating employee fingerprint:", error);
    res.status(500).json({
      message: "Error updating employee fingerprint",
      error: error.message,
    });
  }
};

exports.markEmployeeDataSent= async(employeeId) =>{
  const query = `UPDATE employees SET employee_data_sent = TRUE WHERE employee_id = $1`;
  await pool.query(query, [employeeId]);
};

exports.getEmployeesforDropdown = async (req, res) => {
  try {
    const query = `
      SELECT employee_id, name
      FROM employees
      order by employee_id ASC
    `;  
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  }
  catch (err) {
    console.error("Error fetching employees for dropdown:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getEmployeeAreas = async (req, res) => {
  const { employee_id } = req.params;

  try {
    const result = await pool.query(
      'SELECT area_id FROM employee_areas WHERE employee_id = $1',
      [employee_id]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching employee areas:", err);
    res.status(500).json({ message: err.message });
  }
};



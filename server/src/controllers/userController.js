const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/Pdb');

// JWT secret key (store in .env file in real apps)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};



exports.updateUser = async (req, res) => {
    console.log(req.body);
    const {
        user_id,
        username,
        password,
        userType,
        privileges
    } = req.body;

    try {
        let updateQuery = 'UPDATE users SET username = $1, userType = $2';
        let queryParams = [username, userType];
        let paramCount = 2;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateQuery += `, password = $${++paramCount}, force_password_change = true`; 
            queryParams.push(hashedPassword);
        }

        const privilegeFields = {
            department_access: privileges.departments,
            designation_access: privileges.designations,
            employee_access: privileges.employees,
            company_access: privileges.company,
            shifts_access: privileges.shifts,
            device_area_access: privileges.deviceArea,
            reports_access: privileges.reports,
            processing_access: privileges.processing,
            manual_punch_access: privileges.manualPunch,
            users_access: privileges.users
        };

        Object.entries(privilegeFields).forEach(([field, value]) => {
            if (value !== undefined) {
                updateQuery += `, ${field} = $${++paramCount}`;
                queryParams.push(value);
            }
        });

        updateQuery += ` WHERE user_id = $${++paramCount} RETURNING *`;
        queryParams.push(user_id);

        const result = await pool.query(updateQuery, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User updated successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



exports.registerUser = async (req, res) => {
    const { user_id, password, username, userType, privileges } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await pool.query(
            `INSERT INTO users (
                user_id, 
                password, 
                username, 
                userType, 
                force_password_change,
                organization_access,
                department_access,
                designation_access,
                employee_access,
                company_access,
                shifts_access,
                device_area_access,
                reports_access,
                processing_access,
                manual_punch_access,
                users_access
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
            [
                user_id, 
                hashedPassword, 
                username, 
                userType, 
                true,
                privileges.organization,
                privileges.departments,
                privileges.designations,
                privileges.employees,
                privileges.company,
                privileges.shifts,
                privileges.deviceArea,
                privileges.reports,
                privileges.processing,
                privileges.manualPunch,
                privileges.users
            ]
        );

        res.status(201).json({
            message: 'User successfully registered',
            user_id: result.rows[0].user_id,
            userType: result.rows[0].userType
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};




// Login user
exports.loginUser = async (req, res) => {
  const { user_id, password } = req.body;

  try {
      // Check if the user exists
      const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
      if (result.rows.length === 0) {
          return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = result.rows[0];

      // Compare hashed password with the one in the DB
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
          { user_id: user.user_id, username: user.username },
          JWT_SECRET,
          { expiresIn: '1h' }
      );
      res.json({
        token,
        user_id: user.id,
        username: user.username,
        force_password_change: user.force_password_change,
        usertype: user.usertype,
        privileges: {
            organization: user.organization_access,
            departments: user.department_access,
            designations: user.designation_access,
            employees: user.employee_access,
            company: user.company_access,
            shifts: user.shifts_access,
            deviceArea: user.device_area_access,
            reports: user.reports_access,
            processing: user.processing_access,
            manualPunch: user.manual_punch_access,
            users: user.users_access
        }
    });
    

  } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
  }
};

exports.changePassword = async (req, res) => {
  console.log(req.body);
  const { userId, new_password } = req.body;

  try {

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(new_password, salt);


      const result = await pool.query(
          'UPDATE users SET password = $1, force_password_change = false WHERE id = $2 RETURNING *',
          [hashedPassword, userId]
      );

      if (result.rowCount === 0) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'Password changed successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
  
    try {
      // Check if the user being deleted is an admin
      const userCheck = await pool.query('SELECT usertype FROM users WHERE id = $1', [id]);

      console.log(userCheck.rows);  
  
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (userCheck.rows[0].usertype === 'Admin') {

        console.log('Admin found');
        // Count the number of admins in the system
        const adminCount = await pool.query("SELECT COUNT(*) FROM users WHERE userType = 'Admin'");
  
        if (parseInt(adminCount.rows[0].count) === 1) {
          return res.status(400).json({ 
            message: 'Cannot delete the last remaining admin. Please create a new admin first.' 
          });
        }
      }
  
      // Proceed with deletion
      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
  
      res.json({ message: 'User deleted successfully' });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  



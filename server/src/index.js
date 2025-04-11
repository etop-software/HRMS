const express = require('express');
const { initializeDailyNotificationSchedule } = require('./controllers/mailerController.js');  // Import function
const path = require('path');

const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./config/Pdb.js'); 
const employeeRoutes = require('./routes/employee'); 
const departmentRoutes = require('./routes/departments');
const designationRoutes = require('./routes/designations');
const attendanceRoutes = require('./routes/attendance');
const shiftRoutes = require('./routes/shift');
const employeeShiftRoutes = require('./routes/employeeShift'); 
const leaveRoutes = require('./routes/leaves'); 
const assignLeaveToEmployee = require('./routes/AssignLeave');
const reportRoutes = require('./routes/Reports');
const areaRoutes = require('./routes/areas.js');
const deviceRoutes = require('./routes/Devices.js');
const dashBoardRoutes=require('./routes/DashBoard.js');
const userRoutes = require('./routes/users.js');
const mealTypeRoutes = require('./routes/mealtypes');
const companiesRoutes=require('./routes/company.js');
const ManualLogs = require('./routes/manualPunch.js');
const gptRoutes = require('./routes/gpt.js'); // Import the GPT routes


require('dotenv').config({ path: '../.env' }); 

const app = express();
//app.use(express.text({ type: 'text/plain', limit: '100mb' })); 
app.use((req, res, next) => {
    if (req.headers['user-agent']?.includes('iClock')) {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        
        req.on('end', () => {
            req.rawBody = data;  // Store raw data
            next();
        });
    } else {
        next();
    }
});

//app.use(express.text({ type: 'text/plain', limit: '100mb' }));
/// app.use(express.raw({ type: 'text/plain', limit: '100mb' }));
app.use(express.json({ limit: '100mb' }));
//app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(cors({
    origin: '*', 
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: 'Content-Type, Authorization', 
    credentials: true 
  }));
  
  app.options('*', cors()); 
app.use(express.static(path.join(__dirname, 'public')));
  

app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/employeeShift', employeeShiftRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignLeave', assignLeaveToEmployee);
app.use('/api/Reports', reportRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/dashboard',dashBoardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mealtypes', mealTypeRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/manualLogs', ManualLogs);
app.use('/api/gpt',gptRoutes );

setInterval(async () => {

    const threshold = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    const thresholdIsoString = threshold.toISOString();
    
    // console.log("Current Time:", new Date().toISOString());
    // console.log("Threshold Time (ISO):", thresholdIsoString);
    
    // // Example usage:
    // const someDate = "2025-01-13T08:25:00.000Z"; // Replace with your date
    // console.log("Is before threshold?", someDate < thresholdIsoString);

    try {
        await pool.query(
            `UPDATE device_info
             SET status = FALSE
             WHERE last_seen < $1`, 
            [thresholdIsoString] 
        );
    //    console.log("Offline devices updated.");
    } catch (err) {
        console.error("Error updating offline devices:", err);
    }
}, 6000); 

var pushOperations = require('./controllers/pushOperations.js')(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
    console.log('Closing PostgreSQL pool');
    await pool.end(); 
    console.log('PostgreSQL pool closed');
    process.exit(0); 
});

process.on('SIGTERM', async () => {
    console.log('Closing PostgreSQL pool');
    await pool.end();
    console.log('PostgreSQL pool closed');
    process.exit(0);
});

const nodemailer = require('nodemailer');
const pool = require('../config/Pdb');
const cron = require('node-cron');

// Function to fetch active shifts with grace period
async function fetchActiveShift() {
    const query = `
        SELECT id, shift_name, in_time, grace_time
        FROM public.shifts
        WHERE is_active = true LIMIT 1;
    `;
    try {
        const result = await pool.query(query);
        return result.rows[0]; // Return the first active shift
    } catch (err) {
        console.error('Error fetching active shift:', err);
        throw err;
    }
}

// Function to schedule a notification for a shift
async function scheduleNotificationForShift() {
    const shift = await fetchActiveShift();
//console.log(shift);
    if (!shift) {
        console.log('No active shift found.');
        return;
    }

    const { shift_name, in_time, grace_time } = shift;

    const [hours, minutes] = in_time.split(':').map(Number);

    const notificationTime = new Date();
    notificationTime.setHours(hours, minutes + grace_time, 0);  // Add grace time to shift start

    // // Ensure notification time is in the future
    if (notificationTime < new Date()) {
      //  console.log(`Notification for shift "${shift_name}" is skipped because it's in the past.`);
        return;
    }

    const cronTime = `${notificationTime.getMinutes()} ${notificationTime.getHours()} * * *`;

    cron.schedule(cronTime, async () => {
        console.log(`Sending late employee report for shift: ${shift_name}`);
        const today = new Date();
        const startDate = today.toISOString().slice(0, 10);
        const endDate = today.toISOString().slice(0, 10);
        await sendLateEmployeeReport(startDate, endDate);
    });

  //  console.log(`Notification scheduled for shift "${shift_name}" at ${notificationTime}.`);
}

// Send the late employee report
async function sendLateEmployeeReport(startDate, endDate) {
    try {
        const query = `SELECT * FROM public.get_employee_late_report($1, $2);`;
        const lateEmployees = await pool.query(query, [startDate, endDate]);

        if (lateEmployees.rows.length === 0) {
            console.log('No late employees found for the specified period.');
            return;
        }

        const emailBody = `
            <h2>Late Employees Report</h2>
            <p>Here is the list of employees who were late between <strong>${startDate}</strong> and <strong>${endDate}</strong>:</p>
            ${formatLateEmployeesAsTable(lateEmployees.rows)}
        `;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your-email@gmail.com',
                pass: 'your-email-password',
            },
        });

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: 'boss-email@example.com',
            subject: 'Late Employees Report',
            html: emailBody,
        };

        await transporter.sendMail(mailOptions);
        console.log('Late employee report sent to the boss!');
    } catch (err) {
        console.error('Error sending late employee report:', err);
    }
}

// Format employees' data into an email-friendly table
function formatLateEmployeesAsTable(lateEmployees) {
    if (lateEmployees.length === 0) {
        return `<p>No employees were late during the specified period.</p>`;
    }

    let tableRows = lateEmployees
        .map(employee => `
            <tr>
                <td>${employee.employeeid}</td>
                <td>${employee.employeename}</td>
                <td>${employee.designation}</td>
                <td>${employee.department}</td>
                <td>${employee.punchindate}</td>
                <td>${employee.punchintime}</td>
                <td>${employee.shift}</td>
                <td>${employee.shiftintime}</td>
                <td>${employee.lateminutes}</td>
            </tr>
        `)
        .join('');

    return `
        <table border="1" cellpadding="5" cellspacing="0">
            <thead>
                <tr>
                    <th>Employee ID</th>
                    <th>Employee Name</th>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>Punch-In Date</th>
                    <th>Punch-In Time</th>
                    <th>Shift</th>
                    <th>Shift Start Time</th>
                    <th>Late Minutes</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

// Initialize the scheduling process
async function initializeDailyNotificationSchedule() {
    await scheduleNotificationForShift();  // Schedule the notification for the shift
}

// Call this function once to initialize the schedule when the app starts
module.exports = { initializeDailyNotificationSchedule };

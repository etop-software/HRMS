const mongoose = require('mongoose');
const Employee = require('../models/employee');// Adjust the path as necessary

const uri = "mongodb+srv://abhishekkalvakota24:i4fKaZWH1xHocHD3@test.3cpbw.mongodb.net/?retryWrites=true&w=majority&appName=Test"; // Replace with your MongoDB URI

// Connect to your MongoDB database
mongoose.connect(uri, {
  
})
.then(() => {
    console.log('Connected to MongoDB');
    updateEmployees(); // Call the update function
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

const updateEmployees = async () => {
    try {
        // Update existing employees to set default values for designation and department
        const result = await Employee.updateMany(
            {},
            { 
                $set: { 
                    designation: null, // Set designation to null or a default value
                    department: null // Set department to null or a default value
                }
            }
        );

        console.log(`${result.nModified} employees updated successfully.`);
    } catch (err) {
        console.error('Error updating employees:', err);
    } finally {
        mongoose.connection.close(); // Close the connection
    }
};

// Run the update function immediately when this script is executed
updateEmployees();

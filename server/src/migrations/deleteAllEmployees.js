// src/migrations/deleteAllEmployees.js
const mongoose = require("mongoose");
const Employee = require("../models/employee"); // Adjust the path as necessary

const uri = "mongodb+srv://abhishekkalvakota24:i4fKaZWH1xHocHD3@test.3cpbw.mongodb.net/?retryWrites=true&w=majority&appName=Test"; // Replace with your MongoDB URI

const deleteAllEmployees = async () => {
  try {
    await mongoose.connect(uri);
    
    // Delete all documents in the Employee collection
    await Employee.deleteMany({});

    console.log("All employees deleted successfully.");
  } catch (error) {
    console.error("Error deleting employees:", error);
  } finally {
    await mongoose.connection.close();
  }
};

deleteAllEmployees();

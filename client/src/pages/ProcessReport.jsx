import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { CalendarDays, RefreshCw } from "lucide-react";

const AttendanceProcessing = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  
  // Get yesterday's date in YYYY-MM-DD format
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1); // Subtract one day from today
  const yesterdayDate = yesterday.toISOString().split("T")[0];


  const yesterday1 = new Date();
  yesterday1.setDate(yesterday1.getDate() - 2); // Subtract one day from today
  const yesterdayDate1 = yesterday1.toISOString().split("T")[0];

  const handleProcessAttendance = async () => {
    setIsProcessing(true);
    setMessage("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance/process`, {
        startDate,
        endDate,
      });
      setMessage("Attendance data processed successfully!");
    } catch (error) {
      setMessage("Error processing attendance data.");
      console.error("Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mt-6">
        <CardBody>
          <div className="mb-8">
            <Typography variant="h4" color="blue-gray" className="mb-2 flex items-center">
              <RefreshCw className="h-6 w-6 mr-2" />
              Process Attendance Data
            </Typography>
            <Typography color="gray" className="font-normal">
              Select date range to process attendance records
            </Typography>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <CalendarDays className="h-5 w-5 mr-2 text-blue-500" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={yesterdayDate1}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <CalendarDays className="h-5 w-5 mr-2 text-blue-500" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={yesterdayDate} // Disallow selecting future dates
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleProcessAttendance}
              disabled={isProcessing || !startDate || !endDate}
              className="flex items-center gap-2 bg-blue-500 px-6"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Process Data
                </div>
              )}
            </Button>
          </div>

          {message && (
            <div className={`mt-6 p-4 rounded-lg text-center ${
              message.includes("success") 
                ? "bg-green-50 text-green-700" 
                : "bg-red-50 text-red-700"
            }`}>
              {message}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default AttendanceProcessing;

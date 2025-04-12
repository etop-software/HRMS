import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { ChevronUpIcon, ChevronDownIcon, UsersIcon, ClockIcon } from "@heroicons/react/24/outline";
import { UsersRound, AlarmClockCheck, AlarmClockMinus, CalendarX2, CalendarOff } from "lucide-react";
import AttendanceTable from '../components/AttendanceTable';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Link } from "react-router-dom";
import FloatingChatbot from '../components/FloatingChatbot';

ChartJS.register(ArcElement, Tooltip, Legend,ArcElement, ChartDataLabels);

function DashBoard() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceTableData, setAttendanceTableData] = useState(null);
  const [error, setError] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchDeviceStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/device-status`);
      const result = await response.json();
      if (result.status === 'success') {
        setDeviceStatus(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch device status');
    }
  };

  // Fetch the summary attendance data
  const fetchAttendanceSummary = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/attendance-summary`);

      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setAttendanceData(data.data);
      } else {
        setError('No attendance data found for today.');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Fetch the attendance table data
  const fetchAttendanceTableData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/punchIn-summary`);

      const result = await response.json();
      
      if (result.status === 'success') {
        setAttendanceTableData(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to fetch data');
    }
  };

  // UseEffect to fetch data on component mount and refresh periodically
  useEffect(() => {
    fetchAttendanceSummary();
    fetchAttendanceTableData();
  fetchDeviceStatus();

    const intervalId = setInterval(() => {
      fetchAttendanceSummary(); 
      fetchAttendanceTableData();
     fetchDeviceStatus();
    }, 10000);

    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }, []);

  // if (!attendanceData || !attendanceTableData) {
  //   return (
  //     <div className="flex justify-center items-center mt-10">
  //       <div className="spinner-border animate-spin w-16 h-16 border-4 border-t-transparent rounded-full"></div>
  //       <span className="ml-4">Loading...</span>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen p-6">
     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 cursor-pointer">
        <Card className="transform hover:scale-105 transition-transform duration-300">
          <CardBody className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <UsersRound className="h-8 w-8 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <Typography variant="h3" className="font-bold text-gray-800">
              {attendanceData?.total_employees || '0'}
            </Typography>
            <Typography className="text-sm text-gray-600">
              Total Employees
            </Typography>
          </CardBody>
        </Card>

        {/* On Time Card */}
        <Card className="transform hover:scale-105 transition-transform duration-300">
          <CardBody className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <AlarmClockCheck className="h-8 w-8 text-green-600" />
              <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                On Time
              </span>
            </div>
            <Typography variant="h3" className="font-bold text-gray-800">
              {attendanceData?.on_time || '0'}
            </Typography>
            <Typography className="text-sm text-gray-600">
              Arrived On Time
            </Typography>
          </CardBody>
        </Card>

        {/* Late In Card */}
        <Card className="transform hover:scale-105 transition-transform duration-300">
          <CardBody className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <AlarmClockMinus className="h-8 w-8 text-yellow-600" />
              <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                Late
              </span>
            </div>
            <Typography variant="h3" className="font-bold text-gray-800">
              {attendanceData?.late || '0'}
            </Typography>
            <Typography className="text-sm text-gray-600">
              Late Arrivals
            </Typography>
          </CardBody>
        </Card>

        {/* Absent Card */}
        <Card className="transform hover:scale-105 transition-transform duration-300">
          <CardBody className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <CalendarX2 className="h-8 w-8 text-red-600" />
              <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                Absent
              </span>
            </div>
            <Typography variant="h3" className="font-bold text-gray-800">
              {attendanceData?.absent || '0'}
            </Typography>
            <Typography className="text-sm text-gray-600">
              Not Present Today
            </Typography>
          </CardBody>
        </Card>

        {/* Time Off Card */}
        <Card className="transform hover:scale-105 transition-transform duration-300">
          <CardBody className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <CalendarOff className="h-8 w-8 text-purple-600" />
              <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                Time Off
              </span>
            </div>
            <Typography variant="h3" className="font-bold text-gray-800">
              {attendanceData?.time_off || '0'}
            </Typography>
            <Typography className="text-sm text-gray-600">
              Planned Leave
            </Typography>
          </CardBody>
        </Card>
      </div>

      {/* Real-time Monitoring Section */}
      <div className="bg-white rounded-xl shadow-sm">
  <div className="mb-6">
    <h2 className="text-xl font-bold text-gray-800">Real-time Monitoring</h2>
  </div>

  <div className="flex space-x-6">
    {/* Table */}
    <div className="flex-1">
      <div className="overflow-x-auto">
          <AttendanceTable data={attendanceTableData} />
      </div>
    </div>

    {/* Chart */}
    
    <div className="flex-1">
    <Link  to='/devices'>
      <Card className="transform transition-transform duration-300 ">
        <CardBody className="p-4 bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Device Status</h3>
          </div>
          <div className="h-64 relative">
          <Pie
data={{
  labels: ['Online', 'Offline'],
  datasets: [
    {
      data: [
        deviceStatus.filter(d => d.is_online).length,  // Online count
        deviceStatus.filter(d => !d.is_online).length, // Offline count
      ],
      backgroundColor: ['#52b788', '#f28482'],  // Green for online, Red for offline
      borderWidth: 1,
      borderColor: '#fff',
      cutout: '75%',
    },
  ],
}}

  options={{
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 14,
          },
        },
      },
      datalabels: {
        color: '#333',  // Darker color for visibility
        anchor: 'end',  // Place labels outside the pie
        align: 'start',  // Align labels away from the center
        offset: 10,  // Space between the chart and labels
        font: {
          size: 14,
          weight: 'bold',
        },
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          return `${label}: ${value}`;
        },
      },
    },
  }}
/>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-700">
                  {deviceStatus.length}
                </div>
                <div className="text-sm text-gray-500">Total Devices</div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      </Link>
    </div>
   
  </div>
</div>

<FloatingChatbot />
    </div>
    
  );
}

export default DashBoard;

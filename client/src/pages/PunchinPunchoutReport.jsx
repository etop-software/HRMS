import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardHeader,
  Input,
  Dialog,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Avatar,
  IconButton,
  Tooltip,
  Select,
  Option,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { ChevronRight,FileSpreadsheet,FileText } from "lucide-react";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { useCompany } from "../contexts/CompanyContext";

import * as XLSX from "xlsx";

const PunchinPunchoutReport = () => {
  const { companyName } = useCompany();
  const storedUser = localStorage.getItem('user');

 const LoggedUser = storedUser.replace(/["\n]/g, '').trim();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(35);
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [areas, setAreas] = useState([]);
  const [departments, setDepartments] = useState([]);
  useEffect(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 2);

    const startDateString = sevenDaysAgo.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    const endDateString = today.toISOString().split("T")[0]; // Format as YYYY-MM-DD

    setStartDate(startDateString);
    setEndDate(endDateString);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport();
      fetchareas();
      fetchDepartments();
    }
  }, [startDate, endDate]); // This effect runs when startDate or endDate changes

const fetchareas = async() =>{

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/areas`,
    );
    setAreas(response.data);
  } catch (error) {
    console.error("Error fetching report:", error);
    setError("Failed to fetch the report. Please try again.");
  } finally {
  }


}

const fetchDepartments = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + "/api/departments");
    if (response.ok) {
      const data = await response.json();
      setDepartments(data);
    } else {
      console.error("Failed to fetch departments:", response.statusText);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
};
  const fetchReport = async (terminalId, employeeId) => {
    setLoading(true);
    setError("");
  
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/Reports/Pattendance-report`,
        {
          params: {
            startDate,
            endDate,
           // terminal_id: terminalId || null,
            employee_id: employeeId || null,
            area_id:selectedArea|| null,
            department_id:selectedDepartment|| null,
          },
        }
      );
      console.log("Report data:", response.data.data);
      
      setReportData(response.data.data);
    } catch (error) {
      console.error("Error fetching report:", error);
      setError("Failed to fetch the report. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  // Filter report data based on search term
  const filteredData = reportData.filter((row) =>
    row.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedArea(value);
  };
  //handleDepartmentChange

  
  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setSelectedDepartment(value);
  };

  // Function to format time into HH:MM:SS
  // const formatTime = (dateTime) => {
  //   if (!dateTime) return "-";
  //   const date = new Date(dateTime);
  //   return date.toLocaleTimeString([], {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //   });
  // };

  const formatTime = (dateTime) => {
    if (!dateTime) return "-";
    const date = new Date(dateTime);
  
    // Extract the hours, minutes, and seconds from the original time
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${hours}:${minutes}:${seconds}`;
  };
  

  // Paginate the filtered data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };
  const exportToExcel = () => {
    //const worksheet = XLSX.utils.json_to_sheet(filteredData);

    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map(row => ({
        "ID": row.employee_id || "-",
        "Name": row.employee_name || "-",
        "Area": row.area || "-",
        "Date": row.punchintime
          ? row.punchintime.split("T")[0]
          : row.punchouttime
          ? row.punchouttime.split("T")[0]
          : "N/A", // Date logic corrected
        "In Time": (row.punchintime && row.punchintime.split('T')[1]?.slice(0, 5)) || "-",
        "Out Time": row.punchouttime
          ? row.punchouttime.split('T')[1]?.slice(0, 5) || "-"
          : "-",  // Null-safe check for Out Time
        "Total Hrs": row.time_difference || "-", 
      }))
    );
    
   
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Punch Report");
    XLSX.writeFile(workbook, "PunchInPunchOutReport.xlsx");
  };

  const MyPDFDocument = () => {
    const styles = StyleSheet.create({
      page: {
        flexDirection: "column",
        padding: 20,
      },
      title: {
        fontSize: 11,
        fontWeight: "bold",
        textAlign: "left", // Center title
      },
      headerRow: {
        flexDirection: "row", // Create a horizontal layout for Generated By and Company Name
        justifyContent: "space-between", // Space out the two elements
        marginBottom: 10,
      },
      generatedByText: {
        fontSize: 11,
        fontWeight: "bold",
        textAlign: "left", // Left-aligned text
        flex: 1, // Allow this section to take available space
      },
      companyText: {
        fontSize: 11,
        fontWeight: "bold",
        textAlign: "right", // Right-aligned text
        flex: 1, // Allow this section to take available space
      },
      dateText: {
        fontSize: 11,
        textAlign: "right", // Center Date Range
        marginVertical: 5,
      },
      table: {
        display: "table",
        width: "100%",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#ccc",
        marginBottom: 20,
      },
      tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
      },
      tableHeader: {
        backgroundColor: "#f1f1f1",
        fontWeight: "bold",
        textAlign: "center",
      },
      tableCell: {
        padding: 8,
        fontSize: 10,
        textAlign: "center",
        borderRightWidth: 1,
        borderRightColor: "#ccc",
        flex: 1,
      },
      columnID: {
        width: "10%",
      },
      columnName: {
        width: "20%",
      },
      columnDate: {
        width: "15%",
      },
      columnPunchIn: {
        width: "20%",
      },
      columnPunchOut: {
        width: "20%",
      },
      columnTerminalID: {
        width: "15%",
      },
    });

    return (
      <Document>
        <Page style={styles.page}>
          <View>
          <View style={styles.headerRow}>
          <Text style={styles.title}>Report Type :PunchIn / PunchOut </Text>
<Text style={styles.dateText}>Generated from: {startDate} to  {endDate}</Text>
</View>
<View style={styles.headerRow}>
  <Text style={styles.generatedByText}>Generated by: {LoggedUser}</Text>
  <Text style={styles.companyText}>Company Name: {companyName}</Text>
</View>

            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.columnID]}>ID</Text>
                <Text style={[styles.tableCell, styles.columnName]}>Name</Text>
                <Text style={[styles.tableCell, styles.columnName]}>Area</Text>
                <Text style={[styles.tableCell, styles.columnDate]}>Date</Text>
                <Text style={[styles.tableCell, styles.columnPunchIn]}>
                  Punch In Time
                </Text>
                <Text style={[styles.tableCell, styles.columnPunchOut]}>
                  Punch Out Time
                </Text>
                <Text style={[styles.tableCell, styles.columnTerminalID]}>
                  Total Hrs
                </Text>
              </View>
              {filteredData.map((row, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.columnID]}>
                    {row.employee_id || "-"}
                  </Text>
                  <Text style={[styles.tableCell, styles.columnName]}>
                    {row.employee_name || "-"}
                  </Text>
                  <Text style={[styles.tableCell, styles.columnName]}>
                    {row.area || "-"}
                  </Text>
                  <Text style={[styles.tableCell, styles.columnDate]}>
                    {row.punchintime
                      ? row.punchintime.split("T")[0]
                      : row.punchouttime
                      ? row.punchouttime.split("T")[0]
                      : "N/A"}
                  </Text>
                  <Text style={[styles.tableCell, styles.columnPunchIn]}>
                    {/* {formatTime(row.punchintime)} */}
  {(row.punchintime && row.punchintime.split('T')[1]?.slice(0, 5)) || "-"}
  
                  </Text>
                  <Text style={[styles.tableCell, styles.columnPunchOut]}>
  {(row.punchouttime && row.punchouttime.split('T')[1]?.slice(0, 5)) || "-"}
                  </Text>
                  <Text style={[styles.tableCell, styles.columnTerminalID]}>
                    {row.time_difference || "-"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Page>
      </Document>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-2">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/reports"
                className="inline-flex items-center text-gray-700 hover:text-blue-600"
              >
                Reports
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-gray-500 md:ml-2">
                  Punch In / Punch Out
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-md p-3 mb-3">
        <div className="flex space-x-6 w-[220px]">

          <div className="">
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-2 p-3 w-[200px]  border cursor-pointer border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="">
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-2 p-3 w-[200px] border cursor-pointer border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <select
             className="block w-[220px] mt-6 h-[48px] px-2 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedArea} onChange={handleChange}>
          <option value="">All Areas</option>
          {areas.map((area) => (
            <option key={area.area_id} value={area.area_id}>
              {area.area_name}
            </option>
          ))}
        </select>


        <select
             className="block w-[220px] mt-6 h-[48px] px-2 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedDepartment} onChange={handleDepartmentChange}>
          <option value="">All Departments</option>
          {departments.map((department) => (
            <option key={department.department_name} value={department.id}>
              {department.department_name}
            </option>
          ))}
        </select>
          <input
            type="text"
            placeholder="Search by Employee ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-50 h-15 mt-7 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
         
         
        </div>

        <div className="flex space-x-4 mt-3">
  <button
    onClick={fetchReport}
    disabled={!startDate || !endDate || loading}
    className="flex items-center px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-all duration-200 disabled:bg-gray-400"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
    {loading ? "Loading..." : "Get Report"}
  </button>

  <PDFDownloadLink document={<MyPDFDocument />} fileName="PunchInPunchOutReport.pdf">
    {({ loading }) => (
      <button className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 transition-all duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        {loading ? "Preparing..." : "Export PDF"}
      </button>
    )}
  </PDFDownloadLink>

  <button
    onClick={exportToExcel}
    className="flex items-center px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 transition-all duration-200"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    Export Excel
  </button>
</div>

      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-center mb-4 text-sm">{error}</p>
      )}

      {/* Report Table */}
      {currentItems.length > 0 && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full bg-white border-collapse table-auto text-sm cursor-pointer">
            <thead className="bg-gray-400">
              <tr>
                <th className="px-2  py-2 text-nowrap text-left font-large text-gray-900">
                EMP ID
                </th>
                <th className="px-3  text-nowrap text-left font-large text-gray-900">
                  NAME
                </th>
                <th className="px-3  text-nowrap text-left font-large text-gray-900">
                  Area
                </th>
                <th className="px-3  text-nowrap text-left font-large text-gray-900">
                  Department
                </th>
                <th className="px-3  text-nowrap text-left font-large text-gray-900">
                  Date
                </th>
                <th className="px-3  text-nowrap text-left font-large text-gray-900">
                  Check-IN
                </th>
                <th className="px-3  text-nowrap text-left font-large text-gray-900">
                  Check-OUT
                </th>
                <th className="px-3  text-nowrap text-left font-large text-gray-900">
                  Working Hrs
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((row, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition duration-200 cursor-pointer"
                >
                  <td className="px-3  text-nowrap text-left  text-gray-800">
                    {row.employee_id || "-"}
                  </td>
                  <td className="px-5  text-nowrap text-left  text-gray-800">
                    {row.employee_name || "-"}
                  </td>
                  <td className="px-5  text-nowrap text-left  text-gray-800">
                    {row.area || "-"}
                  </td>
                  <td className="px-5  text-nowrap text-left  text-gray-800">
                    {row.department_name || "-"}
                  </td>

                  <td className="px-2 text-nowrap text-left  text-gray-800">
                    {row.punchintime
                      ? row.punchintime.split("T")[0]
                      : row.punchouttime
                      ? row.punchouttime.split("T")[0]
                      : "N/A"}
                  </td>
                  <td className="px-2 text-nowrap text-left text-gray-800">
  {(row.punchintime && row.punchintime.split('T')[1]?.slice(0, 5)) || "-"}
</td>

                  <td className="px-2 text-nowrap text-left text-gray-800">
  {(row.punchouttime && row.punchouttime.split('T')[1]?.slice(0, 5)) || "-"}
</td>

                  <td className="px-2 text-nowrap text-left  text-gray-800">
                    {row.time_difference || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredData.length > itemsPerPage && (
        <div className="flex justify-around items-center mt-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-300 text-sm rounded-md disabled:bg-gray-200"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-300 text-sm rounded-md disabled:bg-gray-200"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PunchinPunchoutReport;

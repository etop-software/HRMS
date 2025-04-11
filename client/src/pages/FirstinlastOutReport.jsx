import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { useCompany } from "../contexts/CompanyContext";

const FirstinlastOutReport = () => {
  const { companyName } = useCompany();
  const LoggedUser = "abhi";
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25); // Default page size from controller
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departments, setDepartments] = useState([]);

  // Set default date range
  useEffect(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 2);

    setStartDate(sevenDaysAgo.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  // Fetch departments and report when dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchDepartments();
      fetchReport();
    }
  }, [startDate, endDate, currentPage, selectedDepartment, searchTerm]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/departments`);
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/Reports/First-In-Last-Out-Report`,
        {
          params: {
            startDate,
            endDate,
            departmentId: selectedDepartment || null,
            searchText: searchTerm || null,
            pageSize: pageSize,
            pageNumber: currentPage,
          },
        }
      );
      
      setReportData(response.data.data);
    } catch (error) {
      console.error("Error fetching report:", error);
      setError("Failed to fetch the report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    setCurrentPage(1); // Reset to first page when department changes
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return "-";
    const date = new Date(dateTime);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const exportToExcel = () => {
    const worksheetData = reportData.map(row => ({
      "EMP ID": row.employee_id || "-",
      "Name": row.employeename || "-",
      "Department": row.department || "-",
      "Date": row.date ? row.date.split("T")[0] : "N/A",
      "Check-IN": (row.first_checkin && row.first_checkin.split('T')[1]?.slice(0, 5)) || "N/A",
      "Check-OUT": (row.last_checkout && row.last_checkout.split('T')[1]?.slice(0, 5)) || "N/A",
      "Total Hours": (row.total_hours) || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FirstInLastOut Report");
    XLSX.writeFile(workbook, `FirstInLastOut_Report_${startDate}_to_${endDate}.xlsx`);
  };

  const MyPDFDocument = () => {
    const styles = StyleSheet.create({
      page: {
        flexDirection: "column",
        padding: 20,
        fontFamily: "Helvetica",
      },
      title: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
      },
      headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
      },
      headerText: {
        fontSize: 10,
      },
      table: {
        display: "table",
        width: "100%",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#000",
      },
      tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#000",
      },
      tableHeader: {
        backgroundColor: "#f0f0f0",
        fontWeight: "bold",
      },
      tableCell: {
        padding: 5,
        fontSize: 9,
        textAlign: "center",
        borderRightWidth: 1,
        borderRightColor: "#000",
        flex: 1,
      },
      lastCell: {
        borderRightWidth: 0,
      }
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>First In / Last Out Report</Text>
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>Generated by: {LoggedUser}</Text>
            <Text style={styles.headerText}>Company: {companyName}</Text>
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>Date Range: {startDate} to {endDate}</Text>
            <Text style={styles.headerText}>Generated on: {new Date().toLocaleDateString()}</Text>
          </View>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>EMP ID</Text>
              <Text style={styles.tableCell}>Name</Text>
              <Text style={styles.tableCell}>Department</Text>
              <Text style={styles.tableCell}>Date</Text>
              <Text style={styles.tableCell}>Check-IN</Text>
              <Text style={styles.tableCell}>Check-OUT</Text>
              <Text style={styles.tableCell}>Total Hours</Text>
            </View>
            {reportData.map((row, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{row.employee_id || "-"}</Text>
                <Text style={styles.tableCell}>{row.employeename || "-"}</Text>
                <Text style={styles.tableCell}>{row.department || "-"}</Text>
                <Text style={styles.tableCell}>
                  {row.date ? row.date.split("T")[0] : "N/A"}
                </Text>
                <Text style={styles.tableCell}>
                  {(row.first_checkin && row.first_checkin.split('T')[1]?.slice(0, 5)) || "N/A"}
                </Text>
                <Text style={styles.tableCell}>
                  {(row.last_checkout && row.last_checkout.split('T')[1]?.slice(0, 5)) || "N/A"}
                </Text>
                
                <Text style={styles.tableCell}>
                  {(row.total_hours) || "N/A"}
                </Text>
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );
  };

  // ...

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-2">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/reports" className="inline-flex items-center text-gray-700 hover:text-blue-600">
                Reports
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-gray-500 md:ml-2">
                  First In Last Out Report
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow-md p-3 mb-3">
        <div className="flex space-x-6">
            
          <input
            type="text"
            placeholder="Search by Employee Name/ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[220px] h-15 mt-6 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          
          <select
            className="block w-[220px] mt-6 h-[48px] px-2 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedDepartment}
            onChange={handleDepartmentChange}
          >
            <option value="">All Departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.department_name}
              </option>
            ))}
          </select>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-2 p-3 w-[200px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-2 p-3 w-[200px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>


        </div>

        <div className="flex space-x-4 mt-3">
          {/* <button
            onClick={fetchReport}
            disabled={!startDate || !endDate || loading}
            className="flex items-center px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Loading..." : "Get Report"}
          </button> */}

          <PDFDownloadLink document={<MyPDFDocument />} fileName="PunchInPunchOutReport.pdf">
            {({ loading }) => (
              <button className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700">
                {loading ? "Preparing..." : "Export PDF"}
              </button>
            )}
          </PDFDownloadLink>

          <button
            onClick={exportToExcel}
            className="flex items-center px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-700"
          >
            Export Excel
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}

      {reportData.length > 0 && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full bg-white border-collapse table-auto text-sm">
            <thead className="bg-gray-400">
              <tr>
                <th className="px-2 py-2 text-left text-gray-900">EMP ID</th>
                <th className="px-3 text-left text-gray-900">NAME</th>
                <th className="px-3 text-left text-gray-900">Department</th>
                <th className="px-3 text-left text-gray-900">Date</th>
                <th className="px-3 text-left text-gray-900">Check-IN</th>
                <th className="px-3 text-left text-gray-900">Check-OUT</th>
                <th className="px-3 text-left text-gray-900">Total Hrs</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-3 text-left text-gray-800">{row.employee_id || "-"}</td>
                  <td className="px-5 text-left text-gray-800">{row.employeename || "-"}</td>
                  <td className="px-5 text-left text-gray-800">{row.department || "-"}</td>
                  <td className="px-2 text-left text-gray-800">
                    {row.date ? row.date.split("T")[0] : "N/A"}
                  </td>
                  <td className="px-2 text-left text-gray-800">
                    {(row.first_checkin && row.first_checkin.split('T')[1]?.slice(0, 5)) || "N/A"}
                  </td>
                  <td className="px-2 text-left text-gray-800">
                    {(row.last_checkout && row.last_checkout.split('T')[1]?.slice(0, 5)) || "N/A"}
                  </td>
                    <td className="px-2 text-left text-gray-800">
                        {row.total_hours || "N/A"}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportData.length > 0 && (
        <div className="flex justify-around items-center mt-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-300 text-sm rounded-md disabled:bg-gray-200"
          >
            Previous
          </button>
          <span className="text-sm">Page {currentPage}</span>
          <button
            onClick={handleNextPage}
            disabled={reportData.length < pageSize}
            className="px-4 py-2 bg-blue-300 text-sm rounded-md disabled:bg-gray-200"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FirstinlastOutReport;
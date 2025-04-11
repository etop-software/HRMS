import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Input,
  Typography,
  Button,
  Select,
  Option,
  Spinner,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { ChevronRight, Download, FileText, Calendar } from "lucide-react";
import { useSelector } from "react-redux";
import useDebounce from "../hooks/useDebounce";

const DailyAttendanceReport = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDepartmentName, setSelectedDepartmentName] = useState("");

  const debouncedSearchText = useDebounce(searchText, 500);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const username = useSelector((state) => state.user?.username);



  useEffect(() => {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    setStartDate(twoDaysAgo.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAttendanceData();
    }
  }, [currentPage, debouncedSearchText, departmentId, startDate, endDate]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_API_URL + "/api/departments");
      setDepartments(response.data);
      console.log(response.data);  
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError("Failed to load departments. Please refresh the page.");
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        searchText: debouncedSearchText || undefined,
        departmentId: departmentId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        pageSize: itemsPerPage,
        pageNumber: currentPage,
      };

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/Reports/Daily-Attendance-Report`, { params });

      setAttendanceData(response.data.data);
      setTotalRows(response.data.pagination.totalRows);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setError("Failed to fetch the report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalRows / itemsPerPage)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleDepartmentChange = (value) => {
    setDepartmentId(value);
    if (value) {
      const dept = departments.find(d => d.id === value);
      setSelectedDepartmentName(dept ? dept.department_name : "");
    } else {
      setSelectedDepartmentName("");
    }
  };

  // Export to Excel via backend
  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      const params = {
        searchText: debouncedSearchText || undefined,
        departmentId: departmentId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        departmentName: selectedDepartmentName || undefined,
        exportType: 'excel',
      };
      
      // Make a GET request to the backend endpoint for Excel export
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/Reports/Daily-Attendance-Report`, { 
        params,
        responseType: 'blob' // Important for handling binary data
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Multi_in-out_Report_${startDate}_to_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setError("Failed to export Excel. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  // Export to PDF via backend
  const exportToPDF = async () => {
    setExportLoading(true);
    try {
      const params = {
        searchText: debouncedSearchText || undefined,
        departmentId: departmentId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        departmentName: selectedDepartmentName || undefined,
        exportType: 'pdf',
      };
      
      // Make a GET request to the backend endpoint for PDF export
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/Reports/Daily-Attendance-Report`, { 
        params,
        responseType: 'blob' // Important for handling binary data
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Multi_IN_OUT_Report_${startDate}_to_${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      setError("Failed to export PDF. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-4">
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
                <span className="ml-1 text-gray-500 md:ml-2">Daily Attendance Report</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <Card className="mb-6 p-6">
   
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <Input 
              label="Search by Name/ID" 
              value={searchText} 
              onChange={(e) => setSearchText(e.target.value)} 
              icon={<span className="text-gray-500">🔍</span>}
            />
          </div>
          
          <div>
            <Select 
              label="Department" 
              value={departmentId} 
              onChange={handleDepartmentChange}
            >
              <Option value="">All Departments</Option>
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>{dept.department_name}</Option>
              ))}
            </Select>
          </div>
          
          <div className="flex items-center">
            <Input 
              type="date" 
              label="Start Date"
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </div>
          
          <div className="flex items-center">
            <Input 
              type="date" 
              label="End Date"
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 justify-between items-center">
          {/* <Button 
            onClick={fetchAttendanceData} 
            disabled={!startDate || !endDate || loading} 
            className="bg-blue-600 flex items-center gap-2"
          >
            {loading ? <Spinner className="h-4 w-4" /> : null}
            {loading ? "Loading..." : "Get Report"}
          </Button> */}
          
          <div className="flex gap-2">
            <Button
              onClick={exportToExcel}
              disabled={exportLoading || attendanceData.length === 0}
              className="bg-green-600 flex items-center gap-2"
            >
              {exportLoading ? <Spinner className="h-4 w-4" /> : <Download size={16} />}
              Export Excel
            </Button>
            
            <Button
              onClick={exportToPDF}
              disabled={exportLoading || attendanceData.length === 0}
              className="bg-red-600 flex items-center gap-2"
            >
              {exportLoading ? <Spinner className="h-4 w-4" /> : <FileText size={16} />}
              Export PDF
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Spinner className="h-12 w-12" />
          </div>
        ) : attendanceData.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <Typography variant="h6">No attendance data found</Typography>
            <Typography variant="paragraph" className="mt-2">
              Try adjusting your search criteria or date range
            </Typography>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse table-auto text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border-b border-gray-200 px-4 py-3 text-left font-medium whitespace-nowrap text-gray-700">Employee ID</th>
                <th className="border-b border-gray-200 px-4 py-3 text-left font-medium whitespace-nowrap text-gray-700">Date of Punch</th>
                <th className="border-b border-gray-200 px-8 py-3 text-left font-medium text-gray-700">Name</th>
                <th className="border-b border-gray-200 px-4 py-3 text-left font-medium text-gray-700">Department</th>
                <th className="border-b border-gray-200 px-4 py-3 text-left font-bold whitespace-nowrap text-gray-700">Summary Time</th>
                {/* Dynamically Generate Column Headers for Punch-in, Punch-out & Total */}
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <React.Fragment key={num}>
                    <th className="border-b border-gray-200 px-4 py-3 whitespace-nowrap font-medium text-gray-700">Punch-In {num}</th>
                    <th className="border-b border-gray-200 px-4 py-3 whitespace-nowrap font-medium text-gray-700">Punch-Out {num}</th>
                    <th className="border-b border-gray-200 px-4 py-3 whitespace-nowrap font-medium text-gray-700">Total {num}</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
        
            <tbody>
              {attendanceData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}>
                  <td className="border-b border-gray-200 px-4 whitespace-nowrap py-3">{row.employee_id || "-"}</td>
                  <td className="border-b border-gray-200 px-4 whitespace-nowrap py-3">{row.date ? row.date.split("T")[0] : "-"}</td>
                  <td className="border-b border-gray-200 px-8 whitespace-nowrap py-3">{row.name || "-"}</td>
                  <td className="border-b border-gray-200 px-4 whitespace-nowrap py-3">{row.department_name || "-"}</td>
                  
                  <td className="border-b border-gray-200 px-4 font-bold py-3 whitespace-nowrap">{row.total_sum_hhmm || "-"}</td>
                  {/* Dynamically Display Punch-In, Punch-Out & Total Time */}
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <React.Fragment key={num}>
                      <td className="border-b border-gray-200 px-4 whitespace-nowrap py-3">{row[`punchin${num}`] || "-"}</td>
                      <td className="border-b border-gray-200 px-4 whitespace-nowrap py-3">{row[`punchout${num}`] || "-"}</td>
                      <td className="border-b border-gray-200 px-4 whitespace-nowrap py-3">{row[`total${num}_hhmm`] || "-"}</td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        

        )}
        
        {attendanceData.length > 0 && (
          <div className="flex justify-between items-center p-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalRows)} of {totalRows} entries
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                variant="outlined"
                size="sm"
              >
                Previous
              </Button>
              <Button  
                onClick={handleNextPage} 
                disabled={currentPage >= Math.ceil(totalRows / itemsPerPage)}
                variant="outlined"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DailyAttendanceReport;

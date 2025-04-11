import React, { useState, useEffect, useMemo } from "react";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import {
  Card,
  CardHeader,
  Input,
  Button,
  CardBody,
  Typography,
} from "@material-tailwind/react";
import { ChevronRight, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { useCompany } from "../contexts/CompanyContext";
import { Link } from "react-router-dom";
import MultiSelectDropdown from "../components/MultiselectDropdown";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

const FinalReport = () => {
  const { companyName } = useCompany();
  const [employeewise, setEmployeewise] = useState(false);
  const storedUser = localStorage.getItem("userName");
  const loggedUser = storedUser.replace(/["\n]/g, "").trim();
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-01-07");
   const [loadingExcel, setLoadingExcel] = useState(false);
    const [loadingPdf, setLoadingPdf] = useState(false);
  // const [areas, setAreas] = useState([]);
  const [devices, setDevices] = useState([]);
  const [departments, setDepartments] = useState([]);
  // const [selectedArea, setSelectedArea] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employeesforDropdown, setEmployeesforDropdown] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const handleEmployeeWiseChange = (e) => {
    setEmployeewise(e.target.checked); // Update the flag state
  };

  const [pagination, setPagination] = useState({
    totalCount: 0,
    currentPage: 1,
    pageSize: 30,
    totalPages: 0,
  });

  // Fetch employees for the dropdown
  const fetchEmployeesforDropdown = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/employees/Dropdown/values"
      );
      if (response.ok) {
        const data = await response.json();
        setEmployeesforDropdown(data);
      } else {
        console.error("Failed to fetch employees:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };
  useEffect(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 1);

    const startDateString = sevenDaysAgo.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    const endDateString = today.toISOString().split("T")[0]; // Format as YYYY-MM-DD

    setStartDate(startDateString);
    setEndDate(endDateString);
  }, []);
  // Fetch areas
  // const fetchAreas = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${import.meta.env.VITE_API_URL}/api/areas`
  //     );
  //     setAreas(response.data);
  //   } catch (error) {
  //     setError("Failed to fetch areas.");
  //   }
  // };
  const fetchDevices = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/devices`
      );
      setDevices(response.data.devices);
    } catch (error) {
      setError("Failed to fetch devices.");
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/departments`
      );
      setDepartments(response.data);
    } catch (error) {
      setError("Failed to fetch departments.");
    }
  };

  // Fetch report data
  const fetchReportData = async (page = 1, pageSize = 30) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/Reports/finalreport`,
        {
          params: {
            employee_id: selectedEmployees,
            startDate,
            endDate,
            serial_number: selectedDevice || "",
            department_id: selectedDepartment || "",
            page,
            pageSize,
            employeewise,
            p_export_excel:false,  
          },
        }
      );
  
        setReportData(response.data.data);
        setPagination({
          totalCount: response.data.pagination.totalCount,
          currentPage: response.data.pagination.currentPage,
          pageSize: response.data.pagination.pageSize,
          totalPages: response.data.pagination.totalPages,
        });
    } catch (error) {
      setError("Failed to fetch the report data.");
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchExportData = async () => {
    setLoadingExcel(true);
    setError("");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/Reports/finalreport`,
        {
          params: {
            employee_id: selectedEmployees,
            startDate,
            endDate,
            serial_number: selectedDevice || "",
            department_id: selectedDepartment || "",
            page: 1,          
            pageSize: 1000,   
            employeewise,
            p_export_excel: true,
            companyName: companyName,
          },
          responseType: 'arraybuffer', 
        }
      );
  
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

    
      const currentDate = new Date();
      
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); 
      const year = currentDate.getFullYear();
      const hours = currentDate.getHours().toString().padStart(2, '0');
      const minutes = currentDate.getMinutes().toString().padStart(2, '0');
      
      const formattedDateTime = `${day}/${month}/${year}-${hours}:${minutes}`;
      
      const filename = `ConsolidatedReport-${formattedDateTime}.xlsx`;
    
      link.setAttribute('download', filename);  
      document.body.appendChild(link);
      link.click(); 
      link.remove();
    } catch (error) {
      setError("Failed to fetch the report data for export.");
      console.error("Error fetching report data for export:", error);
    } finally {
      setLoadingExcel(false);
    }
  };

  const fetchExportpdfData = async () => {
    setLoadingPdf(true);
    setError("");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/Reports/finalreport`, // Make sure this endpoint is correct for PDF export
        {
          params: {
            employee_id: selectedEmployees,
            startDate,
            endDate,
            serial_number: selectedDevice || "",
            department_id: selectedDepartment || "",
            page: 1,
            pageSize: 1000,
            employeewise,
            p_export_pdf: true, // Flag to specify we're exporting PDF
            companyName: companyName,
            loggedUser: loggedUser,
          },
          responseType: 'arraybuffer', 
        }
      );
  
      const blob = new Blob([response.data], { type: 'application/pdf' });
  
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
  
      const currentDate = new Date();
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const year = currentDate.getFullYear();
      const hours = currentDate.getHours().toString().padStart(2, '0');
      const minutes = currentDate.getMinutes().toString().padStart(2, '0');
  
      const formattedDateTime = `${day}/${month}/${year}-${hours}:${minutes}`;
  
      const filename = `Consolidated-${formattedDateTime}.pdf`;
  
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove(); 
    } catch (error) {
      setError("Failed to fetch the report data for export.");
      console.error("Error fetching report data for export:", error);
    } finally {
      setLoadingPdf(false);
    }
  };
  
  
  const exportToExcel = () => {

    fetchExportData(); 
 
  };

  const exportToPdf = () => {
    fetchExportpdfData();
  };
  
  const companiesToHideColumns = ["Annabelle", "CompanyB", "CompanyC"];

  const columns = [
    {
      header: "ID",
      accessorKey: "employee_id",
      enableSorting: true,
    },
    {
      header: "C.ID",
      accessorKey: "companyid" ?? "NA",
      enableSorting: true,
    },
    {
      header: "Name",
      accessorKey: "employee_name",
      enableSorting: true,
    },
    {
      header: "Dept",
      accessorKey: "department_name",
      enableSorting: true,
    },
    {
      header: "Device",
      accessorKey: "device_name",
      enableSorting: true,
    },
    {
      header: "Date",
      accessorKey: "work_date",
      cell: (info) => (info.getValue() ? info.getValue().split("T")[0] : "-"),
      enableSorting: true,
    },
    {
      header: "In",
      accessorKey: "actual_in_time",
      cell: (info) => info.getValue() || "--",
    },
    {
      header: "Out",
      accessorKey: "actual_out_time",
      cell: (info) => info.getValue() || "--",
    },
    // Only add these columns if the company name is NOT in the companiesToHideColumns list
    ...(companiesToHideColumns.includes(companyName)
      ? []
      : [
          {
            header: "Late Hrs",
            accessorKey: "late_minutes",
            cell: (info) =>
              info.getValue() === 0
                ? "00:00"
                : info.getValue()
                ? convertMinutesToHHMM(info.getValue())
                : "--",
          },
          {
            header: "OT Hrs",
            accessorKey: "overtime_minutes",
            cell: (info) =>
              info.getValue() === 0
                ? "00:00"
                : info.getValue()
                ? convertMinutesToHHMM(info.getValue())
                : "--",
          },
          {
            header: "Early Hrs",
            accessorKey: "early_leave_minutes",
            cell: (info) =>
              info.getValue() === 0
                ? "00:00"
                : info.getValue()
                ? convertMinutesToHHMM(info.getValue())
                : "--",
          },
        ]),
       
    {
      header: "Total Hrs",
      accessorKey: "total_minutes",
      cell: (info) =>
        info.getValue() === 0
          ? "00:00"
          : info.getValue()
          ? convertMinutesToHHMM(info.getValue())
          : "--",
    },
  ];
  
  

  // Initialize the table
  const table = useReactTable({
    data: reportData,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 30, 
      },
    },
  });

  useEffect(() => {
    fetchDepartments();
    fetchDevices();
    fetchEmployeesforDropdown();
  }, []);

  useEffect(() => {
    if (selectedEmployees.length > 0 && startDate && endDate) {
      fetchReportData();
    } else {
      setReportData([]);
    }
  }, [
    selectedEmployees,
    startDate,
    endDate,
    selectedDepartment,
    employeewise,
    selectedDevice,
  ]);

  const convertMinutesToHHMM = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  return (
    <div>
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
                  {" "}
                  Monthly Report
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
      <Card>
        <CardBody>
          {error && <div className="text-red-500">{error}</div>}

          <div className="flex items-center space-x-4">
            <div>
              <label>Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label>End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            {/* <div>
              <label>Area</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="" disabled hidden>
                  Select Area
                </option>
                {areas.map((area) => (
                  <option key={area.area_id} value={area.area_id}>
                    {area.area_name}
                  </option>
                ))}
              </select>
            </div> */}
            <div>
              <label>Device</label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="" disabled hidden>
                  Select device
                </option>
                {devices.map((device) => (
                  <option
                    key={device.serial_number}
                    value={device.serial_number}
                  >
                    {device.device_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="" disabled hidden>
                  Select department
                </option>
                {departments.map((department) => (
                  <option key={department.id} value={String(department.id)}>
                    {department.department_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <MultiSelectDropdown
                employeesforDropdown={employeesforDropdown}
                selectedEmployees={selectedEmployees}
                setSelectedEmployees={setSelectedEmployees}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between space-x-6">
            {/* Checkbox (Left) */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={employeewise}
                onChange={handleEmployeeWiseChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
              />
              <label className="text-gray-700">Group by Employee</label>
            </div>

            <div className="flex items-center space-x-4">
            <Button
        onClick={exportToPdf}
        color="red"
        size="sm"
        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md shadow-md"
        disabled={loadingPdf} // Disable button while exporting
      >
        {loadingPdf ? (
          <ClipLoader color="#ffffff" loading={true} size={20} />
        ) : (
          <>
            <FileText className="text-white" />
            <span>PDF</span>
          </>
        )}
      </Button>

      <Button
        onClick={exportToExcel}
        color="green"
        size="sm"
        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md shadow-md"
        disabled={loadingExcel} // Disable button while exporting
      >
        {loadingExcel ? (
          <ClipLoader color="#ffffff" loading={true} size={20} />
        ) : (
          <>
            <FileSpreadsheet className="text-white" />
            <span>Excel</span>
          </>
        )}
      </Button>
           
            </div>
          </div>

          {/* Global Search Input */}
          <div className="mt-4">
            <Input
              type="text"
              placeholder="Search all columns..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Table */}
          <table className="min-w-full divide-y divide-gray-200 mt-4 table-auto">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: (
                            <ChevronUpIcon className="w-4 h-4 inline-block ml-2" />
                          ),
                          desc: (
                            <ChevronDownIcon className="w-4 h-4 inline-block ml-2" />
                          ),
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4">
                    <ClipLoader color="#3498db" loading={true} size={50} />
                  </td>
                </tr>
              ) : (
                (() => {
                  const rows = table.getRowModel().rows;
                  return rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-2 py-2 text-left text-sm text-gray-600"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ));
                })()
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div>
              <Button
                onClick={() => fetchReportData(1, pagination.pageSize)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border rounded-md"
              >
                First Page
              </Button>
              <Button
                onClick={() =>
                  fetchReportData(
                    pagination.currentPage - 1,
                    pagination.pageSize
                  )
                }
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border rounded-md ml-2"
              >
                Previous Page
              </Button>
              <Button
                onClick={() =>
                  fetchReportData(
                    pagination.currentPage + 1,
                    pagination.pageSize
                  )
                }
                disabled={pagination.currentPage >= pagination.totalPages}
                className="px-4 py-2 border rounded-md ml-2"
              >
                Next Page
              </Button>
              <Button
                onClick={() =>
                  fetchReportData(pagination.totalPages, pagination.pageSize)
                }
                disabled={pagination.currentPage >= pagination.totalPages}
                className="px-4 py-2 border rounded-md ml-2"
              >
                Last Page
              </Button>
            </div>
            <div>
              <span className="text-sm text-gray-700">
                Page <strong>{pagination.currentPage}</strong> of{" "}
                <strong>{pagination.totalPages}</strong>
              </span>
              <select
                value={pagination.pageSize}
                onChange={(e) => {
                  fetchReportData(1, Number(e.target.value));
                }}
                className="px-4 py-2 border rounded-md ml-2"
              >
                {[10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default FinalReport;

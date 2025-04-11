// controllers/attendanceController.js
const pool = require('../config/Pdb');
const generateExcel = require('../utils/generateExcel');
const generatePDF = require('../utils/generatePDF');
const generateExceltransaction = require('../utils/generateExceltransaction');
const generatePDFtransaction = require('../utils/generatePDFtransaction');
const multiinoutgenexcel = require('../utils/multiinoutgenexcel');
const multiinoutgenpdf = require('../utils/multiinoutgenpdf');

async function PunchinPunchoutReport(req, res) {
  const { startDate, endDate } = req.query;

  try {
  

    const query = `
      SELECT 
        pattendance.*, 
        employees.name 
      FROM 
        public.pattendance AS pattendance
      JOIN 
        public.employees AS employees
      ON 
        pattendance.employee_id = employees.employee_id
   WHERE pattendance.datetime BETWEEN $1 AND $2::timestamp + interval '23:59:59'

     ORDER BY 
  pattendance.datetime ASC;
    `;

    // Execute the query with parameterized values for startdate and enddate
    const result = await pool.query(query, [startDate, endDate]);

    // Check if we have results and return them
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
const getEmployeeAttendanceReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  console.log( req.query);

  try {
    const queryText = `
      SELECT * FROM get_employee_attendance($1, $2);
    `;
    
    const result = await pool.query(queryText, [startDate, endDate]);
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance report',
      error: error.message
    });
  }
};
const getEmployeeTransactionReport = async (req, res) => {
  const {
    startDate,
    endDate,
    selectedDevice,
    selectedDepartment,
    searchTerm,
    limit = 50,
    page = 1,
    p_export_excel,
    p_export_pdf,
    companyName,  // New company name parameter
    LoggedUser
  } = req.query;

  try {
    // Parse date inputs
    const parsedStartDate = startDate ? new Date(startDate) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;

    // Setup for pagination
    const recordsLimit = parseInt(limit, 10) || 50;
    const pageNumber = parseInt(page, 10) || 1;

    // SQL Query Values
    const values = [
      parsedStartDate ? parsedStartDate.toISOString().split("T")[0] : null,  // start_date
      parsedEndDate ? parsedEndDate.toISOString().split("T")[0] : null,      // end_date
      selectedDevice || null,  // terminal_filter (optional)
      selectedDepartment || null, // department_filter (optional)
      searchTerm || null,      // search_term (optional)
      recordsLimit,            // limit_records
      pageNumber,              // page_number
      p_export_excel === 'true' || p_export_pdf === 'true' ? true : false, // is_export flag
    ];

    // Call the SQL function
    const query = `
      SELECT * FROM public.get_employee_transaction_report1(
        $1, $2, $3, $4, $5, $6, $7, $8
      );
    `;
    const result = await pool.query(query, values);

    if (p_export_pdf === 'true') {
    return generatePDFtransaction(res, result.rows, startDate, endDate,companyName,LoggedUser); // Implement PDF generation logic in your helper
    } else if (p_export_excel === 'true') {

    return generateExceltransaction(res, result.rows, startDate, endDate,companyName,LoggedUser); // Implement Excel generation logic in your helper
    }

    const totalCount = result.rows.length > 0 ? result.rows[0].total_records : 0;
    const totalPages = Math.ceil(totalCount / recordsLimit);

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        totalCount,
        currentPage: pageNumber,
        pageSize: recordsLimit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching transaction report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction report',
      error: error.message,
    });
  }
};




const pattendanceReport = async (req, res) => {
  const { employee_id, startDate, endDate,area_id,department_id } = req.query;

  console.log(req.query.p_export_excel);

  try {
      // Call the stored procedure with parameters
      const query = `SELECT * FROM public.sp_filter_attendance($1, $2, $3, $4,$5)`;
      const values = [
         // terminal_id || null,  // Default to NULL if not provided
          employee_id ? parseInt(employee_id) : null,
          startDate || null,
          endDate || null,
          area_id || null,
          department_id ? parseInt(department_id) : null
      ];
      
      const result = await pool.query(query, values);

      // Return the filtered attendance records
      res.status(200).json({
          success: true,
          data: result.rows
      });
  } catch (error) {
      console.error('Error fetching attendance records:', error);
      res.status(500).json({
          success: false,
          message: 'Server error while fetching attendance records.'
      });
  }
};

const ReportFinal = async (req, res) => {
  const {
    employee_id,
    startDate,
    endDate,
    serial_number,
    department_id,
    page = 1,        
    pageSize = 30,  
    employeewise,   
    p_export_excel,  
    p_export_pdf,   
    companyName,
    loggedUser 
  } = req.query;

  try {
    const employeeIds = Array.isArray(employee_id)
      ? employee_id.map((id) => parseInt(id))
      : [];
    const parsedStartDate = startDate ? new Date(startDate) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;
    const parsedDepartmentId = department_id ? parseInt(department_id) : null;
    const parsedPage = parseInt(page);
    const parsedPageSize = parseInt(pageSize);

    const values = [
      employeeIds.length > 0 ? employeeIds : null,  
      parsedStartDate ? parsedStartDate.toISOString().split("T")[0] : null, 
      parsedEndDate ? parsedEndDate.toISOString().split("T")[0] : null, 
      parsedDepartmentId,  
      serial_number || null,      
      parsedPage,         
      parsedPageSize,    
      employeewise,    
      p_export_excel === 'true' || p_export_pdf === 'true' ? true : false  // Reuse the p_export_excel for both Excel and PDF
    ];

    const query = `
      SELECT * FROM public.get_employee_attendance28111($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `;

    const result = await pool.query(query, values);

    if (p_export_pdf === 'true' || p_export_excel === 'true') {
      if (p_export_pdf === 'true') {
        return generatePDF(res, result.rows, companyName, startDate, endDate, loggedUser);  
      } else if (p_export_excel === 'true') {
        return generateExcel(res, result.rows, companyName);
      }
    }

    if (result.rows.length > 0) {
      const totalCount = result.rows[0]?.total_count || 0;

      

      res.status(200).json({
        success: true,
        data: result.rows,
        pagination: {
          totalCount,
          currentPage: parsedPage,
          pageSize: parsedPageSize,
          totalPages: Math.ceil(totalCount / parsedPageSize),
        },
      });
    } else {
      res.status(200).json({
        success: false,
        message: "No attendance records found for the provided filters.",
        data: [],
        pagination: {
          totalCount: 0,
          currentPage: parsedPage,
          pageSize: parsedPageSize,
          totalPages: 0,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching attendance records.",
    });
  }
};



const getEmployeeAbsentReport = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const queryText = `
      SELECT * FROM get_employee_absent_report($1, $2);
    `;
    
    const result = await pool.query(queryText, [startDate, endDate]);
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance report',
      error: error.message
    });
  }
};
const getEmployeeReportLenador = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const queryText = `
      SELECT * FROM get_working_hours_report($1, $2);
    `;
    
    const result = await pool.query(queryText, [startDate, endDate]);
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance report',
      error: error.message
    });
  }
};


const getEmployeeFirstInLastOutReport = async (req, res) => {
  const { startDate, endDate, departmentId, searchText, pageSize, pageNumber } = req.query;

  try {
    // Ensure default values for page size and page number if not provided
    const queryPageSize = pageSize ? parseInt(pageSize) : 10;
    const queryPageNumber = pageNumber ? parseInt(pageNumber) : 1;

    const queryText = `
      SELECT * FROM get_employee_FirstIn_LastOut($1, $2, $3, $4, $5, $6);
    `;

    const values = [
      startDate,
      endDate,
      departmentId ? parseInt(departmentId) : null, // Ensure it's an integer or null
      searchText || null,
      queryPageSize,
      queryPageNumber
    ];

    const result = await pool.query(queryText, values);

    res.status(200).json({
      success: true,
      data: result.rows,
      pageSize: queryPageSize,
      pageNumber: queryPageNumber
    });
  } catch (error) {
    console.error('Error fetching First In/Last Out report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch First In/Last Out report',
      error: error.message
    });
  }
};
  

const getEmployeeLateReport = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const queryText = `
      SELECT * FROM get_employee_late_report($1, $2);
    `;
    
    const result = await pool.query(queryText, [startDate, endDate]);
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance report',
      error: error.message
    });
  }
};
const getEmployeeOverTimeReport = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    // Query to call the PostgreSQL function directly without additional filtering
    const queryText = `
      SELECT employee_id, employee_name, work_date,total_worked_hours, overtime_formatted, department, designation
      FROM public.get_employee_overtime_report_v0704($1, $2);
    `;

    const result = await pool.query(queryText, [startDate, endDate]);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance report',
      error: error.message,
    });
  }
};
const getEmployeeEarlyLeaveReport = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    // Query to call the PostgreSQL function directly to fetch early leave report
    const queryText = `
      SELECT employee_id, employee_name, work_date, intime, outime, totalhrs, early_leave, department, designation,shift_out_time
      FROM public.get_employee_early_leave_report_v1($1, $2) WHERE early_leave IS NOT NULL AND early_leave != '00:00';
    `;

    const result = await pool.query(queryText, [startDate, endDate]);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching early leave report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch early leave report',
      error: error.message,
    });
  }
};


const getAttendanceSummaryDaily = async (req, res) => {
  try {
    const {
        searchText = null,
        departmentId = null,
        startDate = null,
        endDate = null,
        pageSize = 10,
        pageNumber = 1,
        exportType = null // New parameter for export type
    } = req.query;

    const parsedDepartmentId = departmentId ? parseInt(departmentId) : null;
    const parsedPageSize = parseInt(pageSize) || 10;
    const parsedPageNumber = parseInt(pageNumber) || 1;

    const parsedStartDate = startDate ? new Date(startDate) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;

    // SQL query text with pagination
    const queryText = `
        SELECT * FROM get_attendance_summary_v2(
            $1::varchar,
            $2::integer,
            $3::date,
            $4::date,
            $5::integer,
            $6::integer
        )
    `;
    
    const queryParams = [
        searchText,
        parsedDepartmentId,
        parsedStartDate ? startDate : null,
        parsedEndDate ? endDate : null,
        parsedPageSize,
        parsedPageNumber
    ];

    // If exportType is 'excel', ignore pagination and fetch all rows
    if (exportType === 'excel') {
      const noPaginationQueryText = `
        SELECT * FROM get_attendance_summary_v2(
            $1::varchar,
            $2::integer,
            $3::date,
            $4::date,
            NULL::integer,
            NULL::integer
        )
      `;
      const noPaginationQueryParams = [
        searchText,
        parsedDepartmentId,
        parsedStartDate ? startDate : null,
        parsedEndDate ? endDate : null
      ];

      const result = await pool.query(noPaginationQueryText, noPaginationQueryParams);

      if (result.rows.length === 0) {
        return res.status(200).json({
            success: true,
            data: [],
            pagination: {
                page: parsedPageNumber,
                pageSize: parsedPageSize,
                totalRows: 0,
                totalPages: 0
            }
        });
      }

      // Generate Excel with all the data
      multiinoutgenexcel(res, result.rows, 'CompanyName'); // Replace 'CompanyName' dynamically if needed
      return;
    }

    // If exportType is 'pdf', ignore pagination and fetch all rows for the report
    if (exportType === 'pdf') {
      const noPaginationQueryText = `
        SELECT * FROM get_attendance_summary_v2(
            $1::varchar,
            $2::integer,
            $3::date,
            $4::date,
            NULL::integer,
            NULL::integer
        )
      `;
      const noPaginationQueryParams = [
        searchText,
        parsedDepartmentId,
        parsedStartDate ? startDate : null,
        parsedEndDate ? endDate : null
      ];

      const result = await pool.query(noPaginationQueryText, noPaginationQueryParams);

      if (result.rows.length === 0) {
        return res.status(200).json({
            success: true,
            data: [],
            pagination: {
                page: parsedPageNumber,
                pageSize: parsedPageSize,
                totalRows: 0,
                totalPages: 0
            }
        });
      }

      // Generate PDF with all the data
      multiinoutgenpdf(res, result.rows, 'CompanyName', startDate, endDate, 'Logged User'); // Pass the logged-in user dynamically
      return;
    }

    // For non-Excel and non-PDF export (regular JSON response), use pagination
    const result = await pool.query(queryText, queryParams);

    if (result.rows.length === 0) {
        return res.status(200).json({
            success: true,
            data: [],
            pagination: {
                page: parsedPageNumber,
                pageSize: parsedPageSize,
                totalRows: 0,
                totalPages: 0
            }
        });
    }

    const totalRows = parseInt(result.rows[0].total_rows);
    const totalPages = Math.ceil(totalRows / parsedPageSize);

    res.status(200).json({
        success: true,
        data: result.rows,
        pagination: {
            page: parsedPageNumber,
            pageSize: parsedPageSize,
            totalRows: totalRows,
            totalPages: totalPages
        }
    });

  } catch (error) {
    console.error('Error in getAttendanceSummary:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
    });
  }
};


// Function to generate the Excel file (you can use a library like 'xlsx' or 'exceljs' to create the file)



module.exports = {
  getEmployeeTransactionReport,
  getEmployeeAttendanceReport,
  getEmployeeAbsentReport,
  getEmployeeLateReport,
  getEmployeeOverTimeReport,
  PunchinPunchoutReport,
  pattendanceReport,
  ReportFinal,
  getEmployeeReportLenador,
  getEmployeeEarlyLeaveReport,
  getAttendanceSummaryDaily,
  getEmployeeFirstInLastOutReport
};

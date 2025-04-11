const XLSX = require('xlsx');


const multiinoutgenexcel = (res, data, companyName) => {
    const formattedData = data.map((row) => {
      // Format date to a readable string (if necessary)
      const formattedDate = row.date ? (typeof row.date === 'string' ? row.date : row.date.toISOString()).split("T")[0] : "-";
  
      // Create a row data object
      const rowData = {
        "Employee ID": row.employee_id,
        "Employee Name": row.name,
        "Department": row.department_name,
        "Date": formattedDate,
        "Punch-In 1": row.punchin1 || "N/A",
        "Punch-Out 1": row.punchout1 || "N/A",
        "Punch-In 2": row.punchin2 || "N/A",
        "Punch-Out 2": row.punchout2 || "N/A",
        "Punch-In 3": row.punchin3 || "N/A",
        "Punch-Out 3": row.punchout3 || "N/A",
        "Punch-In 4": row.punchin4 || "N/A",
        "Punch-Out 4": row.punchout4 || "N/A",
        "Punch-In 5": row.punchin5 || "N/A",
        "Punch-Out 5": row.punchout5 || "N/A",
        "Punch-In 6": row.punchin6 || "N/A",
        "Punch-Out 6": row.punchout6 || "N/A",
        "Total 1": row.total1_hhmm || "00:00",
        "Total 2": row.total2_hhmm || "00:00",
        "Total 3": row.total3_hhmm || "00:00",
        "Total 4": row.total4_hhmm || "00:00",
        "Total 5": row.total5_hhmm || "00:00",
        "Total 6": row.total6_hhmm || "00:00",
        "Total Worked Hours": row.total_sum_hhmm || "00:00", // Total time worked that day
      };
  
      return rowData;
    });
  
    // Create the Excel sheet from the formatted data
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");
  
    // Set headers for the Excel file response
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=AttendanceReport.xlsx");
  
    // Write the workbook to a buffer and send it as a response
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    res.send(buffer); 
  };
  
  module.exports = multiinoutgenexcel;
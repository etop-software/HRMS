const XLSX = require('xlsx');
const convertMinutesToHHMM = require('../utils/convertminutestohhmm');

const generateExceltransaction = (res, data, companyName, startDate, endDate, loggedUser) => {
  // Format data as needed
  const formattedData = data.map((row) => {
    const data = {
      "Employee ID": row.employeeid,
      "CompanyID": row.companyid,
      "Employee Name": row.employeename,
      "Department": row.department,
      "Device": row.devicename,
      "Date": row.punchindate,  
      "Time": row.punchintime || "--",  
      "State": row.punchinstate 
    };
    return data;
  });

  // Convert data to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Styling for the header row
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
    fill: { fgColor: { rgb: "4F81BD" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  };

  // Apply the header style to the header row (assuming first row is headers)
  const headerRow = Object.keys(formattedData[0]);
  headerRow.forEach((key, index) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index }); // A1, B1, etc.
    if (!worksheet[cellAddress]) worksheet[cellAddress] = {};  // Ensure the cell exists
    worksheet[cellAddress].s = headerStyle; // Apply header style
  });

  // Apply basic data row styling (if needed)
  const dataStyle = {
    font: { sz: 10 },  // Set font size for data rows
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  };

  // Apply the style to data rows (excluding the header)
  formattedData.forEach((row, rowIndex) => {
    headerRow.forEach((key, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex }); // A2, B2, etc.
      if (!worksheet[cellAddress]) worksheet[cellAddress] = {};  // Ensure the cell exists
      worksheet[cellAddress].s = dataStyle; // Apply data style
    });
  });

  // Create a new workbook and append the styled worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

  // Send the response with the styled workbook
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=AttendanceReport.xlsx");

  // Write the workbook to buffer and send as response
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  res.send(buffer);
};

module.exports = generateExceltransaction;

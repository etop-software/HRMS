const XLSX = require('xlsx');
const convertMinutesToHHMM = require('../utils/convertminutestohhmm');


const generateExcel = (res, data, companyName) => {

  const formattedData = data.map((row) => {
    const formattedDate = row.work_date
      ? (typeof row.work_date === 'string' ? row.work_date : row.work_date.toISOString()).split("T")[0]
      : "-";

    const data = {
      "Employee ID": row.employee_id,
      "CompanuID": row.companyid,
      "Employee Name": row.employee_name,
      "Department": row.department_name,
      "Device": row.device_name,
      "Date": formattedDate,  
      "In Time": row.actual_in_time || "--",  
      "Out Time": row.actual_out_time || "--", 
      "Total Hrs": row.total_minutes === 0 ? "00:00" : convertMinutesToHHMM(row.total_minutes),  
    };
    if (companyName !== "Annabelle") {
      data["Late Hrs"] = row.late_minutes === 0 ? "00:00" : convertMinutesToHHMM(row.late_minutes);
      data["OT Hrs"] = row.overtime_minutes === 0 ? "00:00" : convertMinutesToHHMM(row.overtime_minutes);
      data["Early Hrs"] = row.early_leave_minutes === 0 ? "00:00" : convertMinutesToHHMM(row.early_leave_minutes);
    }
    return data;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=AttendanceReport .xlsx");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  res.send(buffer); 
};

module.exports = generateExcel;

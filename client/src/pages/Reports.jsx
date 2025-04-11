import React from "react";
import { NotebookText, FileBarChart2, Clock, UserX, FileCheck2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCompany } from "../contexts/CompanyContext";

function Reports() {
  const {
    allowMonthlyReport,
    allowOverTime,
    allowLate,
    allowEarlyLeave,
    allowAbsent
  } = useCompany();


  const reports = [
    {
      title: "Transaction Report",
      description: "View detailed transaction history and attendance records",
      icon: <FileBarChart2 size={24} />,
      path: "/transactionReport",
      color: "from-blue-600 to-blue-400",
      isAllowed: true // Always show this report
    },
    {
      title: "First In Last Out Report",
      description: "Comprehensive overview of all attendance metrics",
      icon: <FileCheck2 size={24} />,
      path: "/FirstinlastOutReport",
      color: "from-green-600 to-green-400",
      isAllowed: allowMonthlyReport
    },
    {
      title: "First and Last Report",
      description: "Comprehensive overview of all attendance metrics",
      icon: <FileCheck2 size={24} />,
      path: "/TotalTime",
      color: "from-red-600 to-red-400",
      isAllowed: true // Always show this report
    },
    {
      title: "Multi In/Out Report",
      description: "Comprehensive overview of all attendance metrics",
      icon: <FileCheck2 size={24} />,
      path: "/DailyAttendanceReport",
      color: "from-blue-600 to-blue-400",
      isAllowed: allowEarlyLeave
    },
    {
      title: "Overtime Report",
      description: "Track employee overtime hours and patterns",
      icon: <Clock size={24} />,
      path: "/overtimeReport",
      color: "from-purple-600 to-purple-400",
      isAllowed: allowOverTime
    },
    {
      title: "Late Report",
      description: "Monitor late arrivals and attendance patterns",
      icon: <NotebookText size={24} />,
      path: "/lateReport",
      color: "from-amber-600 to-amber-400",
      isAllowed: allowLate
    },
    {
      title: "Absent Report",
      description: "Track employee absences and leave patterns",
      icon: <UserX size={24} />,
      path: "/absentReport",
      color: "from-red-600 to-red-400",
      isAllowed: allowAbsent
    },
   
   
    {
      title: "Early Leave Report",
      description: "Comprehensive overview of all attendance metrics",
      icon: <FileCheck2 size={24} />,
      path: "/earlyleavereport",
      color: "from-pink-600 to-pink-400",
      isAllowed: allowEarlyLeave
    },
   
  ];

  // Filter reports based on isAllowed property
  const allowedReports = reports.filter(report => report.isAllowed);

  return (
    <div className="container mx-auto p-6">
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allowedReports.map((report, index) => (
          <Link key={index} to={report.path}>
            <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="p-6">
                <div className={`absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 rounded-full bg-gradient-to-br ${report.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${report.color} text-white shadow-lg mb-4`}>
                  {report.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{report.title}</h3>
                {/* Uncomment if you want descriptions back */}
                {/* <p className="text-gray-600">{report.description}</p> */}
                <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-800">
                  View Report
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Reports;
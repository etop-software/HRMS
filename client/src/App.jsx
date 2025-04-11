import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout";
import Login from "./pages/Login";
import DashBoard from "./pages/DashBoard";
import Departments from "./pages/Departments";
import Designations from "./pages/Designations";
import Employee from "./pages/Employee";
import EmployeeShifts from "./pages/EmployeeShift";
import Leaves from "./pages/Leaves";
import EmployeeLeave from "./pages/EmployeeLeave";
import Shifts from "./pages/Shifts";
import AttendanceReports from "./pages/AttendanceReports";
import TransactionReport from "./pages/TransactionReport";
import OverTimeReport from "./pages/OverTimeReport";
import LateReport from "./pages/LateReport";
import Areas from "./pages/Areas";
import Devices from "./pages/Devices";
import Reports from "./pages/Reports";
import AbsentReport from "./pages/AbsentReport";
import PunchInPunchOutReport from "./pages/PunchinPunchoutReport";
import FirstinlastOutReport from "./pages/FirstinlastOutReport";
import Users from "./pages/Users";
import Company from "./pages/company";
import Manualpunch from "./pages/ManualLogs";
import Process from "./pages/ProcessReport";
import FinalReport from "./pages/FinalReport";
import LeandorReport from "./pages/LeandorReport";
import EarlyLeaveReport from "./pages/EarlyLeaveReport";
import ChangePassword from "./pages/changePasswordtemp";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import DailyAttendanceReport from "./pages/DailyAttendanceReport";
import Employeecalander from "./pages/calanderShift";
import Chatbot from "./pages/chatbot";


const App = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Layout wraps all routes to ensure Sidebar is always visible */}
        <Route element={<Layout />}>
          <Route path="dashboard" element={<DashBoard />} /> {/* Dashboard is accessible to all */}

          {/* Protected Routes */}
          <Route element={<ProtectedRoute requiredPrivilege="departments" />}>
            <Route path="departments" element={<Departments />} />
          </Route>

          <Route element={<ProtectedRoute requiredPrivilege="designations" />}>
            <Route path="designations" element={<Designations />} />
          </Route>

          <Route element={<ProtectedRoute requiredPrivilege="employees" />}>
            <Route path="employees" element={<Employee />} />
          </Route>

          <Route element={<ProtectedRoute requiredPrivilege="shifts" />}>
            <Route path="employeeShifts" element={<EmployeeShifts />} />
          </Route>

          <Route element={<ProtectedRoute requiredPrivilege="shifts" />}>
            <Route path="leaves" element={<Leaves />} />
          </Route>

          <Route element={<ProtectedRoute requiredPrivilege="shifts" />}>
            <Route path="employeeLeave" element={<EmployeeLeave />} />
          </Route>

          <Route element={<ProtectedRoute requiredPrivilege="shifts" />}>
            <Route path="shifts" element={<Shifts />} />
          </Route>

          <Route element={<ProtectedRoute requiredPrivilege="deviceArea" />}>
            <Route path="areas" element={<Areas />} />
          </Route>

          <Route element={<ProtectedRoute requiredPrivilege="deviceArea" />}>
            <Route path="devices" element={<Devices />} />
          </Route>

          <Route element={<ProtectedRoute requiredPrivilege="manualPunch" />}>
            <Route path="manualpunch" element={<Manualpunch />} />
          </Route>

          <Route element={<ProtectedRoute requiredPrivilege="users" />}>
            <Route path="users" element={<Users />} />
          </Route>

          <Route element={<ProtectedRoute requiredPrivilege="company" />}>
            <Route path="company" element={<Company />} />
          </Route>

          <Route element={<ProtectedRoute requiredPrivilege="company" />}>
            <Route path="chatbot" element={<Chatbot />} />
          </Route>

          <Route element={<ProtectedRoute requiredPrivilege="processing" />}>
            <Route path="process" element={<Process />} />
          </Route>

          <Route element={<ProtectedRoute requiredPrivilege="shifts" />}>
            <Route path="employeecalander" element={<Employeecalander />} />
          </Route>

          {/* Reports Section */}
          <Route element={<ProtectedRoute requiredPrivilege="reports" />}>
            <Route path="reports" element={<Reports />} />
            <Route path="attendanceReports" element={<AttendanceReports />} />
            <Route path="transactionReport" element={<TransactionReport />} />
            <Route path="overtimeReport" element={<OverTimeReport />} />
            <Route path="lateReport" element={<LateReport />} />
            <Route path="absentReport" element={<AbsentReport />} />
            <Route path="punchinpunchoutreport" element={<PunchInPunchOutReport />} />
            <Route path="earlyleavereport" element={<EarlyLeaveReport />} />
            <Route path="FinalReport" element={<FinalReport />} />
            <Route path="DailyAttendanceReport" element={<DailyAttendanceReport />} />
            <Route path="TotalTime" element={<LeandorReport />} />
            <Route path="FirstinlastOutReport" element={<FirstinlastOutReport />} />

          </Route>
        </Route>

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;

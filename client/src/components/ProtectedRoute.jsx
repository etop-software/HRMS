import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ requiredPrivilege }) => {
  // Check if the user is authenticated
  const isAuthenticated = localStorage.getItem("token"); // Example check (can be customized)
  
  // If the user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Retrieve user privileges from localStorage (or other state management method)
  const privileges = JSON.parse(localStorage.getItem("privileges")) || {};

  // If the user does not have the required privilege, redirect to unauthorized page
  if (!privileges[requiredPrivilege]) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If the user is authenticated and has the required privilege, render the route's children (outlet)
  return <Outlet />;
};

export default ProtectedRoute;

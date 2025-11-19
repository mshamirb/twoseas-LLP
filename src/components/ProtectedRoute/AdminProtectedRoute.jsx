// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const adminUser = JSON.parse(localStorage.getItem("adminUser"));

  // If clientId exists, render the child component
  if (adminUser?.adminId) {
    return children;
  }

  // Otherwise, redirect to login page
  return <Navigate to="/admin-login" replace />;
}

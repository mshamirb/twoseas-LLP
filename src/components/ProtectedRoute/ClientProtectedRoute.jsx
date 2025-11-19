// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ClientProtectedRoute({ children }) {
  const clientUser = JSON.parse(localStorage.getItem("clientUser"));

  // If clientId exists, render the child component
  if (clientUser?.clientId) {
    return children;
  }

  // Otherwise, redirect to login page
  return <Navigate to="/client-login" replace />;
}

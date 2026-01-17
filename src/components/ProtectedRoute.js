import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

function ProtectedRoute({children}) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const needsOnboarding = localStorage.getItem("needsOnboarding") === "true";

  if (!user || !token) {
    return <Navigate to="/login" />;
  }

  if (needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" />;
  }

  if (!needsOnboarding && location.pathname === "/onboarding") {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute

import React from 'react'
import { Navigate } from 'react-router-dom'

function PublicRoute({children}) {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const needsOnboarding = localStorage.getItem("needsOnboarding") === "true";

  if (user && token) {
    return <Navigate to={needsOnboarding ? "/onboarding" : "/"} />;
  }

  return children;
}

export default PublicRoute

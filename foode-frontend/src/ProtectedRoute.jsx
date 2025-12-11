// src/Component/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRole }) => {
    // 1. Check for any valid token
    const token = localStorage.getItem("token") || localStorage.getItem("customer_token") || localStorage.getItem("admin_token");
    
    // 2. Get the saved role
    const userRole = localStorage.getItem("role"); 

    // 3. If no token, kick to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 4. Role Check: If user exists but has wrong role
    if (allowedRole && userRole !== allowedRole) {
        // If an Admin tries to access Customer pages, send them to Admin Dashboard
        if (userRole === 'ADMIN') {
            return <Navigate to="/dashboard" replace />;
        }
        // If a Customer tries to access Admin pages, send them to Customer Dashboard
        return <Navigate to="/customerDashboard" replace />;
    }

    // 5. If passed all checks, render the page
    return <Outlet />;
};

export default ProtectedRoute;
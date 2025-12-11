// src/Admin/Pages/Dashboard.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; 
import Sidebar from "../component/Sidebar"; 
import './css/Dashboard.css'; 

export default function Dashboard() { 
    return (
        // Changed class name to avoid conflict with Customer Dashboard
        <div className="admin-dashboard-container">
            
            {/* Wrapped Sidebar to ensure it stays fixed width */}
            <div className="admin-sidebar-wrapper">
                <Sidebar />
            </div>

            <main className="admin-main-content">
                <Outlet /> 
            </main>
        </div>
    );
}
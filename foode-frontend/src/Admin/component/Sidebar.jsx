import React from 'react';
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom"; 
import "./Sidebar.css";

const navItems = [
    { title: "View Customer Details", path: "/dashboard/customers" }, 
    { title: "View Food Items", path: "/dashboard/foods" }, 
{ title: "Manage Orders", path: "/dashboard/orders" }
];

export default function Sidebar() {
    const { logout, token } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:8080/admin/signout", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
        } catch (err) {
            console.error("Logout error:", err);
        }
        logout();
        navigate("/admin"); 
    };

    return (
        <aside className="sidebar">
            <div className="logo-section">
                <h1 className="dashboard-title">Foode Admin Panel</h1>
            </div>

            <nav className="nav-menu">
                {navItems.map((item) => (
                    <a
                        key={item.title}
                        href="#" 
                        onClick={(e) => {
                            e.preventDefault(); 
                            navigate(item.path); 
                        }}
                        className="nav-link"
                    >
                        {item.title}
                    </a>
                ))}
                
                <button
                    onClick={handleLogout}
                    className="logout-button"
                >
                    Logout
                </button>
            </nav>
        </aside>
    );
}
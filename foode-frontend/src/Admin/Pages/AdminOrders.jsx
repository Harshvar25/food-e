import React, { useState, useEffect } from 'react';
import { API } from '../Services/api';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'; // Icons
import './css/AdminOrders.css';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ACTIVE");

    // Auth Token
    const token = localStorage.getItem("token"); // Assuming you store admin token here
    const navigate = useNavigate();

    // Available Status Options
    const STATUS_OPTIONS = ["PLACED", "COOKING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

    useEffect(() => {
        fetchOrders();
    }, []);

    const getFilteredOrders = () => {
        if (activeTab === "ALL") return orders;

        if (activeTab === "ACTIVE") {
            return orders.filter(order =>
                ["PLACED", "COOKING", "OUT_FOR_DELIVERY"].includes(order.status)
            );
        }

        if (activeTab === "HISTORY") {
            return orders.filter(order =>
                ["DELIVERED", "CANCELLED"].includes(order.status)
            );
        }
        return orders;
    };

    const filteredOrders = getFilteredOrders();

    const fetchOrders = async () => {
        const token = localStorage.getItem("token"); // Make sure this matches what you set in AdminSignIn
        console.log("Current Admin Token:", token); // DEBUG: Check console to see if this is null

        if (!token) {
            alert("No Admin Token found. Please login again.");
            setLoading(false); // <--- IMPORTANT: Stop loading so the UI updates
            navigate("/admin"); // Redirect to Admin Login
            return;
        }

        try {
            const response = await API.getAllOrders(token);
            if (response.ok) {
                const data = await response.json();
                console.log("Orders fetched:", data); // DEBUG: See if data arrives
                setOrders(data);
            } else {
                console.error("Failed response:", response.status);
            }
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false); // This runs no matter what happens
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            // Optimistic UI Update: Update the UI immediately before API finishes
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.orderId === orderId ? { ...order, status: newStatus } : order
                )
            );

            const response = await API.updateOrderStatus(orderId, newStatus, token);

            if (!response.ok) {
                // Revert if failed
                alert("Failed to update status");
                fetchOrders();
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PLACED': return 'badge-blue';
            case 'COOKING': return 'badge-orange';
            case 'OUT_FOR_DELIVERY': return 'badge-purple';
            case 'DELIVERED': return 'badge-green';
            case 'CANCELLED': return 'badge-red';
            default: return 'badge-gray';
        }
    };

    if (loading) return <div className="admin-loading">Loading Orders...</div>;

    return (
        <div className="admin-orders-container">
            <h2>Manage Customer Orders</h2>

            <div className="tabs-container">
            <button 
                className={`tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`} 
                onClick={() => setActiveTab("ACTIVE")}
            >
                Active Orders
            </button>
            <button 
                className={`tab-btn ${activeTab === 'HISTORY' ? 'active' : ''}`} 
                onClick={() => setActiveTab("HISTORY")}
            >
                History
            </button>
            <button 
                className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`} 
                onClick={() => setActiveTab("ALL")}
            >
                All Orders
            </button>
        </div>

            <div className="table-responsive">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status Control</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{textAlign: "center", padding: "30px"}}>
                                    No orders found in this category.
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.orderId}>
                                    <td>
                                        <span className="id-text">#{order.orderId}</span>
                                        <br/>
                                        <small className="date-text">
                                            {new Date(order.orderDateTime).toLocaleDateString()}
                                        </small>
                                    </td>

                                    <td>
                                        <strong>{order.customerName}</strong>
                                        <br/>
                                        <small className="address-text" title={order.address}>
                                            {order.address ? order.address.substring(0, 30) + '...' : 'No Address'}
                                        </small>
                                    </td>

                                    <td>
                                        <div className="items-list">
                                            {order.items.map((item, idx) => (
                                                <div key={idx}>
                                                    {item.quantity}x {item.foodName}
                                                </div>
                                            ))}
                                        </div>
                                    </td>

                                    <td className="price-cell">₹{order.totalAmount.toFixed(2)}</td>

                                    <td>
                                        <select 
                                            className={`status-select ${getStatusColor(order.status)}`}
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                                        >
                                            {STATUS_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
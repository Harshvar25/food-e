import React, { useState, useEffect } from 'react';
import Navbar from '../Component/Navbar';
import { CustomerAPI } from '../Services/CustomerAPI';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import './css/MyOrders.css'; 

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);
    
    // 1. Add State for the Active Tab
    const [activeTab, setActiveTab] = useState("ACTIVE"); 

    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            const id = localStorage.getItem("customerId");
            const token = localStorage.getItem("customer_token");

            if (!id || !token) {
                navigate("/login");
                return;
            }

            try {
                const response = await CustomerAPI.getCustomerOrders(id, token);
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                } else {
                    setError("Failed to load orders.");
                }
            } catch (err) {
                console.error(err);
                setError("Network error.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

    const toggleDetails = (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(orderId);
        }
    };

    // 2. Add Filter Logic (Same as Admin)
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

    const getStatusColor = (status) => {
        switch(status?.toUpperCase()) {
            case 'PLACED': return 'bg-blue';
            case 'COOKING': return 'bg-orange';
            case 'DELIVERED': return 'bg-green';
            case 'CANCELLED': return 'bg-red';
            case 'OUT_FOR_DELIVERY': return 'bg-purple'; // Added this color
            default: return 'bg-gray';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="my-orders-page">
            <Navbar />
            
            <div className="orders-container">
                <h2 className="page-title">Your Orders</h2>

                {/* 3. Add Tab Buttons UI */}
                <div className="tabs-container">
                    <button 
                        className={`tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`} 
                        onClick={() => setActiveTab("ACTIVE")}
                    >
                        Active
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
                        All
                    </button>
                </div>

                {loading && <p className="loading-msg">Loading your history...</p>}
                {error && <p className="error-msg">{error}</p>}

                {/* 4. Use filteredOrders.length check */}
                {!loading && !error && filteredOrders.length === 0 ? (
                    <div className="empty-state">
                        <Package size={64} color="#ccc" />
                        <p>No orders in this category.</p>
                        {/* Only show "Order Something" button if they have NO orders at all */}
                        {orders.length === 0 && (
                            <button onClick={() => navigate("/customerDashboard")} className="browse-btn">
                                Order Something Yummy
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="orders-list">
                        {/* 5. Map over filteredOrders */}
                        {filteredOrders.map((order) => (
                            <div key={order.orderId} className="order-card">
                                
                                <div className="order-header" onClick={() => toggleDetails(order.orderId)}>
                                    <div className="order-info-left">
                                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <h3 className="order-id">#{order.orderId}</h3>
                                        <p className="order-date"><Clock size={14}/> {formatDate(order.orderDateTime)}</p>
                                    </div>
                                    <div className="order-info-right">
                                        <span className="order-total">₹{order.totalAmount.toFixed(2)}</span>
                                        {expandedOrder === order.orderId ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                    </div>
                                </div>

                                {expandedOrder === order.orderId && (
                                    <div className="order-details">
                                        <div className="delivery-address">
                                            <strong><MapPin size={16}/> Delivery Address:</strong>
                                            <p>{order.address}</p>
                                        </div>
                                        
                                        <div className="order-items-table">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="order-item-row">
                                                    <span className="item-name">
                                                        {item.quantity} x {item.foodName}
                                                    </span>
                                                    <span className="item-price">
                                                        ₹{item.totalPrice.toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="order-summary">
                                            <div className="summary-row total">
                                                <span>Total Paid</span>
                                                <span>₹{order.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
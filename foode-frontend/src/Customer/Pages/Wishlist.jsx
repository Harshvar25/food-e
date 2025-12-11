import React, { useState, useEffect } from 'react';
import Navbar from '../Component/Navbar'; // Adjust path if needed
import FoodCard from '../Component/FoodCard'; // Adjust path if needed
import { CustomerAPI } from '../Services/CustomerAPI';
import { useNavigate } from 'react-router-dom';
import './css/CustomerDashboard.css'; // Reusing dashboard CSS for grid layout

export default function Wishlist() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [customerName, setCustomerName] = useState(""); // State for Name
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("customer_token") || "");

    const navigate = useNavigate();

    const fetchData = async () => {
        const id = localStorage.getItem("customerId");

        if (!id || !token) {
            navigate("/login");
            return;
        }

        try {
            setLoading(true);

            // 1. Fetch Name
            const customerRes = await CustomerAPI.getCustomerById(id, token);
            if (customerRes.data && customerRes.data.name) {
                setCustomerName(customerRes.data.name.split(' ')[0]);
            }

            // 2. Fetch Wishlist
            const wishlistRes = await CustomerAPI.getWishlist(id, token);
            if (wishlistRes.data) {
                setWishlistItems(wishlistRes.data);
            }
            setError(null);

        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Could not load your wishlist.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Listener to refresh if an item is removed via the card
        const handleWishlistUpdate = () => fetchData();
        window.addEventListener("wishlistUpdated", handleWishlistUpdate);

        return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    }, [navigate]);

    const handleMoveToCart = async (wishlistId) => {
        await CustomerAPI.moveToCart(wishlistId, token);

        setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
    };

    return (
        <div className="dashboard-container">
            <div className="navbar-wrapper">
                <Navbar />
            </div>

            <div className="dashboard-content" style={{ marginTop: '80px', minHeight: '60vh' }}>

                {loading && <p className="status-msg">Loading...</p>}
                {error && <p className="status-msg error">{error}</p>}

                {/* --- CASE 1: EMPTY STATE (Specific UI) --- */}
                {!loading && !error && wishlistItems.length === 0 && (
                    <div className="empty-state-container" style={{
                        textAlign: 'center',
                        marginTop: '100px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        {/* We use inline styles here to keep it simple, or you can add to CSS */}
                        <h2 style={{ fontSize: '2rem', color: '#333' }}>
                            Hey {customerName},
                        </h2>

                        <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '400px' }}>
                            Looks like you haven't decided on the food yet. <br />
                            Go back to the dashboard to save some delicious food!
                        </p>

                        <button
                            className="hero-btn"
                            style={{ marginTop: '20px', padding: '12px 30px' }}
                            onClick={() => navigate("/customerDashboard")}
                        >
                            Browse Menu
                        </button>
                    </div>
                )}

                {!loading && !error && wishlistItems.length > 0 && (
                    <>
                        <header className="dashboard-header">
                            <h2>Your Wishlist</h2>
                            <p>Your favorite items, saved for later.</p>
                        </header>

                        <div className="food-grid">
                            {wishlistItems.map(item => (
                                <FoodCard
                                    key={item.id}
                                    food={item.food}
                                    onAddToCart={() => handleMoveToCart(item.id)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
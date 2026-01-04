import React, { useState, useEffect } from 'react';
import Navbar from '../Component/Navbar';
import FoodCard from '../Component/FoodCard';
import { CustomerAPI } from '../Services/CustomerAPI';
import { useNavigate } from 'react-router-dom';
import './css/CustomerDashboard.css';

export default function Wishlist() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [customerName, setCustomerName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token] = useState(localStorage.getItem("customer_token") || "");

    const navigate = useNavigate();

    const fetchData = async () => {
        const id = localStorage.getItem("customerId");

        if (!id || !token) {
            navigate("/login");
            return;
        }

        try {
            setLoading(true);

            const customerResponse = await CustomerAPI.getCustomerById(id, token);
            const customerData = await customerResponse.json();
            if (customerData && customerData.name) {
                setCustomerName(customerData.name.split(' ')[0]);
            }

            const wishlistResponse = await CustomerAPI.getWishlist(id, token);
            const wishlistData = await wishlistResponse.json();
            if (wishlistData) {
                setWishlistItems(wishlistData);
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

        const handleWishlistUpdate = () => fetchData();
        window.addEventListener("wishlistUpdated", handleWishlistUpdate);

        return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    }, [navigate]);

    const handleMoveToCart = async (wishlistId) => {
        try {
            const response = await CustomerAPI.moveToCart(wishlistId, token);
            if (response.ok) {
                setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
            }
        } catch (error) {
            console.error("Error moving item to cart:", error);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="navbar-wrapper">
                <Navbar />
            </div>

            <div className="dashboard-content" style={{ marginTop: '80px', minHeight: '60vh' }}>

                {loading && <p className="status-msg">Loading...</p>}
                {error && <p className="status-msg error">{error}</p>}

                {!loading && !error && wishlistItems.length === 0 && (
                    <div className="empty-state-container" style={{
                        textAlign: 'center',
                        marginTop: '100px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
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
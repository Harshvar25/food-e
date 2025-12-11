import React, { useState, useEffect } from 'react';
import { Search, User, ShoppingCart, LogOut, Menu, X, Heart } from 'lucide-react';
import './CSS/navbar.css';
import { useNavigate } from 'react-router-dom';
import { CustomerAPI } from '../Services/CustomerAPI';
import { useCustomerAuth } from '../Context/CustomerAuthContext';
import { Link } from 'react-router-dom';
import logoImage from '../asset/logo.png';

export default function Navbar({ onSearch }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [customerName, setCustomerName] = useState("Profile");

    const [wishlistCount, setWishlistCount] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const { token, logout } = useCustomerAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNavbarData = async () => {
            const id = localStorage.getItem("customerId");
            const activeToken = token || localStorage.getItem("customer_token");

            if (!id || !activeToken) return;
            try {
                const customerRes = await CustomerAPI.getCustomerById(id, activeToken);
                if (customerRes.data && customerRes.data.name) {
                    setCustomerName(customerRes.data.name.split(' ')[0]);
                }

                const wishlistRes = await CustomerAPI.getWishlist(id, activeToken);
                if (wishlistRes.data) {
                    setWishlistCount(wishlistRes.data.length);
                }

                const cartRes = await CustomerAPI.getCart(id, activeToken);

                console.log("Navbar: Cart API Response:", cartRes);

                if (cartRes.data) {
                    if (cartRes.data && cartRes.data.cartItems) {
                        const items = cartRes.data.cartItems;

                        const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
                        setCartCount(totalQty);
                    } else {
                        setCartCount(0);
                    }
                }
            } catch (error) {
                console.error("Error loading navbar data:", error);
            }
        };

        fetchNavbarData();

        const handleDataUpdate = () => {
            fetchNavbarData();
        };

        window.addEventListener("wishlistUpdated", handleDataUpdate);
        window.addEventListener("cartUpdated", handleDataUpdate);
        window.addEventListener("profileUpdated", handleDataUpdate); // <--- NEW

        return () => {
            window.removeEventListener("wishlistUpdated", handleDataUpdate);
            window.removeEventListener("cartUpdated", handleDataUpdate);
            window.removeEventListener("profileUpdated", handleDataUpdate);// <--- NEW
        };
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (onSearch) onSearch(searchTerm);
        }
    };

    const handleLogout = async () => {
        const activeToken = token || localStorage.getItem("customer_token");

        if (activeToken) {
            try {
                await CustomerAPI.customerLogout(activeToken);
                console.log("Backend notified: Token blacklisted.");
            } catch (error) {
                console.warn("Logout API call failed, forcing local logout.", error);
            }
        }

        await logout();

        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/customerDashboard">
                    <img src={logoImage} alt="Foode Logo" className="logo-img" />
                </Link>
            </div>

            <div className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </div>

            <div className={`navbar-actions`}>
                <div className="search-container">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search food..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <Link to="/cart" className="nav-item">
                    <div className="cart-wrapper">
                        <ShoppingCart size={22} />
                        <span className="cart-badge">{cartCount}</span>
                    </div>
                    <span className="nav-text">Cart</span>
                </Link>

                <Link to="/wishlist" className="nav-item">
                    <div className="cart-wrapper">
                        <Heart size={22} />
                        <span className="cart-badge">{wishlistCount}</span>
                    </div>
                    <span className="nav-text">Wishlist</span>
                </Link>


                <Link to="/orders" className="nav-item">
                    <User size={22} />
                    <span className="nav-text">My Orders</span>
                </Link>
                <Link to="/about" className="nav-item">
                    <User size={22} />
                    <span className="nav-text">About us</span>
                </Link>

                <Link to="/profile" className="nav-item">
                    <User size={22} />
                    <span className="nav-text">{customerName}</span>
                </Link>

                <button className="nav-item" onClick={handleLogout}>
                    <LogOut size={22} />
                    <span className="nav-text">Logout</span>
                </button>
            </div>
        </nav>
    );
}
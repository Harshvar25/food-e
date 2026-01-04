import React, { useState, useEffect } from 'react';
import { Search, User, ShoppingCart, LogOut, Menu, X, Heart } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { CustomerAPI } from '../Services/CustomerAPI';
import { useCustomerAuth } from '../Context/CustomerAuthContext';
import logoImage from '../asset/Logo.png';
import './CSS/navbar.css';

export default function Navbar({ onSearch }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [customerName, setCustomerName] = useState("Profile");
    const [wishlistCount, setWishlistCount] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const { token, logout } = useCustomerAuth();
    const navigate = useNavigate();
    const performLogout = async () => {
        try {
            const activeToken = token || localStorage.getItem("customer_token");
            if (activeToken) await CustomerAPI.customerLogout(activeToken);
        } catch (err) {
            console.warn("Logout API failed", err);
        }
        await logout();
        navigate("/login");
    };
    useEffect(() => {
        const fetchNavbarData = async () => {
            const id = localStorage.getItem("customerId");
            const activeToken = token || localStorage.getItem("customer_token");
            if (!id || !activeToken) return;
            try {
                const customerRes = await CustomerAPI.getCustomerById(id, activeToken);
                if (customerRes.status === 401 || customerRes.status === 403) {
                    performLogout();
                    return;
                }
                if (customerRes.ok) {
                    const customerData = await customerRes.json();
                    const actualData = customerData.data || customerData;
                    if (actualData?.name) setCustomerName(actualData.name.split(' ')[0]);
                    const wishlistRes = await CustomerAPI.getWishlist(id, activeToken);
                    if (wishlistRes.ok) {
                        const wData = await wishlistRes.json();
                        setWishlistCount((wData.data || wData)?.length || 0);
                    }
                    const cartRes = await CustomerAPI.getCart(id, activeToken);
                    if (cartRes.ok) {
                        const cData = await cartRes.json();
                        const cartObj = cData.data || cData;
                        if (cartObj?.cartItems) {
                            setCartCount(cartObj.cartItems.reduce((sum, item) => sum + item.quantity, 0));
                        } else {
                            setCartCount(0);
                        }
                    }
                }
            } catch (error) {
                console.error("Critical Navbar Error:", error);
            }
        };
        fetchNavbarData();
        const handleDataUpdate = () => fetchNavbarData();
        window.addEventListener("wishlistUpdated", handleDataUpdate);
        window.addEventListener("cartUpdated", handleDataUpdate);
        window.addEventListener("profileUpdated", handleDataUpdate);
        return () => {
            window.removeEventListener("wishlistUpdated", handleDataUpdate);
            window.removeEventListener("cartUpdated", handleDataUpdate);
            window.removeEventListener("profileUpdated", handleDataUpdate);
        };
    }, [token, navigate]);
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && onSearch) onSearch(searchTerm);
    };
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/customerDashboard"><img src={logoImage} alt="Logo" className="logo-img" /></Link>
            </div>
            <div className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </div>
            <div className={`navbar-actions ${isMenuOpen ? 'active' : ''}`}>
                <div className="search-container">
                    <Search size={18} className="search-icon" />
                    <input type="text" className="search-input" placeholder="Search food..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleKeyDown} />
                </div>
                <Link to="/cart" className="nav-item">
                    <div className="cart-wrapper"><ShoppingCart size={22} /><span className="cart-badge">{cartCount}</span></div>
                    <span className="nav-text">Cart</span>
                </Link>
                <Link to="/wishlist" className="nav-item">
                    <div className="cart-wrapper"><Heart size={22} /><span className="cart-badge">{wishlistCount}</span></div>
                    <span className="nav-text">Wishlist</span>
                </Link>
                <Link to="/orders" className="nav-item"><User size={22} /><span className="nav-text">My Orders</span></Link>
                <Link to="/profile" className="nav-item"><User size={22} /><span className="nav-text">{customerName}</span></Link>
                <button className="nav-item" onClick={performLogout}><LogOut size={22} /><span className="nav-text">Logout</span></button>
            </div>
        </nav>
    );
}
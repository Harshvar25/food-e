import React, { useState, useEffect } from 'react';
import Navbar from '../Component/Navbar.jsx';
import FoodCard from '../Component/FoodCard.jsx';
import { CustomerAPI } from '../Services/CustomerAPI';
import './css/CustomerDashboard.css';
import { useMemo } from 'react';

export default function CustomerDashboard() {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFoodItems = async () => {
            const token = localStorage.getItem("customer_token");

            if (!token) {
                setError("No token found. Please login.");
                setLoading(false);
                return;
            }

            try {
                const response = await CustomerAPI.getAllFoods(token);
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setFoodItems(data);
                    } else {
                        console.warn("Data is not an array!", data);
                    }
                } else {
                    setError(`Server returned: ${response.status}`);
                }
            } catch (err) {
                console.error("Network error:", err);
                setError("Failed to connect to server.");
            } finally {
                setLoading(false);
            }
        };

        fetchFoodItems();
    }, []);

    const formatCategoryName = (catString) => {
        if (!catString) return "Other";
        return catString.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    // --- NEW: Logic to Group Foods by Category ---
    const groupedFoods = useMemo(() => {
        const groups = {};
        foodItems.forEach(food => {
            // Default to 'Uncategorized' if category is null
            const category = food.category || 'Uncategorized';

            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(food);
        });
        return groups;
    }, [foodItems]);


    const scrollToMenu = () => {
        const menuSection = document.getElementById('menu-section');
        if (menuSection) {
            menuSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleSearch = async (keyword) => {
        const token = localStorage.getItem("customer_token");
        if (!token) return;

        setLoading(true);
        try {
            let response;
            if (!keyword || keyword.trim() === "") {
                response = await CustomerAPI.getAllFoods(token);
            } else {
                response = await CustomerAPI.searchFood(keyword, token);
            }

            if (response.ok) {
                const data = await response.json();
                setFoodItems(data);
            }
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToWishlist = async (foodId) => {
        const customerId = localStorage.getItem("customerId");
        const token = localStorage.getItem("customer_token");

        if (!token || !customerId) {
            alert("Please login to save items.");
            return;
        }

        try {
            const response = await CustomerAPI.addToWishlist(customerId, foodId, token);
            if (response.ok) {
                // Optional: Show a small toast notification
                console.log("Added to wishlist");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddToCart = async (food) => {
        console.log("Add to Cart clicked for:", food);

        if (!food || !food.id) {
            console.error("Error: Food item or ID is missing!", food);
            return;
        }

        const customerId = localStorage.getItem("customerId");
        const token = localStorage.getItem("customer_token");

        if (!token) {
            alert("Please login first.");
            return;
        }

        try {
            await CustomerAPI.addFoodToCart(customerId, food.id, 1, token);
            console.log("Added to cart successfully");
            window.dispatchEvent(new Event("cartUpdated"));
            alert(`${food.name} added to cart!`); // Added user feedback
        } catch (err) {
            console.error("Failed to add to cart:", err);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="navbar-wrapper">
                <Navbar onSearch={handleSearch} />
            </div>

            {/* HERO SECTION */}
            <div className="hero-section">
                <div className="hero-overlay">
                    <div className="hero-content">
                        <h1>Craving Something Extraordinary?</h1>
                        <p>Fresh ingredients, chef-crafted recipes, delivered hot to your door.</p>
                        <button onClick={scrollToMenu} className="hero-btn">
                            Order Now
                        </button>
                    </div>
                </div>
            </div>

            <div className="dashboard-content" id="menu-section">
                <header className="dashboard-header">
                    <h2>Our Menu</h2>
                    <p>Delicious meals delivered right to your doorstep.</p>
                </header>

                {loading && <p className="status-msg">Loading delicious foods...</p>}
                {error && <p className="status-msg error">{error}</p>}

                {/* --- NEW: RENDER CATEGORIES --- */}
                {!loading && !error && Object.keys(groupedFoods).length > 0 ? (
                    Object.keys(groupedFoods).map((category) => (
                        <div key={category} className="category-section">
                            <h3 className="category-title">{formatCategoryName(category)}</h3>
                            
                            {/* Horizontal Scroll Container */}
                            <div className="food-carousel">
                                {groupedFoods[category].map(item => (
                                    <FoodCard
                                        key={item.id}
                                        food={item}
                                        onAddToCart={handleAddToCart}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    // Fallback if no foods found
                    !loading && !error && <p className="status-msg">No food items found.</p>
                )}
            </div>
        </div>
    );
}
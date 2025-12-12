import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Component/Navbar';
import { CustomerAPI } from '../Services/CustomerAPI';
import { Heart, ShoppingCart, Clock, ArrowLeft, Minus, Plus, ChefHat } from 'lucide-react';
import { toast } from 'react-toastify';
import './css/FoodDetails.css'; // We will create this CSS next

export default function FoodDetails() {
    const { id } = useParams(); // Get the ID from the URL (e.g., /food/5)
    const navigate = useNavigate();
    
    const [food, setFood] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1); // Local quantity state

    useEffect(() => {
        const fetchFood = async () => {
            const token = localStorage.getItem("customer_token");
            try {
                const response = await CustomerAPI.getFoodById(id, token);
                console.log(response);
                if (response.ok) {
                    const data = await response.json();
                    setFood(data);
                } else {
                    toast.error("Food item not found");
                    navigate("/customerDashboard");
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load details");
            } finally {
                setLoading(false);
            }
        };
        fetchFood();
    }, [id, navigate]);

    // Helper to render image
    const getImageSrc = (item) => {
        if (item && item.imageData) {
            return `data:${item.imageType};base64,${item.imageData}`;
        }
        return "https://placehold.co/400x400?text=No+Image";
    };

    const handleAddToCart = async () => {
        const token = localStorage.getItem("customer_token");
        const customerId = localStorage.getItem("customerId");
        
        try {
            // Use the quantity selected on this page
            await CustomerAPI.addFoodToCart(customerId, food.id, quantity, token);
            toast.success(`${quantity}x ${food.name} added to Cart!`);
            window.dispatchEvent(new Event("cartUpdated")); // Update navbar count
        } catch (err) {
            toast.error("Failed to add to cart");
        }
    };

    const handleAddToWishlist = async () => {
        const token = localStorage.getItem("customer_token");
        const customerId = localStorage.getItem("customerId");
        try {
            await CustomerAPI.addToWishlist(customerId, food.id, token);
            toast.success("Added to Wishlist ❤️");
        } catch (err) {
            toast.info("Already in wishlist or error occurred");
        }
    };

    if (loading) return <div className="details-loading">Loading deliciousness...</div>;
    if (!food) return null;

    return (
        <div className="food-details-page">
            <Navbar />
            
            <div className="details-container">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} /> Back to Menu
                </button>

                <div className="details-card">
                    {/* Left Column: Image */}
                    <div className="details-image-section">
                        <img src={getImageSrc(food)} alt={food.name} className="hero-image" />
                    </div>

                    {/* Right Column: Info */}
                    <div className="details-info-section">
                        <div className="food-header">
                            <span className="food-category">{food.category}</span>
                            <h1 className="food-title">{food.name}</h1>
                            <div className="food-meta">
                                <span className="prep-time"><Clock size={16}/> 20-30 mins</span>
                                <span className="chef-badge"><ChefHat size={16}/> Chef's Special</span>
                            </div>
                        </div>

                        <p className="food-description">{food.description}</p>
                        
                        <div className="price-tag">
                            ₹{food.price}
                        </div>

                        {/* Quantity Selector */}
                        <div className="quantity-selector">
                            <span>Quantity:</span>
                            <div className="qty-controls">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={18}/></button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)}><Plus size={18}/></button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button className="btn-cart-large" onClick={handleAddToCart}>
                                <ShoppingCart size={20} /> Add to Cart
                            </button>
                            <button className="btn-wishlist-large" onClick={handleAddToWishlist}>
                                <Heart size={20} /> Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react'; // Removed Star if unused
import { Link } from 'react-router-dom'; // <--- 1. IMPORT THIS
import './CSS/FoodCard.css';
import { CustomerAPI } from '../Services/CustomerAPI';

export default function FoodCard({ food, onAddToCart }) {

    const [isWishlisted, setIsWishlisted] = useState(false);
    const [btnState, setBtnState] = useState("");

    const imageSrc = food.imageData
        ? `data:${food.imageType};base64,${food.imageData}`
        : "https://placehold.co/600x400?text=No+Image";

    useEffect(() => {
        const checkWishlistStatus = async () => {
            const customerId = localStorage.getItem("customerId");
            const token = localStorage.getItem("customer_token");

            if (customerId && token) {
                try {
                    const response = await CustomerAPI.getWishlist(customerId, token);
                    if (response.data) {
                        const exists = response.data.some(item => item.food.id === food.id);
                        setIsWishlisted(exists);
                    }
                } catch (error) {
                    console.error("Error checking wishlist status:", error);
                }
            }
        };
        checkWishlistStatus();
    }, [food.id]);

    const handleWishlistClick = async () => {
        const token = localStorage.getItem("customer_token");
        const customerId = localStorage.getItem("customerId");

        if (!token || !customerId) {
            alert("Please login to save items.");
            return;
        }

        try {
            if (isWishlisted) {
                await CustomerAPI.removeFromWishlist(customerId, food.id, token);
                setIsWishlisted(false);
            } else {
                await CustomerAPI.addToWishlist(customerId, food.id, token);
                setIsWishlisted(true);
            }
            window.dispatchEvent(new Event("wishlistUpdated"));
        } catch (error) {
            console.error("Error updating wishlist:", error);
        }
    };

    const animateAddToCart = () => {
        setBtnState("onclic");
        if (onAddToCart) {
            onAddToCart(food);
        }
        setTimeout(() => {
            setBtnState("validate");
            setTimeout(() => {
                setBtnState("");
            }, 750);
        }, 750);
    };

    return (
        <div className="food-card">
            {/* 2. Wrap Image in Link */}
            <div className="card-image-container">
                <Link to={`/food/${food.id}`}>
                    <img src={imageSrc} alt={food.name} className="food-image" />
                </Link>
                
                {food.isBestSeller && (
                    <div className="best-seller-badge">
                        <img src="https://cdn-icons-png.flaticon.com/512/7656/7656139.png" alt="" width="12px" /> Best seller
                    </div>
                )}
            </div>

            <div className="card-content">
                {/* 3. Wrap Title in Link (Remove default link styles) */}
                <Link to={`/food/${food.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="food-title">{food.name}</h3>
                </Link>

                <div className="food-tags">
                    {food.category && (
                        <span className="tag">{food.category}</span>
                    )}
                </div>

                {/* Optional: Limit description length if it's too long */}
                <p className="food-description">
                    {food.description?.length > 60 
                        ? food.description.substring(0, 60) + "..." 
                        : food.description}
                </p>

                <div className="card-footer">
                    <div className="price-block">
                        <span className="current-price">₹{food.price}</span>
                        {food.originalPrice && (
                            <span className="original-price">₹{food.originalPrice}</span>
                        )}
                    </div>

                    <div className="action-buttons">
                        <button
                            className="wishlist-btn"
                            onClick={handleWishlistClick}
                            style={{ backgroundColor: isWishlisted ? '#fee2e2' : '#f3f4f6' }}
                        >
                            <Heart size={20} fill={isWishlisted ? "red" : "white"} color={isWishlisted ? "red" : "black"} />
                        </button>

                        <div className="anim-btn-container">
                            <button
                                id="anim-button"
                                className={btnState}
                                onClick={animateAddToCart}
                            ></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
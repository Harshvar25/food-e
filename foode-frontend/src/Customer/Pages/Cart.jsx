import React, { useState, useEffect } from "react";
import Navbar from '../Component/Navbar';
import { CustomerAPI } from '../Services/CustomerAPI';
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import './css/Cart.css'; 

import CheckoutModal from '../Component/CheckoutModal';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");

  // 2. Add State for the Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const navigate = useNavigate();

  // --- 1. Fetch Cart Data ---
  const fetchCartData = async () => {
    const id = localStorage.getItem("customerId");
    const token = localStorage.getItem("customer_token");

    if (!id || !token) {
        navigate("/login");
        return;
    }

    try {
      setLoading(true);
      const customerRes = await CustomerAPI.getCustomerById(id, token);
      if(customerRes.data) setCustomerName(customerRes.data.name);

      const response = await CustomerAPI.getCart(id, token);
      
      if (response.data && response.data.cartItems) {
        setCartItems(response.data.cartItems);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  useEffect(() => {
    const total = cartItems.reduce(
      (acc, item) => acc + (item.food.price * item.quantity),
      0
    );
    setTotalPrice(total);
  }, [cartItems]);

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity === 0) {
        handleRemoveFromCart(item.cartItemId);
        return;
    }
    
    if (newQuantity < 0) return; 

    const id = localStorage.getItem("customerId");
    const token = localStorage.getItem("customer_token");

    try {
        const updatedItems = cartItems.map(cartItem => 
            cartItem.cartItemId === item.cartItemId 
            ? { ...cartItem, quantity: newQuantity } 
            : cartItem
        );
        setCartItems(updatedItems);
        await CustomerAPI.updateCartQuantity(id, item.cartItemId, newQuantity, token);
        window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
        console.error("Failed to update qty", error);
        fetchCartData();
    }
  };

  const handleRemoveFromCart = async (cartItemId) => {
    const id = localStorage.getItem("customerId");
    const token = localStorage.getItem("customer_token");
    
    if(!window.confirm("Are you sure you want to remove this item?")) return;

    try {
        await CustomerAPI.removeFromCart(id, cartItemId, token);
        setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
        window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
        console.error("Error removing item:", error);
    }
  };

  // 3. Callback function when order is successfully placed
  const handleOrderSuccess = () => {
      // Refresh the cart (it should be empty now)
      fetchCartData();
      // Update the little cart icon number in navbar
      window.dispatchEvent(new Event("cartUpdated"));
  };

  const getImageSrc = (food) => {
      if (food.imageData) {
          return `data:${food.imageType};base64,${food.imageData}`;
      }
      return "https://placehold.co/100x100?text=No+Image";
  };

  return (
    <div className="cart-page-container">
      {/* Navbar Container */}
      <div style={{ marginBottom: '80px' }}>
         <Navbar />
      </div>

      <div className="container" style={{maxWidth: '1000px', margin: '0 auto'}}>
        <div className="cart-card">
            
            {/* Header */}
            <div className="cart-header">
                <h4>Shopping Cart</h4>
            </div>
            
            <div style={{ padding: '20px' }}>
                {loading ? (
                    <div style={{textAlign: 'center', padding: '50px'}}>Loading cart...</div>
                ) : cartItems.length === 0 ? (
                  <div style={{textAlign: 'center', padding: '50px'}}>
                    <ShoppingCart size={64} style={{color: '#ccc', marginBottom: '20px'}} />
                    <h5>Your cart is empty</h5>
                    <button 
                        onClick={() => navigate("/customerDashboard")} 
                        className="btn-checkout"
                        style={{maxWidth: '200px', marginTop: '20px'}}
                    >
                        Browse Menu
                    </button>
                  </div>
                ) : (
                  <>
                    <table className="cart-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartItems.map((item) => (
                            <tr key={item.cartItemId}>
                              <td>
                                <div className="product-cell">
                                  <img
                                    src={getImageSrc(item.food)}
                                    alt={item.food.name}
                                    className="cart-product-img"
                                  />
                                  <div className="product-info">
                                    <h6>{item.food.name}</h6>
                                    <small>{item.food.category}</small>
                                  </div>
                                </div>
                              </td>
                              <td style={{fontWeight: '500'}}>₹ {item.food.price}</td>
                              <td>
                                <div className="quantity-control">
                                  <button
                                    className="qty-btn"
                                    type="button"
                                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                  >
                                    <Minus size={14}/>
                                  </button>
                                  <input
                                    type="text"
                                    className="qty-input"
                                    value={item.quantity}
                                    readOnly
                                  />
                                  <button
                                    className="qty-btn"
                                    type="button"
                                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </td>
                              <td style={{fontWeight: '700', color: '#333'}}>
                                ₹ {(item.food.price * item.quantity).toFixed(2)}
                              </td>
                              <td>
                                <button
                                  className="btn-trash"
                                  onClick={() => handleRemoveFromCart(item.cartItemId)}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                    </table>

                    {/* Footer / Total Section */}
                    <div className="checkout-section">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                          <span className="total-label">Grand Total:</span>
                          <span className="total-amount">₹ {totalPrice.toFixed(2)}</span>
                        </div>
                        
                        <div style={{textAlign: 'right'}}>
                            <button
                                className="btn-checkout"
                                // 4. Open the Modal instead of alerting
                                onClick={() => setIsCheckoutOpen(true)}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                  </>
                )}
            </div>
        </div>
      </div>

      {/* 5. Add the Modal Component */}
      <CheckoutModal 
          isOpen={isCheckoutOpen} 
          onClose={() => setIsCheckoutOpen(false)} 
          onOrderPlaced={handleOrderSuccess}
      />
    </div>
  );
};

export default Cart;
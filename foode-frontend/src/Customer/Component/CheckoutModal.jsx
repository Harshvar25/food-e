import React, { useState } from 'react';
import './CSS/CheckoutModal.css'; // We will add simple CSS below
import { CustomerAPI } from '../Services/CustomerAPI';

export default function CheckoutModal({ isOpen, onClose, onOrderPlaced }) {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const customerId = localStorage.getItem("customerId");
        const token = localStorage.getItem("customer_token");

        if (!customerId || !token) {
            setError("User not authenticated.");
            setLoading(false);
            return;
        }

        try {
            // ✅ CLEANER: Calling the API function
            const response = await CustomerAPI.placeOrder(customerId, address, token);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to place order");
            }

            const orderData = await response.json();

            alert(`Order Placed Successfully! ID: ${orderData.orderId}`);
            onOrderPlaced();
            onClose();

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Checkout</h2>
                <p>Enter your delivery address to confirm.</p>

                <form onSubmit={handleSubmit}>
                    <textarea
                        className="address-input"
                        rows="4"
                        placeholder="123 Tasty Street, Food City..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />

                    {error && <p className="error-msg">{error}</p>}

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn" disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="confirm-btn" disabled={loading}>
                            {loading ? 'Placing Order...' : 'Confirm Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
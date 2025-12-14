import React, { useState, useEffect } from 'react';
import { CustomerAPI } from '../Services/CustomerAPI';
import './CSS/CheckoutModal.css'; // Make sure this path matches your folder structure

export default function CheckoutModal({ isOpen, onClose, onOrderPlaced }) {
    
    // State to toggle between "Saved List" and "New Form"
    const [step, setStep] = useState('LIST'); // 'LIST' or 'NEW'
    
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Form State for New Address
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        addressType: 'Home'
    });

    // 1. Fetch Addresses when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchAddresses();
        }
    }, [isOpen]);

    const fetchAddresses = async () => {
        const id = localStorage.getItem("customerId");
        const token = localStorage.getItem("customer_token");
        try {
            const response = await CustomerAPI.getAddresses(id, token);
            if (response.ok) {
                const data = await response.json();
                setSavedAddresses(data);
                
                // If user has addresses, select the first one. If none, go straight to "Add New".
                if (data.length > 0) {
                    setSelectedAddressId(data[0].id);
                    setStep('LIST');
                } else {
                    setStep('NEW');
                }
            }
        } catch (error) {
            console.error("Error loading addresses", error);
        }
    };

    const handleInputChange = (e) => {
        setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
    };

    const handleConfirmOrder = async () => {
        const id = localStorage.getItem("customerId");
        const token = localStorage.getItem("customer_token");
        
        setLoading(true);
        let finalAddressString = "";

        try {
            // SCENARIO A: Adding a BRAND NEW address
            if (step === 'NEW') {
                if (!newAddress.street || !newAddress.city || !newAddress.zipCode) {
                    alert("Please fill in Street, City and Zip Code.");
                    setLoading(false);
                    return;
                }

                // 1. Save the new address to Database first
                const saveResponse = await CustomerAPI.addAddress(id, newAddress, token);
                if (!saveResponse.ok) throw new Error("Failed to save address");
                
                // 2. Format string for the Order
                finalAddressString = `${newAddress.street}, ${newAddress.city}, ${newAddress.state} - ${newAddress.zipCode}`;
            } 
            // SCENARIO B: Using an EXISTING saved address
            else {
                const selected = savedAddresses.find(a => a.id === selectedAddressId);
                if (!selected) {
                    alert("Please select an address.");
                    setLoading(false);
                    return;
                }
                finalAddressString = `${selected.street}, ${selected.city}, ${selected.state} - ${selected.zipCode}`;
            }

            // 3. Place the Order
            const orderResponse = await CustomerAPI.placeOrder(id, finalAddressString, token);
            
            if (orderResponse.ok) {
                const orderData = await orderResponse.json();
                alert(`Order Placed Successfully! ID: ${orderData.orderId}`);
                onOrderPlaced(); // Refresh cart
                onClose();       // Close modal
            } else {
                alert("Failed to place order.");
            }

        } catch (error) {
            console.error("Checkout failed:", error);
            alert("Something went wrong processing your order.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="checkout-modal">
                <div className="modal-header">
                    <h2>Select Delivery Address</h2>
                    <button className="close-x" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {/* --- TOGGLE TABS --- */}
                    <div className="address-tabs">
                        <button 
                            className={step === 'LIST' ? 'active' : ''} 
                            onClick={() => setStep('LIST')}
                            // Disable "Saved" tab if there are no saved addresses
                            disabled={savedAddresses.length === 0}
                            style={{ opacity: savedAddresses.length === 0 ? 0.5 : 1 }}
                        >
                            Saved Addresses
                        </button>
                        <button 
                            className={step === 'NEW' ? 'active' : ''} 
                            onClick={() => setStep('NEW')}
                        >
                            + Add New
                        </button>
                    </div>

                    {/* --- VIEW 1: LIST SAVED ADDRESSES --- */}
                    {step === 'LIST' && (
                        <div className="address-list">
                            {savedAddresses.map((addr) => (
                                <div 
                                    key={addr.id} 
                                    className={`address-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedAddressId(addr.id)}
                                >
                                    <input 
                                        type="radio" 
                                        name="selectedAddr" 
                                        checked={selectedAddressId === addr.id}
                                        readOnly
                                    />
                                    <div className="addr-details">
                                        <span className="addr-badge">{addr.addressType}</span>
                                        <p>{addr.street}, {addr.city}</p>
                                        <small>{addr.state} - {addr.zipCode}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- VIEW 2: ADD NEW FORM --- */}
                    {step === 'NEW' && (
                        <div className="new-address-form">
                            <label>Street Address</label>
                            <input type="text" name="street" value={newAddress.street} onChange={handleInputChange} placeholder="Flat No, Building, Street" />

                            <div className="row">
                                <div className="col">
                                    <label>City</label>
                                    <input type="text" name="city" value={newAddress.city} onChange={handleInputChange} placeholder="City" />
                                </div>
                                <div className="col">
                                    <label>Zip Code</label>
                                    <input type="text" name="zipCode" value={newAddress.zipCode} onChange={handleInputChange} placeholder="Zip Code" />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col">
                                    <label>State</label>
                                    <input type="text" name="state" value={newAddress.state} onChange={handleInputChange} placeholder="State" />
                                </div>
                                <div className="col">
                                    <label>Type</label>
                                    <select name="addressType" value={newAddress.addressType} onChange={handleInputChange}>
                                        <option value="Home">Home</option>
                                        <option value="Work">Work</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-confirm" onClick={handleConfirmOrder} disabled={loading}>
                        {loading ? "Processing..." : "Confirm & Order"}
                    </button>
                </div>
            </div>
        </div>
    );
}
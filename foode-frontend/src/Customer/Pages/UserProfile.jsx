import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerAPI } from '../Services/CustomerAPI';
import { useCustomerAuth } from '../Context/CustomerAuthContext';
import { User, Camera, Plus, MapPin, Trash2, Edit2, X } from 'lucide-react';
import './css/UserProfile.css';
import Navbar from '../Component/Navbar.jsx';

export default function UserProfile() {
    const navigate = useNavigate();
    const { token, logout } = useCustomerAuth();
    const fileInputRef = useRef(null);

    // --- STATE ---
    const [customer, setCustomer] = useState({
        customerId: '', name: '', email: '', phone: ''
    });
    const [addresses, setAddresses] = useState([]);

    // Image State
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Editing State
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // Address Modal State
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        street: '', city: '', state: '', zipCode: '', addressType: 'HOME'
    });

    const [loading, setLoading] = useState(true);

    // --- INITIAL LOAD ---
    useEffect(() => {
        const id = localStorage.getItem("customerId");
        const storedToken = localStorage.getItem("customer_token") || token;

        if (!id || !storedToken) {
            navigate("/login");
            return;
        }

        loadData(id, storedToken);
    }, [navigate, token]);

    const loadData = async (id, storedToken) => {
        setLoading(true);
        try {
            // 1. Fetch Profile
            const profileRes = await CustomerAPI.getCustomerById(id, storedToken);
            setCustomer(profileRes.data || profileRes);

            // 2. Fetch Addresses
            const addrRes = await CustomerAPI.getAddresses(id, storedToken);
            if (addrRes.ok) {
                const addrData = await addrRes.json();
                setAddresses(addrData);
            }
        } catch (err) {
            console.error("Error loading profile:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- PROFILE HANDLERS ---
    const handleProfileChange = (e) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const saveProfile = async () => {
        const storedToken = localStorage.getItem("customer_token");
        try {
            const formData = new FormData();
            
            // ✅ FIX 1: Changed key from 'customer' to 'customerInfo' to match Backend requirement
            formData.append("customerInfo", new Blob([JSON.stringify(customer)], { type: 'application/json' }));

            if (selectedImage) {
                formData.append("imageFile", selectedImage);
            }

            const res = await CustomerAPI.updateCustomer(customer.customerId, formData, storedToken);

            if (res.ok) {
                alert("Profile Updated Successfully!");
                setIsEditingProfile(false);
            } else {
                alert("Failed to update profile. Check console.");
            }
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    // --- ADDRESS HANDLERS ---

    const openAddAddress = () => {
        setEditingAddress(null);
        setAddressForm({ street: '', city: '', state: '', zipCode: '', addressType: 'HOME' });
        setShowAddressModal(true);
    };

    const openEditAddress = (addr) => {
        setEditingAddress(addr);
        setAddressForm({ ...addr });
        setShowAddressModal(true);
    };

    const handleAddressFormChange = (e) => {
        setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
    };

    const saveAddress = async (e) => {
        e.preventDefault();
        const id = customer.customerId;
        const storedToken = localStorage.getItem("customer_token");

        try {
            let res;
            if (editingAddress) {
                res = await CustomerAPI.updateAddress(id, addressForm, storedToken);
            } else {
                res = await CustomerAPI.addAddress(id, addressForm, storedToken);
            }

            if (res.ok) {
                const updatedList = await CustomerAPI.getAddresses(id, storedToken);
                const data = await updatedList.json();
                setAddresses(data);
                setShowAddressModal(false);
            } else {
                alert("Failed to save address");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const deleteAddress = async (addrId) => {
        if (!window.confirm("Delete this address?")) return;
        const storedToken = localStorage.getItem("customer_token");
        try {
            await CustomerAPI.deleteAddress(addrId, storedToken);
            setAddresses(prev => prev.filter(a => a.id !== addrId));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="loading-screen">Loading...</div>;

    return (
        <div className="profile-page-container">
            <Navbar />
            <div className="profile-banner"></div>

            <div className="profile-content-wrapper">

                {/* --- LEFT COLUMN: PROFILE CARD --- */}
                <div className="profile-sidebar">
                    <div className="profile-card card-shadow">
                        <div className="avatar-section">
                            <div className="avatar-wrapper">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Profile" />
                                ) : customer.imageData ? (
                                    <img src={`data:image/jpeg;base64,${customer.imageData}`} alt="Profile" />
                                ) : (
                                    <User size={64} color="#ccc" />
                                )}

                                {isEditingProfile && (
                                    <button className="cam-btn" onClick={() => fileInputRef.current.click()}>
                                        <Camera size={16} />
                                    </button>
                                )}
                                <input type="file" ref={fileInputRef} hidden onChange={handleImageChange} accept="image/*" />
                            </div>
                            <h2>{customer.name}</h2>
                            <p>{customer.email}</p>
                        </div>

                        <div className="profile-form">
                            {/* Sidebar Actions */}
                            <div className="action-row">
                                {isEditingProfile ? (
                                    <>
                                        <button className="btn-save" onClick={saveProfile}>Save Changes</button>
                                        <button className="btn-cancel" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                                    </>
                                ) : (
                                    <button className="btn-edit" onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: DETAILS & ADDRESSES --- */}
                <div className="profile-main">

                    {/* DETAILS SECTION */}
                    <div className="profile-content-card card-shadow" style={{ marginBottom: '30px', background: 'white', borderRadius: '12px', padding: '25px' }}>
                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Personal Details</h3>
                        
                        <div className="profile-details-form">
                            {/* FULL NAME */}
                            <div className="detail-group">
                                <label className="detail-label">Full Name</label>
                                {isEditingProfile ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={customer.name}
                                        onChange={handleProfileChange}
                                        className="profile-input"
                                    />
                                ) : (
                                    <p className="detail-value">{customer.name}</p>
                                )}
                            </div>

                            {/* EMAIL - ✅ FIX 2: Added conditional rendering */}
                            <div className="detail-group">
                                <label className="detail-label">Email</label>
                                {isEditingProfile ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={customer.email}
                                        onChange={handleProfileChange}
                                        className="profile-input"
                                    />
                                ) : (
                                    <p className="detail-value">{customer.email}</p>
                                )}
                            </div>

                            {/* PHONE */}
                            <div className="detail-group">
                                <label className="detail-label">Phone</label>
                                {isEditingProfile ? (
                                    <input
                                        type="text"
                                        name="phone"
                                        value={customer.phone}
                                        onChange={handleProfileChange}
                                        className="profile-input"
                                    />
                                ) : (
                                    <p className="detail-value">{customer.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ADDRESS SECTION */}
                    <div className="section-header">
                        <h3>My Addresses</h3>
                        <button className="btn-add-addr" onClick={openAddAddress}>
                            <Plus size={18} /> Add New Address
                        </button>
                    </div>

                    <div className="address-grid">
                        {addresses.length === 0 ? (
                            <p className="no-data">No addresses saved yet.</p>
                        ) : (
                            addresses.map(addr => (
                                <div key={addr.id} className="address-card">
                                    <div className="addr-icon">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="addr-info">
                                        <span className="addr-tag">{addr.addressType}</span>
                                        <h4>{addr.street}</h4>
                                        <p>{addr.city}, {addr.state} - {addr.zipCode}</p>
                                    </div>
                                    <div className="addr-actions">
                                        <button onClick={() => openEditAddress(addr)} className="icon-btn edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => deleteAddress(addr.id)} className="icon-btn delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* --- ADDRESS MODAL POPUP --- */}
            {showAddressModal && (
                <div className="modal-overlay">
                    <div className="addr-modal">
                        <div className="modal-head">
                            <h3>{editingAddress ? "Edit Address" : "Add New Address"}</h3>
                            <button onClick={() => setShowAddressModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={saveAddress}>
                            <div className="form-group">
                                <label>Address Type</label>
                                <select name="addressType" value={addressForm.addressType} onChange={handleAddressFormChange}>
                                    <option value="HOME">Home</option>
                                    <option value="WORK">Work</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Street Address</label>
                                <input type="text" name="street" value={addressForm.street} onChange={handleAddressFormChange} required placeholder="Flat No, Street..." />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>City</label>
                                    <input type="text" name="city" value={addressForm.city} onChange={handleAddressFormChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Zip Code</label>
                                    <input type="text" name="zipCode" value={addressForm.zipCode} onChange={handleAddressFormChange} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <input type="text" name="state" value={addressForm.state} onChange={handleAddressFormChange} required />
                            </div>
                            <button type="submit" className="btn-submit">
                                {editingAddress ? "Update Address" : "Save Address"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
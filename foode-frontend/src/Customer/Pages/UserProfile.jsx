import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerAPI } from '../Services/CustomerAPI';
import { useCustomerAuth } from '../Context/CustomerAuthContext';
import { User, Camera } from 'lucide-react';
import './css/UserProfile.css';
import Navbar from '../Component/Navbar.jsx';

export default function UserProfile() {
    const navigate = useNavigate();
    const { token, logout } = useCustomerAuth();
    const fileInputRef = useRef(null);

    const [customer, setCustomer] = useState({
        customerId: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        password: ''
    });

    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const id = localStorage.getItem("customerId");
        const storedToken = localStorage.getItem("customer_token") || token;
        if (!id || !storedToken) {
            navigate("/login");
            return;
        }

        CustomerAPI.getCustomerById(id, storedToken)
            .then(data => {
                setCustomer(data.data || data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile.");
                setLoading(false);
            });
    }, [navigate, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomer(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        const storedToken = localStorage.getItem("customer_token");

        try {
            const formData = new FormData();
            const jsonBlob = new Blob([JSON.stringify(customer)], { type: 'application/json' });
            formData.append("customer", jsonBlob);

            if (selectedImage) {
                formData.append("imageFile", selectedImage);
            }

            const res = await CustomerAPI.updateCustomer(customer.customerId, formData, storedToken);

            if (res.ok) {
                alert("Profile updated successfully!");
                setIsEditing(false);
                window.dispatchEvent(new Event("profileUpdated"));
            } else {
                alert("Failed to update profile.");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Error updating profile.");
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure? This will permanently delete your account.")) return;
        const storedToken = localStorage.getItem("customer_token");
        try {
            const res = await CustomerAPI.deleteCustomer(customer.customerId, storedToken);
            if (res.ok) {
                alert("Account deleted.");
                await logout();
                navigate("/login");
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="profile-loading">Loading Profile...</div>;
    if (error) return <div className="profile-error">{error}</div>;

    return (
        <div className="profile-page-container">
            <Navbar />
            <div className="profile-banner"></div>

            <div className="profile-content-wrapper">
                <div className="profile-header-section">

                    <div className="profile-avatar-wrapper" style={{ position: 'relative' }}>
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="profile-avatar-img" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : customer.imageData ? (
                            <img src={`data:image/jpeg;base64,${customer.imageData}`} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <User size={80} color="#555" className="default-avatar-icon" />
                        )}

                        {isEditing && (
                            <button
                                className="avatar-edit-btn"
                                onClick={() => fileInputRef.current.click()}
                                style={{
                                    position: 'absolute', bottom: '0', right: '0',
                                    background: '#222', color: '#fff', border: 'none',
                                    borderRadius: '50%', padding: '8px', cursor: 'pointer'
                                }}
                            >
                                <Camera size={18} />
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                            accept="image/*"
                        />
                    </div>

                    <div className="profile-info-block">
                        <div className="profile-title-row">
                            <h1 className="profile-name">{customer.name || "User Name"}</h1>
                        </div>
                        <p className="profile-role">Customer Account</p>

                        <div className="profile-header-actions">
                            {isEditing ? (
                                <>
                                    <button onClick={handleSave} className="header-btn primary-btn">Save</button>
                                    <button onClick={() => setIsEditing(false)} className="header-btn secondary-btn">Cancel</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setIsEditing(true)} className="header-btn primary-btn">
                                        Edit Profile
                                    </button>

                                    <button onClick={handleDeleteAccount} className="header-btn danger-btn-outline">
                                        Delete Account
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="profile-content-card card-shadow">
                    <div className="profile-details-form">
                        <div className="detail-group">
                            <label className="detail-label">Full Name</label>
                            {isEditing ? <input type="text" name="name" value={customer.name} onChange={handleChange} className="profile-input" /> : <p className="detail-value">{customer.name}</p>}
                        </div>
                        <div className="detail-group">
                            <label className="detail-label">Email</label>
                            <p className="detail-value read-only">{customer.email}</p>
                        </div>
                        <div className="detail-group">
                            <label className="detail-label">Phone</label>
                            {isEditing ? <input type="text" name="phone" value={customer.phone} onChange={handleChange} className="profile-input" /> : <p className="detail-value">{customer.phone}</p>}
                        </div>
                        <div className="detail-group">
                            <label className="detail-label">Address</label>
                            {isEditing ? <textarea name="address" value={customer.address} onChange={handleChange} className="profile-textarea" /> : <p className="detail-value">{customer.address || "No address set"}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
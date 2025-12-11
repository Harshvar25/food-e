import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CustomerAPI } from "../Services/CustomerAPI"; // Ensure this import exists

export default function CustomerSignUp() {
    const navigate = useNavigate();

    // 1. Text Data State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        address: ""
    });

    // 2. NEW: Image File State
    const [imageFile, setImageFile] = useState(null);

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Handle Text Changes
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    // 3. NEW: Handle File Selection
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const dataToSend = new FormData();

            const jsonBlob = new Blob([JSON.stringify(formData)], { type: 'application/json' });
            dataToSend.append("customer", jsonBlob);

            if (imageFile) {
                dataToSend.append("image", imageFile);
            }

            console.log("Sending Multipart Data...");

            const response = await CustomerAPI.customerSignUp(dataToSend);

            if (response.ok) {
                await response.json();
                console.log("Account Created Successfully");
                navigate("/login");
            } else {
                const msg = await response.text();
                throw new Error(msg || "Registration failed. Please try again.");
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError(err.message || "Could not connect to server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signin-page-container">

            <div className="visual-panel">
                {/* Background image handled via CSS */}
            </div>

            <div className="form-panel">
                <div className="login-card">
                    <h1 className="logo-title">Foode</h1>

                    <div className="card-header">
                        <h2>Create Account</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">

                        {/* --- NEW: Image Upload Input --- */}
                        <label htmlFor="profile-pic">Profile Picture (Optional)</label>
                        <input 
                            type="file" 
                            id="profile-pic" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="form-input file-input"
                            style={{ paddingTop: '10px' }}
                        />

                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />

                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />

                        <label htmlFor="phone">Phone Number</label>
                        <input
                            id="phone"
                            type="tel"
                            placeholder="1234567890"
                            maxLength={15}
                            value={formData.phone}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />

                        <label htmlFor="address">Delivery Address</label>
                        <textarea
                            id="address"
                            placeholder="123 Food Street, Yum City"
                            value={formData.address}
                            onChange={handleChange}
                            className="form-input"
                            rows="2"
                        />

                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />

                        {error && <p className="error-message">{error}</p>}

                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? "Creating Account..." : "Sign Up"}
                        </button>

                        <p className="signup-link">
                            Already have an account? <Link to="/login">Log In here</Link>
                        </p>
                    </form>

                    <div className="footer-links">
                        <span className="copyright-text">© Foode 2024</span>
                        <a href="/terms">Terms</a>
                        <a href="/privacy">Privacy</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
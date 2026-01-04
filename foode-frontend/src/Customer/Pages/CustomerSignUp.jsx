import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CustomerAPI } from "../Services/CustomerAPI";
import logoImage from '../asset/Logo.png';

export default function CustomerSignUp() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: ""
    });

    const [confirmPassword, setConfirmPassword] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const isPasswordStrong = (pass) => {
        const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{8,}$/;
        return regex.test(pass);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        if (!isPasswordStrong(formData.password)) {
            setError("Password must be 8+ chars with Uppercase, Number, and Special Symbol.");
            return;
        }

        setIsLoading(true);

        try {
            const dataToSend = new FormData();
            const jsonBlob = new Blob([JSON.stringify(formData)], { type: 'application/json' });
            dataToSend.append("customer", jsonBlob);

            if (imageFile) {
                dataToSend.append("image", imageFile);
            }

            const response = await CustomerAPI.customerSignUp(dataToSend);

            if (response.ok) {
                alert("Account Created! Please Login.");
                navigate("/login");
            } else {
                const msg = await response.text();
                throw new Error(msg || "Registration failed");
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signin-page-container">
            <div className="visual-panel"></div>
            <div className="form-panel">
                    <img src={logoImage} alt="Foode Logo" className="logo-img logo-title" />                    <div className="card-header">
                        <h2>Create Account</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">

                        <label htmlFor="profile-pic">Profile Picture (Optional)</label>
                        <input
                            type="file" id="profile-pic" accept="image/*"
                            onChange={handleFileChange}
                            className="form-input file-input"
                            style={{ paddingTop: '10px' }}
                        />

                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name" type="text" placeholder="John Doe"
                            value={formData.name} onChange={handleChange}
                            className="form-input" required
                        />

                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email" type="email" placeholder="user@example.com"
                            value={formData.email} onChange={handleChange}
                            className="form-input" required
                        />

                        <label htmlFor="phone">Phone Number</label>
                        <input
                            id="phone" type="tel" placeholder="1234567890" maxLength={15}
                            value={formData.phone} onChange={handleChange}
                            className="form-input" required
                        />

                        <label htmlFor="password">Password</label>
                        <input
                            id="password" type="password" placeholder="Min. 8 chars with symbols"
                            value={formData.password} onChange={handleChange}
                            className="form-input" required
                        />

                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword" type="password" placeholder="Repeat your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-input" required
                        />

                        {error && <p className="error-message" style={{ color: '#d63031', fontSize: '0.85rem', marginBottom: '10px' }}>{error}</p>}

                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? "Creating Account..." : "Sign Up"}
                        </button>

                        <p className="signup-link">
                            Already have an account? <Link to="/login">Log In here</Link>
                        </p>
                    </form>

                    <div className="footer-links">
                        <span className="copyright-text">© Foode 2026</span>
                    </div>
            </div>
        </div>
    );
}
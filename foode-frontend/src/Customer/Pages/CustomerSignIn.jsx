import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CustomerAPI } from "../Services/CustomerAPI";
import { X } from 'lucide-react';
import './css/CustomerSignIn.css';
import logoImage from '../asset/Logo.png';

export default function CustomerSignIn() {
    const navigate = useNavigate();
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotStep, setForgotStep] = useState(1);
    const [forgotEmail, setForgotEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [timer, setTimer] = useState(70);

    // Timer Logic for OTP validity
    useEffect(() => {
        let interval;
        if (forgotStep === 2 && timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        } else if (timer === 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [forgotStep, timer]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            const res = await CustomerAPI.customerSignIn(email, password);
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("customer_token", data.token);
                localStorage.setItem("customerId", data.id || data.userId || data.customerId);
                navigate("/customerDashboard");
            } else {
                setError("Invalid credentials");
            }
        } catch (err) { setError("Server connection failed"); }
        setIsLoading(false);
    };

    // --- Forgot Password Logic Steps ---

    const handleSendOtp = async () => {
        setIsLoading(true);
        try {
            const res = await CustomerAPI.verifyEmailForOTP(forgotEmail);
            if (res.ok) {
                setForgotStep(2);
                setTimer(70);
            } else {
                alert("This email is not registered with us.");
            }
        } catch (err) { alert("Network error. Try again."); }
        setIsLoading(false);
    };

    const handleVerifyOtp = async () => {
        setIsLoading(true);
        try {
            const res = await CustomerAPI.verifyOTP(otp, forgotEmail);
            if (res.ok) {
                setForgotStep(3);
            } else {
                alert("Invalid or expired OTP. Please check again.");
            }
        } catch (err) { alert("Verification failed."); }
        setIsLoading(false);
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        setIsLoading(true);
        try {
            const res = await CustomerAPI.resetPassword(forgotEmail, newPassword);
            if (res.ok) {
                alert("Success! Your password has been updated.");
                setShowForgotModal(false);
                setForgotStep(1);
            } else {
                alert("Update failed. The OTP session may have expired.");
            }
        } catch (err) { alert("Error connecting to server."); }
        setIsLoading(false);
    };

    return (
        <div className="signin-page-container">
            <div className="visual-panel"></div>
            <div className="form-panel">
                <div className="card-head">
                    <img src={logoImage} alt="Foode Logo" className="logo-img logo-title" />
                    <div className="card-header"><h2>Welcome</h2></div>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <label>Your Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" required />
                    
                    <label>Your Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" required />

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Log In"}
                    </button>

                    <p className="forgot-password" onClick={() => setShowForgotModal(true)} style={{cursor: 'pointer'}}>
                        I forgot my password
                    </p>

                    <p className="signup-link">
                        Don't have an account? <Link to="/signup">Sign Up here</Link>
                    </p>
                </form>
            </div>

            {/* FORGOT PASSWORD MULTI-STEP MODAL */}
            {showForgotModal && (
                <div className="modal-overlay">
                    <div className="addr-modal">
                        <div className="modal-head">
                            <h3>Reset Password</h3>
                            <button onClick={() => setShowForgotModal(false)}><X size={20} /></button>
                        </div>
                        
                        <div style={{ padding: '20px 0' }}>
                            {forgotStep === 1 && (
                                <div className="step-container">
                                    <p>Enter your registered email to receive an OTP.</p>
                                    <input 
                                        type="email" 
                                        className="form-input" 
                                        placeholder="user@example.com"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                    />
                                    <button className="btn-submit" onClick={handleSendOtp} disabled={isLoading}>Send OTP</button>
                                </div>
                            )}

                            {forgotStep === 2 && (
                                <div className="step-container">
                                    <p>Enter the 4-digit OTP sent to {forgotEmail}</p>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                    <p style={{color: timer < 10 ? 'red' : '#666', fontSize: '0.8rem', marginTop: '5px'}}>
                                        OTP valid for: {timer} seconds
                                    </p>
                                    <button className="btn-submit" onClick={handleVerifyOtp} disabled={isLoading || timer === 0}>Verify OTP</button>
                                    {timer === 0 && <button onClick={handleSendOtp} style={{background: 'none', color: '#2ecc71', border: 'none', cursor: 'pointer', marginTop: '10px'}}>Resend OTP</button>}
                                </div>
                            )}

                            {forgotStep === 3 && (
                                <div className="step-container">
                                    <p>Enter your new secure password.</p>
                                    <input 
                                        type="password" 
                                        className="form-input" 
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <input 
                                        type="password" 
                                        className="form-input" 
                                        placeholder="Confirm Password"
                                        style={{marginTop: '10px'}}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button className="btn-submit" style={{marginTop: '15px'}} onClick={handleChangePassword} disabled={isLoading}>Update Password</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
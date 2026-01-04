import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../Services/api";
import { useAuth } from "../Context/AuthContext";
import './css/AdminSignIn.css';
import logo from '../assets/Logo.png';


export default function AdminSignIn() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await API.adminLogin(username, password);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Invalid credentials");
                return;
            }

            login(data.token);
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", "ADMIN");
            navigate("/dashboard");

        } catch (err) {
            console.error("Login error:", err);
            setError("Something went wrong. Try again.");
        }
    };

    return (
        <div className="signin-page-container">
            <div className="visual-panel">
                {/*  */}
            </div>

            <div className="form-panel">
                <div className="login-card">
                    <img src={logo} className="logo-title" alt="foodE Logo" />
                    <div className="card-header">
                        <h2>Log In</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">

                        <label htmlFor="username">Your username</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input"
                        />

                        <label htmlFor="password">Your password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                        />

                        {error && <p className="error-message">{error}</p>}

                        <button type="submit" className="login-button">
                            Log In
                        </button>

                        <p className="forgot-password">I forgot my password</p>
                    </form>

                    <div className="footer-links">
                        <p className="copyright-text">© Foode 2024</p>
                        <a href="/terms">Terms of use</a>
                        <a href="/privacy">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CustomerAPI } from "../Services/CustomerAPI";
import './css/CustomerSignIn.css';
import logoImage from '../asset/Logo.png'; // Import the logo image

const useCustomerAuth = () => ({
    login: (token) => { }
});

export default function CustomerSignIn() {

    const navigate = useNavigate();
    const { login } = useCustomerAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        localStorage.removeItem("customer_token");
        localStorage.removeItem("customerId");

        try {
            const res = await CustomerAPI.customerSignIn(email, password);

            if (!res.ok) {
                let errorMsg = "Invalid credentials";
                try {
                    const errorData = await res.json();
                    errorMsg = errorData.message || errorData.error || errorMsg;
                } catch (e) { }

                setError(errorMsg);
                setIsLoading(false);
                return;
            }

            const data = await res.json();

            if (data.token) {

                localStorage.setItem("customer_token", data.token);
                localStorage.setItem("role", "CUSTOMER");

                const userId = data.id || data.userId || data.customerId;

                if (userId) {
                    localStorage.setItem("customerId", userId);
                    await login(data.token);
                    console.log("Login Success! Customer ID saved:", userId);
                    setTimeout(() => {
                        navigate("/customerDashboard");
                    }, 100);
                } else {
                    console.error("WARNING: Backend sent token but NO 'id' field.", data);
                }

                login(data.token);

                navigate("/customerDashboard");
            } else {
                setError("Login succeeded but no token received.");
                setIsLoading(false);
            }

        } catch (err) {
            console.error(err);
            setError("Could not connect to server.");
            setIsLoading(false);
        }
    };

    return (
        <div className="signin-page-container">

            <div className="visual-panel">
            </div>

            <div className="form-panel">
                    <div className="card-head">
                        <img src={logoImage} alt="Foode Logo" className="logo-img logo-title" />


                        <div className="card-header">
                            <h2>Welcome</h2>
                        </div>
                    </div>


                    <form onSubmit={handleSubmit} className="login-form">

                        <label htmlFor="email">Your Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            required
                        />

                        <label htmlFor="password">Your Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            required
                        />

                        {error && <p className="error-message">{error}</p>}

                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Log In"}
                        </button>

                        <p className="forgot-password">I forgot my password</p>

                        <p className="signup-link">
                            Don't have an account? <Link to="/signup">Sign Up here</Link>
                        </p>
                    </form>

                <div className="footer-links">
                    <p className="copyright-text">© Foode 2024</p>
                    <a href="/terms">Terms of use</a>
                    <a href="/privacy">Privacy Policy</a>
                </div>
            </div>
        </div>
    );
}
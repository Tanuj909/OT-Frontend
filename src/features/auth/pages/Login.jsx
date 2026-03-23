import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import { useAuthContext } from "../../../context/AuthContext";

const Login = () => {
    const { handleLogin, loading, error } = useAuth();
    const { isAuthenticated } = useAuthContext();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isAuthenticated) navigate("/", { replace: true });
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.email && formData.password) {
            handleLogin(formData);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div className="text-hospital-blue font-bold text-2xl tracking-tight" style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="fa-solid fa-heart-pulse mr-2 text-hospital-green"></i>
                        <span>OT<span style={{ color: "var(--hospital-text-primary)" }}>Sync</span></span>
                    </div>
                    <p className="text-hospital-text-secondary text-sm">Sign in to your hospital account</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div style={{ marginBottom: "1.25rem" }}>
                        <label className="text-sm font-medium" style={{ display: "block", marginBottom: "0.5rem" }} htmlFor="email">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="e.g. doctor@hospital.com"
                            className="search-input"
                            style={{ width: "100%", paddingLeft: "1rem" }}
                            required
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>

                    <div style={{ marginBottom: "1.5rem", position: "relative" }}>
                        <label className="text-sm font-medium" style={{ display: "block", marginBottom: "0.5rem" }} htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="search-input"
                            style={{ width: "100%", paddingLeft: "1rem" }}
                            required
                            disabled={loading}
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: "absolute",
                                right: "0.75rem",
                                top: "2.1rem",
                                background: "none",
                                border: "none",
                                color: "var(--hospital-text-secondary)",
                                fontSize: "0.875rem",
                                cursor: "pointer",
                                width: "auto",
                                padding: "0"
                            }}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    {error && (
                        <div style={{ 
                            backgroundColor: "#fee2e2", 
                            color: "#ef4444", 
                            padding: "0.75rem", 
                            borderRadius: "0.5rem", 
                            marginBottom: "1rem", 
                            fontSize: "0.875rem",
                            textAlign: "center"
                        }}>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            backgroundColor: "var(--hospital-blue)",
                            color: "white",
                            border: "none",
                            borderRadius: "0.5rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "background-color 0.2s"
                        }}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                    <a href="/forgot-password" style={{ fontSize: "0.875rem", color: "var(--hospital-blue)", textDecoration: "none" }}>
                        Forgot password?
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;
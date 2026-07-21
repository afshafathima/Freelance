import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Mail, Lock, AlertCircle } from "lucide-react";
import API from "../api/axios";

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); setLoading(true);
        try {
            const res = await API.post("/auth/login", form);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Cannot connect to the server. Make sure the backend is running.");
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div style={{ display: "flex", width: "100%", maxWidth: 900, gap: 60, alignItems: "center" }}>
                <div style={{ flex: 1, display: "none" }} className="auth-hero">
                    <div style={{ color: "var(--text-primary)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <Zap size={28} color="var(--accent-light)" />
                            <span style={{ fontSize: 24, fontWeight: 800 }}>FreelanceFlow</span>
                        </div>
                        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>The all-in-one platform built for independent professionals.</p>
                    </div>
                </div>
                <div className="auth-card" style={{ maxWidth: 400, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,var(--accent),var(--accent-dark))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Zap size={16} color="white" />
                        </div>
                        <span className="auth-logo" style={{ fontSize: 20 }}>FreelanceFlow</span>
                    </div>
                    <p className="auth-tagline">Free forever. Upgrade when you're ready.</p>
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to your account</p>
                    {error && (
                        <div className="error-msg">
                            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={{ position: "relative" }}>
                                <Mail size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                <input className="form-input" style={{ paddingLeft: 36 }} type="email" placeholder="you@email.com"
                                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: "relative" }}>
                                <Lock size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                <input className="form-input" style={{ paddingLeft: 36 }} type="password" placeholder="••••••"
                                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                            </div>
                        </div>
                        <button className="auth-btn" type="submit" disabled={loading}>
                            {loading ? "Signing in…" : "Sign In →"}
                        </button>
                    </form>
                    <p className="auth-divider">
                        Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
export default Login;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, User, Mail, Lock, AlertCircle } from "lucide-react";
import API from "../api/axios";

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
        setLoading(true);
        try {
            const res = await API.post("/auth/register", { name: form.name, email: form.email, password: form.password });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Cannot connect to the server. Make sure the backend is running.");
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: 420, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,var(--accent),var(--accent-dark))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Zap size={16} color="white" />
                    </div>
                    <span className="auth-logo" style={{ fontSize: 20 }}>FreelanceFlow</span>
                </div>
                <p className="auth-tagline">Free forever. Upgrade when you're ready.</p>
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Start managing your freelance business</p>
                {error && (
                    <div className="error-msg">
                        <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div style={{ position: "relative" }}>
                            <User size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input className="form-input" style={{ paddingLeft: 36 }} type="text" placeholder="Your name"
                                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input className="form-input" style={{ paddingLeft: 36 }} type="email" placeholder="you@email.com"
                                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: "relative" }}>
                                <Lock size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                <input className="form-input" style={{ paddingLeft: 36 }} type="password" placeholder="••••••"
                                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <div style={{ position: "relative" }}>
                                <Lock size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                <input className="form-input" style={{ paddingLeft: 36 }} type="password" placeholder="••••••"
                                    value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
                            </div>
                        </div>
                    </div>
                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? "Creating account…" : "Create Free Account →"}
                    </button>
                </form>
                <p className="auth-divider">
                    Already have an account? <Link to="/" className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
export default Register;

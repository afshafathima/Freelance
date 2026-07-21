import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Users, FolderKanban, CheckSquare,
    Clock, FileText, BarChart3, LogOut, Zap, Sparkles, Database
} from "lucide-react";
import API from "../api/axios";

const navItems = [
    { to: "/dashboard",  label: "Dashboard",    icon: LayoutDashboard },
    { to: "/clients",    label: "Clients",       icon: Users },
    { to: "/projects",   label: "Projects",      icon: FolderKanban },
    { to: "/tasks",      label: "Tasks",         icon: CheckSquare },
    { to: "/timer",      label: "Time Tracking", icon: Clock },
    { to: "/invoices",   label: "Invoices",      icon: FileText },
    { to: "/financials", label: "Financials",    icon: BarChart3 },
];

function Sidebar() {
    const navigate = useNavigate();
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    const [plan, setPlan] = useState(user?.plan || "Free");
    const [seeding, setSeeding] = useState(false);
    const [seedMsg, setSeedMsg] = useState("");

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const handleTogglePlan = async () => {
        try {
            const res = await API.put("/auth/upgrade");
            const updated = res.data.user;
            localStorage.setItem("user", JSON.stringify(updated));
            setPlan(updated.plan);
            window.location.reload();
        } catch (err) {
            alert("Could not switch plan tier.");
        }
    };

    const handleSeedData = async () => {
        if (!confirm("Load sample data? This adds 2 clients, 3 projects, 13 tasks, and time logs.")) return;
        setSeeding(true);
        setSeedMsg("");
        try {
            const res = await API.post("/seed");
            const s = res.data.summary;
            setSeedMsg(`✅ ${s.clients} clients, ${s.projects} projects, ${s.tasks} tasks`);
            setTimeout(() => window.location.reload(), 1800);
        } catch (err) {
            setSeedMsg(`⚠️ ${err.response?.data?.message || "Failed"}`);
        } finally {
            setSeeding(false);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 2px 8px var(--accent-glow)", flexShrink: 0
                    }}>
                        <Zap size={14} color="white" />
                    </div>
                    <div className="logo-text">FreelanceFlow</div>
                </div>
                <div className="logo-sub" style={{ marginTop: 5 }}>Business Manager</div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink key={to} to={to} className={({ isActive }) => isActive ? "active" : ""}>
                        <Icon className="nav-icon" size={16} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            <div style={{ padding: "0 12px 8px" }}>
                <button
                    onClick={handleSeedData}
                    disabled={seeding}
                    style={{
                        width: "100%", padding: "8px 12px",
                        background: "rgba(56,189,248,0.06)",
                        border: "1px dashed rgba(56,189,248,0.25)",
                        borderRadius: "var(--radius-sm)", color: "var(--info)",
                        fontSize: 12, fontWeight: 600, cursor: seeding ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", gap: 7,
                        transition: "all 0.18s", fontFamily: "inherit", opacity: seeding ? 0.6 : 1
                    }}
                >
                    <Database size={12} />
                    {seeding ? "Loading data…" : "Load Sample Data"}
                </button>
                {seedMsg && (
                    <div style={{
                        marginTop: 6, fontSize: 10.5,
                        color: seedMsg.startsWith("✅") ? "var(--success)" : "var(--warning)",
                        padding: "4px 6px", borderRadius: 5,
                        background: seedMsg.startsWith("✅") ? "var(--success-bg)" : "var(--warning-bg)",
                        border: `1px solid ${seedMsg.startsWith("✅") ? "var(--success-border)" : "var(--warning-border)"}`
                    }}>
                        {seedMsg}
                    </div>
                )}
            </div>

            <div className="sidebar-footer">
                {user && (
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: "50%",
                                background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0
                            }}>
                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div style={{ overflow: "hidden" }}>
                                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {user.name}
                                </div>
                                <div style={{ fontSize: 10.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {user.email}
                                </div>
                            </div>
                        </div>
                        <span
                            className={`plan-badge ${plan.toLowerCase()}`}
                            onClick={handleTogglePlan}
                            style={{ cursor: "pointer", userSelect: "none" }}
                            title="Click to switch plan (demo)"
                        >
                            {plan === "Pro" ? <Sparkles size={10} /> : <Zap size={10} />}
                            {plan} Plan
                        </span>
                    </div>
                )}
                <button className="btn-logout" onClick={handleLogout}>
                    <LogOut size={13} /> Sign Out
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;

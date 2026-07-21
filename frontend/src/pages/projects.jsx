import { useEffect, useState } from "react";
import { Plus, X, FolderKanban, Trash2 } from "lucide-react";
import API from "../api/axios";

function Projects() {
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [burnRates, setBurnRates] = useState({});
    const [form, setForm] = useState({ projectName: "", clientId: "", budget: "", status: "Active" });
    const [error, setError] = useState("");

    const fetchProjects = async () => {
        try { const r = await API.get("/projects"); setProjects(r.data); } catch (e) { console.error(e); }
    };
    const fetchClients = async () => {
        try { const r = await API.get("/clients"); setClients(r.data); } catch (e) {}
    };

    useEffect(() => { fetchProjects(); fetchClients(); }, []);

    useEffect(() => {
        projects.forEach(async (p) => {
            try {
                const r = await API.get(`/projects/${p._id}/burnrate`);
                setBurnRates(prev => ({ ...prev, [p._id]: r.data }));
            } catch (e) {}
        });
    }, [projects]);

    const handleSubmit = async (e) => {
        e.preventDefault(); setError("");
        try {
            await API.post("/projects", { ...form, budget: Number(form.budget) });
            setShowModal(false); setForm({ projectName: "", clientId: "", budget: "", status: "Active" });
            fetchProjects();
        } catch (err) { setError(err.response?.data?.message || "Failed to create project"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete project?")) return;
        try { await API.delete(`/projects/${id}`); fetchProjects(); } catch (e) { alert("Failed to delete"); }
    };

    const handleStatusChange = async (id, status) => {
        try { await API.put(`/projects/${id}`, { status }); fetchProjects(); } catch (e) {}
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Projects</h1>
                    <p className="page-subtitle">Track your active work and burn rates</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setError(""); setShowModal(true); }}><Plus size={14} /> New Project</button>
            </div>

            {projects.length === 0 ? (
                <div className="empty-state">
                    <FolderKanban size={44} style={{ opacity: 0.3, marginBottom: 14 }} />
                    <h3>No projects yet</h3>
                    <p>Create your first project to start tracking time and budget.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 18 }}>
                    {projects.map(p => {
                        const br = burnRates[p._id] || {};
                        const pct = br.burnPercent || 0;
                        const barClass = pct >= 90 ? "danger" : pct >= 65 ? "warning" : "safe";
                        return (
                            <div key={p._id} className="card" style={{ position: "relative" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{p.projectName}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.clientId?.name || "No client"}</div>
                                    </div>
                                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                        <select
                                            value={p.status}
                                            onChange={e => handleStatusChange(p._id, e.target.value)}
                                            style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6, padding: "3px 6px", fontSize: 11, fontFamily: "inherit" }}
                                        >
                                            <option>Active</option>
                                            <option>Completed</option>
                                            <option>On Hold</option>
                                        </select>
                                        <button className="btn btn-danger btn-xs btn-icon" onClick={() => handleDelete(p._id)}><Trash2 size={11} /></button>
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                                    {[
                                        { label: "Budget", value: `$${(p.budget||0).toLocaleString()}` },
                                        { label: "Spent", value: `$${(br.spent||0).toFixed(0)}` },
                                        { label: "Hours", value: `${(br.totalHours||0).toFixed(1)}h` },
                                    ].map(s => (
                                        <div key={s.label} style={{ background: "var(--bg-input)", borderRadius: 6, padding: "8px 10px" }}>
                                            <div style={{ fontSize: 9.5, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{s.label}</div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{s.value}</div>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Burn Rate</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: pct >= 90 ? "var(--danger)" : pct >= 65 ? "var(--warning)" : "var(--success)" }}>{pct}%</span>
                                    </div>
                                    <div className="progress-wrap">
                                        <div className={`progress-bar ${barClass}`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">New Project</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        {error && <div className="error-msg">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Project Name</label>
                                <input className="form-input" required value={form.projectName} onChange={e => setForm({ ...form, projectName: e.target.value })} placeholder="e.g. Website Redesign" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Client</label>
                                <select className="form-select" required value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>
                                    <option value="">Select a client</option>
                                    {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Budget ($)</label>
                                    <input className="form-input" type="number" min="0" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="5000" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                        <option>Active</option>
                                        <option>Completed</option>
                                        <option>On Hold</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Projects;

import { useEffect, useState } from "react";
import { Plus, X, Pencil, Trash2, Users } from "lucide-react";
import API from "../api/axios";

function Client() {
    const [clients, setClients] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", phone: "", hourlyRate: "" });
    const [error, setError] = useState("");
    const [planLimit, setPlanLimit] = useState(false);

    const fetch = async () => {
        try { const r = await API.get("/clients"); setClients(r.data); } catch (e) { console.error(e); }
    };

    useEffect(() => { fetch(); }, []);

    const openAdd = () => { setEditing(null); setForm({ name: "", email: "", phone: "", hourlyRate: "" }); setError(""); setShowModal(true); };
    const openEdit = (c) => { setEditing(c); setForm({ name: c.name, email: c.email || "", phone: c.phone || "", hourlyRate: c.hourlyRate || "" }); setError(""); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(""); setPlanLimit(false);
        try {
            if (editing) await API.put(`/clients/${editing._id}`, form);
            else await API.post("/clients", form);
            setShowModal(false); fetch();
        } catch (err) {
            if (err.response?.data?.limitReached) { setPlanLimit(true); setShowModal(false); }
            else setError(err.response?.data?.message || "Failed to save client");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this client?")) return;
        try { await API.delete(`/clients/${id}`); fetch(); } catch (e) { alert("Failed to delete"); }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Clients</h1>
                    <p className="page-subtitle">Manage your client relationships</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Client</button>
            </div>

            {planLimit && (
                <div className="upgrade-banner">
                    <p>⚡ Free plan limit: 2 clients. Click your plan badge in the sidebar to upgrade to Pro.</p>
                </div>
            )}

            {clients.length === 0 ? (
                <div className="empty-state">
                    <Users size={44} style={{ opacity: 0.3, marginBottom: 14 }} />
                    <h3>No clients yet</h3>
                    <p>Add your first client to get started.</p>
                </div>
            ) : (
                <div className="table-container">
                    <div className="table-header"><h3>All Clients ({clients.length})</h3></div>
                    <table>
                        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Rate/hr</th><th>Actions</th></tr></thead>
                        <tbody>
                            {clients.map(c => (
                                <tr key={c._id}>
                                    <td style={{ fontWeight: 600 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>
                                                {c.name.charAt(0).toUpperCase()}
                                            </div>
                                            {c.name}
                                        </div>
                                    </td>
                                    <td style={{ color: "var(--text-secondary)" }}>{c.email || "—"}</td>
                                    <td style={{ color: "var(--text-secondary)" }}>{c.phone || "—"}</td>
                                    <td style={{ fontWeight: 700, color: "var(--success)" }}>${c.hourlyRate || 0}/hr</td>
                                    <td>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(c)}><Pencil size={13} /></button>
                                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(c._id)}><Trash2 size={13} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editing ? "Edit Client" : "New Client"}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        {error && <div className="error-msg">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Client name" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="client@email.com" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Hourly Rate ($)</label>
                                <input className="form-input" type="number" min="0" step="0.01" value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} placeholder="100" />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editing ? "Save Changes" : "Add Client"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Client;

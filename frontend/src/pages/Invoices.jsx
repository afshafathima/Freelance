import { useEffect, useState } from "react";
import { Plus, X, FileText, Trash2 } from "lucide-react";
import API from "../api/axios";

function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);
    const [showGen, setShowGen] = useState(false);
    const [form, setForm] = useState({ clientId: "", projectId: "", startDate: "", endDate: "" });
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchInvoices = async () => {
        try { const r = await API.get("/invoices"); setInvoices(r.data); } catch (e) {}
    };

    useEffect(() => {
        fetchInvoices();
        API.get("/clients").then(r => setClients(r.data)).catch(() => {});
        API.get("/projects").then(r => setProjects(r.data)).catch(() => {});
    }, []);

    const filteredProjects = form.clientId ? projects.filter(p => p.clientId?._id === form.clientId || p.clientId === form.clientId) : projects;

    const handlePreview = async () => {
        setError(""); setPreview(null);
        if (!form.clientId || !form.projectId || !form.startDate || !form.endDate) { setError("All fields required"); return; }
        setLoading(true);
        try {
            const r = await API.get("/invoices/preview", { params: form });
            setPreview(r.data);
        } catch (err) { setError(err.response?.data?.message || "Failed to preview"); }
        setLoading(false);
    };

    const handleGenerate = async () => {
        setError(""); setLoading(true);
        try {
            await API.post("/invoices/generate", form);
            setShowGen(false); setPreview(null); setForm({ clientId: "", projectId: "", startDate: "", endDate: "" });
            fetchInvoices();
        } catch (err) { setError(err.response?.data?.message || "Failed to generate"); }
        setLoading(false);
    };

    const handleStatusChange = async (id, status) => {
        try { await API.put(`/invoices/${id}`, { status }); fetchInvoices(); } catch (e) {}
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete invoice?")) return;
        try { await API.delete(`/invoices/${id}`); fetchInvoices(); } catch (e) {}
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Invoices</h1>
                    <p className="page-subtitle">Generate and manage client invoices</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowGen(true); setError(""); setPreview(null); }}><Plus size={14} /> Generate Invoice</button>
            </div>

            {invoices.length === 0 ? (
                <div className="empty-state">
                    <FileText size={44} style={{ opacity: 0.3, marginBottom: 14 }} />
                    <h3>No invoices yet</h3>
                    <p>Generate your first invoice from unbilled time logs.</p>
                </div>
            ) : (
                <div className="table-container">
                    <div className="table-header"><h3>All Invoices ({invoices.length})</h3></div>
                    <table>
                        <thead><tr><th>Client</th><th>Project</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr></thead>
                        <tbody>
                            {invoices.map(inv => (
                                <tr key={inv._id}>
                                    <td style={{ fontWeight: 600 }}>{inv.clientId?.name || "—"}</td>
                                    <td style={{ color: "var(--text-secondary)" }}>{inv.projectId?.projectName || "—"}</td>
                                    <td style={{ fontWeight: 700, color: "var(--success)" }}>${(inv.amount || 0).toFixed(2)}</td>
                                    <td>
                                        <select
                                            value={inv.status}
                                            onChange={e => handleStatusChange(inv._id, e.target.value)}
                                            style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontFamily: "inherit" }}
                                        >
                                            <option>Draft</option><option>Sent</option><option>Paid</option>
                                        </select>
                                    </td>
                                    <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn btn-danger btn-xs btn-icon" onClick={() => handleDelete(inv._id)}><Trash2 size={11} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showGen && (
                <div className="modal-overlay" onClick={() => setShowGen(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Generate Invoice from Time Logs</h2>
                            <button className="modal-close" onClick={() => setShowGen(false)}><X size={16} /></button>
                        </div>
                        {error && <div className="error-msg">{error}</div>}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div className="form-group">
                                <label className="form-label">Client</label>
                                <select className="form-select" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value, projectId: "" })}>
                                    <option value="">Select client</option>
                                    {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Project</label>
                                <select className="form-select" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} disabled={!form.clientId}>
                                    <option value="">Select project</option>
                                    {filteredProjects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <input className="form-input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date</label>
                                    <input className="form-input" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                                </div>
                            </div>
                            <button className="btn btn-secondary" onClick={handlePreview} disabled={loading}>
                                {loading ? "Checking…" : "Preview Unbilled Logs"}
                            </button>
                            {preview && (
                                <div style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                                        {[
                                            { label: "Total Hours", value: `${preview.totalHours.toFixed(2)}h` },
                                            { label: "Rate", value: `$${preview.hourlyRate}/hr` },
                                            { label: "Total Amount", value: `$${preview.totalAmount.toFixed(2)}` },
                                        ].map(s => (
                                            <div key={s.label} style={{ textAlign: "center" }}>
                                                <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 2 }}>{s.label}</div>
                                                <div style={{ fontSize: 18, fontWeight: 800 }}>{s.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>{preview.logs.length} time log(s) will be billed</div>
                                    <button className="btn btn-primary w-full" onClick={handleGenerate} disabled={loading} style={{ justifyContent: "center" }}>
                                        {loading ? "Generating…" : "Generate & Mark as Billed"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Invoices;

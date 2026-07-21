import { useEffect, useState } from "react";
import { Plus, X, CheckSquare, Check } from "lucide-react";
import API from "../api/axios";

const TABS = ["All", "Pending", "Completed"];

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [tab, setTab] = useState("All");
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: "", projectId: "", dueDate: "" });
    const [error, setError] = useState("");

    const fetch = async () => {
        try { const r = await API.get("/tasks"); setTasks(r.data); } catch (e) {}
    };
    useEffect(() => {
        fetch();
        API.get("/projects").then(r => setProjects(r.data)).catch(() => {});
    }, []);

    const filtered = tasks.filter(t => tab === "All" ? true : t.status === tab);

    const handleSubmit = async (e) => {
        e.preventDefault(); setError("");
        try {
            await API.post("/tasks", { ...form, status: "Pending" });
            setShowModal(false); setForm({ title: "", projectId: "", dueDate: "" }); fetch();
        } catch (err) { setError(err.response?.data?.message || "Failed to create task"); }
    };

    const toggleStatus = async (task) => {
        const newStatus = task.status === "Completed" ? "Pending" : "Completed";
        try { await API.put(`/tasks/${task._id}`, { status: newStatus }); fetch(); } catch (e) {}
    };

    const handleDelete = async (id) => {
        try { await API.delete(`/tasks/${id}`); fetch(); } catch (e) {}
    };

    const getDaysLeft = (due) => {
        if (!due) return null;
        return Math.ceil((new Date(due) - Date.now()) / 86400000);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Tasks</h1>
                    <p className="page-subtitle">Manage your work items and deadlines</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setError(""); setShowModal(true); }}><Plus size={14} /> Add Task</button>
            </div>

            <div className="tab-group" style={{ marginBottom: 20, width: "fit-content" }}>
                {TABS.map(t => (
                    <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                        {t} {t !== "All" && <span style={{ opacity: 0.7, fontSize: 11 }}>({tasks.filter(x => x.status === t).length})</span>}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <CheckSquare size={44} style={{ opacity: 0.3, marginBottom: 14 }} />
                    <h3>No {tab.toLowerCase()} tasks</h3>
                    <p>Add a task to track your work.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead><tr><th style={{ width: 36 }}></th><th>Task</th><th>Project</th><th>Due Date</th><th>Status</th><th></th></tr></thead>
                        <tbody>
                            {filtered.map(task => {
                                const daysLeft = getDaysLeft(task.dueDate);
                                const done = task.status === "Completed";
                                return (
                                    <tr key={task._id} style={{ opacity: done ? 0.6 : 1 }}>
                                        <td>
                                            <button
                                                onClick={() => toggleStatus(task)}
                                                style={{
                                                    width: 20, height: 20, borderRadius: 4,
                                                    border: done ? "none" : "1.5px solid var(--border-light)",
                                                    background: done ? "var(--success)" : "transparent",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    cursor: "pointer", flexShrink: 0
                                                }}
                                            >
                                                {done && <Check size={11} color="white" strokeWidth={3} />}
                                            </button>
                                        </td>
                                        <td style={{ fontWeight: 500, textDecoration: done ? "line-through" : "none" }}>{task.title}</td>
                                        <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{task.projectId?.projectName || "—"}</td>
                                        <td>
                                            {task.dueDate ? (
                                                <span style={{ fontSize: 12, color: !done && daysLeft < 0 ? "var(--danger)" : !done && daysLeft <= 2 ? "var(--warning)" : "var(--text-secondary)" }}>
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                    {!done && daysLeft !== null && (
                                                        <span style={{ marginLeft: 6, fontSize: 10 }}>
                                                            {daysLeft < 0 ? `(${Math.abs(daysLeft)}d overdue)` : daysLeft === 0 ? "(Today)" : `(${daysLeft}d)`}
                                                        </span>
                                                    )}
                                                </span>
                                            ) : "—"}
                                        </td>
                                        <td><span className={`badge badge-${done ? "completed" : "pending"}`}>{task.status}</span></td>
                                        <td>
                                            <button className="btn btn-danger btn-xs btn-icon" onClick={() => handleDelete(task._id)}><X size={11} /></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">New Task</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        {error && <div className="error-msg">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Task Title</label>
                                <input className="form-input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Design homepage" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Project</label>
                                <select className="form-select" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
                                    <option value="">No project</option>
                                    {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Due Date</label>
                                <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Tasks;

import { useEffect, useState, useRef } from "react";
import { Play, Square, Plus, X, Clock } from "lucide-react";
import API from "../api/axios";

function fmt(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function TimeTracking() {
    const [logs, setLogs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [elapsed, setElapsed] = useState(0);
    const [activeLogId, setActiveLogId] = useState(localStorage.getItem("activeLogId") || null);
    const [timerStart, setTimerStart] = useState(localStorage.getItem("timerStart") ? Number(localStorage.getItem("timerStart")) : null);
    const [form, setForm] = useState({ projectId: "", taskId: "", hours: "" });
    const [showManual, setShowManual] = useState(false);
    const [error, setError] = useState("");
    const intervalRef = useRef(null);

    const fetchLogs = async () => {
        try { const r = await API.get("/timer"); setLogs(r.data); } catch (e) {}
    };

    useEffect(() => {
        fetchLogs();
        API.get("/projects").then(r => setProjects(r.data)).catch(() => {});
    }, []);

    useEffect(() => {
        if (form.projectId) {
            API.get("/tasks").then(r => setTasks(r.data.filter(t => t.projectId?._id === form.projectId || t.projectId === form.projectId))).catch(() => {});
        }
    }, [form.projectId]);

    useEffect(() => {
        if (timerStart) {
            intervalRef.current = setInterval(() => {
                setElapsed(Math.floor((Date.now() - timerStart) / 1000));
            }, 1000);
        }
        return () => clearInterval(intervalRef.current);
    }, [timerStart]);

    const startTimer = async () => {
        if (!form.projectId || !form.taskId) { setError("Select a project and task first"); return; }
        setError("");
        try {
            const r = await API.post("/timer/start", { projectId: form.projectId, taskId: form.taskId });
            const now = Date.now();
            localStorage.setItem("activeLogId", r.data._id);
            localStorage.setItem("timerStart", String(now));
            setActiveLogId(r.data._id);
            setTimerStart(now);
            setElapsed(0);
        } catch (err) { setError(err.response?.data?.message || "Failed to start timer"); }
    };

    const stopTimer = async () => {
        if (!activeLogId) return;
        try {
            await API.put(`/timer/stop/${activeLogId}`);
            localStorage.removeItem("activeLogId");
            localStorage.removeItem("timerStart");
            setActiveLogId(null); setTimerStart(null); setElapsed(0);
            clearInterval(intervalRef.current);
            fetchLogs();
        } catch (err) { setError(err.response?.data?.message || "Failed to stop timer"); }
    };

    const handleManual = async (e) => {
        e.preventDefault(); setError("");
        try {
            await API.post("/timer/manual", { projectId: form.projectId, taskId: form.taskId, hours: Number(form.hours) });
            setShowManual(false); setForm({ projectId: "", taskId: "", hours: "" }); fetchLogs();
        } catch (err) { setError(err.response?.data?.message || "Failed to save entry"); }
    };

    const isRunning = !!activeLogId;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Time Tracking</h1>
                    <p className="page-subtitle">Track time against your projects</p>
                </div>
                <button className="btn btn-secondary" onClick={() => setShowManual(true)}><Plus size={14} /> Manual Entry</button>
            </div>

            <div className="card" style={{ marginBottom: 24, maxWidth: 500 }}>
                <div className="timer-display" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 48, fontWeight: 800, letterSpacing: -2, textAlign: "center", padding: "12px 0", color: isRunning ? "var(--success)" : "var(--text-primary)", ...(isRunning ? { textShadow: "0 0 24px rgba(34,197,94,0.35)" } : {}) }}>
                    {fmt(elapsed)}
                </div>
                {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}
                {!isRunning && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                        <select className="form-select" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value, taskId: "" })}>
                            <option value="">Select project…</option>
                            {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                        </select>
                        <select className="form-select" value={form.taskId} onChange={e => setForm({ ...form, taskId: e.target.value })} disabled={!form.projectId}>
                            <option value="">Select task…</option>
                            {tasks.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                        </select>
                    </div>
                )}
                <button className={`btn w-full ${isRunning ? "btn-danger" : "btn-primary"}`} onClick={isRunning ? stopTimer : startTimer} style={{ justifyContent: "center" }}>
                    {isRunning ? <><Square size={14} /> Stop Timer</> : <><Play size={14} /> Start Timer</>}
                </button>
            </div>

            <div className="table-container">
                <div className="table-header"><h3>Time Log History ({logs.length})</h3></div>
                {logs.length === 0 ? (
                    <div className="empty-state" style={{ padding: 32 }}>
                        <Clock size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                        <p>No time logs yet</p>
                    </div>
                ) : (
                    <table>
                        <thead><tr><th>Project</th><th>Task</th><th>Duration</th><th>Date</th><th>Billed</th></tr></thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log._id}>
                                    <td style={{ fontWeight: 500 }}>{log.projectId?.projectName || "—"}</td>
                                    <td style={{ color: "var(--text-secondary)" }}>{log.taskId?.title || "—"}</td>
                                    <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{(log.duration || 0).toFixed(2)}h</td>
                                    <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{new Date(log.createdAt).toLocaleDateString()}</td>
                                    <td><span className={`badge ${log.billed ? "badge-paid" : "badge-pending"}`}>{log.billed ? "Billed" : "Unbilled"}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showManual && (
                <div className="modal-overlay" onClick={() => setShowManual(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Manual Time Entry</h2>
                            <button className="modal-close" onClick={() => setShowManual(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleManual}>
                            <div className="form-group">
                                <label className="form-label">Project</label>
                                <select className="form-select" required value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value, taskId: "" })}>
                                    <option value="">Select project</option>
                                    {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Task</label>
                                <select className="form-select" required value={form.taskId} onChange={e => setForm({ ...form, taskId: e.target.value })} disabled={!form.projectId}>
                                    <option value="">Select task</option>
                                    {tasks.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Hours Worked</label>
                                <input className="form-input" type="number" step="0.25" min="0.25" required value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="e.g. 2.5" />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowManual(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default TimeTracking;

import { useEffect, useState } from "react";
import { FolderKanban, Users, FileText, Clock, AlertTriangle, CheckSquare } from "lucide-react";
import API from "../api/axios";

function Dashboard() {
    const [stats, setStats] = useState({ projects: 0, clients: 0, invoices: [], timeLogs: [], tasks: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [proj, clients, inv, logs, tasks] = await Promise.all([
                    API.get("/projects"), API.get("/clients"), API.get("/invoices"),
                    API.get("/timer"), API.get("/tasks")
                ]);
                setStats({
                    projects: proj.data.length,
                    clients: clients.data.length,
                    invoices: inv.data,
                    timeLogs: logs.data,
                    tasks: tasks.data
                });
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        fetchAll();
    }, []);

    const activeProjects = stats.projects;
    const pendingInvoices = stats.invoices.filter(i => i.status !== "Paid");
    const pendingInvoiceTotal = pendingInvoices.reduce((s, i) => s + (i.amount || 0), 0);
    const totalHours = stats.timeLogs.reduce((s, l) => s + (l.duration || 0), 0);
    const upcomingTasks = stats.tasks.filter(t => t.status === "Pending" && t.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);

    const statCards = [
        { label: "Active Projects", value: activeProjects, icon: FolderKanban, color: "purple" },
        { label: "Clients", value: stats.clients, icon: Users, color: "blue" },
        { label: "Pending Invoices", value: `$${pendingInvoiceTotal.toFixed(0)}`, icon: FileText, color: "warning" },
        { label: "Total Hours", value: totalHours.toFixed(1) + "h", icon: Clock, color: "green" },
    ];

    if (loading) return <div style={{ color: "var(--text-secondary)", padding: 40 }}>Loading dashboard…</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Your freelance business at a glance</p>
                </div>
            </div>

            <div className="stats-grid">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                    <div className="stat-card" key={label}>
                        <div className={`stat-icon stat-icon-${color}`}><Icon size={18} /></div>
                        <div className="stat-label">{label}</div>
                        <div className="stat-value">{value}</div>
                    </div>
                ))}
            </div>

            <div className="grid-2" style={{ gap: 20 }}>
                <div className="table-container">
                    <div className="table-header"><h3>Pending Invoices</h3></div>
                    {pendingInvoices.length === 0 ? (
                        <div className="empty-state" style={{ padding: 32 }}>
                            <CheckSquare size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                            <p>No pending invoices</p>
                        </div>
                    ) : (
                        <table>
                            <thead><tr><th>Client</th><th>Amount</th><th>Status</th></tr></thead>
                            <tbody>
                                {pendingInvoices.slice(0, 5).map(inv => (
                                    <tr key={inv._id}>
                                        <td>{inv.clientId?.name || "—"}</td>
                                        <td style={{ fontWeight: 700 }}>${(inv.amount || 0).toFixed(2)}</td>
                                        <td><span className={`badge badge-${(inv.status || "draft").toLowerCase()}`}>{inv.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="table-container">
                    <div className="table-header">
                        <h3>Upcoming Deadlines</h3>
                    </div>
                    {upcomingTasks.length === 0 ? (
                        <div className="empty-state" style={{ padding: 32 }}>
                            <CheckSquare size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                            <p>No upcoming tasks</p>
                        </div>
                    ) : (
                        <table>
                            <thead><tr><th>Task</th><th>Due Date</th></tr></thead>
                            <tbody>
                                {upcomingTasks.map(task => {
                                    const due = new Date(task.dueDate);
                                    const daysLeft = Math.ceil((due - Date.now()) / 86400000);
                                    return (
                                        <tr key={task._id}>
                                            <td>{task.title}</td>
                                            <td>
                                                <span style={{ fontSize: 12, color: daysLeft < 0 ? "var(--danger)" : daysLeft <= 3 ? "var(--warning)" : "var(--text-secondary)" }}>
                                                    {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Today" : `${daysLeft}d left`}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
export default Dashboard;

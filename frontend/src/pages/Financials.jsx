import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, Clock, FileText } from "lucide-react";
import API from "../api/axios";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const COLORS = { Paid: "#22c55e", Sent: "#38bdf8", Draft: "#f59e0b" };

function Financials() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/invoices/stats").then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ color: "var(--text-secondary)", padding: 40 }}>Loading financials…</div>;
    if (!stats) return <div style={{ color: "var(--danger)", padding: 40 }}>Failed to load financial data.</div>;

    const { monthlyStats = [], totalEarned = 0, totalPending = 0 } = stats;

    // Build bar chart data grouped by month
    const monthMap = {};
    monthlyStats.forEach(({ _id, total, count }) => {
        const key = `${_id.year}-${String(_id.month).padStart(2, "0")}`;
        if (!monthMap[key]) monthMap[key] = { month: MONTH_NAMES[_id.month - 1], Paid: 0, Sent: 0, Draft: 0 };
        monthMap[key][_id.status] = total;
    });
    const chartData = Object.values(monthMap).slice(-6);

    // Pie data
    const pieData = Object.entries(
        monthlyStats.reduce((acc, s) => {
            acc[s._id.status] = (acc[s._id.status] || 0) + s.total;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

    const kpis = [
        { label: "Total Earned", value: `$${totalEarned.toFixed(2)}`, icon: DollarSign, color: "var(--success)" },
        { label: "Pending Revenue", value: `$${totalPending.toFixed(2)}`, icon: TrendingUp, color: "var(--warning)" },
        { label: "Total Invoiced", value: `$${(totalEarned + totalPending).toFixed(2)}`, icon: FileText, color: "var(--info)" },
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Financials</h1>
                    <p className="page-subtitle">Revenue analytics and invoice breakdown</p>
                </div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                {kpis.map(({ label, value, icon: Icon, color }) => (
                    <div className="stat-card" key={label}>
                        <div className="stat-icon" style={{ background: `${color}20`, color }}><Icon size={18} /></div>
                        <div className="stat-label">{label}</div>
                        <div className="stat-value" style={{ fontSize: 22 }}>{value}</div>
                    </div>
                ))}
            </div>

            <div className="grid-2" style={{ gap: 20, marginTop: 24 }}>
                <div className="card">
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Monthly Revenue</h3>
                    {chartData.length === 0 ? (
                        <div className="empty-state" style={{ padding: 32 }}><p>No invoice data yet</p></div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={chartData} barSize={18}>
                                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                                <Tooltip
                                    contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                                    formatter={v => [`$${v.toFixed(2)}`]}
                                />
                                <Bar dataKey="Paid" fill={COLORS.Paid} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Sent" fill={COLORS.Sent} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Draft" fill={COLORS.Draft} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="card">
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Revenue by Status</h3>
                    {pieData.length === 0 ? (
                        <div className="empty-state" style={{ padding: 32 }}><p>No data yet</p></div>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                            <ResponsiveContainer width={160} height={160}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                                        {pieData.map((entry, i) => <Cell key={i} fill={COLORS[entry.name] || "#7c6af7"} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {pieData.map(entry => (
                                    <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[entry.name] || "#7c6af7", flexShrink: 0 }} />
                                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{entry.name}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700 }}>${entry.value.toFixed(0)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default Financials;

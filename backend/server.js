import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import authRoutes    from "./routes/authRoutes.js";
import clientRoutes  from "./routes/clientRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes    from "./routes/taskRoutes.js";
import timerRoutes   from "./routes/timerRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import seedRoutes    from "./routes/seedRoutes.js";

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    credentials: true
}));
app.use(express.json());

// ── Health Check ────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({ success: true, message: "🚀 FreelanceFlow Backend Running" });
});

app.get("/health", (req, res) => {
    res.json({
        success: true,
        mongo: process.env.MONGO_URI ? "Configured" : "Missing",
        jwt:   process.env.JWT_SECRET ? "Configured" : "Missing"
    });
});

// ── API Routes ──────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/clients",  clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks",    taskRoutes);
app.use("/api/timer",    timerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/seed",     seedRoutes);

// ── 404 ─────────────────────────────────────────────────────
app.use("*", (req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`\n✅ Server running → http://localhost:${PORT}`);
            console.log("   Routes: /api/auth | /api/clients | /api/projects | /api/tasks | /api/timer | /api/invoices | /api/seed\n");
        });
    } catch (err) {
        console.error("Server failed to start:", err.message);
        process.exit(1);
    }
};

start();
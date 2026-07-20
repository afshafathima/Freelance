import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import timerRoutes from "./routes/timerRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import seedRoutes from "./routes/seedRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "🚀 FreelanceFlow Backend Running"
    });
});

app.get("/health", (req, res) => {
    res.json({
        success: true,
        mongo: process.env.MONGO_URI ? "Configured" : "Missing",
        jwt: process.env.JWT_SECRET ? "Configured" : "Missing"
    });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/timer", timerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/seed", seedRoutes);

// 404
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

startServer();
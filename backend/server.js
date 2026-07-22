import "dotenv/config";
import express from "express";
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

const app = express();

// ===============================
// CORS
// ===============================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://freelanceflow-pnncbt8kf-af-sha.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin (Postman, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// ===============================
// Health Routes
// ===============================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 FreelanceFlow Backend Running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is healthy",
    mongo: process.env.MONGO_URI ? "Configured" : "Missing",
    jwt: process.env.JWT_SECRET ? "Configured" : "Missing",
  });
});

// ===============================
// API Routes
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/timer", timerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/seed", seedRoutes);

// ===============================
// 404 Handler
// ===============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Local: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err.message);
    process.exit(1);
  }
};

start();
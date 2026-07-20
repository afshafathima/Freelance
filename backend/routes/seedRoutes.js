import express from "express";
import { seedSampleData, clearSampleData } from "../controllers/seedController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/seed — load sample data for logged-in user
router.post("/", authMiddleware, seedSampleData);

// DELETE /api/seed — clear all data for logged-in user (dev utility)
router.delete("/", authMiddleware, clearSampleData);

export default router;

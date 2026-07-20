import express from "express";
import {
    register,
    login,
    upgradePlan
} from "../controllers/authController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Register User
router.post("/register", register);

// Login User
router.post("/login", login);

// Upgrade / Toggle User Plan
router.put("/upgrade", auth, upgradePlan);

export default router;
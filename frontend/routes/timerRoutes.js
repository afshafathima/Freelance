import express from "express";
import {
    startTimer,
    stopTimer,
    manualEntry,
    getLogs
} from "../controllers/timerController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", auth, getLogs);
router.post("/start", auth, startTimer);
router.put("/stop/:id", auth, stopTimer);
router.post("/manual", auth, manualEntry);

export default router;
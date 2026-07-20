import express from "express";
import {
    createClient,
    getClients,
    updateClient,
    deleteClient
} from "../controllers/clientController.js";
import auth from "../middleware/authMiddleware.js";
import planMiddleware from "../middleware/planMiddleware.js";

const router = express.Router();

router.post("/", auth, planMiddleware, createClient);
router.get("/", auth, getClients);
router.put("/:id", auth, updateClient);
router.delete("/:id", auth, deleteClient);

export default router;
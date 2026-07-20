import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
    createInvoice,
    getInvoices,
    updateInvoice,
    deleteInvoice,
    generateFromTimeLogs,
    getFinancialStats,
    previewUnbilledLogs
} from "../controllers/invoiceController.js";

const router = express.Router();

router.get("/", auth, getInvoices);
router.post("/", auth, createInvoice);
router.put("/:id", auth, updateInvoice);
router.delete("/:id", auth, deleteInvoice);
router.post("/generate", auth, generateFromTimeLogs);
router.get("/stats", auth, getFinancialStats);
router.get("/preview", auth, previewUnbilledLogs);

export default router;

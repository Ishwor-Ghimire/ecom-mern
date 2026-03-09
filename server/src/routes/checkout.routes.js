import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getCheckoutSummary,
  getWhatsAppLinkForOrder,
} from "../controllers/checkout.controller.js";

const router = express.Router();

router.get("/summary", protect, getCheckoutSummary);
router.get("/whatsapp/:orderId", protect, getWhatsAppLinkForOrder);

export default router;

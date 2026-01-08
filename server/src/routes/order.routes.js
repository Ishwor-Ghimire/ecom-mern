import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  createOrderFromCart,
  getMyOrders,
  getOrderById,
  updateOrderPayment,
  updateOrderStatus,
  listAllOrders,
} from "../controllers/order.controller.js";

const router = express.Router();

// User routes
router.post("/", protect, createOrderFromCart);
router.get("/me", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

// Admin routes
router.get("/", protect, adminOnly, listAllOrders);
router.put("/:id/payment", protect, adminOnly, updateOrderPayment);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;

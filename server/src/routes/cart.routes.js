import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getMyCart,
  mergeGuestCart,
  setCartItemQty,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", protect, getMyCart);
router.post("/merge", protect, mergeGuestCart);
router.put("/item", protect, setCartItemQty);
router.delete("/item/:productId", protect, removeCartItem);
router.delete("/clear", protect, clearCart);

export default router;

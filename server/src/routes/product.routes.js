import express from "express";
import {
  getProducts,
  createProduct,
  getProductBySlug,
  updateProduct,
} from "../controllers/product.controller.js";
import { protect, adminOnly } from "../middleware/auth.js";



const router = express.Router();

router.get("/", getProducts);

router.post("/", protect, adminOnly, createProduct);

router.put("/:id", protect, adminOnly, updateProduct);

router.get("/:slug", getProductBySlug);


export default router;

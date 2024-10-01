import express from "express";

import { addTocart, getCartProducts, removeAllFromCart, updateQuantity } from "../controller/cart.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";


const router = express.Router();

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, addTocart);
router.delete("/", protectRoute, removeAllFromCart);
router.put("/:id", protectRoute, updateQuantity);

export default router;
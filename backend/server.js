import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import { connectDB } from "./lib/connectDB.js";
import cookieParser from "cookie-parser";



dotenv.config();



const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json()); //alolows us to send json data

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products",productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);


app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);

    connectDB();
});

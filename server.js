//lets make User – authentication, role, profile info. Product – what you’re selling. Category – for filtering & navigation. Order – to track purchases. Cart – active shopping session. Wishlist – saved items for later. 🟡 Supporting Models (important but not 100% required at MVP launch) Review / Rating – boosts engagement & trust, but you can launch without it. Payment – if you use an external gateway (Stripe/PayPal), you can just store status in Order and skip this as a separate model until you need more detailed logging. Shipment / Delivery – nice for tracking, but if you’re a small store at first, shipping details can just live inside Order. Inventory Logs – useful for audit/history, but you can start with just a stock field in Product. theese first
import express from 'express';
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("API is running...");
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB connected");
}).catch((error) => {
    console.error("MongoDB connection error:", error);
});


app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
import serverless from 'serverless-http';
import express from 'express';
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import shipmentRoutes from './routes/shipmentRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Health check endpoint
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/shipments", shipmentRoutes);

// MongoDB connection with caching for Lambda
let cachedDb = null;

const connectToDatabase = async () => {
    if (cachedDb) {
        console.log('Using cached database connection');
        return cachedDb;
    }

    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        cachedDb = connection;
        console.log('New database connection established');
        return connection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

// Lambda handler
export const handler = async (event, context) => {
    // Important: Set context.callbackWaitsForEmptyEventLoop to false
    // This prevents Lambda from waiting for the event loop to be empty
    // before freezing the process, which is important for connection reuse
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        await connectToDatabase();
        const serverlessHandler = serverless(app);
        return await serverlessHandler(event, context);
    } catch (error) {
        console.error('Handler error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
